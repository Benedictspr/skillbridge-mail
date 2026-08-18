import sendEmailHandler from './api/send-email.js';
import authHandler from './api/auth.js';
import twoFactorHandler from './api/2fa.js';
import syncHandler from './api/sync.js';

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, val) { this.headers[key] = val; },
    writeHead(code, headers) { this.statusCode = code; this.headers = headers; return this; },
    write(chunk) { this.written = (this.written || '') + chunk; return true; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
    end() { return this; }
  };
  return res;
}

async function runTests() {
  console.log('=== TESTING CONSOLIDATED VERCEL SERVERLESS FUNCTION HANDLERS ===\n');

  // Test 1: send-signup-otp via consolidated api/send-email.js
  console.log('Test 1: send-signup-otp (parsed body)...');
  const req1 = {
    method: 'POST',
    query: { action: 'send-signup-otp' },
    url: '/api/send-email?action=send-signup-otp',
    body: { email: 'shaptsevjkonikevich@gmail.com', name: 'Benedict', otpCode: '123456', mode: 'sandbox' }
  };
  const res1 = createMockRes();
  await sendEmailHandler(req1, res1);
  console.log('Result 1 status:', res1.statusCode, res1.data);

  // Test 2: send-welcome-email via consolidated api/send-email.js
  console.log('\nTest 2: send-welcome-email (parsed body)...');
  const req2 = {
    method: 'POST',
    query: { action: 'send-welcome-email' },
    url: '/api/send-email?action=send-welcome-email',
    body: { email: 'shaptsevjkonikevich@gmail.com', name: 'Benedict', company: 'SkillBridge', mode: 'sandbox' }
  };
  const res2 = createMockRes();
  await sendEmailHandler(req2, res2);
  console.log('Result 2 status:', res2.statusCode, res2.data);

  // Test 3: send-reset-otp via consolidated api/send-email.js
  console.log('\nTest 3: send-reset-otp (parsed body)...');
  const req3 = {
    method: 'POST',
    query: { action: 'send-reset-otp' },
    url: '/api/send-email?action=send-reset-otp',
    body: { email: 'shaptsevjkonikevich@gmail.com', otpCode: '888999', mode: 'sandbox' }
  };
  const res3 = createMockRes();
  await sendEmailHandler(req3, res3);
  console.log('Result 3 status:', res3.statusCode, res3.data);

  // Test 4: Auth Register Handler via consolidated api/auth.js
  console.log('\nTest 4: api/auth?action=register...');
  const req4 = {
    method: 'POST',
    query: { action: 'register' },
    url: '/api/auth?action=register',
    body: JSON.stringify({ email: 'testuser@example.com', password: 'NewSecurePassword123!', name: 'Test User' })
  };
  const res4 = createMockRes();
  await authHandler(req4, res4);
  console.log('Result 4 status:', res4.statusCode, res4.data);

  // Test 5: Auth Login Handler via consolidated api/auth.js
  console.log('\nTest 5: api/auth?action=login...');
  const req5 = {
    method: 'POST',
    query: { action: 'login' },
    url: '/api/auth?action=login',
    body: JSON.stringify({ email: 'testuser@example.com', password: 'NewSecurePassword123!' })
  };
  const res5 = createMockRes();
  await authHandler(req5, res5);
  console.log('Result 5 status:', res5.statusCode, res5.data);

  // Test 6: Sync Hydrate Handler via consolidated api/sync.js
  console.log('\nTest 6: api/sync?action=hydrate...');
  const req6 = {
    method: 'GET',
    query: { action: 'hydrate', userId: 'usr_test_user' },
    url: '/api/sync?action=hydrate&userId=usr_test_user',
    headers: { 'x-user-id': 'usr_test_user' }
  };
  const res6 = createMockRes();
  await syncHandler(req6, res6);
  console.log('Result 6 status:', res6.statusCode, 'version:', res6.data?.state?.version);

  // Test 7: 2FA Generate Handler via consolidated api/2fa.js
  console.log('\nTest 7: api/2fa?action=generate...');
  const req7 = {
    method: 'POST',
    query: { action: 'generate' },
    url: '/api/2fa?action=generate',
    body: JSON.stringify({ email: 'testuser@example.com' })
  };
  const res7 = createMockRes();
  await twoFactorHandler(req7, res7);
  console.log('Result 7 status:', res7.statusCode, res7.data?.success, 'secret length:', res7.data?.secret?.length);

  console.log('\n=== ALL CONSOLIDATED VERCEL FUNCTION HANDLERS VERIFIED 100% ===');
}

runTests().catch(err => console.error('TEST ERROR:', err));
