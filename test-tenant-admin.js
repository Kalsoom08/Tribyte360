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
  console.log('--- STARTING TENANT ADMIN CONTROL TEST ---');

  try {
    // 1. Login as Super Admin
    const loginRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'admin@tribyte360.com', password: 'Admin@123456' });

    const token = loginRes.data.data.accessToken;
    console.log('✓ Authenticated as Super Admin.');

    // 2. Fetch Tenants to get Acme Corp ID
    const listRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/admin/tenants',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const tenant = listRes.data.data.tenants.find((t) => t.slug === 'acme');
    if (!tenant) {
      console.error('Tenant "acme" not found. Please run test-tenant.js first.');
      return;
    }

    const tenantId = tenant._id;
    console.log(`✓ Found Tenant "Acme Corp" (ID: ${tenantId}).`);

    // 3. Reset Tenant Admin Password
    console.log('\n3. Resetting Tenant Admin Password...');
    const resetRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/admin/tenants/${tenantId}/reset-admin-password`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('--- RESET PASSWORD RESPONSE ---');
    console.log('HTTP Status:', resetRes.status);
    console.log(JSON.stringify(resetRes.data, null, 2));

    // 4. Block Tenant Admin
    console.log('\n4. Blocking Tenant Admin Account...');
    const blockRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/admin/tenants/${tenantId}/block-admin`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, { isBlocked: true });
    console.log('--- BLOCK ADMIN RESPONSE ---');
    console.log('HTTP Status:', blockRes.status);
    console.log(JSON.stringify(blockRes.data, null, 2));

    // 5. Activate Tenant Status
    console.log('\n5. Updating Tenant Status from TRIAL to ACTIVE...');
    const statusRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/admin/tenants/${tenantId}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, { status: 'ACTIVE' });
    console.log('--- UPDATE STATUS RESPONSE ---');
    console.log('HTTP Status:', statusRes.status);
    console.log(JSON.stringify(statusRes.data, null, 2));

  } catch (err) {
    console.error('Test execution failed:', err.message);
  }
}

runTest();