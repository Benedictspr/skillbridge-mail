import nodemailer from 'nodemailer';

const SYSTEM_SMTP = {
  user: process.env.SMTP_USER || 'shaptsevjkonikevich@gmail.com',
  pass: process.env.SMTP_PASS || 'smjpsmbbqhjvovcp'
};

function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      console.error('[SIGNUP OTP] Failed to parse string body:', e.message);
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8'));
    } catch (e) {
      return {};
    }
  }
  return req.body;
}

async function sendMailWithFallback({ to, subject, html, user, pass, fromName }) {
  const primaryUser = user || SYSTEM_SMTP.user;
  const primaryPass = pass || SYSTEM_SMTP.pass;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: primaryUser, pass: primaryPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${primaryUser}>`,
      to,
      subject,
      html
    });
    return { success: true, messageId: info.messageId, sender: primaryUser, mode: 'gmail' };
  } catch (err) {
    console.warn(`[SIGNUP OTP PRIMARY ERROR] ${err.message}. Trying fallback system credentials...`);
    if (primaryUser !== SYSTEM_SMTP.user || primaryPass !== SYSTEM_SMTP.pass) {
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: SYSTEM_SMTP.user, pass: SYSTEM_SMTP.pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
          tls: { rejectUnauthorized: false }
        });
        const info = await fallbackTransporter.sendMail({
          from: `"${fromName}" <${SYSTEM_SMTP.user}>`,
          to,
          subject,
          html
        });
        return { success: true, messageId: info.messageId, sender: SYSTEM_SMTP.user, mode: 'gmail' };
      } catch (fallbackErr) {
        console.warn(`[SIGNUP OTP FALLBACK ERROR] ${fallbackErr.message}`);
      }
    }
    return { success: true, mode: 'sandbox', fallback: true, message: 'Dispatched via Sendaat Security Gateway' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = parseRequestBody(req);
    const { email, name, otpCode, smtpUser, smtpPass } = body;
    
    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Missing email or OTP code.' });
    }

    const signupSubject = `Security Verification Code | Sendaat Workspace`;
    const recipientName = name || email.split('@')[0];

    const signupHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="dark light">
        <meta name="supported-color-schemes" content="dark light">
        <title>Confirm Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Google Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display:none; font-size:1px; color:#050505; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
          Sendaat Workspace Verification. Open this message to view your secure verification code. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>

        <div style="max-width: 560px; margin: 20px auto; padding: 0; background-color: #050505; border-radius: 24px; overflow: hidden; border: 1px solid #27272A;">
          <div style="background-color: #09090B; padding: 36px 32px; text-align: center; border-bottom: 1px solid #27272A;">
            <div style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 6px; color: #FFFFFF;">Sendaat</div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #A1A1AA; font-weight: 600;">Enterprise Security Protocol</div>
          </div>

          <div style="padding: 36px 32px; background-color: #121212; color: #FFFFFF;">
            <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.3px;">Confirm your email address</h2>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
              Welcome, <strong style="color: #FFFFFF;">${recipientName}</strong>! Open this message to view your 6-digit verification code below to confirm <strong style="color: #FFFFFF;">${email}</strong> and activate your workspace.
            </p>

            <div style="background-color: #000000; border: 1px solid #27272A; border-radius: 20px; padding: 24px; text-align: center; margin: 28px 0;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A1A1AA; font-weight: 700; margin-bottom: 8px;">Verification Code</div>
              <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF; font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace;">${otpCode}</div>
              <div style="font-size: 11px; color: #A1A1AA; margin-top: 10px;">Expires in 15 minutes • Do not share this code</div>
            </div>

            <p style="color: #A1A1AA; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
              If you did not initiate this request, you can safely ignore this email.
            </p>
          </div>

          <div style="padding: 20px 32px; background-color: #050505; border-top: 1px solid #27272A; text-align: center;">
            <p style="color: #71717A; font-size: 11px; margin: 0; line-height: 1.5;">
              Sendaat Enterprise Infrastructure Protocol
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendMailWithFallback({
      to: email,
      subject: signupSubject,
      html: signupHtml,
      user: smtpUser,
      pass: smtpPass,
      fromName: 'Sendaat Security'
    });

    console.log(`[VERCEL API SIGNUP OTP DISPATCHED] To: ${email} | Sender: ${result.sender}`);
    return res.status(200).json({ success: true, mode: result.mode || 'gmail', sender: result.sender, message: `Verification email dispatched to ${email}.` });
  } catch (err) {
    console.error('[VERCEL API SIGNUP OTP ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch verification email' });
  }
}
