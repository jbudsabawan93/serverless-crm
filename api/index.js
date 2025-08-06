const mongoose = require('mongoose');

let conn = null;

// Order Schema + Model
const OrderSchema = new mongoose.Schema({
  order_id: String,
  order_number: String,
  product_name: String,
  price: Number,
  amount: Number,
  total: Number,
  order_date: Date
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Customer Schema + Model
const CustomerSchema = new mongoose.Schema({
  customer_id: String,
  full_name: String,
  address: String,
  telephone: String,
  order_number: String,
  date: Date
});
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// Product Schema + Model
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
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Lambda Handler
exports.handler = async (event) => {
  try {
    if (conn === null) {
      conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("✅ Connected to MongoDB");
    }

    // --- Customers CRUD ---
    if (event.path && event.path.endsWith('/customers')) {
      // DELETE
      if (event.httpMethod === 'DELETE') {
        const { customer_id } = JSON.parse(event.body || '{}');
        if (!customer_id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'customer_id is required' })
          };
        }
        const result = await Customer.deleteOne({ customer_id });
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', deletedCount: result.deletedCount })
        };
      }
      // PUT (update)
      if (event.httpMethod === 'PUT') {
        const { customer_id, full_name, address, telephone, order_number, date } = JSON.parse(event.body || '{}');
        if (!customer_id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'customer_id is required' })
          };
        }
        const result = await Customer.updateOne(
          { customer_id },
          { full_name, address, telephone, order_number, date: date ? new Date(date) : undefined }
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', modifiedCount: result.modifiedCount })
        };
      }
      // POST (create)
      if (event.httpMethod === 'POST') {
        const { customer_id, full_name, address, telephone, order_number, date } = JSON.parse(event.body || '{}');
        if (!customer_id || !full_name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'customer_id and full_name are required' })
          };
        }
        const newCustomer = new Customer({
          customer_id,
          full_name,
          address,
          telephone,
          order_number,
          date: date ? new Date(date) : undefined
        });
        await newCustomer.save();
        return {
          statusCode: 201,
          body: JSON.stringify({ status: 'success', customer: newCustomer })
        };
      }
      // GET (all)
      const customers = await Customer.find().lean();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customers)
      };
    }

    // --- Orders CRUD ---
    if (event.path && event.path.endsWith('/orders')) {
      // DELETE
      if (event.httpMethod === 'DELETE') {
        const { order_id } = JSON.parse(event.body || '{}');
        if (!order_id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'order_id is required' })
          };
        }
        const result = await Order.deleteOne({ order_id });
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', deletedCount: result.deletedCount })
        };
      }
      // PUT (update)
      if (event.httpMethod === 'PUT') {
        const { order_id, order_number, product_name, price, amount, total, order_date } = JSON.parse(event.body || '{}');
        if (!order_id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'order_id is required' })
          };
        }
        const result = await Order.updateOne(
          { order_id },
          { 
            order_number, 
            product_name, 
            price, 
            amount, 
            total, 
            order_date: order_date ? new Date(order_date) : undefined
          }
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', modifiedCount: result.modifiedCount })
        };
      }
      // POST (create)
      if (event.httpMethod === 'POST') {
        const { order_id, order_number, product_name, price, amount, total, order_date } = JSON.parse(event.body || '{}');
        if (!order_id || !order_number) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'order_id and order_number are required' })
          };
        }
        const newOrder = new Order({
          order_id,
          order_number,
          product_name,
          price,
          amount,
          total,
          order_date: order_date ? new Date(order_date) : undefined
        });
        await newOrder.save();
        return {
          statusCode: 201,
          body: JSON.stringify({ status: 'success', order: newOrder })
        };
      }
      // GET (all)
      const orders = await Order.find().lean();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders)
      };
    }

    // --- Products CRUD ---
    if (event.path && event.path.endsWith('/products')) {
      // DELETE
      if (event.httpMethod === 'DELETE') {
        const { product_id } = JSON.parse(event.body || '{}');
        if (!product_id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'product_id is required' })
          };
        }
        const result = await Product.deleteOne({ product_id });
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', deletedCount: result.deletedCount })
        };
      }
      // PUT (update)
      if (event.httpMethod === 'PUT') {
        const { product_id, imge_url, product_name, description, price, quantity, category, sku, createdAt } = JSON.parse(event.body || '{}');
        if (!product_id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'product_id is required' })
          };
        }
        const result = await Product.updateOne(
          { product_id },
          { imge_url, product_name, description, price, quantity, category, sku, createdAt: createdAt ? new Date(createdAt) : undefined }
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', modifiedCount: result.modifiedCount })
        };
      }
      // POST (create)
      if (event.httpMethod === 'POST') {
        const { product_id, imge_url, product_name, description, price, quantity, category, sku, createdAt } = JSON.parse(event.body || '{}');
        if (!product_id || !product_name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'product_id and product_name are required' })
          };
        }
        const newProduct = new Product({
          product_id,
          imge_url,
          product_name,
          description,
          price,
          quantity,
          category,
          sku,
          createdAt: createdAt ? new Date(createdAt) : undefined
        });
        await newProduct.save();
        return {
          statusCode: 201,
          body: JSON.stringify({ status: 'success', product: newProduct })
        };
      }
      // GET (all)
      const products = await Product.find().lean();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products)
      };
    }

  } catch (err) {
    console.error("❌ Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};