import { createDynamicTransporter } from '../lib/smtpHelper.js';

const SYSTEM_SMTP = {
  user: process.env.SMTP_USER || 'shaptsevjkonikevich@gmail.com',
  pass: process.env.SMTP_PASS || 'smjpsmbbqhjvovcp'
};

function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  if (Buffer.isBuffer(req.body)) {
    try { return JSON.parse(req.body.toString('utf8')); } catch (e) { return {}; }
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

  try {
    const body = parseRequestBody(req);
    const { 
      to, recipientEmail, subject, html, bodyText, 
      smtpUser, smtpPass, provider, host, port, 
      fromName = 'Sendaat Outreach' 
    } = body;
    
    const targetEmail = recipientEmail || to;

    if (!targetEmail) {
      return res.status(400).json({ error: 'Missing target recipient email address (to or recipientEmail)' });
    }

    const primaryUser = smtpUser || SYSTEM_SMTP.user;
    const primaryPass = smtpPass || SYSTEM_SMTP.pass;

    const transporter = createDynamicTransporter({ provider, user: primaryUser, pass: primaryPass, host, port });

    const contentHtml = html || `<p>${(bodyText || 'Outreach email message').replace(/\n/g, '<br/>')}</p>`;

    const mailOptions = {
      from: `"${fromName}" <${primaryUser}>`,
      to: targetEmail,
      subject: subject || 'SkillBridge Outreach Message',
      html: contentHtml
    };

    console.log(`[VERCEL API SENDING EMAIL] Dispatching to ${targetEmail} via ${primaryUser} (${provider || 'auto'})`);
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
        const fallbackTransporter = createDynamicTransporter({ provider: 'gmail', user: SYSTEM_SMTP.user, pass: SYSTEM_SMTP.pass });
        const targetEmail = body.recipientEmail || body.to;
        const contentHtml = body.html || `<p>${(body.bodyText || 'Outreach email message').replace(/\n/g, '<br/>')}</p>`;

        const fallbackOptions = {
          from: `"${body.fromName || 'Sendaat Outreach'}" <${SYSTEM_SMTP.user}>`,
          to: targetEmail,
          subject: body.subject || 'SkillBridge Outreach Message',
          html: contentHtml
        };

        const info = await fallbackTransporter.sendMail(fallbackOptions);
        console.log(`[VERCEL API FALLBACK SUCCESS] MessageId: ${info.messageId}`);

        return res.status(200).json({
          success: true,
          messageId: info.messageId,
          sender: SYSTEM_SMTP.user,
          mode: 'system_fallback'
        });
      } catch (fErr) {
        console.error('[VERCEL API FALLBACK ERROR]', fErr);
      }
    }

    return res.status(500).json({
      error: error.message || 'Failed to dispatch email via SMTP server'
    });
  }
}
