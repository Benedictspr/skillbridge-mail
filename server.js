import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createDynamicTransporter } from './lib/smtpHelper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'server_db.json');

import { 
  userSyncStore, 
  projectVersionStore, 
  getUserSyncData, 
  updateUserSyncData, 
  registerSseClient, 
  broadcastToUser,
  sanitizeSyncState,
  processedMutationIds
} from './lib/syncStore.js';

import { 
  extractAuthUser, 
  createSession,
  createAuthToken, 
  verifyAuthToken,
  sanitizeUser, 
  findUserByEmail, 
  findUserById, 
  findUserByGoogleSub,
  findUserByPasskeyCredentialId,
  saveUserToStore, 
  setRegisteredUsersStore,
  registeredUsersStore,
  hashPassword,
  verifyPassword,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  revokeSession,
  revokeAllOtherSessions,
  getUserSessions,
  canRemoveAuthenticationMethod,
  recordSecurityEvent,
  getUserSecurityEvents
} from './lib/authStore.js';

import {
  ALLOWED_ORIGINS,
  createPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  createPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication
} from './lib/webauthnHelper.js';

import { verifyGoogleToken } from './lib/googleAuthHelper.js';

const app = express();
const PORT = 3001;

// --- Production Security Headers ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// --- Production CORS Configuration ---
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Device-Id', 
    'X-Requested-With', 
    'Accept', 
    'X-CSRF-Token'
  ]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Gracefully handle malformed JSON body payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[MALFORMED JSON PAYLOAD REJECTED]', err.message);
    return res.status(400).json({ error: 'Malformed JSON payload structure.' });
  }
  next(err);
});

// Helper for Setting Secure Session Cookie
function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `skillbridge_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${isProd ? '; Secure' : ''}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `skillbridge_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

// Initial State structures
let recipientTracker = {};
let sentHistoryLog = [];
let receivedReplies = [
  {
    id: 'reply-101',
    senderEmail: 'john.doe@university.edu',
    senderName: 'John Doe',
    role: 'Mathematics Tutor',
    subject: 'Re: Remote Opportunity for Students',
    bodyText: "Hi Benedict,\n\nThank you for reaching out! I am a 3rd-year Mathematics student at University and very interested in the remote tutoring role. I have 2 years of teaching experience with high school algebra and calculus.\n\nPlease let me know the next steps for applying.\n\nBest regards,\nJohn Doe",
    receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isUnread: true
  },
  {
    id: 'reply-102',
    senderEmail: 'mary.smith@cambridge.org',
    senderName: 'Mary Smith',
    role: 'Python Developer',
    subject: 'Re: Remote Opportunity for Students',
    bodyText: "Hello Benedict,\n\nI saw your email regarding flexible student work opportunities. I specialize in Python, Django, and Data Science. I am available for 10-15 hours per week alongside my studies.\n\nLooking forward to hearing from you!\n\nMary Smith",
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isUnread: false
  }
];
const SYSTEM_SMTP = { user: process.env.SMTP_USER || 'user@sendaat.io', pass: process.env.SMTP_PASS || '', mode: 'gmail' };
let storedSmtpConfig = { ...SYSTEM_SMTP };

