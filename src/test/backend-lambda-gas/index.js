const axios = require('axios');

const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbyC37x8GcLjOCr3FlPIaTg4giVy86XmKJIcS3JHCGyWrwcHIKWvQZ-P0bHuWD3l68Ot/exec';

exports.handler = async (event) => {
  const method = (event.httpMethod || '').toUpperCase();
  console.log('Incoming Request Method:', method);
  console.log('event:', JSON.stringify(event));

  // Common axios config สำหรับ GAS
  const axiosConfig = {
    timeout: 30000, // 30 วินาที
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Lambda-Function/1.0)',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  switch (method) {
    case 'OPTIONS':
      return {
        statusCode: 200,
        body: '',
      };

    case 'GET':
      try {
        const params = event.queryStringParameters || {};
        if (!params.action) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'กรุณาระบุ action' }),
          };
        }

        console.log('Sending GET request to GAS with params:', params);
        const response = await axios.get(GAS_BASE_URL, {
          ...axiosConfig,
          params,
        });

        console.log('GAS response status:', response.status);
        console.log('GAS response data:', JSON.stringify(response.data));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(response.data),
        };
      } catch (error) {
        console.error('GET Error - Full error object:', JSON.stringify(error, null, 2));
        console.error('GET Error - Response status:', error.response?.status);
        console.error('GET Error - Response data:', error.response?.data);
        console.error('GET Error - Response headers:', error.response?.headers);
        console.error('GET Error - Message:', error.message);

        return {
          statusCode: error.response?.status || 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: error.message,
            details: error.response?.data || null,
            status: error.response?.status || 500,
            url: GAS_BASE_URL,
          }),
        };
      }

    case 'POST':
      try {
        const body = JSON.parse(event.body || '{}');
        if (!body.action) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'กรุณาระบุ action' }),
          };
        }

        console.log('Sending POST request to GAS with body:', body);
        const response = await axios.post(GAS_BASE_URL, body, axiosConfig);

        console.log('GAS response status:', response.status);
        console.log('GAS response data:', JSON.stringify(response.data));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(response.data),
        };
      } catch (error) {
        console.error('POST Error - Full error object:', JSON.stringify(error, null, 2));
        console.error('POST Error - Response status:', error.response?.status);
        console.error('POST Error - Response data:', error.response?.data);
        console.error('POST Error - Response headers:', error.response?.headers);
        console.error('POST Error - Message:', error.message);

        return {
          statusCode: error.response?.status || 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: error.message,
            details: error.response?.data || null,
            status: error.response?.status || 500,
            url: GAS_BASE_URL,
          }),
        };
      }

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: `Method ${method} not allowed` }),
      };
  }
};
