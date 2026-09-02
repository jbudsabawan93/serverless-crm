# Create an HTTP API (API Gateway console)

Do this after the Lambda is uploaded.  
Lambda handler must be **`index.handler`** — see [lambda-v2.md](./lambda-v2.md)

Example region: `ap-southeast-1` (use the same region as the Lambda).

---

## 1. Create HTTP API

API Gateway → **Create API** → **HTTP API** → **Build**  
Name e.g. `aws-serverless-api-http`

## 2. Add Integration

- Type: **Lambda**
- Function: the function packed from `api/` (e.g. `aws-serverless-lambda`)
- Version: `$LATEST`

## 3. Routes

Both routes are required. Without them, `GET /api/customers` returns 404.

| Method | Path |
| --- | --- |
| `ANY` | `/api` |
| `ANY` | `/api/{proxy+}` |

## 4. CORS

Match the real frontend origin. Do not use `*` in production.

| Setting | Example |
| --- | --- |
| Allow origins | `https://your-app.vercel.app`, or `*` while testing |
| Allow headers | `content-type,x-amz-date,authorization,x-api-key,x-amz-security-token` |
| Allow methods | `*` |

Lambda also sends CORS from `SPA_ORIGIN`. Keep both origins in sync.

## 5. Review and Create

Stage: `$default` (the URL will not include `/dev`)

---

## Resulting URL

```
https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/api
```

Paste this into `VITE_API_URL` **with no trailing slash**.

Then set Lambda env: `MONGODB_URI`, `SPA_ORIGIN`
