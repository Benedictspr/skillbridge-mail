import nodemailer from 'nodemailer';

const user = 'shaptsevjkonikevich@gmail.com';
const pass = 'smjpsmbbqhjvovcp';

async function runDetailedDiagnostics() {
  console.log('--- STARTING DETAILED EMAIL DELIVERY DIAGNOSTICS ---');
  console.log(`Checking SMTP account: ${user}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    console.log('Step 1: Verifying SMTP connection to Google servers...');
    await transporter.verify();
    console.log('✅ STEP 1 SUCCESS: Google SMTP server authenticated successfully!');
  } catch (err) {
    console.error('❌ STEP 1 FAILED (SMTP Authentication Error):', err.message);
    return;
  }

  try {
    console.log('\nStep 2: Attempting to send test email to target inbox...');
    const targetRecipient = 'shaptsevjkonikevich@gmail.com';
    const info = await transporter.sendMail({
      from: `"SkillBridge Mail Test" <${user}>`,
      to: targetRecipient,
      subject: `SkillBridge Inbox Delivery Diagnostic - ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px;">
          <h2 style="color: #10b981;">✅ Email Delivery Test Passed!</h2>
          <p>This email was dispatched via SkillBridge Mail live SMTP delivery pipeline.</p>
          <p><strong>Message ID:</strong> ${Date.now()}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      text: 'SkillBridge Inbox Delivery Diagnostic Passed.'
    });

    console.log('✅ STEP 2 SUCCESS: Email accepted by Google SMTP server!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('Envelope:', info.envelope);
  } catch (err) {
    console.error('❌ STEP 2 FAILED (Message Send Error):', err.message);
  }
}

runDetailedDiagnostics();
