import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RefreshCw, 
  History, 
  Laptop, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  Clock, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import syncEngine from '../utils/syncEngine';

export default function SyncStatusBadge({ onOpenVersionHistory }) {
  const [syncState, setSyncState] = useState({
    status: 'synced',
    lastSyncedAt: new Date().toISOString(),
    pendingCount: 0,
    isOnline: true,
    version: 1,
    deviceId: syncEngine.deviceId
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [relativeTime, setRelativeTime] = useState('Just now');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((eventType, data) => {
      if (eventType === 'STATUS_CHANGE') {
        setSyncState(prev => ({ ...prev, ...data }));
      }
    });

    // Close on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update relative time display every 3 seconds
  useEffect(() => {
    const updateTime = () => {
      if (!syncState.lastSyncedAt) return setRelativeTime('Just now');
      const diffSec = Math.floor((Date.now() - new Date(syncState.lastSyncedAt).getTime()) / 1000);
      if (diffSec < 5) setRelativeTime('Just now');
      else if (diffSec < 60) setRelativeTime(`${diffSec}s ago`);
      else if (diffSec < 3600) setRelativeTime(`${Math.floor(diffSec / 60)}m ago`);
      else setRelativeTime(`${Math.floor(diffSec / 3600)}h ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 3000);
    return () => clearInterval(interval);
  }, [syncState.lastSyncedAt]);

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncEngine.executePush();
      await syncEngine.flushOfflineQueue();
    } catch (e) {}
    setTimeout(() => {
      setIsManualSyncing(false);
    }, 600);
  };

  const getStatusBadgeUI = () => {
    if (!syncState.isOnline || syncState.status === 'offline') {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        dot: 'bg-rose-400',
        icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />,
        text: syncState.pendingCount > 0 ? `Offline (${syncState.pendingCount} pending)` : 'Offline (Cached)'
      };
    }

    if (syncState.status === 'saving' || syncState.status === 'syncing' || isManualSyncing) {
      return {
        bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        dot: 'bg-blue-400 animate-ping',
        icon: <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
        text: 'Syncing...'
      };
    }

    if (syncState.status === 'changes_pending' || syncState.pendingCount > 0) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        dot: 'bg-amber-400 animate-pulse',
        icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
        text: `Changes pending (${syncState.pendingCount})`
      };
    }

    // Default: Synced
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:border-emerald-500/50',
      dot: 'bg-emerald-400',
      icon: <Cloud className="w-3.5 h-3.5 text-emerald-400" />,
      text: 'Synced'
    };
  };

  const badgeUI = getStatusBadgeUI();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer select-none backdrop-blur-sm ${badgeUI.bg}`}
        title="Cross-Device Cloud Sync Status"
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${badgeUI.dot}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${badgeUI.dot.split(' ')[0]}`} />
        </span>
        {badgeUI.icon}
        <span className="hidden sm:inline font-mono tracking-tight">{badgeUI.text}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} text-zinc-400`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl p-3.5 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">Persistent Cloud Memory</p>
                <p className="text-[10px] text-zinc-400">Multi-Device Single Source of Truth</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              v{syncState.version || 1}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3 h-3 text-zinc-500" />
                Last Synced
              </span>
              <span className="text-zinc-200 font-mono text-[11px]">{relativeTime}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                {syncState.isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
                Connection
              </span>
              <span className={`font-medium text-[11px] ${syncState.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {syncState.isOnline ? 'Live Real-Time SSE' : 'Offline Storage Queue'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <Laptop className="w-3 h-3 text-zinc-500" />
                Device ID
              </span>
              <span className="text-zinc-400 font-mono text-[10px] truncate max-w-[120px]" title={syncState.deviceId}>
                {syncState.deviceId.split('_').slice(0, 2).join('_')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
            <button
              onClick={handleForceSync}
              disabled={isManualSyncing || !syncState.isOnline}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </button>

            {onOpenVersionHistory && (
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenVersionHistory();
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/5 text-xs font-medium text-white border border-white/10 transition-colors"
              >
                <History className="w-3 h-3" />
                History
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
