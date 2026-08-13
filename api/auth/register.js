import { parseRequestBody, findUserByEmail, saveUserToStore, supabase } from '../../lib/authStore.js';

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
    const { email, password, name, company, role } = body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid work email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);

    const newUser = {
      id: existing?.id || `usr_${Date.now()}`,
      email: cleanEmail,
      password: password || 'Password123!',
      name: name ? name.trim() : cleanEmail.split('@')[0],
      company: company ? company.trim() : `${cleanEmail.split('@')[0]}'s Workspace`,
      role: role || 'Workspace Owner',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      onboardingCompleted: false,
      isEmailVerified: true,
      twoFactorEnabled: false
    };

    saveUserToStore(newUser);

    // Sync with Supabase Auth Cloud
    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: newUser.password,
        options: {
          data: { name: newUser.name, company: newUser.company, role: newUser.role }
        }
      });
    } catch (e) {
      console.warn('[VERCEL AUTH REGISTER] Supabase sync warning:', e.message);
    }

    console.log(`[VERCEL AUTH REGISTER SUCCESS] Registered: ${cleanEmail}`);
    return res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    console.error('[VERCEL AUTH REGISTER ERROR]', err);
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
}
