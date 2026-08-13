// Central User Registration & Authentication Storage helper with Supabase Cloud Sync
import { supabase } from './supabaseClient';

const DEFAULT_USERS = [
  {
    id: 'usr_default_admin',
    email: 'maverick@sendaat.io',
    password: 'Password123!',
    name: 'Maverick Vance',
    company: 'Sendaat Enterprise',
    role: 'Infrastructure Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    twoFactorEnabled: false,
    twoFactorSecret: 'SENDAAT-2FA-784920'
  },
  {
    id: 'usr_maverick',
    email: 'm4verickjack@gmail.com',
    password: 'Password123!',
    name: 'Maverick Jack',
    company: 'Sendaat Enterprise',
    role: 'Workspace Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    twoFactorEnabled: false,
    twoFactorSecret: 'SENDAAT-2FA-991023'
  },
  {
    id: 'usr_smtp_owner',
    email: 'shaptsevjkonikevich@gmail.com',
    password: 'Password123!',
    name: 'Sendaat Admin',
    company: 'Sendaat Network',
    role: 'Platform Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    twoFactorEnabled: false,
    twoFactorSecret: 'SENDAAT-2FA-100293'
  }
];

export function getRegisteredUsers() {
  try {
    const saved = localStorage.getItem('sendaat_registeredUsers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasMaverick = parsed.some(u => u.email.toLowerCase() === 'm4verickjack@gmail.com');
        if (!hasMaverick) {
          const merged = [...parsed, DEFAULT_USERS[1]];
          localStorage.setItem('sendaat_registeredUsers', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading registered users:', e);
  }
  
  localStorage.setItem('sendaat_registeredUsers', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export async function registerUser(newUser) {
  const users = getRegisteredUsers();
  const cleanEmail = newUser.email.trim().toLowerCase();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  
  if (existing) {
    throw new Error('An account with this email address already exists. Please sign in.');
  }

  const userRecord = {
    id: 'usr_' + Date.now(),
    email: cleanEmail,
    password: newUser.password,
    name: newUser.name ? newUser.name.trim() : cleanEmail.split('@')[0],
    company: newUser.company ? newUser.company.trim() : `${cleanEmail.split('@')[0]}'s Workspace`,
    role: newUser.role || 'Workspace Owner',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
    onboardingCompleted: false,
    isEmailVerified: newUser.isEmailVerified ?? true,
    twoFactorEnabled: newUser.twoFactorEnabled || false,
    twoFactorSecret: newUser.twoFactorSecret || ('SENDAAT-2FA-' + Math.floor(100000 + Math.random() * 900000))
  };

  const updatedUsers = [...users, userRecord];
  localStorage.setItem('sendaat_registeredUsers', JSON.stringify(updatedUsers));

  // Sync to Central Backend Serverless API
  try {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: newUser.password,
        name: userRecord.name,
        company: userRecord.company,
        role: userRecord.role
      })
    });
  } catch (err) {
    console.warn('Central auth register sync warning:', err);
  }

  // Sync with Supabase Cloud DB
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: newUser.password,
      options: {
        data: {
          name: userRecord.name,
          company: userRecord.company,
          role: userRecord.role
        }
      }
    });

    if (error && !error.message?.includes('already registered')) {
      console.warn('Supabase Auth warning during signup:', error.message);
    }
  } catch (err) {
    console.warn('Supabase cloud signup sync warning:', err);
  }

  return userRecord;
}

export function validateCredentials(email, password) {
  const users = getRegisteredUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  
  if (!user) {
    return { 
      success: false, 
      reason: 'EMAIL_NOT_FOUND', 
      message: 'No account found with this email address. Please create an account.' 
    };
  }

  if (user.password !== password) {
    return { 
      success: false, 
      reason: 'INVALID_PASSWORD', 
      message: 'Incorrect password. Please try again or reset your password.' 
    };
  }

  return { success: true, user };
}

