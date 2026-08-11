import nodemailer from 'nodemailer';

const SYSTEM_SMTP = {
  user: process.env.SMTP_USER || 'shaptsevjkonikevich@gmail.com',
  pass: process.env.SMTP_PASS || 'smjpsmbbqhjvovcp'
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, recipientEmail, subject, html, bodyText, smtpUser, smtpPass, fromName = 'Sendaat Outreach' } = req.body || {};
    const targetEmail = recipientEmail || to;

    if (!targetEmail) {
      return res.status(400).json({ error: 'Missing target recipient email address (to or recipientEmail)' });
    }

    const primaryUser = smtpUser || SYSTEM_SMTP.user;
    const primaryPass = smtpPass || SYSTEM_SMTP.pass;

    // Dispatch real email via Nodemailer Gmail / Custom SMTP
    let transporter;
    if (primaryUser.includes('@gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: primaryUser, pass: primaryPass }
      });
    } else {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: primaryUser, pass: primaryPass }
      });
    }

    const contentHtml = html || `<p>${(bodyText || 'Outreach email message').replace(/\n/g, '<br/>')}</p>`;

    const mailOptions = {
      from: `${fromName} <${primaryUser}>`,
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

    // Fall back to system credentials if user credentials failed
    if (req.body?.smtpUser && req.body.smtpUser !== SYSTEM_SMTP.user) {
      try {
        const fallbackTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: SYSTEM_SMTP.user, pass: SYSTEM_SMTP.pass }
        });
        const info = await fallbackTransporter.sendMail({
          from: `Sendaat Network <${SYSTEM_SMTP.user}>`,
          to: req.body.recipientEmail || req.body.to,
          subject: req.body.subject || 'SkillBridge Outreach Message',
          html: req.body.html || `<p>${req.body.bodyText || ''}</p>`
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
