import { 
  userSyncStore, 
  projectVersionStore, 
  getUserSyncData, 
  updateUserSyncData, 
  registerSseClient, 
  broadcastToUser 
} from '../lib/syncStore.js';
import { parseRequestBody } from '../lib/authStore.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-Device-Id'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';
  const query = req.query || {};
  const action = query.action || (url.split('?')[0].split('/').pop() || '');

  const userId = query.userId || req.headers['x-user-id'] || 'usr_maverick';
  const deviceId = query.deviceId || req.headers['x-device-id'] || `device_${Date.now()}`;

  // 1. SSE Real-Time Sync Stream
  if (action === 'stream' || url.includes('/stream')) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

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
    return;
  }

  // 2. Hydrate Complete Workspace State
  if (action === 'hydrate' || url.includes('/hydrate')) {
    const userState = getUserSyncData(userId);
    return res.status(200).json({
      success: true,
      userId: userId,
      state: userState
    });
  }

  // 3. Push Incremental State / Delta with Concurrency Control
  if (action === 'push' || url.includes('/push')) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = parseRequestBody(req);
    const targetUserId = body.userId || userId;
    const clientVersion = body.clientVersion || null;
    const delta = body.delta || body;

    try {
      const result = updateUserSyncData(targetUserId, delta, body.deviceId || deviceId, clientVersion);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // 4. Projects Listing & Creation
  if (action === 'projects' || url.includes('/projects')) {
    const userState = getUserSyncData(userId);
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        projects: userState?.projects || []
      });
    }

    if (req.method === 'POST') {
      const body = parseRequestBody(req);
      const newProj = {
        id: body.id || `proj_${Date.now()}`,
        name: body.name || 'Untitled Project',
        type: body.type || 'email_builder',
        updatedAt: new Date().toISOString(),
        version: 1,
        thumbnail: body.thumbnail || '',
        data: body.data || {}
      };

      const projects = [...(userState.projects || []).filter(p => p.id !== newProj.id), newProj];
      const updated = updateUserSyncData(userId, { projects, activeProjectId: newProj.id }, deviceId);
      return res.status(200).json({ success: true, project: newProj, version: updated.version });
    }
  }

  // 5. Version History Listing
  if (action === 'versions' || url.includes('/versions')) {
    const projectId = query.projectId || req.query.id || 'proj_default_campaign';
    const versions = projectVersionStore[projectId] || [];
    return res.status(200).json({
      success: true,
      projectId,
      versions
    });
  }

  // 6. Restore Version Snapshot
  if (action === 'restore' || url.includes('/restore')) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = parseRequestBody(req);
    const projectId = body.projectId || 'proj_default_campaign';
    const targetVersion = body.version;

    const list = projectVersionStore[projectId] || [];
    const targetSnapshot = list.find(v => v.version === Number(targetVersion));

    if (!targetSnapshot) {
      return res.status(404).json({ success: false, error: `Version ${targetVersion} not found in history.` });
    }

    const delta = {
      campaignConfig: targetSnapshot.snapshot.campaignConfig,
      emailDesignerData: targetSnapshot.snapshot.emailDesignerData,
      theme: targetSnapshot.snapshot.theme || 'dark'
    };

    const updated = updateUserSyncData(userId, delta, deviceId);
    return res.status(200).json({
      success: true,
      message: `Restored snapshot v${targetVersion} successfully.`,
      state: updated.state
    });
  }

  // 7. Batch Offline Queue Flush
  if (action === 'batch' || url.includes('/batch')) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = parseRequestBody(req);
    const mutations = Array.isArray(body.mutations) ? body.mutations : [];

    let lastResult = null;
    for (const mut of mutations) {
      if (mut && mut.delta) {
        lastResult = updateUserSyncData(body.userId || userId, mut.delta, mut.deviceId || deviceId, mut.clientVersion);
      }
    }

    return res.status(200).json({
      success: true,
      processedCount: mutations.length,
      latestState: lastResult ? lastResult.state : getUserSyncData(userId)
    });
  }

  // Default fallback -> hydrate
  const userState = getUserSyncData(userId);
  return res.status(200).json({ success: true, state: userState });
}
