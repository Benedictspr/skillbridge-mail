import nodemailer from 'nodemailer';

const SYSTEM_SMTP = {
  user: process.env.SMTP_USER || 'shaptsevjkonikevich@gmail.com',
  pass: process.env.SMTP_PASS || 'smjpsmbbqhjvovcp'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { smtpUser, smtpPass } = req.body || {};
    const user = smtpUser || SYSTEM_SMTP.user;
    const pass = smtpPass || SYSTEM_SMTP.pass;

    if (!user || !pass) {
      return res.status(400).json({ success: false, error: 'Missing SMTP email or password' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();
    return res.status(200).json({ success: true, message: `SMTP connection to ${user} verified!` });
  } catch (err) {
    console.error('[VERCEL TEST GMAIL ERROR]', err);
    return res.status(400).json({
      success: false,
      error: `Gmail SMTP Error: ${err.message}. Ensure 2-Step Verification is enabled and a 16-character App Password is used.`
    });
  }
}
