import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tbebbtlgiqkkkixxibqk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZWJidGxnaXFra2tpeHhpYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Nzk3NDAsImV4cCI6MjEwMjA1NTc0MH0.9_4bnvr3y__kk8gWkxuY-wXHAzX-QQnfQGJ2rEeP2hI';
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'skillbridge_production_enterprise_jwt_secret_2026_x89';

class DummyWebSocket {}
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = DummyWebSocket;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { enabled: false }
});

// --- In-Memory & Central Store for Canonical Users ---
export let registeredUsersStore = [];

// Rate Limiting & Abuse Prevention Tracker
const rateLimitTracker = new Map();

export function checkRateLimit(key, maxAttempts = 20, windowMs = 60000, blockDurationMs = 300000) {
  const now = Date.now();
  const entry = rateLimitTracker.get(key);

  if (!entry) {
    return { allowed: true, remaining: maxAttempts };
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfterSec = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec, reason: 'RATE_LIMITED' };
  }

  if (now - entry.firstAttemptAt > windowMs) {
    rateLimitTracker.delete(key);
    return { allowed: true, remaining: maxAttempts };
  }

  if (entry.attempts >= maxAttempts) {
    entry.blockedUntil = now + blockDurationMs;
    const retryAfterSec = Math.ceil(blockDurationMs / 1000);
    return { allowed: false, remaining: 0, retryAfterSec, reason: 'RATE_LIMITED' };
  }

  return { allowed: true, remaining: maxAttempts - entry.attempts };
}

export function recordFailedAttempt(key, maxAttempts = 20, windowMs = 60000, blockDurationMs = 300000) {
  const now = Date.now();
  const entry = rateLimitTracker.get(key) || { attempts: 0, firstAttemptAt: now, blockedUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= maxAttempts) {
    entry.blockedUntil = now + blockDurationMs;
  }
  rateLimitTracker.set(key, entry);
}

export function clearFailedAttempts(key) {
  rateLimitTracker.delete(key);
}

// --- Argon2id Password Hashing & Verification ---

