import { 
  parseRequestBody, 
  findUserByEmail, 
  findUserById,
  findUserByGoogleSub,
  findUserByPasskeyCredentialId,
  saveUserToStore, 
  supabase, 
  createSession,
  createAuthToken, 
  sanitizeUser,
  hashPassword,
  verifyPassword,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  revokeSession,
  revokeAllOtherSessions,
  getUserSessions,
  canRemoveAuthenticationMethod,
  recordSecurityEvent
} from '../lib/authStore.js';

import {
  createPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  createPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication
} from '../lib/webauthnHelper.js';

import { verifyGoogleToken } from '../lib/googleAuthHelper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Device-Id'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const action = req.query.action || (req.url ? req.url.split('?')[0].split('/').pop() : '');
    const body = parseRequestBody(req);

    if (action === 'login' || req.url.includes('/login')) {
      return await handleLogin(req, res, body);
    } else if (action === 'register' || req.url.includes('/register')) {
      return await handleRegister(req, res, body);
    } else if (action === 'update-password' || req.url.includes('/update-password')) {
      return await handleUpdatePassword(req, res, body);
    } else if (action === 'google-verify' || req.url.includes('/google/verify')) {
      return await handleGoogleVerify(req, res, body);
    } else if (action === 'passkey-reg-opts' || req.url.includes('/passkey/register-options')) {
      return await handlePasskeyRegOptions(req, res, body);
    } else if (action === 'passkey-reg-verify' || req.url.includes('/passkey/register-verify')) {
      return await handlePasskeyRegVerify(req, res, body);
    } else if (action === 'passkey-auth-opts' || req.url.includes('/passkey/auth-options')) {
      return await handlePasskeyAuthOptions(req, res, body);
    } else if (action === 'passkey-auth-verify' || req.url.includes('/passkey/auth-verify')) {
      return await handlePasskeyAuthVerify(req, res, body);
    }

    if (body.credential || body.token && body.token.startsWith('ey')) {
      return await handleGoogleVerify(req, res, body);
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

  if (user) {
    const isValid = await verifyPassword(user.passwordCredential, password);
    if (isValid) {
      if (user.passwordCredential && !user.passwordCredential.hash.startsWith('$argon2')) {
        user.passwordCredential.hash = await hashPassword(password);
        user.passwordCredential.algorithm = 'argon2id';
        saveUserToStore(user);
      }
      const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
      return res.status(200).json({ success: true, user: sanitizeUser(user), token });
    }
  }

  return res.status(401).json({
    success: false,
    reason: 'INVALID_CREDENTIALS',
    message: 'Incorrect email or password. Please try again.'
  });
}

async function handleRegister(req, res, body) {
  const { email, password, name, company, role } = body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid work email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const rawPass = password || 'Password123!';
  const passwordHash = await hashPassword(rawPass);

  const newUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: name ? name.trim() : cleanEmail.split('@')[0],
    company: company ? company.trim() : `${cleanEmail.split('@')[0]}'s Workspace`,
    role: role || 'Workspace Owner',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
    onboardingCompleted: false,
    isEmailVerified: true,
    twoFactorEnabled: false,
    passwordCredential: {
      hash: passwordHash,
      algorithm: 'argon2id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    identities: [],
    passkeys: [],
    sessions: [],
    securityEvents: []
  };

  saveUserToStore(newUser);
  const { token } = createSession(newUser, req, { deviceId: req.headers['x-device-id'] });
  return res.status(200).json({ success: true, user: sanitizeUser(newUser), token });
}

