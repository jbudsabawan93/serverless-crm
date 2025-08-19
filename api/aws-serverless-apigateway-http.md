## API Gateway: Create by AWS Console

1. Create HTTP API
* Go to API Gateway Console → ap-southeast-1 region
* Click `Create API`
* Select `HTTP API` → `Build`
* API name: `aws-serverless-api-http`

2. Add Integration
* Click `Add integration`
* Integration type: `Lambda`
* Lambda function: `aws-serverless-lambda`
* Version: `$LATEST`

3. Configure Routes
* Route 1:
    * Method: `ANY`
    * Resource path: `/api`
    * Integration: Select your Lambda function
* Route 2:
    * Method: `ANY`
    * Resource path: `/api/{proxy+}`
    * Integration: Select your Lambda function
4. Configure CORS
* Click "Configure" under CORS
    * Access-Control-Allow-Origin: `*`
    * Access-Control-Allow-Headers: `content-type,x-amz-date,authorization,x-api-key,x-amz-security-token`
    * Access-Control-Allow-Methods: `*`

5. Review and Create
* Stage name: Leave as `$default` (removes "dev" from URL)
* Click "Create"

### API URL Structure
```
https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/api/
```