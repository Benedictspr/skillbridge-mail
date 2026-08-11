// Central User Registration & Authentication Storage helper

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
        // Ensure m4verickjack@gmail.com is present in existing list
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
  
  // Seed default registered users
  localStorage.setItem('sendaat_registeredUsers', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function registerUser(newUser) {
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

  // Sync with backend DB
  try {
    fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userRecord)
    }).catch(() => {});
  } catch (e) {}

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

// 90 Days in milliseconds (3 months)
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function validatePasswordReuse(email, newPassword) {
  const users = getRegisteredUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { valid: true };
  }

  // 1. Cannot reuse active current password
  if (user.password && user.password === newPassword) {
    return {
      valid: false,
      message: 'You cannot reuse your current active password. Please choose a new password.'
    };
  }

  // 2. Cannot reuse any password used within the last 90 days (3 months)
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
