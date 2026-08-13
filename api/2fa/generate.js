import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
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
    const { email } = body;
    const userEmail = email || 'user@sendaat.io';

    const secret = generateSecret();
    const otpauthUrl = generateURI({ label: userEmail, issuer: 'Sendaat', secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return res.status(200).json({
      success: true,
      secret,
      otpauthUrl,
      qrCodeDataUrl
    });
  } catch (err) {
    console.error('[VERCEL API 2FA GENERATE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to generate 2FA secret' });
  }
}
