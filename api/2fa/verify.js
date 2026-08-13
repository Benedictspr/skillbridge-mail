import { verify as verifyTotp } from 'otplib';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { token, secret } = req.body || {};
    if (!token || !secret) {
      return res.status(400).json({ error: 'Missing token or secret for 2FA verification.' });
    }

    const cleanToken = token.toString().trim().replace(/\s+/g, '');
    const isValid = await verifyTotp({ token: cleanToken, secret });

    return res.status(200).json({ success: true, valid: Boolean(isValid) });
  } catch (err) {
    console.error('[VERCEL API 2FA VERIFY ERROR]', err);
    return res.status(500).json({ error: err.message || 'Invalid TOTP token verification.' });
  }
}
