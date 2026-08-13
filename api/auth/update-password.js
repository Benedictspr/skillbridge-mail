import { parseRequestBody, findUserByEmail, saveUserToStore, supabase } from './store.js';

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
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = findUserByEmail(cleanEmail);

    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        password: newPassword,
        name: cleanEmail.split('@')[0],
        company: `${cleanEmail.split('@')[0]}'s Workspace`,
        role: 'Workspace Owner',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        onboardingCompleted: false,
        isEmailVerified: true,
        twoFactorEnabled: false
      };
    } else {
      user.password = newPassword;
    }

    saveUserToStore(user);

    // Sync password update to Supabase Cloud
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch (e) {
      console.warn('[VERCEL UPDATE PASSWORD] Supabase update warning:', e.message);
    }

    console.log(`[VERCEL UPDATE PASSWORD SUCCESS] Updated password for: ${cleanEmail}`);
    return res.status(200).json({ success: true, message: 'Password updated successfully across all devices.', user });
  } catch (err) {
    console.error('[VERCEL UPDATE PASSWORD ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update password.' });
  }
}