// ASYNC VALIDATE CREDENTIALS WITH CENTRAL SERVER & SUPABASE CLOUD BACKEND
export async function validateCredentialsAsync(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Try Central Vercel Backend Auth first (for Cross-Device / Cross-Browser Logins)
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: password })
    });
    
    const data = await resp.json();
    if (resp.ok && data.success && data.user) {
      // Sync and overwrite local storage cache on this device with verified server account
      const users = getRegisteredUsers();
      const updatedUsers = users.filter(u => u.email.toLowerCase() !== cleanEmail);
      updatedUsers.push(data.user);
      localStorage.setItem('sendaat_registeredUsers', JSON.stringify(updatedUsers));

      return { success: true, user: data.user };
    }
  } catch (backendErr) {
    console.warn('Central Vercel auth check warning:', backendErr);
  }

  // 2. Query Supabase Cloud Authentication for cross-device logins
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (!error && data?.user) {
      const meta = data.user.user_metadata || {};
      const cloudUser = {
        id: data.user.id || 'usr_' + Date.now(),
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

      // Cache locally on this device
      const users = getRegisteredUsers();
      const updatedUsers = users.filter(u => u.email.toLowerCase() !== cleanEmail);
      updatedUsers.push(cloudUser);
      localStorage.setItem('sendaat_registeredUsers', JSON.stringify(updatedUsers));

      return { success: true, user: cloudUser };
    }
  } catch (err) {
    console.warn('Supabase cloud authentication check warning:', err);
  }

  // 3. Fallback to LocalStorage Check
  return validateCredentials(cleanEmail, password);
}

// 90 Days in milliseconds (3 months)
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function validatePasswordReuse(email, newPassword) {
  const users = getRegisteredUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { valid: true };
  }

  if (user.password && user.password === newPassword) {
    return {
      valid: false,
      message: 'You cannot reuse your current active password. Please choose a new password.'
    };
  }

  const history = Array.isArray(user.passwordHistory) ? user.passwordHistory : [];
  const now = Date.now();

  const isReusedRecent = history.some(entry => {
    if (entry && entry.password === newPassword) {
      const ageMs = now - (entry.setAt || 0);
      return ageMs < NINETY_DAYS_MS;
    }
    return false;
  });

  if (isReusedRecent) {
    return {
      valid: false,
      message: 'You cannot reuse a password used within the last 3 months (90 days). Please choose a new password.'
    };
  }

  return { valid: true };
}

export function updateUserPassword(email, newPassword) {
  const check = validatePasswordReuse(email, newPassword);
  if (!check.valid) {
    throw new Error(check.message);
  }

  const users = getRegisteredUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  
  let found = false;
  const updatedUsers = users.map(u => {
    if (u.email.toLowerCase() === cleanEmail) {
      found = true;
      const history = Array.isArray(u.passwordHistory) ? u.passwordHistory : [];
      const newHistory = [
        { password: u.password, setAt: Date.now() },
        ...history
      ];
      return { 
        ...u, 
        password: newPassword,
        passwordHistory: newHistory 
      };
    }
    return u;
  });

  if (!found) {
    // If not found locally, create record
    updatedUsers.push({
      id: 'usr_' + Date.now(),
      email: cleanEmail,
      password: newPassword,
      name: cleanEmail.split('@')[0],
      company: `${cleanEmail.split('@')[0]}'s Workspace`,
      role: 'Workspace Owner',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      onboardingCompleted: false,
      isEmailVerified: true,
      twoFactorEnabled: false
    });
  }

  localStorage.setItem('sendaat_registeredUsers', JSON.stringify(updatedUsers));
  
  // Sync password update to Central Backend Serverless API
  try {
    fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword })
    }).catch(() => {});
  } catch (e) {}

  // Sync password update to Supabase
  try {
    supabase.auth.updateUser({ password: newPassword }).catch(() => {});
  } catch (e) {}

  return true;
}

export function updateUserProfile(email, updatedData) {
  const users = getRegisteredUsers();
  const cleanEmail = (email || '').trim().toLowerCase();

  const updatedUsers = users.map(u => {
    if (u.email.toLowerCase() === cleanEmail) {
      return { ...u, ...updatedData };
    }
    return u;
  });

  localStorage.setItem('sendaat_registeredUsers', JSON.stringify(updatedUsers));
}
