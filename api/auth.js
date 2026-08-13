import { parseRequestBody, findUserByEmail, saveUserToStore, supabase } from '../lib/authStore.js';

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

    if (action === 'login' || req.url.includes('/login') || req.url.includes('auth-login')) {
      return await handleLogin(req, res, body);
    } else if (action === 'register' || req.url.includes('/register') || req.url.includes('auth-register')) {
      return await handleRegister(req, res, body);
    } else if (action === 'update-password' || req.url.includes('/update-password') || req.url.includes('auth-update-password')) {
      return await handleUpdatePassword(req, res, body);
    }

    if (body.newPassword) return await handleUpdatePassword(req, res, body);
    if (body.name || body.company) return await handleRegister(req, res, body);
    return await handleLogin(req, res, body);

  } catch (err) {
    console.error('[VERCEL AUTH ROUTER ERROR]', err);
    return res.status(500).json({ success: false, error: err.message || 'Authentication system error' });
  }
}

async function handleLogin(req, res, body) {
  const { email, password } = body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = findUserByEmail(cleanEmail);

  if (user && user.password === password) {
    console.log(`[VERCEL AUTH LOGIN SUCCESS] Authenticated via server store: ${cleanEmail}`);
    return res.status(200).json({ success: true, user });
  }

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
}

async function handleRegister(req, res, body) {
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
}

async function handleUpdatePassword(req, res, body) {
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

  try {
    await supabase.auth.updateUser({ password: newPassword });
  } catch (e) {
    console.warn('[VERCEL UPDATE PASSWORD] Supabase update warning:', e.message);
  }

  console.log(`[VERCEL UPDATE PASSWORD SUCCESS] Updated password for: ${cleanEmail}`);
  return res.status(200).json({ success: true, message: 'Password updated successfully across all devices.', user });
}
