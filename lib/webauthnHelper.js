import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import crypto from 'crypto';

// Configuration
export const RP_NAME = 'SkillBridge Mail';
export const RP_ID = process.env.RP_ID || (process.env.NODE_ENV === 'production' ? 'skillbridge.io' : 'localhost');

// Allowed Origins (development, local ports, and production domains)
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://skillbridge.io',
  'https://mail.skillbridge.io',
  'https://sendaat.io',
  'https://app.sendaat.io'
];

if (process.env.ALLOWED_ORIGIN) {
  ALLOWED_ORIGINS.push(process.env.ALLOWED_ORIGIN);
}

// In-Memory & Ephemeral Challenge Cache with 5-minute TTL
const challengeStore = new Map(); // key: challengeId -> { challenge, userId, type, expiresAt }

export function getExpectedOrigin(req) {
  const originHeader = req.headers?.origin || req.headers?.Origin || '';
  if (originHeader && ALLOWED_ORIGINS.includes(originHeader)) {
    return originHeader;
  }
  // Fallback to primary host from request or localhost
  const host = req.headers?.host || 'localhost:3001';
  const proto = req.headers?.['x-forwarded-proto'] || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
  const derived = `${proto}://${host}`;
  if (ALLOWED_ORIGINS.includes(derived)) {
    return derived;
  }
  return ALLOWED_ORIGINS[0];
}

export function saveChallenge(userId, challenge, type = 'authentication') {
  const challengeId = crypto.randomBytes(24).toString('base64url');
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL
  challengeStore.set(challengeId, {
    challenge,
    userId: userId ? String(userId).trim() : null,
    type,
    expiresAt
  });
  return challengeId;
}

export function consumeChallenge(challengeId, expectedType = null) {
  if (!challengeId) return null;
  const entry = challengeStore.get(challengeId);
  if (!entry) return null;

  // Single-use: delete immediately to prevent replay attacks
  challengeStore.delete(challengeId);

  if (Date.now() > entry.expiresAt) {
    return null; // Expired
  }

  if (expectedType && entry.type !== expectedType) {
    return null; // Type mismatch
  }

  return entry;
}

// Clean expired challenges periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of challengeStore.entries()) {
    if (now > entry.expiresAt) {
      challengeStore.delete(id);
    }
  }
}, 60000);

/**
 * Generate WebAuthn Registration Options for an existing or new user
 */
export async function createPasskeyRegistrationOptions(user, existingPasskeys = [], req = {}) {
  const cleanUserId = user.id ? String(user.id) : `usr_${Date.now()}`;
  const userName = user.email || 'user@skillbridge.io';
  const userDisplayName = user.name || userName.split('@')[0];

  const excludeCredentials = (existingPasskeys || []).map(p => ({
    id: p.credentialId,
    transports: p.transports || ['internal', 'hybrid', 'usb', 'nfc', 'ble']
  }));

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: Buffer.from(cleanUserId, 'utf8'),
    userName: userName,
    userDisplayName: userDisplayName,
    attestationType: 'none',
    excludeCredentials,
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred'
    }
  });

  const challengeId = saveChallenge(cleanUserId, options.challenge, 'registration');

  return {
    options,
    challengeId
  };
}

/**
 * Verify WebAuthn Registration Response
 */
export async function verifyPasskeyRegistration(response, challengeId, req = {}) {
  const challengeEntry = consumeChallenge(challengeId, 'registration');
  if (!challengeEntry) {
    throw new Error('Registration challenge expired, already consumed, or invalid.');
  }

  const expectedOrigin = getExpectedOrigin(req);

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challengeEntry.challenge,
    expectedOrigin: [expectedOrigin, ...ALLOWED_ORIGINS],
    expectedRPID: RP_ID,
    requireUserVerification: false
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('WebAuthn registration signature verification failed.');
  }

  const { credential } = verification.registrationInfo;

  return {
    verified: true,
    userId: challengeEntry.userId,
    credential: {
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: response.response.transports || ['internal', 'hybrid', 'usb', 'nfc', 'ble'],
      deviceType: credential.deviceType || 'multiDevice',
      backedUp: credential.backedUp || false
    }
  };
}

/**
 * Generate WebAuthn Authentication Options
 */
export async function createPasskeyAuthenticationOptions(user = null, userPasskeys = [], req = {}) {
  const allowCredentials = (userPasskeys || []).map(p => ({
    id: p.credentialId,
    transports: p.transports || ['internal', 'hybrid', 'usb', 'nfc', 'ble']
  }));

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    userVerification: 'preferred'
  });

  const challengeId = saveChallenge(user ? user.id : null, options.challenge, 'authentication');

  return {
    options,
    challengeId
  };
}

/**
 * Verify WebAuthn Authentication Response
 */
export async function verifyPasskeyAuthentication(response, storedCredential, challengeId, req = {}) {
  if (!storedCredential || storedCredential.status === 'revoked') {
    throw new Error('Credential is not recognized, unlinked, or has been revoked.');
  }

  const challengeEntry = consumeChallenge(challengeId, 'authentication');
  if (!challengeEntry) {
    throw new Error('Authentication challenge expired, already consumed, or invalid.');
  }

  const expectedOrigin = getExpectedOrigin(req);

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challengeEntry.challenge,
    expectedOrigin: [expectedOrigin, ...ALLOWED_ORIGINS],
    expectedRPID: RP_ID,
    credential: {
      id: storedCredential.credentialId,
      publicKey: Buffer.from(storedCredential.publicKey, 'base64url'),
      counter: storedCredential.counter || 0,
      transports: storedCredential.transports
    },
    requireUserVerification: false
  });

  if (!verification.verified) {
    throw new Error('Cryptographic signature verification for passkey assertion failed.');
  }

  return {
    verified: true,
    newCounter: verification.authenticationInfo.newCounter
  };
}
