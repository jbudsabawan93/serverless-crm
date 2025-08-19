const mongoose = require('mongoose');

let conn = null;

// Schemas
const OrderSchema = new mongoose.Schema({
  order_id: String,
  order_number: String,
  product_name: String,
  price: Number,
  amount: Number,
  total: Number,
  order_date: Date
});
const CustomerSchema = new mongoose.Schema({
  customer_id: String,
  full_name: String,
  address: String,
  telephone: String,
  order_number: String,
  date: Date
});
const ProductSchema = new mongoose.Schema({
  product_id: String,
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

const SPA_ORIGIN = process.env.SPA_ORIGIN || '*';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': SPA_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

const send = (statusCode, body) => ({
  statusCode,
  headers: defaultHeaders,
  body: JSON.stringify(body)
});

const parseBody = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch (e) { return {}; }
};

const ensureConnected = async () => {
  if (conn && mongoose.connection && mongoose.connection.readyState === 1) return;
  if (process.env.MONGODB_URI == null) {
    throw new Error('MONGODB_URI not set');
  }
  conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB');
};

const modelFor = (name) => {
  switch ((name || '').toLowerCase()) {
    case 'customers': return { model: Customer, idField: 'customer_id', required: ['customer_id','full_name'] };
    case 'orders': return { model: Order, idField: 'order_id', required: ['order_id','order_number'] };
    case 'products': return { model: Product, idField: 'product_id', required: ['product_id','product_name'] };
    default: return null;
  }
};

exports.handler = async (event) => {
  try {
    // Support HTTP API and REST event shapes
    const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
    const rawPath = event.rawPath || event.path || '/';
    // Normalize path under /api
    const base = '/api';
    let sub = rawPath.startsWith(base) ? rawPath.slice(base.length) : rawPath;
    sub = sub.replace(/^\/+|\/+$/g, ''); // trim slashes
    const segments = sub.split('/').filter(Boolean); // e.g. ['customers','123']

    // CORS preflight
    if (method === 'OPTIONS') return { statusCode: 204, headers: defaultHeaders, body: '' };

    await ensureConnected();

    // no resource: return simple health/info
    if (!segments.length) {
      return send(200, { status: 'ok', resources: ['customers','orders','products'] });
    }

    const resource = segments[0];
    const resourceIdFromPath = segments[1]; // optional id in path
    const descriptor = modelFor(resource);
    if (!descriptor) return send(404, { error: 'unknown resource', resource });

    const Model = descriptor.model;
    const idField = descriptor.idField;

    const body = parseBody(event.body);

    // Allow id via path or body
    const idValue = resourceIdFromPath || body[idField];

    // CRUD operations
    if (method === 'GET') {
      if (idValue) {
        const doc = await Model.findOne({ [idField]: idValue }).lean();
        if (!doc) return send(404, { error: 'not found' });
        return send(200, doc);
      } else {
        const docs = await Model.find().lean();
        return send(200, docs);
      }
    }

    if (method === 'POST') {
      // validate required fields
      const missing = (descriptor.required || []).filter(f => !(body && body[f]));
      if (missing.length) return send(400, { error: 'missing fields', missing });
      // Transform dates if present
      if (body.order_date) body.order_date = new Date(body.order_date);
      if (body.date) body.date = new Date(body.date);
      if (body.createdAt) body.createdAt = new Date(body.createdAt);

      const instance = new Model(body);
      await instance.save();
      return send(201, { status: 'created', item: instance });
    }

    if (method === 'PUT' || method === 'PATCH') {
      if (!idValue) return send(400, { error: `${idField} is required in path or body` });
      // prepare update payload (exclude undefined)
      const update = { ...body };
      // convert possible date fields
      if (update.order_date) update.order_date = new Date(update.order_date);
      if (update.date) update.date = new Date(update.date);
      if (update.createdAt) update.createdAt = new Date(update.createdAt);
      // remove id field if present to avoid changing identifier
      delete update[idField];

      const res = await Model.updateOne({ [idField]: idValue }, update);
      const modified = res.modifiedCount ?? res.nModified ?? 0;
      return send(200, { status: 'updated', modifiedCount: modified });
    }

    if (method === 'DELETE') {
      if (!idValue) return send(400, { error: `${idField} is required in path or body` });
      const res = await Model.deleteOne({ [idField]: idValue });
      const deleted = res.deletedCount ?? res.n ?? 0;
      return send(200, { status: 'deleted', deletedCount: deleted });
    }

    return send(405, { error: 'method not allowed' });

  } catch (err) {
    console.error('❌ Error:', err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};