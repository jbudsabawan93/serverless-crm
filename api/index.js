const mongoose = require('mongoose');

let conn = null;

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true },
  order_number: String,
  product_name: String,
  price: Number,
  amount: Number,
  total: Number,
  order_date: Date
});
const CustomerSchema = new mongoose.Schema({
  customer_id: { type: String, unique: true },
  full_name: String,
  address: String,
  telephone: String,
  order_number: String,
  date: Date
});
const ProductSchema = new mongoose.Schema({
  product_id: { type: String, unique: true },
  imge_url: String,
  product_name: String,
  description: String,
  price: Number,
  quantity: Number,
  category: String,
  sku: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const RateSchema = new mongoose.Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expireAt: Date
}, { collection: 'ratelimits' });
RateSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const Rate = mongoose.models.RateLimit || mongoose.model('RateLimit', RateSchema);

const SPA_ORIGIN = process.env.SPA_ORIGIN || '*';
const DATE_FIELDS = ['order_date', 'date', 'createdAt'];
const RATE_PER_MINUTE = Math.max(0, Number(process.env.RATE_PER_MINUTE ?? 30));
const MONTHLY_LIMIT = Math.max(0, Number(process.env.MONTHLY_LIMIT ?? 100000));

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': SPA_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
};

const send = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: { ...defaultHeaders, ...extraHeaders },
  body: JSON.stringify(body)
});

const parseBody = (raw, isBase64Encoded) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const text = isBase64Encoded ? Buffer.from(raw, 'base64').toString('utf8') : raw;
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const toDate = (value) => {
  if (value == null || value === '') return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const sanitize = (payload = {}) => {
  const data = { ...payload };
  delete data._id;
  delete data.__v;
  for (const field of DATE_FIELDS) {
    if (!(field in data)) continue;
    const parsed = toDate(data[field]);
    if (parsed) data[field] = parsed;
    else delete data[field];
  }
  return data;
};

const ensureConnected = async () => {
  if (conn && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set');
  }
  conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000
  });
};

const clientIp = (event) =>
  event.requestContext?.http?.sourceIp ||
  event.requestContext?.identity?.sourceIp ||
  'unknown';

const consume = async (id, limit, expireAt) => {
  const doc = await Rate.findByIdAndUpdate(
    id,
    { $inc: { count: 1 }, $setOnInsert: { expireAt } },
    { upsert: true, new: true }
  );
  return doc.count > limit;
};

const enforceLimits = async (event) => {
  const now = new Date();
  const checks = [];

  if (RATE_PER_MINUTE > 0) {
    const minuteId = `ip:${clientIp(event)}:${now.toISOString().slice(0, 16)}`;
    const expireAt = new Date(now.getTime() + 2 * 60 * 1000);
    checks.push(consume(minuteId, RATE_PER_MINUTE, expireAt).then((limited) => (
      limited ? send(429, { error: 'too many requests' }, { 'Retry-After': '60' }) : null
    )));
  }

  if (MONTHLY_LIMIT > 0) {
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const expireAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 7));
    checks.push(consume(`month:${monthKey}`, MONTHLY_LIMIT, expireAt).then((limited) => (
      limited ? send(429, { error: 'monthly quota exceeded' }, { 'Retry-After': '86400' }) : null
    )));
  }

  const blocked = (await Promise.all(checks)).find(Boolean);
  return blocked || null;
};

const isScheduledWake = (event) =>
  event?.source === 'aws.events' || event?.warmup === true;

const warm = async () => {
  await ensureConnected();
  await mongoose.connection.db.admin().command({ ping: 1 });
  return send(200, { status: 'warm' });
};

const modelFor = (name) => {
  switch ((name || '').toLowerCase()) {
    case 'customers': return { model: Customer, idField: 'customer_id', required: ['customer_id', 'full_name'] };
    case 'orders': return { model: Order, idField: 'order_id', required: ['order_id', 'order_number'] };
    case 'products': return { model: Product, idField: 'product_id', required: ['product_id', 'product_name'] };
    default: return null;
  }
};

exports.handler = async (event) => {
  try {
    if (isScheduledWake(event)) return await warm();

    const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
    const rawPath = event.rawPath || event.path || '/';
    const base = '/api';
    let sub = rawPath.startsWith(base) ? rawPath.slice(base.length) : rawPath;
    sub = sub.replace(/^\/+|\/+$/g, '');
    const segments = sub.split('/').filter(Boolean);

    if (method === 'OPTIONS') return { statusCode: 204, headers: defaultHeaders, body: '' };

    await ensureConnected();

    const limited = await enforceLimits(event);
    if (limited) return limited;

    if (!segments.length || segments[0] === 'wake' || segments[0] === 'health') {
      if (segments[0] === 'wake') return await warm();
      return send(200, { status: 'ok', resources: ['customers', 'orders', 'products'] });
    }

    const resource = segments[0];
    const resourceIdFromPath = segments[1];
    const descriptor = modelFor(resource);
    if (!descriptor) return send(404, { error: 'unknown resource', resource });

    const Model = descriptor.model;
    const idField = descriptor.idField;
    const body = sanitize(parseBody(event.body, event.isBase64Encoded));
    const idValue = resourceIdFromPath || body[idField];

    if (method === 'GET') {
      if (idValue) {
        const doc = await Model.findOne({ [idField]: idValue }).lean();
        if (!doc) return send(404, { error: 'not found' });
        return send(200, doc);
      }
      const docs = await Model.find().lean();
      return send(200, docs);
    }

    if (method === 'POST') {
      const missing = (descriptor.required || []).filter((field) => !body[field]);
      if (missing.length) return send(400, { error: 'missing fields', missing });

      const instance = new Model(body);
      await instance.save();
      return send(201, { status: 'success', item: instance });
    }

    if (method === 'PUT' || method === 'PATCH') {
      if (!idValue) return send(400, { error: `${idField} is required in path or body` });

      const update = { ...body };
      delete update[idField];

      const res = await Model.updateOne({ [idField]: idValue }, { $set: update });
      const matched = res.matchedCount ?? res.n ?? 0;
      if (!matched) return send(404, { error: 'not found' });

      const modified = res.modifiedCount ?? res.nModified ?? 0;
      return send(200, { status: 'success', modifiedCount: modified });
    }

    if (method === 'DELETE') {
      if (!idValue) return send(400, { error: `${idField} is required in path or body` });
      const res = await Model.deleteOne({ [idField]: idValue });
      const deleted = res.deletedCount ?? res.n ?? 0;
      return send(200, { status: 'success', deletedCount: deleted });
    }

    return send(405, { error: 'method not allowed' });
  } catch (err) {
    console.error('Error:', err);
    if (err && err.code === 11000) {
      return send(409, { error: 'duplicate id' });
    }
    return send(500, { error: err.message });
  }
};
