import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './authStore.js';

let __dirname = '';
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __dirname = process.cwd();
}

const DB_FILE = path.join(__dirname, '..', 'server_db.json');

// In-Memory cache for low-latency retrieval and serverless execution
export let userSyncStore = {};
export let projectVersionStore = {};
export const processedMutationIds = new Set();

// Active SSE client connections map: userId -> Set of client objects { deviceId, res }
export const activeSseClients = new Map();

// Cloud Persistence helper to save state to Supabase / persistent cloud storage
export async function persistStateToCloud(userId, state) {
  if (!userId || !state) return;
  const cleanId = String(userId).trim();

  try {
    // Attempt upserting to Supabase table if accessible
    const { error } = await supabase
      .from('user_sync')
      .upsert({
        user_id: cleanId,
        version: state.version,
        state_data: state,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      // If table is missing or restricted, log debug and continue with serverless cache
    }
  } catch (err) {
    // Graceful cloud persistence handler
  }
}

export async function loadStateFromCloud(userId) {
  if (!userId) return null;
  const cleanId = String(userId).trim();

  try {
    const { data, error } = await supabase
      .from('user_sync')
      .select('state_data')
      .eq('user_id', cleanId)
      .single();

    if (!error && data?.state_data) {
      userSyncStore[cleanId] = data.state_data;
      return data.state_data;
    }
  } catch (err) {}
  return null;
}

export function broadcastToUser(userId, eventData, excludeDeviceId = null) {
  if (!userId) return;
  const cleanUserId = String(userId).trim();
  const clients = activeSseClients.get(cleanUserId);
  if (!clients || clients.size === 0) return;

  const payload = `data: ${JSON.stringify({ ...eventData, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of clients) {
    try {
      if (excludeDeviceId && client.deviceId === excludeDeviceId) {
        continue;
      }
      client.res.write(payload);
    } catch (err) {
      console.warn('[SSE BROADCAST ERROR]', err.message);
    }
  }
}

export function registerSseClient(userId, deviceId, res) {
  if (!userId) return null;
  const cleanUserId = String(userId).trim();
  if (!activeSseClients.has(cleanUserId)) {
    activeSseClients.set(cleanUserId, new Set());
  }
  const clientObj = { deviceId, res };
  activeSseClients.get(cleanUserId).add(clientObj);

  res.on('close', () => {
    const set = activeSseClients.get(cleanUserId);
    if (set) {
      set.delete(clientObj);
      if (set.size === 0) {
        activeSseClients.delete(cleanUserId);
      }
    }
  });

  return clientObj;
}

export function loadSyncDataFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data.userSyncStore && typeof data.userSyncStore === 'object') {
        userSyncStore = data.userSyncStore;
      }
      if (data.projectVersionStore && typeof data.projectVersionStore === 'object') {
        projectVersionStore = data.projectVersionStore;
      }
    }
  } catch (err) {}
}

export function saveSyncDataToDisk() {
  try {
    let existingData = {};
    if (fs.existsSync(DB_FILE)) {
      try {
        existingData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      } catch (e) {}
    }

    const payload = {
      ...existingData,
      userSyncStore,
      projectVersionStore
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {}
}

// Initialize on module load
loadSyncDataFromDisk();

// Sanitize user state to ensure secrets are NEVER returned during hydration
export function sanitizeSyncState(state) {
  if (!state) return null;
  const safe = { ...state };

  if (safe.smtpConfig) {
    const { pass, ...safeSmtp } = safe.smtpConfig;
    safe.smtpConfig = {
      ...safeSmtp,
      configured: Boolean(pass || safeSmtp.user),
      mode: safeSmtp.mode || 'gmail',
      user: safeSmtp.user || ''
    };
  }

  return safe;
}

export function getDefaultUserState(user) {
  const userId = user?.id || 'usr_default';
  const email = user?.email || 'user@sendaat.io';
  const userName = user?.name || email.split('@')[0];

  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    lastUpdatedByDevice: 'system_init',
    userProfile: {
      id: userId,
      email: email,
      name: userName,
      company: user?.company || `${userName}'s Workspace`,
      role: user?.role || 'Workspace Owner',
      avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      onboardingCompleted: user?.onboardingCompleted ?? true,
      twoFactorEnabled: user?.twoFactorEnabled ?? false
    },
    currentOrg: {
      id: 'org_sendaat_1001',
      name: 'Sendaat Enterprise',
      domain: 'sendaat.io',
      role: 'Workspace Owner',
      plan: 'Enterprise Scale',
      verified: true
    },
    theme: 'dark',
    activeTab: 'dashboard',
    activeSuite: 'mail',
    activeInboxTab: 'primary',
    isSidebarCollapsed: true,
    campaignConfig: {
      subject: 'Elevating Communication Workflows - Sendaat Enterprise',
      bodyText: 'Hi {{first_name}},\n\nWe noticed your recent activity on Sendaat Enterprise. Our multi-tenant communication platform helps modern teams scale their email deliverability with 1-by-1 humanized pacing, real-time sync, and enterprise security.\n\nWould you be open for a quick demo this week?\n\nBest regards,\n{{sender_name}}',
      intervalSeconds: 5,
      useJitter: true,
      headerLogoText: 'SENDAAT',
      buttonText: 'Schedule 15-min Demo',
      buttonUrl: 'https://sendaat.io',
      signatureText: 'Best regards,\nMaverick Jack\nWorkspace Owner, Sendaat Enterprise',
      senderEmail: user?.email || 'user@sendaat.io',
      senderName: userName,
      htmlContent: ''
    },
    smtpConfig: {
      mode: 'gmail',
      user: process.env.SMTP_USER || 'user@sendaat.io',
      configured: Boolean(process.env.SMTP_PASS)
    },
    recipients: [
      { id: 'rec-1', firstName: 'Maverick', lastName: 'Jack', email: 'm4verickjack@gmail.com', company: 'Sendaat Enterprise', role: 'Platform Admin', status: 'Ready', organization_id: 'org_sendaat_1001' },
      { id: 'rec-2', firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@stanford.edu', company: 'Stanford University', role: 'Graduate Researcher', status: 'Ready', organization_id: 'org_sendaat_1001' },
      { id: 'rec-3', firstName: 'Elena', lastName: 'Rostova', email: 'elena.rostova@mit.edu', company: 'MIT Media Lab', role: 'AI Specialist', status: 'Ready', organization_id: 'org_sendaat_1001' },
      { id: 'rec-4', firstName: 'Marcus', lastName: 'Vance', email: 'marcus.vance@oxford.ac.uk', company: 'Oxford University', role: 'Senior Fellow', status: 'Ready', organization_id: 'org_sendaat_1001' }
    ],
    suppressionList: [
      { id: 'sup-1', email: 'spam-trap@competitor.com', reason: 'Spam Trap Detected', addedAt: '2026-08-01' },
      { id: 'sup-2', email: 'bounced-hard@olddomain.net', reason: 'Hard Bounce 550 Mailbox Not Found', addedAt: '2026-08-02' }
    ],
    savedTemplates: [],
    mySavedTemplates: [],
    emailDesignerData: null,
    apiKeys: [
      {
        id: 'key_default',
        name: 'Default Production Key',
        key: `sk_live_sendaat_1001_${Math.random().toString(36).substring(2, 10)}`,
        createdAt: '2026-08-01',
        scope: 'Full Access (read/write)',
        lastUsed: 'Just now'
      }
    ],
    projects: [
      {
        id: 'proj_default_campaign',
        name: 'Enterprise Outreach Campaign',
        type: 'email_builder',
        updatedAt: new Date().toISOString(),
        version: 1,
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400',
        summary: 'Primary email campaign for talent acquisition and outreach'
      }
    ]
  };
}

