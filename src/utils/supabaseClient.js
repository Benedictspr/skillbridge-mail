import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tbebbtlgiqkkkixxibqk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZWJidGxnaXFra2tpeHhpYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Nzk3NDAsImV4cCI6MjEwMjA1NTc0MH0.9_4bnvr3y__kk8gWkxuY-wXHAzX-QQnfQGJ2rEeP2hI';

class DummyWebSocket {}
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = DummyWebSocket;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: typeof window !== 'undefined' },
  realtime: { enabled: typeof window !== 'undefined' }
});