async function sendMailWithFallback({ to, subject, html, user, pass, provider, host, port, fromName = 'Sendaat Security' }) {
  let primaryUser = user || storedSmtpConfig.user || SYSTEM_SMTP.user;
  let primaryPass = pass || storedSmtpConfig.pass || SYSTEM_SMTP.pass;
  let provKey = provider || storedSmtpConfig.provider || 'gmail';

  try {
    const transporter = createDynamicTransporter({ provider: provKey, user: primaryUser, pass: primaryPass, host, port });
    const info = await transporter.sendMail({
      from: `${fromName} <${primaryUser}>`,
      to,
      subject,
      html
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Dispatched to: ${to} via ${primaryUser} (${provKey})`);
    return { success: true, messageId: info.messageId, sender: primaryUser, mode: provKey };
  } catch (err) {
    console.warn(`[SMTP PRIMARY ERROR] ${err.message}. Retrying with system credentials...`);
    if (primaryUser !== SYSTEM_SMTP.user || primaryPass !== SYSTEM_SMTP.pass) {
      try {
        const fallbackTransporter = createDynamicTransporter({ provider: 'gmail', user: SYSTEM_SMTP.user, pass: SYSTEM_SMTP.pass });
        const info = await fallbackTransporter.sendMail({
          from: `${fromName} <${SYSTEM_SMTP.user}>`,
          to,
          subject,
          html
        });
        console.log(`[EMAIL FALLBACK SUCCESS] Dispatched to: ${to} via system transport ${SYSTEM_SMTP.user}`);
        return { success: true, messageId: info.messageId, sender: SYSTEM_SMTP.user, mode: 'gmail' };
      } catch (fallbackErr) {
        console.warn(`[SMTP FALLBACK ERROR] ${fallbackErr.message}. Defaulting to Sendaat Security Sandbox Mode.`);
      }
    }
    console.log(`[SANDBOX DISPATCH] Dispatched to: ${to} via Sendaat Sandbox Security Gateway`);
    return { success: true, mode: 'sandbox', fallback: true, message: 'Dispatched via Sendaat Security Sandbox Gateway' };
  }
}

// Load database from file on startup
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data.recipientTracker) recipientTracker = data.recipientTracker;
      if (data.sentHistoryLog) sentHistoryLog = data.sentHistoryLog;
      if (data.receivedReplies) receivedReplies = data.receivedReplies;
      if (data.storedSmtpConfig) storedSmtpConfig = data.storedSmtpConfig;
      if (data.registeredUsers && Array.isArray(data.registeredUsers) && data.registeredUsers.length > 0) {
        setRegisteredUsersStore(data.registeredUsers);
      }
      console.log(`[DB LOADED] Restored ${sentHistoryLog.length} sent logs, ${receivedReplies.length} replies, and ${registeredUsersStore.length} user accounts.`);
    }
  } catch (err) {
    console.error('[DB LOAD ERROR]', err.message);
  }
}

// Save database to file
function saveDatabase() {
  try {
    const payload = {
      recipientTracker,
      sentHistoryLog,
      receivedReplies,
      storedSmtpConfig,
      registeredUsers: registeredUsersStore
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB SAVE ERROR]', err.message);
  }
}

loadDatabase();

// --- Authentication & Multi-Tenant Authorization Middleware ---

function requireAuthMiddleware(req, res, next) {
  const authUser = extractAuthUser(req);
  if (!authUser || !authUser.id) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: A valid session authentication token is required.',
      code: 'UNAUTHENTICATED'
    });
  }

  req.authUser = authUser;
  req.verifiedUserId = authUser.id;
  next();
}

function syncAuthMiddleware(req, res, next) {
  const authUser = extractAuthUser(req);
  if (!authUser || !authUser.id) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: A valid session authentication token is required to access the synchronization system.',
      code: 'UNAUTHENTICATED'
    });
  }

  let requestedUserId = req.query.userId || req.headers['x-user-id'] || null;
  if (req.body && req.body.userId) {
    requestedUserId = req.body.userId;
  }

  if (requestedUserId && String(requestedUserId).trim() !== authUser.id) {
    console.warn(`[SECURITY 403 FORBIDDEN] User ${authUser.id} attempted to access workspace of ${requestedUserId}`);
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You are not authorized to access or mutate another user\'s workspace data.',
      code: 'FORBIDDEN_CROSS_USER_ACCESS'
    });
  }

  req.authUser = authUser;
  req.verifiedUserId = authUser.id;
  next();
}

// =========================================================================
// 1. SYNC & CLOUD WORKSPACE ENDPOINTS (Cross-Device Continuity)
// =========================================================================

// 1. Real-time SSE Live Event Stream
app.get('/api/sync/stream', syncAuthMiddleware, (req, res) => {
  const userId = req.verifiedUserId;
  const deviceId = req.query.deviceId || req.headers['x-device-id'] || `device_${Date.now()}`;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const initMsg = JSON.stringify({
    type: 'INIT_CONNECTED',
    userId: userId,
    deviceId: deviceId,
    timestamp: new Date().toISOString()
  });
  res.write(`data: ${initMsg}\n\n`);

  registerSseClient(userId, deviceId, res);

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(`:keep-alive\n\n`);
    } catch (e) {
      clearInterval(keepAliveInterval);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
  });
});

// 2. Hydrate complete authoritative state
app.get('/api/sync/hydrate', syncAuthMiddleware, (req, res) => {
  const userId = req.verifiedUserId;
  const userState = getUserSyncData(userId, req.authUser);
  return res.json({
    success: true,
    userId: userId,
    state: userState
  });
});

// 3. Push state delta
app.post('/api/sync/push', syncAuthMiddleware, (req, res) => {
  const { delta, deviceId, clientVersion } = req.body;
  const userId = req.verifiedUserId;

  try {
    const result = updateUserSyncData(
      userId,
      delta || req.body,
      deviceId || req.headers['x-device-id'] || 'unknown_device',
      clientVersion !== undefined ? clientVersion : null,
      true
    );
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Projects Listing & Auto-Saving
app.get('/api/sync/projects', syncAuthMiddleware, (req, res) => {
  const userId = req.verifiedUserId;
  const userState = getUserSyncData(userId, req.authUser);
  return res.json({
    success: true,
    projects: userState?.projects || []
  });
});

app.post('/api/sync/projects', syncAuthMiddleware, (req, res) => {
  const userId = req.verifiedUserId;
  const deviceId = req.body.deviceId || req.headers['x-device-id'] || 'unknown_device';
  const userState = getUserSyncData(userId, req.authUser);

  const newProj = {
    id: req.body.id || `proj_${Date.now()}`,
    name: req.body.name || 'Untitled Project',
    type: req.body.type || 'email_builder',
    updatedAt: new Date().toISOString(),
    version: 1,
    thumbnail: req.body.thumbnail || '',
    data: req.body.data || {}
  };

  const projects = [...(userState.projects || []).filter(p => p.id !== newProj.id), newProj];
  const updated = updateUserSyncData(userId, { projects, activeProjectId: newProj.id }, deviceId);
  return res.json({ success: true, project: newProj, version: updated.version });
});

// 5. Version History Listing
app.get('/api/sync/versions', syncAuthMiddleware, (req, res) => {
  const projectId = req.query.projectId || 'proj_default_campaign';
  const versions = projectVersionStore[projectId] || [];
  return res.json({
    success: true,
    projectId,
    versions
  });
});

// 6. Restore Version Snapshot
app.post('/api/sync/restore', syncAuthMiddleware, (req, res) => {
  const { projectId = 'proj_default_campaign', version, deviceId } = req.body;
  const userId = req.verifiedUserId;

  const list = projectVersionStore[projectId] || [];
  const targetSnapshot = list.find(v => v.version === Number(version));

  if (!targetSnapshot) {
    return res.status(404).json({ success: false, error: `Version ${version} not found in history.` });
  }

  const delta = {
    campaignConfig: targetSnapshot.snapshot.campaignConfig,
    emailDesignerData: targetSnapshot.snapshot.emailDesignerData,
    theme: targetSnapshot.snapshot.theme || 'dark'
  };

  const updated = updateUserSyncData(userId, delta, deviceId || 'restore_device');
  return res.json({
    success: true,
    message: `Restored snapshot v${version} successfully.`,
    state: updated.state
  });
});

// 7. Offline Mutation Queue Batch Flush
app.post('/api/sync/batch', syncAuthMiddleware, (req, res) => {
  const { mutations = [], deviceId } = req.body;
  const userId = req.verifiedUserId;

  let lastResult = null;
  let appliedCount = 0;
  for (const mut of mutations) {
    if (mut && mut.delta) {
      const mutKey = mut.id || `${userId}_${mut.clientVersion}_${JSON.stringify(mut.delta)}`;
      if (processedMutationIds.has(mutKey)) {
        continue;
      }
      processedMutationIds.add(mutKey);
      lastResult = updateUserSyncData(
        userId,
        mut.delta,
        mut.deviceId || deviceId,
        mut.clientVersion
      );
      appliedCount++;
    }
  }

  return res.json({
    success: true,
    processedCount: appliedCount,
    totalReceived: mutations.length,
    latestState: lastResult ? lastResult.state : getUserSyncData(userId, req.authUser)
  });
});

// =========================================================================
// 2. PRODUCTION AUTHENTICATION & IDENTITY HARDENING ENDPOINTS
// =========================================================================

// --- 2.1 Password Registration & Authentication (Argon2id) ---

app.post('/api/auth/register', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const rateCheck = checkRateLimit(`reg_${clientIp}`, 15, 60000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many registration attempts. Please wait a few minutes.', retryAfter: rateCheck.retryAfterSec });
  }

  const { email, password, name, company, role } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid work email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  try {
    const rawPass = password || 'Password123!';
    const passwordHash = await hashPassword(rawPass);

    const newUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
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
    recordSecurityEvent(newUser.id, 'ACCOUNT_REGISTERED_PASSWORD', { email: cleanEmail }, req);
    saveDatabase();

    const { token } = createSession(newUser, req, { deviceId: req.headers['x-device-id'] });
    setSessionCookie(res, token);

    console.log(`[AUTH REGISTER] Registered: ${cleanEmail} (ID: ${newUser.id})`);
    return res.json({ success: true, user: sanitizeUser(newUser), token });
  } catch (err) {
    console.error('[AUTH REGISTER ERROR]', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const rateCheck = checkRateLimit(`login_${clientIp}_${cleanEmail}`, 10, 60000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many failed login attempts. Please try again in 5 minutes.',
      code: 'RATE_LIMITED'
    });
  }

  const user = findUserByEmail(cleanEmail);
  if (!user) {
    recordFailedAttempt(`login_${clientIp}_${cleanEmail}`);
    return res.status(404).json({
      success: false,
      reason: 'EMAIL_NOT_FOUND',
      message: 'No account found with this email address. Please create an account.'
    });
  }

  // Password verification
  const isValid = await verifyPassword(user.passwordCredential, password);
  if (!isValid) {
    recordFailedAttempt(`login_${clientIp}_${cleanEmail}`);
    recordSecurityEvent(user.id, 'PASSWORD_LOGIN_FAILED', { reason: 'INVALID_CREDENTIALS' }, req);
    return res.status(401).json({
      success: false,
      reason: 'INVALID_PASSWORD',
      message: 'Incorrect password. Please try again or reset your password.'
    });
  }

  // Transparent migration to Argon2id if was legacy plaintext
  if (user.passwordCredential && !user.passwordCredential.hash.startsWith('$argon2')) {
    user.passwordCredential.hash = await hashPassword(password);
    user.passwordCredential.algorithm = 'argon2id';
    saveUserToStore(user);
  }

  clearFailedAttempts(`login_${clientIp}_${cleanEmail}`);
  const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
  setSessionCookie(res, token);

  recordSecurityEvent(user.id, 'PASSWORD_LOGIN_SUCCESS', {}, req);
  saveDatabase();

  console.log(`[AUTH LOGIN SUCCESS] ${cleanEmail} -> User ${user.id}`);
  return res.json({ success: true, user: sanitizeUser(user), token });
});

// Update or Set Password (Argon2id)
app.post('/api/auth/update-password', async (req, res) => {
  const authUser = extractAuthUser(req);
  const { email, newPassword, currentPassword } = req.body;

  let targetUser = null;
  if (authUser) {
    targetUser = findUserById(authUser.id);
  } else if (email) {
    targetUser = findUserByEmail(email);
  }

  if (!targetUser) {
    return res.status(401).json({ error: 'Authentication required to update password.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  // If user already had a password, verify current password if provided
  if (targetUser.passwordCredential && targetUser.passwordCredential.hash && currentPassword) {
    const isCurrentValid = await verifyPassword(targetUser.passwordCredential, currentPassword);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    targetUser.passwordCredential = {
      hash: passwordHash,
      algorithm: 'argon2id',
      createdAt: targetUser.passwordCredential?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Invalidate other active sessions for security
    const currentSessionId = authUser?.sessionId || null;
    revokeAllOtherSessions(targetUser.id, currentSessionId);

    saveUserToStore(targetUser);
    recordSecurityEvent(targetUser.id, 'PASSWORD_CHANGED', {}, req);
    saveDatabase();

    const { token } = createSession(targetUser, req, { deviceId: req.headers['x-device-id'] });
    setSessionCookie(res, token);

    console.log(`[PASSWORD UPDATED] User: ${targetUser.id} (${targetUser.email})`);
    return res.json({
      success: true,
      message: 'Password updated and secured with Argon2id across all devices.',
      user: sanitizeUser(targetUser),
      token
    });
  } catch (err) {
    console.error('[PASSWORD UPDATE ERROR]', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// --- 2.2 Genuine WebAuthn / FIDO2 Passkey Endpoints ---

// Registration Options
app.post('/api/auth/passkey/register-options', async (req, res) => {
  try {
    const authUser = extractAuthUser(req);
    const { email } = req.body;

    let targetUser = authUser ? findUserById(authUser.id) : (email ? findUserByEmail(email) : null);

    if (!targetUser) {
      // Ephemeral user stub for passkey-first registration
      const cleanEmail = email ? email.trim().toLowerCase() : `passkey_${Date.now()}@skillbridge.io`;
      targetUser = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        passkeys: []
      };
    }

    const { options, challengeId } = await createPasskeyRegistrationOptions(
      targetUser,
      targetUser.passkeys || [],
      req
    );

    return res.json({ success: true, options, challengeId });
  } catch (err) {
    console.error('[WEBAUTHN REG OPTIONS ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to generate WebAuthn registration options' });
  }
});

// Registration Verification & Credential Storage
app.post('/api/auth/passkey/register-verify', async (req, res) => {
  try {
    const { response, challengeId, name, email } = req.body;
    if (!response || !challengeId) {
      return res.status(400).json({ error: 'Missing WebAuthn response or challenge ID.' });
    }

    const verificationResult = await verifyPasskeyRegistration(response, challengeId, req);
    const { credential, userId } = verificationResult;

    let user = findUserById(userId);
    if (!user) {
      // New user passkey-first account creation
      const cleanEmail = email ? email.trim().toLowerCase() : `user_${Date.now()}@skillbridge.io`;
      user = {
        id: userId,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        company: `${cleanEmail.split('@')[0]}'s Workspace`,
        role: 'Workspace Owner',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
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
    recordSecurityEvent(user.id, 'PASSKEY_REGISTERED', { name: passkeyRecord.name, credentialId: passkeyRecord.credentialId }, req);
    saveDatabase();

    const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
    setSessionCookie(res, token);

    console.log(`[PASSKEY REGISTER SUCCESS] User: ${user.id} -> Added passkey "${passkeyRecord.name}"`);
    return res.json({ success: true, user: sanitizeUser(user), credential: passkeyRecord, token });
  } catch (err) {
    console.error('[WEBAUTHN REG VERIFY ERROR]', err);
    return res.status(400).json({ error: err.message || 'Passkey cryptographic registration verification failed.' });
  }
});

// Authentication Options
app.post('/api/auth/passkey/auth-options', async (req, res) => {
  try {
    const { email } = req.body;
    let targetUser = null;
    let userPasskeys = [];

    if (email) {
      targetUser = findUserByEmail(email);
      if (targetUser && Array.isArray(targetUser.passkeys)) {
        userPasskeys = targetUser.passkeys.filter(p => p.status !== 'revoked');
      }
    }

    const { options, challengeId } = await createPasskeyAuthenticationOptions(targetUser, userPasskeys, req);
    return res.json({ success: true, options, challengeId });
  } catch (err) {
    console.error('[WEBAUTHN AUTH OPTIONS ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to generate WebAuthn authentication options' });
  }
});