export function getUserSyncData(userId, userFallback = null) {
  if (!userId) return null;
  const cleanId = String(userId).trim();
  if (!userSyncStore[cleanId]) {
    userSyncStore[cleanId] = getDefaultUserState(userFallback || { id: cleanId });
    saveSyncDataToDisk();
    persistStateToCloud(cleanId, userSyncStore[cleanId]);
  }
  return sanitizeSyncState(userSyncStore[cleanId]);
}

export function updateUserSyncData(userId, delta, deviceId = 'unknown_device', clientVersion = null, allowConflictMerge = true) {
  if (!userId) throw new Error('User ID is required for sync update.');
  const cleanId = String(userId).trim();
  let current = userSyncStore[cleanId] || getDefaultUserState({ id: cleanId });

  let conflictDetected = false;
  const serverVersion = current.version || 1;

  // Enforce Optimistic Concurrency Control (CAS)
  if (clientVersion !== null && clientVersion !== undefined && Number(clientVersion) < serverVersion) {
    conflictDetected = true;
    console.log(`[SYNC CONFLICT] Client v${clientVersion} is behind Server v${serverVersion} for user ${cleanId}`);
    
    if (!allowConflictMerge) {
      return {
        success: false,
        conflict: true,
        code: 'VERSION_CONFLICT',
        message: `Version conflict: client revision (${clientVersion}) is stale compared to server revision (${serverVersion}).`,
        serverVersion: serverVersion,
        state: sanitizeSyncState(current)
      };
    }
  }

  // Create project version history snapshot before modifying significant fields
  if (delta.campaignConfig || delta.emailDesignerData || delta.projects || delta.recipients) {
    const projId = delta.activeProjectId || 'proj_default_campaign';
    if (!projectVersionStore[projId]) {
      projectVersionStore[projId] = [];
    }
    projectVersionStore[projId].unshift({
      version: serverVersion,
      timestamp: new Date().toISOString(),
      deviceId: deviceId,
      userEmail: current.userProfile?.email || 'user',
      snapshot: {
        campaignConfig: current.campaignConfig,
        emailDesignerData: current.emailDesignerData,
        recipientsCount: current.recipients?.length || 0,
        theme: current.theme
      }
    });

    if (projectVersionStore[projId].length > 50) {
      projectVersionStore[projId].pop();
    }
  }

  // Atomically increment version and merge delta fields safely
  const nextVersion = serverVersion + 1;
  const updated = {
    ...current,
    ...delta,
    version: nextVersion,
    lastUpdated: new Date().toISOString(),
    lastUpdatedByDevice: deviceId
  };

  if (delta.userProfile) {
    updated.userProfile = { ...current.userProfile, ...delta.userProfile };
  }
  if (delta.campaignConfig) {
    updated.campaignConfig = { ...current.campaignConfig, ...delta.campaignConfig };
  }
  if (delta.smtpConfig) {
    updated.smtpConfig = { ...current.smtpConfig, ...delta.smtpConfig };
  }

  userSyncStore[cleanId] = updated;
  saveSyncDataToDisk();
  persistStateToCloud(cleanId, updated);

  const safeUpdated = sanitizeSyncState(updated);

  // Broadcast real-time update to all active devices of this user
  broadcastToUser(cleanId, {
    type: 'STATE_UPDATED',
    version: nextVersion,
    updatedByDevice: deviceId,
    delta: delta,
    conflictDetected: conflictDetected
  }, deviceId);

  return {
    success: true,
    version: nextVersion,
    conflict: conflictDetected,
    state: safeUpdated
  };
}

