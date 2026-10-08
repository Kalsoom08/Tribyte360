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
  console.log('--- STARTING HR EMPLOYEE & CONTRACT MANAGEMENT TEST ---');

  try {
    // 1. Super Admin Login
    console.log('1. Logging in as Super Admin...');
    const superLoginRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'admin@tribyte360.com', password: 'Admin@123456' });

    const superToken = superLoginRes.data.data.accessToken;

    // 2. Create Tenant with HR Module
    const slug = 'hrcorp-' + Math.floor(Math.random() * 1000);
    const ownerEmail = `owner@${slug}.com`;
    console.log(`\n2. Provisioning fresh Tenant '${slug}'...`);

    const createTenantRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: '/api/v1/admin/tenants', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${superToken}` },
    }, { name: 'HRCorp Global', slug, ownerEmail, installedApps: ['HR'] });

    const initialPassword = createTenantRes.data.data.initialAdminCredentials.temporaryPassword;

    // 3. Tenant Owner Login
    console.log(`\n3. Logging in as Tenant Owner for '${slug}'...`);
    const tenantLoginRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: '/api/v1/company/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': slug },
    }, { email: ownerEmail, password: initialPassword });

    const tenantToken = tenantLoginRes.data.data.accessToken;
    const reqHeaders = {
      'Content-Type': 'application/json',
      'x-tenant-id': slug,
      'Authorization': `Bearer ${tenantToken}`,
    };

    // 4. Create Department
    console.log('\n4. Creating Department: Software Engineering (ENG)...');
    const deptRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: '/api/v1/company/org/departments', method: 'POST', headers: reqHeaders,
    }, { name: 'Software Engineering', code: 'ENG' });
    const deptId = deptRes.data.data._id;

    // 5. Onboard Employee with Full Profile, Documents & Employment Contract
    console.log('\n5. Onboarding Employee: Alex Engineer (alex@hrcorp.com)...');
    const createEmpRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: '/api/v1/hr/employees', method: 'POST', headers: reqHeaders,
    }, {
      email: `alex@${slug}.com`,
      fullName: 'Alex Engineer',
      employeeCode: 'EMP-2001',
      departmentId: deptId,
      phone: '+1-555-9876',
      contractType: 'FULL_TIME',
      baseSalary: 85000,
      currency: 'USD',
      probationDays: 90,
      noticePeriodDays: 30,
      joiningDate: '2026-01-15',
      dateOfBirth: '1995-06-20',
      gender: 'MALE',
      nationality: 'American',
      emergencyContactName: 'Jane Engineer',
      emergencyContactPhone: '+1-555-1122',
      documents: [
        { type: 'PASSPORT', documentNumber: 'US-PASS-102938', expiryDate: '2030-01-01' },
        { type: 'NATIONAL_ID', documentNumber: 'SSN-999-00-1122' },
      ],
    });

    console.log('--- EMPLOYEE CREATED RESPONSE ---');
    console.log('HTTP Status:', createEmpRes.status);
    console.log(JSON.stringify(createEmpRes.data, null, 2));

    const employeeProfileId = createEmpRes.data.data.profile._id;

    // 6. Fetch Employee 360 View
    console.log(`\n6. Fetching 360-degree View for Employee Profile (${employeeProfileId})...`);
    const getEmpRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: `/api/v1/hr/employees/${employeeProfileId}`, method: 'GET', headers: reqHeaders,
    });

    console.log('--- EMPLOYEE 360 VIEW ---');
    console.log('HTTP Status:', getEmpRes.status);
    console.log(JSON.stringify(getEmpRes.data, null, 2));

    // 7. Fetch All HR Employees & Attrition Stats
    console.log('\n7. Fetching All HR Employees & Attrition Stats...');
    const listEmpRes = await httpRequest({
      hostname: '127.0.0.1', port: 3000, path: '/api/v1/hr/employees', method: 'GET', headers: reqHeaders,
    });

    console.log('--- HR EMPLOYEES & ATTRITION STATS ---');
    console.log('HTTP Status:', listEmpRes.status);
    console.log(JSON.stringify(listEmpRes.data, null, 2));

  } catch (err) {
    console.error('Test execution failed:', err.message);
  }
}

runTest();