import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tbebbtlgiqkkkixxibqk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZWJidGxnaXFra2tpeHhpYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Nzk3NDAsImV4cCI6MjEwMjA1NTc0MH0.9_4bnvr3y__kk8gWkxuY-wXHAzX-QQnfQGJ2rEeP2hI';

class DummyWebSocket {}
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = DummyWebSocket;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { enabled: false }
});

// Central In-Memory Store for Serverless Containers
export let registeredUsersStore = [
  {
    id: 'usr_default_admin',
    email: 'maverick@sendaat.io',
    password: 'Password123!',
    name: 'Maverick Vance',
    company: 'Sendaat Enterprise',
    role: 'Infrastructure Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    onboardingCompleted: true,
    twoFactorEnabled: false
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
    twoFactorEnabled: false
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
    twoFactorEnabled: false
  }
];

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

export function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  return registeredUsersStore.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export function saveUserToStore(userRecord) {
  const cleanEmail = userRecord.email.trim().toLowerCase();
  const existingIdx = registeredUsersStore.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    registeredUsersStore[existingIdx] = { ...registeredUsersStore[existingIdx], ...userRecord };
  } else {
    registeredUsersStore.push(userRecord);
  }
}
