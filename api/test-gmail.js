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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = parseRequestBody(req);
    const { smtpUser, smtpPass, provider, host, port } = body;
    const user = smtpUser || SYSTEM_SMTP.user;
    const pass = smtpPass || SYSTEM_SMTP.pass;

    if (!user || !pass) {
      return res.status(400).json({ success: false, error: 'Missing SMTP email or password' });
    }

    const transporter = createDynamicTransporter({ provider, user, pass, host, port });

    await transporter.verify();
    return res.status(200).json({ success: true, message: `SMTP connection for ${user} verified successfully!` });
  } catch (err) {
    console.error('[UNIVERSAL SMTP TEST ERROR]', err);
    return res.status(400).json({
      success: false,
      error: `SMTP Error: ${err.message}. Please verify your username, App Password, and provider settings.`
    });
  }
}
