import sendWelcomeEmailHandler from './api/send-welcome-email.js';
import sendSignupOtpHandler from './api/send-signup-otp.js';
import sendResetOtpHandler from './api/send-reset-otp.js';

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

  // Test 2: send-signup-otp with string body (raw JSON string)
  console.log('\nTest 2: send-signup-otp (string body)...');
  const req2 = {
    method: 'POST',
    body: JSON.stringify({ email: 'shaptsevjkonikevich@gmail.com', name: 'Benedict', otpCode: '654321' })
  };
  const res2 = createMockRes();
  await sendSignupOtpHandler(req2, res2);
  console.log('Result 2 status:', res2.statusCode, res2.data);

  // Test 3: send-welcome-email with parsed object body
  console.log('\nTest 3: send-welcome-email (parsed body)...');
  const req3 = {
    method: 'POST',
    body: { email: 'shaptsevjkonikevich@gmail.com', name: 'Benedict', company: 'SkillBridge' }
  };
  const res3 = createMockRes();
  await sendWelcomeEmailHandler(req3, res3);
  console.log('Result 3 status:', res3.statusCode, res3.data);

  // Test 4: send-reset-otp with parsed object body
  console.log('\nTest 4: send-reset-otp (parsed body)...');
  const req4 = {
    method: 'POST',
    body: { email: 'shaptsevjkonikevich@gmail.com', otpCode: '888999' }
  };
  const res4 = createMockRes();
  await sendResetOtpHandler(req4, res4);
  console.log('Result 4 status:', res4.statusCode, res4.data);
}

runTests().catch(err => console.error('TEST ERROR:', err));