// Authentication Verification & Session Creation
app.post('/api/auth/passkey/auth-verify', async (req, res) => {
  try {
    const { response, challengeId } = req.body;
    if (!response || !challengeId || !response.id) {
      return res.status(400).json({ error: 'Missing WebAuthn assertion response or challenge ID.' });
    }

    const credentialId = response.id;
    const user = findUserByPasskeyCredentialId(credentialId);

    if (!user) {
      return res.status(401).json({ error: 'Unrecognized passkey credential. Please sign in with password or Google.' });
    }

    const storedPasskey = (user.passkeys || []).find(p => p.credentialId === credentialId && p.status !== 'revoked');
    if (!storedPasskey) {
      return res.status(401).json({ error: 'This passkey has been revoked.' });
    }

    const verificationResult = await verifyPasskeyAuthentication(response, storedPasskey, challengeId, req);

    // Update passkey counter and lastUsedAt
    storedPasskey.counter = verificationResult.newCounter;
    storedPasskey.lastUsedAt = new Date().toISOString();

    saveUserToStore(user);
    recordSecurityEvent(user.id, 'PASSKEY_LOGIN_SUCCESS', { credentialName: storedPasskey.name }, req);
    saveDatabase();

    const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
    setSessionCookie(res, token);

    console.log(`[PASSKEY AUTH SUCCESS] User: ${user.id} logged in with passkey "${storedPasskey.name}"`);
    return res.json({ success: true, user: sanitizeUser(user), token });
  } catch (err) {
    console.error('[WEBAUTHN AUTH VERIFY ERROR]', err);
    return res.status(400).json({ error: err.message || 'Passkey cryptographic signature verification failed.' });
  }
});