async function handleUpdatePassword(req, res, body) {
  const { email, newPassword } = body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = findUserByEmail(cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const passwordHash = await hashPassword(newPassword);
  user.passwordCredential = {
    hash: passwordHash,
    algorithm: 'argon2id',
    createdAt: user.passwordCredential?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveUserToStore(user);
  const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
  return res.status(200).json({ success: true, message: 'Password updated successfully across all devices.', user: sanitizeUser(user), token });
}

async function handleGoogleVerify(req, res, body) {
  const credentialToken = body.token || body.credential;
  if (!credentialToken) {
    return res.status(400).json({ error: 'Missing Google credential token.' });
  }

  const verified = await verifyGoogleToken(credentialToken);
  const { googleSub, email, name, avatar, isEmailVerified } = verified;

  let user = findUserByGoogleSub(googleSub) || (email ? findUserByEmail(email) : null);

  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      email: email,
      name: name || email.split('@')[0],
      company: `${name || email.split('@')[0]}'s Workspace`,
      role: 'Workspace Owner',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      onboardingCompleted: false,
      isEmailVerified: Boolean(isEmailVerified),
      identities: [{ provider: 'google', sub: googleSub, email, linkedAt: new Date().toISOString() }],
      passkeys: [],
      sessions: [],
      securityEvents: []
    };
  } else {
    user.identities = user.identities || [];
    if (!user.identities.some(i => i.provider === 'google' && i.sub === googleSub)) {
      user.identities.push({ provider: 'google', sub: googleSub, email, linkedAt: new Date().toISOString() });
    }
  }

  saveUserToStore(user);
  const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
  return res.status(200).json({ success: true, user: sanitizeUser(user), token });
}

async function handlePasskeyRegOptions(req, res, body) {
  const { email } = body;
  const user = email ? findUserByEmail(email) : null;
  const { options, challengeId } = await createPasskeyRegistrationOptions(
    user || { id: `usr_${Date.now()}`, email: email || 'user@skillbridge.io' },
    user?.passkeys || [],
    req
  );
  return res.json({ success: true, options, challengeId });
}

async function handlePasskeyRegVerify(req, res, body) {
  const { response, challengeId, name, email } = body;
  const { credential, userId } = await verifyPasskeyRegistration(response, challengeId, req);

  let user = findUserById(userId) || (email ? findUserByEmail(email) : null);
  if (!user) {
    user = {
      id: userId,
      email: email || `user_${Date.now()}@skillbridge.io`,
      name: (email || 'user').split('@')[0],
      company: 'Workspace',
      role: 'Workspace Owner',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userId)}`,
      onboardingCompleted: false,
      isEmailVerified: true,
      passkeys: [],
      identities: [],
      sessions: [],
      securityEvents: []
    };
  }

  const passkeyRecord = {
    credentialId: credential.credentialId,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: credential.transports,
    deviceType: credential.deviceType,
    backedUp: credential.backedUp,
    name: (name || 'Security Passkey').trim(),
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    status: 'active'
  };

  user.passkeys = (user.passkeys || []).filter(p => p.credentialId !== passkeyRecord.credentialId);
  user.passkeys.push(passkeyRecord);
  saveUserToStore(user);

  const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
  return res.json({ success: true, user: sanitizeUser(user), credential: passkeyRecord, token });
}

async function handlePasskeyAuthOptions(req, res, body) {
  const { email } = body;
  const user = email ? findUserByEmail(email) : null;
  const { options, challengeId } = await createPasskeyAuthenticationOptions(user, user?.passkeys || [], req);
  return res.json({ success: true, options, challengeId });
}

async function handlePasskeyAuthVerify(req, res, body) {
  const { response, challengeId } = body;
  const credentialId = response.id;
  const user = findUserByPasskeyCredentialId(credentialId);
  if (!user) return res.status(401).json({ error: 'Unrecognized passkey credential.' });

  const storedPasskey = (user.passkeys || []).find(p => p.credentialId === credentialId && p.status !== 'revoked');
  if (!storedPasskey) return res.status(401).json({ error: 'Passkey is revoked.' });

  const verificationResult = await verifyPasskeyAuthentication(response, storedPasskey, challengeId, req);
  storedPasskey.counter = verificationResult.newCounter;
  storedPasskey.lastUsedAt = new Date().toISOString();
  saveUserToStore(user);

  const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
  return res.json({ success: true, user: sanitizeUser(user), token });
}
