// Central User Registration & Authentication client utility for SkillBridge
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export function getStoredAuthToken() {
  try {
    return localStorage.getItem('sendaat_authToken') || null;
  } catch (e) {
    return null;
  }
}

export function setStoredAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('sendaat_authToken', token);
    } else {
      localStorage.removeItem('sendaat_authToken');
    }
  } catch (e) {}
}

export function getStoredCurrentUser() {
  try {
    const raw = localStorage.getItem('sendaat_currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem('sendaat_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('sendaat_currentUser');
    }
  } catch (e) {}
}

// 1. Password Registration
export async function registerUserAsync({ email, password, name, company, role }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const resp = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      password: password || 'Password123!',
      name: name ? name.trim() : cleanEmail.split('@')[0],
      company: company ? company.trim() : `${cleanEmail.split('@')[0]}'s Workspace`,
      role: role || 'Workspace Owner'
    })
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || data.message || 'Failed to create account.');
  }

  if (data.token) setStoredAuthToken(data.token);
  if (data.user) setStoredCurrentUser(data.user);
  return data;
}

// 2. Password Login
export async function validateCredentialsAsync(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    const data = await resp.json();
    if (resp.ok && data.success && data.user) {
      if (data.token) setStoredAuthToken(data.token);
      if (data.user) setStoredCurrentUser(data.user);
      return { success: true, user: data.user, token: data.token };
    }

    return {
      success: false,
      reason: data.reason || 'INVALID_CREDENTIALS',
      message: data.message || 'Invalid email or password.'
    };
  } catch (err) {
    console.error('Login request error:', err);
    return { success: false, message: 'Unable to connect to authentication server.' };
  }
}

// 3. Genuine WebAuthn / Passkey Registration
export async function registerPasskeyAsync(passkeyName = 'My Device', email = null) {
  const token = getStoredAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Step 1: Get challenge options from server
  const optResp = await fetch('/api/auth/passkey/register-options', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email })
  });
  const optData = await optResp.json();
  if (!optResp.ok || !optData.success) {
    throw new Error(optData.error || 'Failed to initialize passkey registration.');
  }

  // Step 2: Invoke Authenticator
  const attResp = await startRegistration({ optionsJSON: optData.options });

  // Step 3: Verify with Server
  const verResp = await fetch('/api/auth/passkey/register-verify', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      response: attResp,
      challengeId: optData.challengeId,
      name: passkeyName,
      email
    })
  });
  const verData = await verResp.json();
  if (!verResp.ok || !verData.success) {
    throw new Error(verData.error || 'Failed to verify and save passkey.');
  }

  if (verData.token) setStoredAuthToken(verData.token);
  if (verData.user) setStoredCurrentUser(verData.user);
  return verData;
}

// 4. Genuine WebAuthn / Passkey Authentication
export async function authenticatePasskeyAsync(email = null) {
  // Step 1: Get challenge options from server
  const optResp = await fetch('/api/auth/passkey/auth-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const optData = await optResp.json();
  if (!optResp.ok || !optData.success) {
    throw new Error(optData.error || 'Failed to initialize passkey login.');
  }

  // Step 2: Invoke Authenticator
  const asstResp = await startAuthentication({ optionsJSON: optData.options });

  // Step 3: Verify with Server
  const verResp = await fetch('/api/auth/passkey/auth-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response: asstResp,
      challengeId: optData.challengeId
    })
  });
  const verData = await verResp.json();
  if (!verResp.ok || !verData.success) {
    throw new Error(verData.error || 'Passkey verification failed.');
  }

  if (verData.token) setStoredAuthToken(verData.token);
  if (verData.user) setStoredCurrentUser(verData.user);
  return verData;
}

// 5. Google Authentication / OIDC Token Verification
export async function authenticateWithGoogleTokenAsync(googleToken) {
  const resp = await fetch('/api/auth/google/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: googleToken })
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || 'Failed to verify Google identity.');
  }

  if (data.token) setStoredAuthToken(data.token);
  if (data.user) setStoredCurrentUser(data.user);
  return data;
}

// 6. Link Google Identity
export async function linkGoogleAccountAsync(googleToken) {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/google/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ token: googleToken })
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || 'Failed to link Google account.');
  }
  if (data.user) setStoredCurrentUser(data.user);
  return data;
}

// 7. Unlink Google Identity
export async function unlinkGoogleAccountAsync() {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/google/unlink', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || 'Failed to disconnect Google account.');
  }
  if (data.user) setStoredCurrentUser(data.user);
  return data;
}

// 8. Password Change
export async function updateUserPasswordAsync(newPassword, currentPassword = null) {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/update-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ newPassword, currentPassword })
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || 'Failed to update password.');
  }
  if (data.token) setStoredAuthToken(data.token);
  if (data.user) setStoredCurrentUser(data.user);
  return data;
}

// 9. Passkey Management
export async function listPasskeysAsync() {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/passkey/list', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await resp.json();
}

export async function renamePasskeyAsync(credentialId, name) {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/passkey/rename', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ credentialId, name })
  });
  return await resp.json();
}

export async function revokePasskeyAsync(credentialId) {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/passkey/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ credentialId })
  });
  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || 'Failed to revoke passkey.');
  }
  if (data.user) setStoredCurrentUser(data.user);
  return data;
}

// 10. Active Sessions Management
export async function listActiveSessionsAsync() {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/sessions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await resp.json();
}

export async function revokeSessionAsync(sessionId) {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/sessions/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId })
  });
  return await resp.json();
}

export async function revokeOtherSessionsAsync() {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/sessions/revoke-others', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return await resp.json();
}

// 11. Security Audit Events
export async function listSecurityEventsAsync() {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/security-events', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await resp.json();
}

// 12. Configured Methods
export async function getAuthMethodsAsync() {
  const token = getStoredAuthToken();
  const resp = await fetch('/api/auth/methods', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await resp.json();
}

// 13. Logout
export async function logoutUserAsync() {
  const token = getStoredAuthToken();
  try {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  } catch (e) {}
  setStoredAuthToken(null);
  setStoredCurrentUser(null);
}

// Backward Compatibility Helpers for existing UI components
export function getRegisteredUsers() {
  const user = getStoredCurrentUser();
  return user ? [user] : [];
}

export function registerUser(newUser) {
  setStoredCurrentUser(newUser);
  return newUser;
}

export function validatePasswordReuse(email, newPassword) {
  return { valid: true };
}

export function validateCredentials(email, password) {
  return { success: false, message: 'Please sign in using server authentication.' };
}

export function updateUserPassword(email, newPassword) {
  updateUserPasswordAsync(newPassword).catch(console.error);
  return true;
}

export function updateUserProfile(email, updatedData) {
  const current = getStoredCurrentUser();
  if (current) {
    const updated = { ...current, ...updatedData };
    setStoredCurrentUser(updated);
  }
}
