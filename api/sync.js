import { 
  userSyncStore, 
  projectVersionStore, 
  getUserSyncData, 
  updateUserSyncData, 
  registerSseClient, 
  broadcastToUser,
  sanitizeSyncState,
  processedMutationIds
} from '../lib/syncStore.js';
import { parseRequestBody, extractAuthUser } from '../lib/authStore.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-Device-Id'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Mandatory Server-Side Session Authentication
  const authUser = extractAuthUser(req);
  if (!authUser || !authUser.id) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: A valid session authentication token is required to access the synchronization system.',
      code: 'UNAUTHENTICATED'
    });
  }

  const authenticatedUserId = authUser.id;
  const url = req.url || '';
  const query = req.query || {};
  const action = query.action || (url.split('?')[0].split('/').pop() || '');

  // 2. Strict Multi-Tenant Authorization Check
  // Check if client explicitly requests a different userId in query or body
  let requestedUserId = query.userId || req.headers['x-user-id'] || null;
  let body = {};
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    body = parseRequestBody(req) || {};
    if (body.userId) {
      requestedUserId = body.userId;
    }
  }

  if (requestedUserId && requestedUserId.trim() !== authenticatedUserId) {
    console.warn(`[SECURITY 403 FORBIDDEN] User ${authenticatedUserId} attempted to access workspace of ${requestedUserId}`);
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You are not authorized to access or mutate another user\'s workspace data.',
      code: 'FORBIDDEN_CROSS_USER_ACCESS'
    });
  }

  const userId = authenticatedUserId;
  const deviceId = query.deviceId || req.headers['x-device-id'] || body.deviceId || `device_${Date.now()}`;

  // 3. SSE Real-Time Sync Stream (Secured and Isolated)
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

  // 4. Hydrate Complete Workspace State
  if (action === 'hydrate' || url.includes('/hydrate')) {
    const userState = getUserSyncData(userId, authUser);
    return res.status(200).json({
      success: true,
      userId: userId,
      state: userState
    });
  }

  // 5. Push Incremental State / Delta with Optimistic Concurrency Control
  if (action === 'push' || url.includes('/push')) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const clientVersion = body.clientVersion !== undefined ? body.clientVersion : null;
    const delta = body.delta || body;

    try {
      const result = updateUserSyncData(userId, delta, deviceId, clientVersion, true);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // 6. Projects Listing & Creation
  if (action === 'projects' || url.includes('/projects')) {
    const userState = getUserSyncData(userId, authUser);
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        projects: userState?.projects || []
      });
    }

    if (req.method === 'POST') {
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

  // 7. Version History Listing
  if (action === 'versions' || url.includes('/versions')) {
    const projectId = query.projectId || 'proj_default_campaign';
    const versions = projectVersionStore[projectId] || [];
    return res.status(200).json({
      success: true,
      projectId,
      versions
    });
  }

  // 8. Restore Version Snapshot
  if (action === 'restore' || url.includes('/restore')) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
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

  // 9. Batch Offline Queue Flush with Idempotency Protection
  if (action === 'batch' || url.includes('/batch')) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const mutations = Array.isArray(body.mutations) ? body.mutations : [];

    let lastResult = null;
    let appliedCount = 0;
    for (const mut of mutations) {
      if (mut && mut.delta) {
        const mutKey = mut.id || `${userId}_${mut.clientVersion}_${JSON.stringify(mut.delta)}`;
        if (processedMutationIds.has(mutKey)) {
          // Skip duplicate/replayed mutation
          continue;
        }
        processedMutationIds.add(mutKey);
        lastResult = updateUserSyncData(userId, mut.delta, mut.deviceId || deviceId, mut.clientVersion);
        appliedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      processedCount: appliedCount,
      totalReceived: mutations.length,
      latestState: lastResult ? lastResult.state : getUserSyncData(userId, authUser)
    });
  }

  // Default fallback -> hydrate
  const userState = getUserSyncData(userId, authUser);
  return res.status(200).json({ success: true, state: userState });
}

