const http = require('http');

function httpRequest(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (bodyData) req.write(JSON.stringify(bodyData));
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING TENANT PROVISIONING END-TO-END TEST ---');

  try {
    // 1. Login as Super Admin
    console.log('1. Logging in as Super Admin...');
    const loginRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'admin@tribyte360.com', password: 'Admin@123456' });

    if (loginRes.status !== 201 && loginRes.status !== 200) {
      console.error('Login Failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.data.accessToken;
    console.log('✓ Super Admin authenticated. JWT Token acquired.');

    // 2. Create Tenant: Acme Corp (subdomain: acme)
    console.log('\n2. Creating new Tenant: "Acme Corp" (subdomain: "acme")...');
    const createTenantRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/admin/tenants',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, {
      name: 'Acme Corp',
      slug: 'acme',
      ownerEmail: 'owner@acme.com',
      phone: '+1-555-0192',
      country: 'United States',
      timezone: 'America/New_York',
      installedApps: ['HR', 'ACCOUNTING', 'ATTENDANCE'],
    });

    console.log('--- TENANT CREATION RESPONSE ---');
    console.log('HTTP Status:', createTenantRes.status);
    console.log(JSON.stringify(createTenantRes.data, null, 2));

    // 3. List All Tenants and Statistics
    console.log('\n3. Fetching all tenants & platform statistics...');
    const listRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/admin/tenants',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('--- TENANTS LIST & STATS ---');
    console.log('HTTP Status:', listRes.status);
    console.log(JSON.stringify(listRes.data, null, 2));

  } catch (err) {
    console.error('Test execution failed:', err.message);
  }
}

runTest();