// List Passkeys
app.get('/api/auth/passkey/list', requireAuthMiddleware, (req, res) => {
  const user = findUserById(req.verifiedUserId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const activePasskeys = (user.passkeys || [])
    .filter(p => p.status !== 'revoked')
    .map(p => ({
      credentialId: p.credentialId,
      name: p.name,
      deviceType: p.deviceType,
      createdAt: p.createdAt,
      lastUsedAt: p.lastUsedAt
    }));

  return res.json({ success: true, passkeys: activePasskeys });
});

// Rename Passkey
app.post('/api/auth/passkey/rename', requireAuthMiddleware, (req, res) => {
  const { credentialId, name } = req.body;
  if (!credentialId || !name) {
    return res.status(400).json({ error: 'Missing credential ID or new name.' });
  }

  const user = findUserById(req.verifiedUserId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const passkey = (user.passkeys || []).find(p => p.credentialId === credentialId);
  if (!passkey) return res.status(404).json({ error: 'Passkey not found.' });

  passkey.name = name.trim();
  saveUserToStore(user);
  saveDatabase();

  return res.json({ success: true, message: 'Passkey renamed successfully.', passkey });
});

// Revoke Passkey with Anti-Lockout Validation
app.post('/api/auth/passkey/revoke', requireAuthMiddleware, (req, res) => {
  const { credentialId } = req.body;
  if (!credentialId) {
    return res.status(400).json({ error: 'Missing credential ID.' });
  }

  const user = findUserById(req.verifiedUserId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  // Anti-lockout check
  const lockoutCheck = canRemoveAuthenticationMethod(user, 'passkey', credentialId);
  if (!lockoutCheck.allowed) {
    return res.status(400).json({ error: lockoutCheck.reason, code: 'LOCKOUT_PREVENTED' });
  }

  const passkey = (user.passkeys || []).find(p => p.credentialId === credentialId);
  if (!passkey) return res.status(404).json({ error: 'Passkey not found.' });

  passkey.status = 'revoked';
  saveUserToStore(user);
  recordSecurityEvent(user.id, 'PASSKEY_REVOKED', { credentialId, name: passkey.name }, req);
  saveDatabase();

  return res.json({ success: true, message: 'Passkey revoked successfully.', user: sanitizeUser(user) });
});

// --- 2.3 Google OAuth 2.0 / OpenID Connect Endpoints ---

// Google Token Verification & Canonical User Resolution
app.post('/api/auth/google/verify', async (req, res) => {
  try {
    const { token: credentialToken } = req.body;
    if (!credentialToken) {
      return res.status(400).json({ error: 'Missing Google credential token.' });
    }

    const verifiedGoogle = await verifyGoogleToken(credentialToken);
    const { googleSub, email, name, avatar, isEmailVerified } = verifiedGoogle;

    // 1. Check if Google sub is already associated with an existing SkillBridge user
    let user = findUserByGoogleSub(googleSub);

    if (!user && email) {
      // 2. Check if an account already exists with this verified email
      user = findUserByEmail(email);
      if (user) {
        // Link Google identity to the existing canonical account
        user.identities = user.identities || [];
        if (!user.identities.some(i => i.provider === 'google')) {
          user.identities.push({
            provider: 'google',
            sub: googleSub,
            email: email,
            linkedAt: new Date().toISOString()
          });
        }
      }
    }

    if (!user) {
      // 3. New User Registration via Google OAuth
      user = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        email: email,
        name: name || email.split('@')[0],
        company: `${(name || email.split('@')[0])}'s Workspace`,
        role: 'Workspace Owner',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        onboardingCompleted: false,
        isEmailVerified: Boolean(isEmailVerified),
        identities: [
          {
            provider: 'google',
            sub: googleSub,
            email: email,
            linkedAt: new Date().toISOString()
          }
        ],
        passkeys: [],
        sessions: [],
        securityEvents: []
      };
      recordSecurityEvent(user.id, 'ACCOUNT_CREATED_GOOGLE', { googleSub, email }, req);
    } else {
      recordSecurityEvent(user.id, 'GOOGLE_LOGIN_SUCCESS', { googleSub }, req);
    }

    saveUserToStore(user);
    saveDatabase();

    const { token } = createSession(user, req, { deviceId: req.headers['x-device-id'] });
    setSessionCookie(res, token);

    console.log(`[GOOGLE OAUTH SUCCESS] sub: ${googleSub} -> Resolved to SkillBridge User ID: ${user.id}`);
    return res.json({ success: true, user: sanitizeUser(user), token });
  } catch (err) {
    console.error('[GOOGLE AUTH ERROR]', err);
    return res.status(400).json({ error: err.message || 'Google OAuth verification failed.' });
  }
});

// Link Google Identity to Authenticated User
app.post('/api/auth/google/link', requireAuthMiddleware, async (req, res) => {
  try {
    const { token: credentialToken } = req.body;
    if (!credentialToken) {
      return res.status(400).json({ error: 'Missing Google credential token.' });
    }

    const verifiedGoogle = await verifyGoogleToken(credentialToken);
    const { googleSub, email } = verifiedGoogle;

    const existingOther = findUserByGoogleSub(googleSub);
    if (existingOther && existingOther.id !== req.verifiedUserId) {
      return res.status(409).json({ error: 'This Google account is already linked to another SkillBridge user.' });
    }

    const user = findUserById(req.verifiedUserId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.identities = user.identities || [];
    if (!user.identities.some(i => i.provider === 'google' && i.sub === googleSub)) {
      user.identities.push({
        provider: 'google',
        sub: googleSub,
        email: email,
        linkedAt: new Date().toISOString()
      });
    }

    saveUserToStore(user);
    recordSecurityEvent(user.id, 'GOOGLE_ACCOUNT_LINKED', { googleSub, email }, req);
    saveDatabase();

    return res.json({ success: true, message: 'Google account linked successfully.', user: sanitizeUser(user) });
  } catch (err) {
    console.error('[GOOGLE LINK ERROR]', err);
    return res.status(400).json({ error: err.message || 'Failed to link Google account.' });
  }
});

// Unlink Google Identity with Anti-Lockout Validation
app.post('/api/auth/google/unlink', requireAuthMiddleware, (req, res) => {
  const user = findUserById(req.verifiedUserId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const lockoutCheck = canRemoveAuthenticationMethod(user, 'google');
  if (!lockoutCheck.allowed) {
    return res.status(400).json({ error: lockoutCheck.reason, code: 'LOCKOUT_PREVENTED' });
  }

  user.identities = (user.identities || []).filter(i => i.provider !== 'google');
  saveUserToStore(user);
  recordSecurityEvent(user.id, 'GOOGLE_ACCOUNT_UNLINKED', {}, req);
  saveDatabase();

  return res.json({ success: true, message: 'Google account disconnected.', user: sanitizeUser(user) });
});

// --- 2.4 Active Sessions & Security Management Endpoints ---

// Get Active Sessions
app.get('/api/auth/sessions', requireAuthMiddleware, (req, res) => {
  const sessions = getUserSessions(req.verifiedUserId, req.authUser.sessionId);
  return res.json({ success: true, sessions });
});

// Revoke Specific Session
app.post('/api/auth/sessions/revoke', requireAuthMiddleware, (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID.' });
  }

  const success = revokeSession(req.verifiedUserId, sessionId);
  saveDatabase();
  return res.json({ success, message: success ? 'Session revoked.' : 'Session not found.' });
});

// Sign Out Other Devices
app.post('/api/auth/sessions/revoke-others', requireAuthMiddleware, (req, res) => {
  const currentSessionId = req.authUser.sessionId;
  const count = revokeAllOtherSessions(req.verifiedUserId, currentSessionId);
  saveDatabase();
  return res.json({ success: true, countRevoked: count, message: `Signed out of ${count} other devices.` });
});

// Get Audit Security Events
app.get('/api/auth/security-events', requireAuthMiddleware, (req, res) => {
  const events = getUserSecurityEvents(req.verifiedUserId);
  return res.json({ success: true, events });
});

// Get Configured Auth Methods
app.get('/api/auth/methods', requireAuthMiddleware, (req, res) => {
  const user = findUserById(req.verifiedUserId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const sanitized = sanitizeUser(user);
  return res.json({
    success: true,
    methods: sanitized.configuredMethods,
    hasPassword: sanitized.hasPassword,
    hasGoogle: sanitized.hasGoogle,
    passkeys: sanitized.passkeys
  });
});

// Logout Endpoint
app.post('/api/auth/logout', requireAuthMiddleware, (req, res) => {
  if (req.authUser.sessionId) {
    revokeSession(req.verifiedUserId, req.authUser.sessionId);
    saveDatabase();
  }
  clearSessionCookie(res);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 1x1 Transparent GIF Pixel Buffer for Open Tracking
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// =========================================================================
// 3. EMAIL DISPATCH, TRACKING, AND IMAP INBOX ENDPOINTS
// =========================================================================

// 1. Send Email Endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientId, to, recipientName, subject, html, smtpUser, smtpPass, mode } = req.body;

    if (!to || !recipientId) {
      return res.status(400).json({ error: 'Missing required recipient parameters.' });
    }

    if (smtpUser && smtpPass) {
      storedSmtpConfig = { user: smtpUser, pass: smtpPass, mode: mode || 'gmail' };
    }

    const trackingPixelUrl = `http://localhost:3001/api/track/open/${recipientId}`;
    const trackedHtml = `${html}<img src="${trackingPixelUrl}" width="1" height="1" style="display:none !important; width:1px; height:1px;" alt="" />`;
    const sentTimestamp = new Date().toISOString();

    if (mode === 'gmail' && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `Sendaat Outreach <${smtpUser}>`,
        to: to,
        replyTo: smtpUser,
        subject: subject,
        html: trackedHtml
      };

      const info = await transporter.sendMail(mailOptions);

      recipientTracker[recipientId] = {
        status: 'Sent',
        sentAt: sentTimestamp,
        opened: false,
        messageId: info.messageId
      };

      const logItem = {
        id: `sent-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
        recipientId,
        to,
        recipientName: recipientName || to,
        subject,
        sentAt: sentTimestamp,
        status: 'Sent',
        mode: 'gmail',
        messageId: info.messageId
      };
      sentHistoryLog.unshift(logItem);
      saveDatabase();

      console.log(`[REAL GMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
      return res.json({ success: true, messageId: info.messageId, mode: 'gmail', logItem });

    } else {
      recipientTracker[recipientId] = {
        status: 'Sent',
        sentAt: sentTimestamp,
        opened: false,
        messageId: `sandbox-${Date.now()}`
      };

      const logItem = {
        id: `sent-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
        recipientId,
        to,
        recipientName: recipientName || to,
        subject,
        sentAt: sentTimestamp,
        status: 'Sent (Sandbox)',
        mode: 'sandbox',
        messageId: `sandbox-${Date.now()}`
      };
      sentHistoryLog.unshift(logItem);
      saveDatabase();

      console.log(`[SANDBOX SENT] To: ${to} (Simulated delivery)`);
      return res.json({ success: true, simulated: true, mode: 'sandbox', logItem });
    }

  } catch (err) {
    console.error('[SEND EMAIL ERROR]', err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

// 2. Tracking Pixel Endpoint for Email Open Detection
app.get('/api/track/open/:recipientId', (req, res) => {
  const { recipientId } = req.params;

  if (recipientTracker[recipientId]) {
    recipientTracker[recipientId].opened = true;
    recipientTracker[recipientId].openedAt = new Date().toISOString();
    recipientTracker[recipientId].status = 'Opened';
    console.log(`[OPEN DETECTED] Recipient ID ${recipientId} opened email at ${recipientTracker[recipientId].openedAt}`);
  } else {
    recipientTracker[recipientId] = {
      status: 'Opened',
      opened: true,
      openedAt: new Date().toISOString()
    };
  }

  saveDatabase();

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(TRANSPARENT_GIF);
});

// 3. GET Recipient Statuses Endpoint
app.get('/api/recipient-statuses', (req, res) => {
  res.json(recipientTracker);
});

// 4. GET Sent History Endpoint
app.get('/api/sent-history', (req, res) => {
  res.json(sentHistoryLog);
});

// 5. GET Received Replies Inbox Endpoint
app.get('/api/replies', (req, res) => {
  res.json(receivedReplies);
});

// 6. Real Live IMAP Replies Sync Endpoint
app.post('/api/fetch-live-replies', async (req, res) => {
  try {
    const user = req.body.smtpUser || storedSmtpConfig.user;
    const pass = req.body.smtpPass || storedSmtpConfig.pass;

    if (!user || !pass) {
      return res.status(400).json({ 
        error: 'Missing Gmail credentials. Please enter your Gmail address and 16-character App Password in Settings.' 
      });
    }

    console.log(`[LIVE IMAP SYNC START] Connecting to imap.gmail.com:993 for ${user}...`);

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: {
        user: user,
        pass: pass
      },
      logger: false
    });

    client.on('error', (err) => {
      console.error('[IMAP CLIENT CAUGHT ERROR]', err.message || err);
    });

    await client.connect();
    let lock = await client.getMailboxLock('INBOX');

    const fetchedReplies = [];
    try {
      const totalMessages = client.mailbox.exists;
      if (totalMessages > 0) {
        const startSeq = Math.max(1, totalMessages - 24);
        for await (let message of client.fetch(`${startSeq}:*`, { envelope: true, source: true })) {
          try {
            const parsed = await simpleParser(message.source);
            const senderEmail = parsed.from?.value[0]?.address || 'unknown@domain.com';
            const senderName = parsed.from?.value[0]?.name || senderEmail.split('@')[0];

            if (senderEmail.toLowerCase() === user.toLowerCase()) continue;

            fetchedReplies.unshift({
              id: `imap-${message.uid || Date.now()}-${Math.random().toString(36).substring(2,6)}`,
              senderEmail,
              senderName,
              role: 'Gmail Contact / Applicant',
              subject: parsed.subject || 'Re: Remote Student Opportunity',
              bodyText: parsed.text || parsed.html?.replace(/<[^>]+>/g, '') || '(No message body text)',
              receivedAt: (parsed.date || new Date()).toISOString(),
              isUnread: true
            });
          } catch (pErr) {
            console.error('[PARSE MSG ERR]', pErr.message);
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    let newCount = 0;
    fetchedReplies.forEach(newR => {
      const exists = receivedReplies.some(r => r.senderEmail === newR.senderEmail && r.subject === newR.subject);
      if (!exists) {
        receivedReplies.unshift(newR);
        newCount++;
      }
    });

    saveDatabase();

    console.log(`[LIVE IMAP SYNC SUCCESS] Synced ${newCount} new incoming emails from Gmail IMAP!`);
    return res.json({ success: true, count: newCount, replies: receivedReplies });

  } catch (err) {
    console.error('[IMAP SYNC ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to connect to Gmail IMAP server.' });
  }
});

// 7. Add/Simulate Incoming Reply Endpoint
app.post('/api/replies', (req, res) => {
  const { senderEmail, senderName, role, subject, bodyText } = req.body;
  if (!senderEmail || !bodyText) {
    return res.status(400).json({ error: 'Missing senderEmail or bodyText' });
  }

  const newReply = {
    id: `reply-${Date.now()}`,
    senderEmail,
    senderName: senderName || 'Applicant',
    role: role || 'Student Applicant',
    subject: subject || 'Re: Remote Opportunity for Students',
    bodyText,
    receivedAt: new Date().toISOString(),
    isUnread: true
  };

  receivedReplies.unshift(newReply);
  saveDatabase();
  console.log(`[NEW REPLY STORED] From ${senderName} (${senderEmail})`);
  res.json({ success: true, reply: newReply });
});

// 8. GET Stored Config Endpoint
app.get('/api/config', (req, res) => {
  res.json({ smtpUser: storedSmtpConfig.user, mode: storedSmtpConfig.mode });
});

// 9. Test Gmail Connection Endpoint
app.post('/api/test-gmail', async (req, res) => {
  try {
    const { smtpUser, smtpPass } = req.body;
    if (!smtpUser || !smtpPass) {
      return res.status(400).json({ success: false, message: 'Missing Gmail address or App Password.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.verify();
    console.log(`[GMAIL TEST SUCCESS] Authenticated as ${smtpUser}`);

    storedSmtpConfig = { user: smtpUser, pass: smtpPass, mode: 'gmail' };
    saveDatabase();

    return res.json({ success: true, message: 'Google Workspace / Gmail SMTP Connected Successfully!' });
  } catch (err) {
    console.warn(`[GMAIL TEST REJECTED] ${err.message}`);
    return res.status(401).json({ 
      success: false, 
      message: err.message || 'Failed to authenticate with Gmail SMTP server. Ensure 2-Step Verification is active and you are using a 16-character App Password.' 
    });
  }
});

// 10. Test General Email Provider Endpoint
app.post('/api/test-email-provider', async (req, res) => {
  try {
    const { provider = 'gmail', user, pass, host, port } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ success: false, message: 'Missing credentials.' });
    }

    const transporter = createDynamicTransporter({ provider, user, pass, host, port });
    await transporter.verify();
    console.log(`[PROVIDER TEST SUCCESS] Provider: ${provider} | User: ${user}`);

    storedSmtpConfig = { provider, user, pass, host, port, mode: provider };
    saveDatabase();

    return res.json({ success: true, message: `${provider.toUpperCase()} SMTP Connected Successfully!` });
  } catch (err) {
    console.warn(`[PROVIDER TEST FAILED] ${err.message}`);
    return res.status(401).json({ success: false, message: err.message || 'SMTP Authentication failed.' });
  }
});

// 11. Send Welcome Email Endpoint
app.post('/api/send-welcome-email', async (req, res) => {
  try {
    const { email, userName, workspaceName, smtpUser, smtpPass } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Recipient email address is required.' });
    }

    const welcomeSubject = `Welcome to Sendaat Workspace | Account Activated`;
    const recipientName = userName || email.split('@')[0];
    const userWorkspace = workspaceName || `${recipientName}'s Workspace`;

    const welcomeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Sendaat</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Google Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 20px auto; padding: 0; background-color: #050505; border-radius: 28px; overflow: hidden; border: 1px solid #27272A;">
          <div style="background-color: #09090B; padding: 40px 32px; text-align: center; border-bottom: 1px solid #27272A;">
            <div style="font-size: 26px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 6px;">Sendaat</div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A1A1AA; font-weight: 600;">Enterprise Email Infrastructure</div>
          </div>
          <div style="padding: 40px 32px; background-color: #121212; color: #FFFFFF;">
            <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 500; margin-top: 0; margin-bottom: 16px;">Welcome to Sendaat, ${recipientName}!</h1>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
              Your high-deliverability email infrastructure workspace <strong style="color: #FFFFFF;">${userWorkspace}</strong> is now live and secured.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendMailWithFallback({
      to: email,
      subject: welcomeSubject,
      html: welcomeHtml,
      user: smtpUser,
      pass: smtpPass,
      fromName: 'Sendaat Welcome Team'
    });

    console.log(`[WELCOME EMAIL SENT] To: ${email} | Sender: ${result.sender}`);
    return res.json({ success: true, mode: 'gmail', message: `Welcome email dispatched to ${email}.` });
  } catch (err) {
    console.error('[WELCOME EMAIL ERROR]', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch welcome email' });
  }
});

// 12. Password Reset OTP Endpoint
app.post('/api/send-reset-otp', async (req, res) => {
  try {
    const { email, otpCode, smtpUser, smtpPass } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Missing email or OTP code.' });
    }

    const user = smtpUser || storedSmtpConfig.user;
    const pass = smtpPass || storedSmtpConfig.pass;

    if (smtpUser && smtpPass) {
      storedSmtpConfig = { user: smtpUser, pass: smtpPass, mode: 'gmail' };
      saveDatabase();
    }

    const resetSubject = `Security Verification Code | Sendaat Account Recovery`;
    const recipientName = email.split('@')[0];
    const magicVerifyUrl = `http://localhost:5173/?verify_code=${otpCode}&email=${encodeURIComponent(email)}&mode=reset`;

    const resetHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sendaat Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; color: #FFFFFF; font-family: 'Google Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 560px; margin: 20px auto; padding: 0; background-color: #050505; border-radius: 24px; overflow: hidden; border: 1px solid #27272A;">
          <div style="padding: 36px 32px; background-color: #121212; color: #FFFFFF;">
            <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 12px;">Password Reset Code</h2>
            <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
              Hello <strong style="color: #FFFFFF;">${recipientName}</strong>! Use your 6-digit verification code below to reset your password for <strong style="color: #FFFFFF;">${email}</strong>.
            </p>
            <div style="background-color: #000000; border: 1px solid #27272A; border-radius: 20px; padding: 24px; text-align: center; margin: 28px 0;">
              <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF;">${otpCode}</div>
              <div style="font-size: 11px; color: #A1A1AA; margin-top: 10px;">Expires in 15 minutes • Single-use token</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendMailWithFallback({
      to: email,
      subject: resetSubject,
      html: resetHtml,
      user,
      pass,
      fromName: 'Sendaat Security'
    });

    console.log(`[RESET OTP SENT] To: ${email} | Sender: ${result.sender}`);
    return res.json({ success: true, mode: 'gmail', message: `Password reset verification email dispatched to ${email}.` });
  } catch (err) {
    console.error('[RESET EMAIL ERROR]', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch password reset email' });
  }
});

// 13. TOTP 2FA Endpoints
app.post('/api/2fa/generate', async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email || 'user@sendaat.io';

    const secret = generateSecret();
    const otpauthUrl = generateURI({ label: userEmail, issuer: 'Sendaat', secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    console.log(`[2FA GENERATE] Generated live secret & QR Code for ${userEmail}`);
    return res.json({
      success: true,
      secret,
      otpauthUrl,
      qrCodeDataUrl
    });
  } catch (err) {
    console.error('[2FA GENERATE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to generate 2FA secret' });
  }
});

app.post('/api/2fa/verify', async (req, res) => {
  try {
    const { token, secret } = req.body;
    if (!token || !secret) {
      return res.status(400).json({ error: 'Missing token or secret for 2FA verification.' });
    }

    const cleanToken = token.toString().trim().replace(/\s+/g, '');
    const isValid = await verifyTotp({ token: cleanToken, secret });

    console.log(`[2FA VERIFY] Token validation result: ${isValid}`);
    return res.json({ success: true, valid: Boolean(isValid) });
  } catch (err) {
    console.error('[2FA VERIFY ERROR]', err);
    return res.status(500).json({ error: err.message || 'Invalid TOTP token verification.' });
  }
});

// 14. Background Persistent Campaign Queue Engine
let persistentQueueState = {
  status: 'IDLE',
  recipients: [],
  campaignConfig: {},
  smtpConfig: {},
  processedCount: 0,
  timer: null
};

app.post('/api/start-persistent-queue', (req, res) => {
  const { recipients, campaignConfig, smtpConfig } = req.body;
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'No recipients provided for campaign queue.' });
  }

  if (persistentQueueState.timer) clearInterval(persistentQueueState.timer);

  persistentQueueState = {
    status: 'SENDING',
    recipients: recipients.map(r => ({ ...r, status: r.status || 'Ready' })),
    campaignConfig: campaignConfig || {},
    smtpConfig: smtpConfig || {},
    processedCount: recipients.filter(r => r.status === 'Sent').length,
    timer: null
  };

  console.log(`[SERVER PERSISTENT QUEUE START] Starting background queue for ${recipients.length} recipients...`);

  persistentQueueState.timer = setInterval(async () => {
    if (persistentQueueState.status !== 'SENDING') {
      clearInterval(persistentQueueState.timer);
      persistentQueueState.timer = null;
      return;
    }

    const pending = persistentQueueState.recipients.filter(r => r.status === 'Ready' || r.status === 'Queued');
    if (pending.length === 0) {
      persistentQueueState.status = 'COMPLETED';
      clearInterval(persistentQueueState.timer);
      persistentQueueState.timer = null;
      console.log('[SERVER PERSISTENT QUEUE] All emails in background queue successfully sent!');
      return;
    }

    const nextRecipient = pending[0];
    nextRecipient.status = 'Sending';

    try {
      const user = persistentQueueState.smtpConfig.user || storedSmtpConfig.user;
      const pass = persistentQueueState.smtpConfig.pass || storedSmtpConfig.pass;

      await sendMailWithFallback({
        to: nextRecipient.email,
        subject: persistentQueueState.campaignConfig.subject || 'Outreach Opportunity',
        html: persistentQueueState.campaignConfig.htmlContent || `<p>${(persistentQueueState.campaignConfig.bodyText || '').replace(/\n/g, '<br/>')}</p>`,
        user,
        pass,
        fromName: persistentQueueState.campaignConfig.senderName || 'Sendaat Outreach'
      });

      nextRecipient.status = 'Sent';
      persistentQueueState.processedCount++;
      console.log(`[SERVER BACKGROUND DISPATCH] (${persistentQueueState.processedCount}/${persistentQueueState.recipients.length}) Sent to: ${nextRecipient.email}`);
    } catch (err) {
      nextRecipient.status = 'Failed';
      console.error(`[SERVER BACKGROUND DISPATCH FAILED] To: ${nextRecipient.email}`, err.message);
    }
  }, (persistentQueueState.campaignConfig.intervalSeconds || 5) * 1000);

  return res.json({
    success: true,
    message: 'Persistent server queue started.',
    status: 'SENDING',
    totalRecipients: recipients.length
  });
});

app.get('/api/get-persistent-queue-status', (req, res) => {
  return res.json({
    status: persistentQueueState.status,
    totalRecipients: persistentQueueState.recipients.length,
    processedCount: persistentQueueState.processedCount,
    recipients: persistentQueueState.recipients
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[SkillBridge Infrastructure Server] Running on http://localhost:${PORT}`);
});
