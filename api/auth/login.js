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
    const { email, password } = body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = findUserByEmail(cleanEmail);

    // 1. Check local server store match
    if (user) {
      if (user.password === password) {
        console.log(`[VERCEL AUTH LOGIN SUCCESS] Authenticated via server store: ${cleanEmail}`);
        return res.status(200).json({ success: true, user });
      }
    }

    // 2. Query Supabase Cloud Auth for cross-device validation
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!error && data?.user) {
        const meta = data.user.user_metadata || {};
        const cloudUser = {
          id: data.user.id || `usr_${Date.now()}`,
          email: cleanEmail,
          password: password,
          name: meta.name || cleanEmail.split('@')[0],
          company: meta.company || `${cleanEmail.split('@')[0]}'s Workspace`,
          role: meta.role || 'Workspace Owner',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
          onboardingCompleted: false,
          isEmailVerified: true,
          twoFactorEnabled: false
        };

        saveUserToStore(cloudUser);
        console.log(`[VERCEL AUTH LOGIN SUCCESS] Authenticated via Supabase Cloud: ${cleanEmail}`);
        return res.status(200).json({ success: true, user: cloudUser });
      }
    } catch (sbErr) {
      console.warn('[VERCEL AUTH LOGIN] Supabase query warning:', sbErr.message);
    }

    // 3. Fallback response for unverified credentials
    if (!user) {
      return res.status(404).json({
        success: false,
        reason: 'EMAIL_NOT_FOUND',
        message: 'No account found with this email address. Please create an account.'
      });
    }

    return res.status(401).json({
      success: false,
      reason: 'INVALID_PASSWORD',
      message: 'Incorrect password. Please try again or reset your password.'
    });

  } catch (err) {
    console.error('[VERCEL AUTH LOGIN ERROR]', err);
    return res.status(500).json({ success: false, message: err.message || 'Authentication error.' });
  }
}
