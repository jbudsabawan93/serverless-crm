# Lambda API

CRUD for `customers`, `orders`, and `products`.  
Handler file: `index.js` → set AWS handler to **`index.handler`**

Connects to MongoDB Atlas (Mongoose) and reuses the connection across invocations.  
No API auth — only the SPA is gated.

API Gateway setup: [aws-serverless-apigateway-http.md](./aws-serverless-apigateway-http.md)

---

## Runtime

| Setting | Recommended |
| --- | --- |
| Runtime | Node.js 18.x or 20.x |
| Handler | `index.handler` |
| Timeout | 30 seconds |
| Memory | 256 MB or more |

Do not use `lambda-v2.handler` — that file is not in the zip.

---

## Environment

| Variable | Required | Default | Meaning |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | — | e.g. `mongodb+srv://USER:PASS@CLUSTER/myCRMs` |
| `SPA_ORIGIN` | Recommended | `*` | Frontend origin, e.g. `https://your-app.vercel.app` |
| `RATE_PER_MINUTE` | No | `30` | Per-IP per-minute limit (`0` disables) |
| `MONTHLY_LIMIT` | No | `100000` | Monthly quota (`0` disables) |

---

## Models

### customers — POST requires `customer_id`, `full_name`

`customer_id` `full_name` `address` `telephone` `order_number` `date`

### orders — POST requires `order_id`, `order_number`

`order_id` `order_number` `product_name` `price` `amount` `total` `order_date`

### products — POST requires `product_id`, `product_name`

`product_id` `imge_url` (spelling matches the schema) `product_name` `description` `price` `quantity` `category` `sku` `createdAt`

---

## Endpoints

Base: `https://<api-id>.execute-api.<region>.amazonaws.com/api`  
Do not add a trailing slash to `VITE_API_URL`.

| Method | Path | Action |
| --- | --- | --- |
| GET | `/` or `/health` | `{ status: "ok", resources: [...] }` |
| GET | `/wake` | Ping MongoDB |
| OPTIONS | any | CORS preflight `204` |
| GET | `/{resource}` | List |
| GET | `/{resource}/{id}` | Get one |
| POST | `/{resource}` | Create → `201` `{ status: "success", item }` |
| PUT / PATCH | `/{resource}` or `/{resource}/{id}` | Update; id in path or body |
| DELETE | `/{resource}` or `/{resource}/{id}` | Delete; id in path or body |

`{resource}` = `customers` \| `orders` \| `products`  
Id fields: `customer_id` / `order_id` / `product_id`

Common errors

| HTTP | Meaning |
| --- | --- |
| 400 | Missing required fields |
| 404 | Unknown resource or id not found |
| 409 | Duplicate id |
| 429 | Rate limited (`Retry-After`) |
| 500 | e.g. `MONGODB_URI not set` |

---

## curl

Replace `<BASE>` with the live URL (no trailing slash).

```bash
curl -s <BASE>
curl -s <BASE>/customers
curl -s <BASE>/customers/C001

curl -s -X POST <BASE>/customers \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"C001","full_name":"John Doe","address":"123 Main St"}'

curl -s -X PUT <BASE>/customers \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"C001","telephone":"0800000000"}'

curl -s -X DELETE <BASE>/customers/C001
```

Orders and products use the same pattern.

---

## Pack the ZIP

```bash
cd api
npm install
npm run build
```

Produces `lambda-v2.zip` with only `index.js`, `package.json`, and `node_modules`.  
Upload that zip to Lambda and set the handler to `index.handler`.

Do not zip the whole folder with `Compress-Archive *` — it will include markdown and old zips.

---

## Test in the Lambda console

```json
{
  "version": "2.0",
  "rawPath": "/api/customers",
  "requestContext": { "http": { "method": "GET" } }
}
```

---

## Troubleshooting

- **502 / 500** — CloudWatch: bad URI, or Atlas does not allow the Lambda IP (use `0.0.0.0/0` or a VPC)
- **Browser blocks CORS** — `SPA_ORIGIN` must match the site origin, and API Gateway CORS must be enabled
- **Timeout** — raise the timeout; cold start + MongoDB is slow on the first call
- **Everything 404** — missing `ANY /api` or `ANY /api/{proxy+}`
- **Handler does nothing** — must be `index.handler`, not `lambda-v2.handler`