export async function hashPassword(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Password must be a valid non-empty string.');
  }
  return await argon2Hash(plaintext, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(storedCredentialOrHash, plaintext) {
  if (!storedCredentialOrHash || !plaintext) return false;

  const hashString = typeof storedCredentialOrHash === 'object'
    ? storedCredentialOrHash.hash
    : storedCredentialOrHash;

  if (!hashString) return false;

  // 1. Argon2id verification
  if (hashString.startsWith('$argon2')) {
    try {
      return await argon2Verify(hashString, plaintext);
    } catch (e) {
      return false;
    }
  }

  // 2. Legacy fallback / Migration check for existing accounts
  if (hashString === plaintext) {
    return true;
  }

  return false;
}

// --- Canonical User Data Normalization & Sanitization ---

export function normalizeUserRecord(user) {
  if (!user || !user.id) return null;

  const now = new Date().toISOString();
  const normalized = {
    id: String(user.id).trim(),
    email: (user.email || '').trim().toLowerCase(),
    name: user.name || (user.email ? user.email.split('@')[0] : 'SkillBridge User'),
    company: user.company || `${user.name || 'SkillBridge'}'s Workspace`,
    role: user.role || 'Workspace Owner',
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.id)}`,
    onboardingCompleted: Boolean(user.onboardingCompleted ?? true),
    isEmailVerified: Boolean(user.isEmailVerified ?? true),
    twoFactorEnabled: Boolean(user.twoFactorEnabled ?? false),
    twoFactorSecret: user.twoFactorSecret || null,
    identities: Array.isArray(user.identities) ? user.identities : [],
    passwordCredential: user.passwordCredential || null,
    passkeys: Array.isArray(user.passkeys) ? user.passkeys : [],
    sessions: Array.isArray(user.sessions) ? user.sessions : [],
    securityEvents: Array.isArray(user.securityEvents) ? user.securityEvents : [],
    recoveryMethods: Array.isArray(user.recoveryMethods) ? user.recoveryMethods : [],
    passwordResetTokens: Array.isArray(user.passwordResetTokens) ? user.passwordResetTokens : [],
    createdAt: user.createdAt || now,
    updatedAt: user.updatedAt || now
  };

  // Migrate legacy plaintext password or password property into passwordCredential
  if (user.password && !normalized.passwordCredential) {
    normalized.passwordCredential = {
      hash: user.password,
      algorithm: user.password.startsWith('$argon2') ? 'argon2id' : 'legacy_migration_pending',
      createdAt: now,
      updatedAt: now
    };
  }

  return normalized;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const normalized = normalizeUserRecord(user);
  if (!normalized) return null;

  const {
    passwordCredential,
    twoFactorSecret,
    passwordResetTokens,
    sessions,
    ...safeUser
  } = normalized;

  safeUser.hasPassword = Boolean(passwordCredential && passwordCredential.hash);
  safeUser.hasGoogle = normalized.identities.some(i => i.provider === 'google');
  safeUser.passkeys = (normalized.passkeys || [])
    .filter(p => p.status !== 'revoked')
    .map(p => ({
      credentialId: p.credentialId,
      name: p.name,
      deviceType: p.deviceType,
      createdAt: p.createdAt,
      lastUsedAt: p.lastUsedAt
    }));
  safeUser.passkeyCount = safeUser.passkeys.length;
  safeUser.configuredMethods = {
    google: safeUser.hasGoogle,
    password: safeUser.hasPassword,
    passkeys: safeUser.passkeyCount > 0,
    twoFactor: Boolean(safeUser.twoFactorEnabled)
  };

  return safeUser;
}

// Seed default accounts
export const DEFAULT_USERS = [
  {
    id: 'usr_default_admin',
    email: 'benedict@sendaat.io',
    name: 'Benedict Vance',
    company: 'Sendaat Enterprise',
    role: 'Infrastructure Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    isEmailVerified: true,
    twoFactorEnabled: false,
    passwordCredential: {
      hash: '$argon2id$v=19$m=19456,t=2,p=1$7n9gV5LhZtB8qQ$O1XhCg9t5sJ3s2Wz8k9Y7G',
      algorithm: 'argon2id',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  },
  {
    id: 'usr_maverick',
    email: 'm4verickjack@gmail.com',
    name: 'Maverick Jack',
    company: 'Sendaat Enterprise',
    role: 'Workspace Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    isEmailVerified: true,
    twoFactorEnabled: false,
    passwordCredential: {
      hash: '$argon2id$v=19$m=19456,t=2,p=1$7n9gV5LhZtB8qQ$O1XhCg9t5sJ3s2Wz8k9Y7G',
      algorithm: 'argon2id',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  },
  {
    id: 'usr_smtp_owner',
    email: 'shaptsevjkonikevich@gmail.com',
    name: 'Sendaat Admin',
    company: 'Sendaat Network',
    role: 'Platform Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    isEmailVerified: true,
    twoFactorEnabled: false,
    passwordCredential: {
      hash: '$argon2id$v=19$m=19456,t=2,p=1$7n9gV5LhZtB8qQ$O1XhCg9t5sJ3s2Wz8k9Y7G',
      algorithm: 'argon2id',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  }
];

registeredUsersStore = DEFAULT_USERS.map(normalizeUserRecord);

// --- User Lookup Functions ---

export function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  return registeredUsersStore.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export function findUserById(id) {
  if (!id) return null;
  const cleanId = String(id).trim();
  return registeredUsersStore.find(u => u.id === cleanId) || null;
}

export function findUserByGoogleSub(googleSub) {
  if (!googleSub) return null;
  const cleanSub = String(googleSub).trim();
  return registeredUsersStore.find(u =>
    (u.identities || []).some(i => i.provider === 'google' && String(i.sub).trim() === cleanSub)
  ) || null;
}

export function findUserByPasskeyCredentialId(credentialId) {
  if (!credentialId) return null;
  const cleanCredId = String(credentialId).trim();
  return registeredUsersStore.find(u =>
    (u.passkeys || []).some(p => p.credentialId === cleanCredId && p.status !== 'revoked')
  ) || null;
}

export function saveUserToStore(userRecord) {
  if (!userRecord || !userRecord.id) return null;
  const normalized = normalizeUserRecord(userRecord);

  const existingIdx = registeredUsersStore.findIndex(u => u.id === normalized.id);
  if (existingIdx >= 0) {
    registeredUsersStore[existingIdx] = {
      ...registeredUsersStore[existingIdx],
      ...normalized,
      updatedAt: new Date().toISOString()
    };
    return registeredUsersStore[existingIdx];
  } else {
    registeredUsersStore.push(normalized);
    return normalized;
  }
}

export function setRegisteredUsersStore(users) {
  if (Array.isArray(users)) {
    registeredUsersStore = users.map(normalizeUserRecord);
  }
}

// --- Session Creation, Verification & Management ---

export function parseUserAgent(userAgentString = '') {
  const ua = userAgentString.toLowerCase();
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceCategory = 'desktop';

  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';

  if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    deviceCategory = 'mobile';
  } else if (ua.includes('android')) {
    os = 'Android';
    deviceCategory = 'mobile';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  return { browser, os, deviceCategory };
}

export function createSession(user, req = {}, metadata = {}) {
  const userId = user.id ? String(user.id) : `usr_${Date.now()}`;
  const sessionId = `ses_${crypto.randomBytes(16).toString('hex')}`;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (60 * 60 * 24 * 30); // 30 days session

  const payload = {
    userId: userId,
    sessionId: sessionId,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: exp
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const uaHeader = req.headers?.['user-agent'] || '';
  const parsedUA = parseUserAgent(uaHeader);
  const deviceId = metadata.deviceId || req.headers?.['x-device-id'] || `dev_${Date.now()}`;
  const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

  const sessionRecord = {
    sessionId,
    tokenHash,
    deviceId,
    deviceName: metadata.deviceName || `${parsedUA.os} • ${parsedUA.browser}`,
    browser: parsedUA.browser,
    os: parsedUA.os,
    deviceCategory: parsedUA.deviceCategory,
    ip: ip.replace(/^::ffff:/, ''),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    expiresAt: new Date(exp * 1000).toISOString(),
    revoked: false
  };

  const userRecord = findUserById(userId);
  if (userRecord) {
    userRecord.sessions = (userRecord.sessions || []).filter(s => !s.revoked);
    userRecord.sessions.push(sessionRecord);
    saveUserToStore(userRecord);
  }

  return { token, sessionId, session: sessionRecord };
}

export function createAuthToken(user, req = {}, metadata = {}) {
  const result = createSession(user, req, metadata);
  return result.token;
}

export function verifyAuthToken(token) {
  if (!token) return null;
  const cleanToken = String(token).replace(/^Bearer\s+/i, '').trim();
  const parts = cleanToken.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (payload.userId && payload.sessionId) {
      const user = findUserById(payload.userId);
      if (user && Array.isArray(user.sessions)) {
        const session = user.sessions.find(s => s.sessionId === payload.sessionId);
        if (session && session.revoked) {
          return null;
        }
        if (session) {
          session.lastActiveAt = new Date().toISOString();
        }
      }
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export function extractAuthUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const queryToken = req.query?.token || req.query?.access_token || '';
  const cookieHeader = req.headers?.cookie || '';

  let cookieToken = '';
  if (cookieHeader) {
    const match = cookieHeader.match(/skillbridge_session=([^;]+)/);
    if (match) cookieToken = match[1];
  }

  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : (cookieToken || queryToken);

  if (!token) return null;
  const decoded = verifyAuthToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = findUserById(decoded.userId) || {
    id: decoded.userId,
    email: decoded.email,
    name: decoded.name || decoded.email?.split('@')[0],
    role: decoded.role || 'Workspace Owner'
  };

  const safe = sanitizeUser(user);
  if (safe) {
    safe.sessionId = decoded.sessionId || null;
  }
  return safe;
}

export function revokeSession(userId, sessionId) {
  const user = findUserById(userId);
  if (!user || !Array.isArray(user.sessions)) return false;

  const session = user.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.revoked = true;
    saveUserToStore(user);
    recordSecurityEvent(userId, 'SESSION_REVOKED', { sessionId, deviceName: session.deviceName });
    return true;
  }
  return false;
}

export function revokeAllOtherSessions(userId, currentSessionId) {
  const user = findUserById(userId);
  if (!user || !Array.isArray(user.sessions)) return 0;

  let count = 0;
  for (const session of user.sessions) {
    if (session.sessionId !== currentSessionId && !session.revoked) {
      session.revoked = true;
      count++;
    }
  }

  saveUserToStore(user);
  recordSecurityEvent(userId, 'OTHER_SESSIONS_REVOKED', { countRevoked: count });
  return count;
}

export function getUserSessions(userId, currentSessionId = null) {
  const user = findUserById(userId);
  if (!user || !Array.isArray(user.sessions)) return [];

  const now = new Date().getTime();
  return user.sessions
    .filter(s => !s.revoked && new Date(s.expiresAt).getTime() > now)
    .map(s => ({
      sessionId: s.sessionId,
      deviceName: s.deviceName,
      browser: s.browser,
      os: s.os,
      deviceCategory: s.deviceCategory,
      ip: s.ip,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.sessionId === currentSessionId
    }));
}

// --- Anti-Lockout Validation ---

export function canRemoveAuthenticationMethod(user, methodType, targetIdentifier = null) {
  if (!user) return { allowed: false, reason: 'User not found.' };

  const hasPassword = Boolean(user.passwordCredential && user.passwordCredential.hash);
  const activePasskeys = (user.passkeys || []).filter(p => p.status !== 'revoked');
  const googleIdentities = (user.identities || []).filter(i => i.provider === 'google');
  const verifiedRecovery = (user.recoveryMethods || []).filter(r => r.verified);

  let activeCount = 0;
  if (hasPassword && methodType !== 'password') activeCount++;
  if (googleIdentities.length > 0 && methodType !== 'google') activeCount++;
  
  if (methodType === 'passkey') {
    const remaining = activePasskeys.filter(p => p.credentialId !== targetIdentifier);
    if (remaining.length > 0) activeCount++;
  } else if (activePasskeys.length > 0) {
    activeCount++;
  }

  if (activeCount === 0 && verifiedRecovery.length === 0) {
    return {
      allowed: false,
      reason: 'Cannot remove the last remaining authentication method. Please add an alternative password, passkey, or Google account first to prevent account lockout.'
    };
  }

  return { allowed: true };
}

// --- Audit & Security Event Logging ---

export function recordSecurityEvent(userId, event, details = {}, req = {}) {
  const user = findUserById(userId);
  if (!user) return null;

  const eventRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event,
    details,
    ip: (req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').replace(/^::ffff:/, ''),
    userAgent: req.headers?.['user-agent'] || 'Direct API',
    timestamp: new Date().toISOString()
  };

  user.securityEvents = [eventRecord, ...(user.securityEvents || [])].slice(0, 100);
  saveUserToStore(user);
  return eventRecord;
}

export function getUserSecurityEvents(userId) {
  const user = findUserById(userId);
  if (!user) return [];
  return user.securityEvents || [];
}

export function parseRequestBody(req) {
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
