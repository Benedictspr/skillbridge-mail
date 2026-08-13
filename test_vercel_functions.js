import sendWelcomeEmailHandler from './api/send-welcome-email.js';
import sendSignupOtpHandler from './api/send-signup-otp.js';
import sendResetOtpHandler from './api/send-reset-otp.js';
import loginAuthHandler from './api/auth-login.js';
import registerAuthHandler from './api/auth-register.js';
import updatePasswordAuthHandler from './api/auth-update-password.js';

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, val) { this.headers[key] = val; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
    end() { return this; }
  };
  return res;
}

async function runTests() {
  console.log('=== TESTING VERCEL SERVERLESS FUNCTION HANDLERS ===\n');

  // Test 1: send-signup-otp with parsed object body
  console.log('Test 1: send-signup-otp (parsed body)...');
  const req1 = {
    method: 'POST',
    body: { email: 'shaptsevjkonikevich@gmail.com', name: 'Benedict', otpCode: '123456' }
  };
  const res1 = createMockRes();
  await sendSignupOtpHandler(req1, res1);
  console.log('Result 1 status:', res1.statusCode, res1.data);

  // Test 2: send-welcome-email with parsed object body
  console.log('\nTest 2: send-welcome-email (parsed body)...');
  const req2 = {
    method: 'POST',
    body: { email: 'shaptsevjkonikevich@gmail.com', name: 'Benedict', company: 'SkillBridge' }
  };
  const res2 = createMockRes();
  await sendWelcomeEmailHandler(req2, res2);
  console.log('Result 2 status:', res2.statusCode, res2.data);

  // Test 3: send-reset-otp with parsed object body
  console.log('\nTest 3: send-reset-otp (parsed body)...');
  const req3 = {
    method: 'POST',
    body: { email: 'shaptsevjkonikevich@gmail.com', otpCode: '888999' }
  };
  const res3 = createMockRes();
  await sendResetOtpHandler(req3, res3);
  console.log('Result 3 status:', res3.statusCode, res3.data);

  // Test 4: Auth Register Handler
  console.log('\nTest 4: api/auth-register...');
  const req4 = {
    method: 'POST',
    body: JSON.stringify({ email: 'testuser@example.com', password: 'NewSecurePassword123!', name: 'Test User' })
  };
  const res4 = createMockRes();
  await registerAuthHandler(req4, res4);
  console.log('Result 4 status:', res4.statusCode, res4.data);

  // Test 5: Auth Login Handler
  console.log('\nTest 5: api/auth-login...');
  const req5 = {
    method: 'POST',
    body: JSON.stringify({ email: 'testuser@example.com', password: 'NewSecurePassword123!' })
  };
  const res5 = createMockRes();
  await loginAuthHandler(req5, res5);
  console.log('Result 5 status:', res5.statusCode, res5.data);

  // Test 6: Auth Password Update Handler
  console.log('\nTest 6: api/auth-update-password...');
  const req6 = {
    method: 'POST',
    body: JSON.stringify({ email: 'testuser@example.com', newPassword: 'UpdatedPassword789!' })
  };
  const res6 = createMockRes();
  await updatePasswordAuthHandler(req6, res6);
  console.log('Result 6 status:', res6.statusCode, res6.data);
}

runTests().catch(err => console.error('TEST ERROR:', err));
