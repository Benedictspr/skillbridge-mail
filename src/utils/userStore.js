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

  // Sync with Supabase Cloud DB for Cross-Device Access
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

// ASYNC VALIDATE CREDENTIALS WITH SUPABASE CLOUD BACKEND
export async function validateCredentialsAsync(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Try local storage check first
  const localRes = validateCredentials(cleanEmail, password);
  if (localRes.success) {
    return localRes;
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
      if (!users.some(u => u.email.toLowerCase() === cleanEmail)) {
        localStorage.setItem('sendaat_registeredUsers', JSON.stringify([...users, cloudUser]));
      }

      return { success: true, user: cloudUser };
    }
  } catch (err) {
    console.warn('Supabase cloud authentication check warning:', err);
  }

  return localRes;
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
    throw new Error('No registered account found with this email address.');
  }

  localStorage.setItem('sendaat_registeredUsers', JSON.stringify(updatedUsers));
  
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
