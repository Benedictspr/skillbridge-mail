// Central Real-Time Cross-Device Synchronization Engine for SkillBridge / Sendaat
// Handles persistent cloud state, SSE live stream, cross-tab sync, offline queue, optimistic concurrency, and conflict detection.

class SyncEngine {
  constructor() {
    this.userId = null;
    this.deviceId = this.getOrCreateDeviceId();
    this.currentVersion = 1;
    this.syncStatus = 'synced'; // 'synced' | 'syncing' | 'saving' | 'offline' | 'changes_pending' | 'conflict'
    this.lastSyncedAt = new Date().toISOString();
    this.lastError = null;
    this.eventSource = null;
    this.broadcastChannel = null;
    this.listeners = new Set();
    this.debounceTimer = null;
    this.pendingDelta = {};
    this.offlineQueue = this.loadOfflineQueue();
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;

    this.initNetworkListeners();
    this.initBroadcastChannel();
  }

  getOrCreateDeviceId() {
    try {
      let id = localStorage.getItem('sendaat_deviceId');
      if (!id) {
        const platform = typeof navigator !== 'undefined' && /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
        id = `dev_${platform}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
        localStorage.setItem('sendaat_deviceId', id);
      }
      return id;
    } catch (e) {
      return `dev_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[SYNC ENGINE] Network online detected. Reconnecting stream and flushing offline queue.');
      this.isOnline = true;
      this.setStatus('syncing');
      this.connectStream();
      this.flushOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.warn('[SYNC ENGINE] Network offline detected. Switching to offline caching mode.');
      this.isOnline = false;
      this.setStatus('offline');
      if (this.eventSource) {
        try { this.eventSource.close(); } catch (e) {}
        this.eventSource = null;
      }
    });
  }

  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('sendaat_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          const data = event.data;
          if (!data || data.senderDeviceId === this.deviceId) return;

          if (data.type === 'LOCAL_TAB_UPDATE') {
            console.log('[SYNC ENGINE] Cross-tab local update received from tab:', data.senderDeviceId);
            this.emit('REMOTE_UPDATE', {
              delta: data.delta,
              version: data.version,
              updatedByDevice: 'Other Tab (Local Browser)'
            });
          }
        };
      } catch (e) {
        console.warn('[SYNC ENGINE] BroadcastChannel initialization skipped:', e);
      }
    }
  }

  initUser(user) {
    if (!user || !user.id) return;
    const cleanUserId = String(user.id).trim();

    if (this.userId !== cleanUserId) {
      this.userId = cleanUserId;
      console.log(`[SYNC ENGINE] Initialized for User: ${cleanUserId} (Device: ${this.deviceId})`);
      this.connectStream();
      this.flushOfflineQueue();
    }
  }

  connectStream() {
    if (typeof window === 'undefined' || !this.userId || !this.isOnline) return;

    if (this.eventSource) {
      try { this.eventSource.close(); } catch (e) {}
      this.eventSource = null;
    }

    try {
      const streamUrl = `/api/sync/stream?userId=${encodeURIComponent(this.userId)}&deviceId=${encodeURIComponent(this.deviceId)}`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus(this.offlineQueue.length > 0 ? 'changes_pending' : 'synced');
        console.log(`[SYNC SSE STREAM CONNECTED] Active for ${this.userId} on ${this.deviceId}`);
      };

      this.eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'INIT_CONNECTED') {
            return;
          }

          if (data.type === 'STATE_UPDATED') {
            if (data.updatedByDevice !== this.deviceId) {
              console.log(`[SYNC REAL-TIME UPDATE RECEIVED] from ${data.updatedByDevice} (v${data.version})`);
              this.currentVersion = data.version;
              this.lastSyncedAt = data.timestamp || new Date().toISOString();
              this.setStatus('synced');
              this.emit('REMOTE_UPDATE', {
                delta: data.delta,
                version: data.version,
                updatedByDevice: data.updatedByDevice,
                conflictDetected: data.conflictDetected
              });
            }
          }
        } catch (err) {
          console.warn('[SYNC SSE PARSE ERROR]', err);
        }
      };

      this.eventSource.onerror = (err) => {
        if (this.eventSource) {
          try { this.eventSource.close(); } catch (e) {}
          this.eventSource = null;
        }
        if (this.isOnline) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            this.connectStream();
          }, delay);
        }
      };
    } catch (e) {
      console.warn('[SYNC STREAM INIT ERROR]', e);
    }
  }

  // Hydrate full authoritative state from backend cloud memory
  async hydrate(userId = this.userId) {
    const targetUserId = userId || this.userId || 'usr_maverick';
    this.setStatus('syncing');

    try {
      const resp = await fetch(`/api/sync/hydrate?userId=${encodeURIComponent(targetUserId)}`, {
        headers: {
          'X-User-Id': targetUserId,
          'X-Device-Id': this.deviceId
        }
      });

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }

      const data = await resp.json();
      if (data.success && data.state) {
        this.currentVersion = data.state.version || 1;
        this.lastSyncedAt = data.state.lastUpdated || new Date().toISOString();
        this.setStatus('synced');
        console.log(`[SYNC HYDRATED] Authoritative cloud state loaded (v${this.currentVersion})`);
        return data.state;
      }
      throw new Error(data.error || 'Failed to hydrate state');
    } catch (err) {
      console.warn('[SYNC HYDRATE FALLBACK] Using cached local storage due to network/server error:', err.message);
      this.setStatus(this.isOnline ? 'synced' : 'offline');
      return null;
    }
  }

  // Push local mutation delta to backend with debouncing and optimistic concurrency
  pushState(delta, immediate = false) {
    if (!this.userId) return;

    this.pendingDelta = { ...this.pendingDelta, ...delta };
    this.setStatus('saving');

    // Broadcast across tabs immediately
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'LOCAL_TAB_UPDATE',
          senderDeviceId: this.deviceId,
          delta: delta,
          version: this.currentVersion
        });
      } catch (e) {}
    }

    if (immediate) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.executePush();
      return;
    }

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.executePush();
    }, 400);
  }

  async executePush() {
    const deltaToSend = { ...this.pendingDelta };
    this.pendingDelta = {};

    if (Object.keys(deltaToSend).length === 0) {
      this.setStatus('synced');
      return;
    }

    if (!this.isOnline) {
      this.enqueueOfflineMutation(deltaToSend);
      this.setStatus('offline');
      return;
    }

    this.setStatus('syncing');

    try {
      const resp = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.userId,
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify({
          userId: this.userId,
          deviceId: this.deviceId,
          clientVersion: this.currentVersion,
          delta: deltaToSend
        })
      });

      const data = await resp.json();

      if (resp.ok && data.success) {
        this.currentVersion = data.version || this.currentVersion + 1;
        this.lastSyncedAt = new Date().toISOString();
        this.setStatus('synced');

        if (data.conflict) {
          console.log('[SYNC ENGINE] Conflict auto-merged with server revision.');
          this.emit('CONFLICT_RESOLVED', { newVersion: data.version, state: data.state });
        }
      } else {
        throw new Error(data.error || 'Server rejected sync push');
      }
    } catch (err) {
      console.warn('[SYNC PUSH ERROR] Queuing for offline retry:', err.message);
      this.enqueueOfflineMutation(deltaToSend);
      this.setStatus(this.isOnline ? 'changes_pending' : 'offline');
    }
  }

  enqueueOfflineMutation(delta) {
    this.offlineQueue.push({
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      clientVersion: this.currentVersion,
      deviceId: this.deviceId,
      delta: delta
    });
    this.saveOfflineQueue();
  }

  async flushOfflineQueue() {
    if (this.offlineQueue.length === 0 || !this.userId || !this.isOnline) return;

    console.log(`[SYNC ENGINE] Flushing ${this.offlineQueue.length} offline mutations...`);
    this.setStatus('syncing');

    const mutations = [...this.offlineQueue];

    try {
      const resp = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.userId,
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify({
          userId: this.userId,
          deviceId: this.deviceId,
          mutations: mutations
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        this.offlineQueue = [];
        this.saveOfflineQueue();
        if (data.latestState) {
          this.currentVersion = data.latestState.version || this.currentVersion;
        }
        this.lastSyncedAt = new Date().toISOString();
        this.setStatus('synced');
        console.log(`[SYNC OFFLINE FLUSH SUCCESS] All ${mutations.length} offline changes committed to cloud memory.`);
      }
    } catch (err) {
      console.warn('[SYNC OFFLINE FLUSH ERROR]', err.message);
      this.setStatus('changes_pending');
    }
  }

  loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('sendaat_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveOfflineQueue() {
    try {
      localStorage.setItem('sendaat_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (e) {}
  }

  // Version History Helpers
  async getVersions(projectId = 'proj_default_campaign') {
    try {
      const resp = await fetch(`/api/sync/versions?projectId=${encodeURIComponent(projectId)}&userId=${encodeURIComponent(this.userId || 'usr_maverick')}`);
      if (resp.ok) {
        const data = await resp.json();
        return data.versions || [];
      }
    } catch (e) {
      console.warn('[SYNC GET VERSIONS ERROR]', e);
    }
    return [];
  }

  async restoreVersion(projectId = 'proj_default_campaign', version) {
    this.setStatus('syncing');
    try {
      const resp = await fetch('/api/sync/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.userId || 'usr_maverick',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify({
          userId: this.userId,
          projectId: projectId,
          version: Number(version),
          deviceId: this.deviceId
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        this.setStatus('synced');
        this.emit('VERSION_RESTORED', { version, state: data.state });
        return { success: true, state: data.state };
      }
      throw new Error(data.error || 'Failed to restore snapshot');
    } catch (err) {
      this.setStatus('synced');
      throw err;
    }
  }

  async saveProject(project) {
    this.setStatus('saving');
    try {
      const resp = await fetch('/api/sync/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.userId || 'usr_maverick',
          'X-Device-Id': this.deviceId
        },
        body: JSON.stringify({
          ...project,
          userId: this.userId,
          deviceId: this.deviceId
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        this.setStatus('synced');
        return data.project;
      }
      throw new Error(data.error || 'Failed to save project');
    } catch (err) {
      this.setStatus('changes_pending');
      throw err;
    }
  }

  setStatus(status) {
    if (this.syncStatus !== status) {
      this.syncStatus = status;
      this.emit('STATUS_CHANGE', {
        status: this.syncStatus,
        lastSyncedAt: this.lastSyncedAt,
        pendingCount: this.offlineQueue.length + (Object.keys(this.pendingDelta).length > 0 ? 1 : 0),
        isOnline: this.isOnline,
        version: this.currentVersion,
        deviceId: this.deviceId
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Send current status immediately
    listener('STATUS_CHANGE', {
      status: this.syncStatus,
      lastSyncedAt: this.lastSyncedAt,
      pendingCount: this.offlineQueue.length,
      isOnline: this.isOnline,
      version: this.currentVersion,
      deviceId: this.deviceId
    });

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(eventType, payload) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, payload);
      } catch (e) {
        console.error('[SYNC LISTENER ERROR]', e);
      }
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
