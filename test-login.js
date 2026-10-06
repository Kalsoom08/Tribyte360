const http = require('http');

const data = JSON.stringify({
  email: 'admin@tribyte360.com',
  password: 'Admin@123456',
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
  timeout: 5000, // 5 second timeout
};

console.log('Sending login request to http://127.0.0.1:3000/api/v1/auth/login...');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('--- RESPONSE RECEIVED ---');
    console.log('HTTP Status:', res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      console.log(body);
    }
  });
});

req.on('timeout', () => {
  console.error('ERROR: Request timed out! Check if auth-service and RabbitMQ are running.');
  req.destroy();
});

req.on('error', (err) => {
  console.error('ERROR connecting to API Gateway:', err.message);
});

req.write(data);
req.end();