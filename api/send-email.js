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
      console.error('[SEND EMAIL] Failed to parse string body:', e.message);
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
    const { to, recipientEmail, subject, html, bodyText, smtpUser, smtpPass, fromName = 'Sendaat Outreach' } = body;
    const targetEmail = recipientEmail || to;

    if (!targetEmail) {
      return res.status(400).json({ error: 'Missing target recipient email address (to or recipientEmail)' });
    }

    const primaryUser = smtpUser || SYSTEM_SMTP.user;
    const primaryPass = smtpPass || SYSTEM_SMTP.pass;

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

    const contentHtml = html || `<p>${(bodyText || 'Outreach email message').replace(/\n/g, '<br/>')}</p>`;

    const mailOptions = {
      from: `"${fromName}" <${primaryUser}>`,
      to: targetEmail,
      subject: subject || 'SkillBridge Outreach Message',
      html: contentHtml
    };

    console.log(`[VERCEL API SENDING EMAIL] Dispatching to ${targetEmail} via ${primaryUser}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[VERCEL API SUCCESS] MessageId: ${info.messageId}`);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      sender: primaryUser,
      mode: 'live_smtp'
    });
  } catch (error) {
    console.error('[VERCEL API EMAIL ERROR]', error);

    const body = parseRequestBody(req);
    if (body.smtpUser && body.smtpUser !== SYSTEM_SMTP.user) {
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
          from: `"Sendaat Network" <${SYSTEM_SMTP.user}>`,
          to: body.recipientEmail || body.to,
          subject: body.subject || 'SkillBridge Outreach Message',
          html: body.html || `<p>${body.bodyText || ''}</p>`
        });
        return res.status(200).json({
          success: true,
          messageId: info.messageId,
          sender: SYSTEM_SMTP.user,
          mode: 'system_fallback'
        });
      } catch (fallbackErr) {
        console.error('[VERCEL API SYSTEM FALLBACK ERROR]', fallbackErr);
      }
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch email via SMTP'
    });
  }
}
