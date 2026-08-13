import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
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
    const action = req.query.action || (req.url ? req.url.split('?')[0].split('/').pop() : '');
    const body = parseRequestBody(req);

    if (action === 'generate' || req.url.includes('/generate')) {
      const userEmail = body.email || 'user@sendaat.io';
      const secret = generateSecret();
      const otpauthUrl = generateURI({ label: userEmail, issuer: 'Sendaat', secret });
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return res.status(200).json({ success: true, secret, otpauthUrl, qrCodeDataUrl });
    } else if (action === 'verify' || req.url.includes('/verify') || body.token) {
      const { token, secret } = body;
      if (!token || !secret) {
        return res.status(400).json({ error: 'Missing token or secret for 2FA verification.' });
      }
      const cleanToken = token.toString().trim().replace(/\s+/g, '');
      const isValid = await verifyTotp({ token: cleanToken, secret });
      return res.status(200).json({ success: true, valid: Boolean(isValid) });
    }

    return res.status(400).json({ error: 'Invalid 2FA action requested.' });
  } catch (err) {
    console.error('[VERCEL API 2FA ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to process 2FA request' });
  }
}
