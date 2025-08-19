## Lambda v2 API (MongoDB + AWS API Gateway)

This document describes how to deploy and use the Lambda v2 function that exposes a simple CRUD API for customers, orders, and products backed by MongoDB (via `mongoose`).

### Features
- Generic REST-style routing under `/api`
- CRUD for `customers`, `orders`, `products`
- JSON responses with proper CORS headers
- Reuses a single MongoDB connection across invocations

### Runtime & Handler
- Runtime: Node.js 2x.x+
- Handler: `lambda-v2.handler`

If you zip the code manually, ensure the zip contains the handler file at the root of the archive (not inside a folder).

### Environment Variables
- `MONGODB_URI` (required): MongoDB connection string
  - Example: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>`
- `SPA_ORIGIN` (recommended): Frontend origin allowed by CORS
  - Example: `https://your-frontend.example.com`
  - For testing, you can set `*` (wildcard), but use a specific origin in production.

### Data Models (MongoDB)
The following fields are expected (based on v1 schemas and maintained in v2):

- customers
  - `customer_id` (String, required)
  - `full_name` (String)
  - `address` (String)
  - `telephone` (String)
  - `order_number` (String)
  - `date` (Date)

- orders
  - `order_id` (String, required)
  - `order_number` (String, required)
  - `product_name` (String)
  - `price` (Number)
  - `amount` (Number)
  - `total` (Number)
  - `order_date` (Date)

- products
  - `product_id` (String, required)
  - `imge_url` (String)
  - `product_name` (String, required)
  - `description` (String)
  - `price` (Number)
  - `quantity` (Number)
  - `category` (String)
  - `sku` (String)
  - `createdAt` (Date, default now)

### API Gateway Routing (HTTP API)
Create two routes and integrate them with your Lambda function:
- `ANY /api`
- `ANY /api/{proxy+}`

Enable CORS for your API:
- Allow origins: set to your `SPA_ORIGIN` (or `*` during testing)
- Allow headers: `content-type,x-amz-date,authorization,x-api-key,x-amz-security-token`
- Allow methods: `*` (or `GET,POST,PUT,DELETE,OPTIONS`)

### Endpoints
Base URL example: `https://<api-id>.execute-api.<region>.amazonaws.com/api`

- Health check
  - `GET /api`

- Customers
  - `GET /api/customers` — list
  - `POST /api/customers` — create
  - `PUT /api/customers` — update by `customer_id`
  - `DELETE /api/customers` — delete by `customer_id`
  - Optionally supported in v2: `GET /api/customers/{customer_id}` (if route-style id is enabled)

- Orders
  - `GET /api/orders` — list
  - `POST /api/orders` — create
  - `PUT /api/orders` — update by `order_id`
  - `DELETE /api/orders` — delete by `order_id`

- Products
  - `GET /api/products` — list
  - `POST /api/products` — create
  - `PUT /api/products` — update by `product_id`
  - `DELETE /api/products` — delete by `product_id`

### Request Examples (curl)
Replace `<BASE_URL>` with your API base, e.g. `https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/api`.

```bash
# Health
curl -s <BASE_URL>

# Customers: list
curl -s <BASE_URL>/customers

# Customers: create
curl -s -X POST <BASE_URL>/customers \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "C001",
    "full_name": "John Doe",
    "address": "123 Main St"
  }'

# Customers: update (by customer_id)
curl -s -X PUT <BASE_URL>/customers \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "C001",
    "telephone": "080-000-0000"
  }'

# Customers: delete (by customer_id)
curl -s -X DELETE <BASE_URL>/customers \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "C001"}'
```

Analogous requests apply for `/orders` and `/products` using their respective ids and fields.

### Deploy (ZIP)

1) Install dependencies in the `api` folder:
```bash
cd api
npm install
```

2) Create a deployment ZIP (Windows PowerShell example):
```powershell
Compress-Archive -Path * -DestinationPath lambda-v2.zip -Force
```

Or using the provided npm script if available:
```bash
npm run build
```

3) Upload `lambda-v2.zip` to AWS Lambda and set:
- Runtime: Node.js 18.x/20.x
- Handler: `lambda-v2.handler`
- Timeout: 30 seconds (adjust as needed)
- Memory: 256 MB or higher depending on workload
- Environment variables: `MONGODB_URI`, `SPA_ORIGIN`

4) Connect to API Gateway (HTTP API) with routes as above and enable CORS.

### Testing in AWS Console
Use a test event shaped like HTTP API payloads, e.g.:
```json
{
  "version": "2.0",
  "rawPath": "/api/customers",
  "requestContext": { "http": { "method": "GET" } }
}
```

### Troubleshooting
- 502/500 errors: Check CloudWatch logs for connection or validation errors
- Response blocked in browser: ensure `SPA_ORIGIN` and CORS settings match your frontend origin
- Timeouts: increase Lambda timeout and ensure MongoDB is reachable from your Lambda environment
- Empty or null responses: verify API routes (`/api` and `/api/{proxy+}`) are configured and the handler name is correct

### Notes
- Keep your MongoDB connection outside the handler to reuse across invocations
- Avoid bundling large dev files in the ZIP; only include runtime code and `node_modules`


