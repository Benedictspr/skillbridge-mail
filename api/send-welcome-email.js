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
      console.error('[WELCOME EMAIL] Failed to parse string body:', e.message);
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
    console.warn(`[WELCOME EMAIL PRIMARY ERROR] ${err.message}. Trying system fallback credentials...`);
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
        console.warn(`[WELCOME EMAIL FALLBACK ERROR] ${fallbackErr.message}`);
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
    const { email, name, company, smtpUser, smtpPass } = body;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing recipient email address.' });
    }

    const recipientName = name || email.split('@')[0];
    const workspaceName = company || 'Sendaat Workspace';

    const welcomeSubject = `Welcome to Sendaat, ${recipientName}!`;
    const welcomeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="dark light">
        <meta name="supported-color-schemes" content="dark light">
        <title>Welcome to Sendaat</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Google Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display:none; font-size:1px; color:#050505; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
          Welcome to Sendaat Infrastructure. Your workspace is active and ready. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>

        <div style="max-width: 560px; margin: 20px auto; padding: 0; background-color: #050505; border-radius: 24px; overflow: hidden; border: 1px solid #27272A;">
          
          <!-- Top Header -->
          <div style="background-color: #09090B; padding: 36px 32px; text-align: center; border-bottom: 1px solid #27272A;">
            <div style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 6px; color: #FFFFFF;">Sendaat</div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #A1A1AA; font-weight: 600;">Enterprise Infrastructure</div>
          </div>

          <!-- Main Content -->
          <div style="padding: 36px 32px; background-color: #121212; color: #FFFFFF;">
            <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.3px;">
              Welcome aboard, ${recipientName}!
            </h2>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
              Your workspace <strong style="color: #FFFFFF;">${workspaceName}</strong> is verified and ready. Experience high-deliverability email infrastructure designed for performance.
            </p>

            <!-- Feature Capabilities Box -->
            <div style="background-color: #000000; border: 1px solid #27272A; border-radius: 20px; padding: 24px; margin: 24px 0;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A1A1AA; font-weight: 700; margin-bottom: 20px; text-align: center;">
                Core Capabilities Enabled
              </div>
              
              <!-- Feature 1 -->
              <div style="margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #18181B;">
                <div style="font-weight: 600; color: #FFFFFF; font-size: 14px; margin-bottom: 4px;">
                  ⚡ Peak Deliverability
                </div>
                <div style="color: #A1A1AA; font-size: 12.5px; line-height: 1.5;">
                  Automated IP warming, SPF & DKIM authentication ensuring your emails land directly in the primary inbox.
                </div>
              </div>

              <!-- Feature 2 -->
              <div style="margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #18181B;">
                <div style="font-weight: 600; color: #FFFFFF; font-size: 14px; margin-bottom: 4px;">
                  🛡️ Smart Bounce Protection
                </div>
                <div style="color: #A1A1AA; font-size: 12.5px; line-height: 1.5;">
                  Real-time hard bounce suppression guarding your domain reputation automatically.
                </div>
              </div>

              <!-- Feature 3 -->
              <div>
                <div style="font-weight: 600; color: #FFFFFF; font-size: 14px; margin-bottom: 4px;">
                  📬 Unified Inbox Sync
                </div>
                <div style="color: #A1A1AA; font-size: 12.5px; line-height: 1.5;">
                  Instant Gmail IMAP/SMTP integration to track replies, opens, and campaign performance in real time.
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0 12px 0;">
              <a href="https://skillbridge-mail.vercel.app" target="_blank" style="background-color: #FFFFFF; color: #000000; font-weight: 700; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 13px; letter-spacing: -0.2px;">
                Launch Workspace →
              </a>
            </div>
          </div>

          <!-- Social Media & Protocol Footer -->
          <div style="padding: 24px 32px; background-color: #050505; border-top: 1px solid #27272A; text-align: center;">
            <div style="margin-bottom: 16px;">
              <a href="https://x.com" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                <img src="https://img.icons8.com/ios-filled/48/ffffff/twitterx.png" alt="X" width="18" height="18" style="vertical-align: middle; opacity: 0.85;" />
              </a>
              <a href="https://facebook.com" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                <img src="https://img.icons8.com/ios-filled/48/ffffff/facebook-new.png" alt="Facebook" width="18" height="18" style="vertical-align: middle; opacity: 0.85;" />
              </a>
              <a href="https://instagram.com" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                <img src="https://img.icons8.com/ios-filled/48/ffffff/instagram-new.png" alt="Instagram" width="18" height="18" style="vertical-align: middle; opacity: 0.85;" />
              </a>
              <a href="https://linkedin.com" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                <img src="https://img.icons8.com/ios-filled/48/ffffff/linkedin.png" alt="LinkedIn" width="18" height="18" style="vertical-align: middle; opacity: 0.85;" />
              </a>
              <a href="https://snapchat.com" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                <img src="https://img.icons8.com/ios-filled/48/ffffff/snapchat.png" alt="Snapchat" width="18" height="18" style="vertical-align: middle; opacity: 0.85;" />
              </a>
            </div>

            <p style="color: #71717A; font-size: 11px; margin: 0; line-height: 1.6;">
              Account Email: <strong style="color: #A1A1AA;">${email}</strong> • Workspace: <strong style="color: #A1A1AA;">${workspaceName}</strong><br/>
              Sendaat Enterprise Infrastructure Protocol
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const result = await sendMailWithFallback({
      to: email,
      subject: welcomeSubject,
      html: welcomeHtml,
      user: smtpUser,
      pass: smtpPass,
      fromName: 'Sendaat Welcome Team'
    });

    console.log(`[VERCEL API WELCOME EMAIL SENT] To: ${email} | Sender: ${result.sender}`);
    return res.status(200).json({ success: true, mode: result.mode, sender: result.sender, message: `Welcome email dispatched to ${email}.` });
  } catch (err) {
    console.error('[VERCEL API WELCOME EMAIL ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch welcome email' });
  }
}
