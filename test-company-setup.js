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
  console.log('--- STARTING COMPANY SETUP & TENANT AUTH TEST ---');

  try {
    // 1. Tenant Owner Login for Acme Corp
    console.log('1. Logging in as Tenant Owner for "Acme Corp" (owner@acme.com)...');
    const loginRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/company/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'acme',
      },
    }, { email: 'owner@acme.com', password: 'Owner@123456' });

    console.log('--- TENANT OWNER LOGIN RESPONSE ---');
    console.log('HTTP Status:', loginRes.status);
    console.log(JSON.stringify(loginRes.data, null, 2));

    const token = loginRes.data.data.accessToken;

    // 2. Fetch Company Profile
    console.log('\n2. Fetching Company Profile for "Acme Corp"...');
    const getProfileRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/company/profile',
      method: 'GET',
      headers: {
        'x-tenant-id': 'acme',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('--- GET COMPANY PROFILE ---');
    console.log('HTTP Status:', getProfileRes.status);
    console.log(JSON.stringify(getProfileRes.data, null, 2));

    // 3. Update Company Profile
    console.log('\n3. Updating Company Profile (Logo, Address, Working Hours, Fiscal Year)...');
    const updateProfileRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/company/profile',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'acme',
        'Authorization': `Bearer ${token}`,
      },
    }, {
      name: 'Acme Corporation Inc.',
      logoUrl: 'https://cdn.acme.com/logo.png',
      taxId: 'US-987654321',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      workStartTime: '08:30',
      workEndTime: '17:30',
      fiscalYearStartMonth: 'April',
      timezone: 'America/New_York',
      defaultLanguage: 'en',
      address: {
        street: '100 Innovation Way',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
    });

    console.log('--- UPDATE COMPANY PROFILE RESPONSE ---');
    console.log('HTTP Status:', updateProfileRes.status);
    console.log(JSON.stringify(updateProfileRes.data, null, 2));

  } catch (err) {
    console.error('Test execution failed:', err.message);
  }
}

runTest();