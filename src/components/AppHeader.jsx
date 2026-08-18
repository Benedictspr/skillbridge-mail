import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, Settings, RefreshCw, 
  ShieldCheck, X, Send, Check, User, LogOut, Shield, ChevronDown
} from 'lucide-react';
import SyncStatusBadge from './SyncStatusBadge';

export default function AppHeader({ 
  searchTerm, 
  setSearchTerm, 
  campaignStatus, 
  onRefresh, 
  onToggleSidebar, 
  onOpenSettings,
  onNavigateHome,
  currentOrg,
  setCurrentOrg,
  setActiveTab,
  currentUser,
  onOpenProfile,
  onSignOut,
  recipients = [],
  onOpenVersionHistory
}) {
  const [showToast, setShowToast] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Compute Real-Time Deliverability Sender Score (Unified across Header and Deliverability Center)
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const totalCount = safeRecipients.length;
  const bouncedCount = safeRecipients.filter(r => r?.status === 'Bounced' || r?.status === 'Suppressed').length;
  const realTimeScore = totalCount > 0 
    ? Math.max(72, Math.min(100, Math.round(99 - ((bouncedCount / totalCount) * 35)))) 
    : (currentOrg?.reputationScore || 99);

  return (
    <header className="sticky top-0 z-40 bg-[#09090B] border-b border-zinc-800/80 shadow-xs font-sans text-white">
      {/* Main Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo (Matches Onboarding Pages Clean Style) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 transition-colors"
            title="Toggle Navigation Menu"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-zinc-200 rounded-full" />
              <span className="w-full h-0.5 bg-zinc-200 rounded-full" />
              <span className="w-full h-0.5 bg-zinc-200 rounded-full" />
            </div>
          </button>

          {/* Sendaat Logo - Exact Onboarding Style */}
          <div onClick={onNavigateHome} className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black shadow-xs">
              <Send className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-normal text-xl text-white tracking-tight font-sans">
              Sendaat
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden lg:block">
          <div className="px-3.5 py-1.5 flex items-center gap-2.5 text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search contacts, suppression lists, deliverability logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 font-sans"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-zinc-800 rounded-full">
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Right Controls: Real-Time Sender Score & Sleek User ID Profile */}
        <div className="flex items-center gap-3 relative">
          {showToast && (
            <div className="absolute -bottom-10 right-0 bg-zinc-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-zinc-800 flex items-center gap-1.5 z-50 animate-fade-in">
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Sendaat deliverability metrics refreshed!</span>
            </div>
          )}

          {/* Cross-Device Cloud Sync Status Badge */}
          <SyncStatusBadge onOpenVersionHistory={onOpenVersionHistory} />

          {/* Real-Time Dynamic Sender Score */}
          <div 
            onClick={() => setActiveTab('deliverability')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-zinc-200 text-xs font-medium border border-zinc-800 shadow-xs cursor-pointer hover:bg-zinc-800 transition-colors"
            title="Real-Time Deliverability Command Center"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Sender Score: <strong className="text-white font-bold">{realTimeScore}/100</strong></span>
          </div>

          {/* Upgraded Sleek Monochromatic User ID Profile Pill */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs transition-all shadow-xs cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="font-semibold text-white text-xs font-sans">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-zinc-400 font-sans">{currentUser.role || 'Owner'}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 font-sans animate-fade-in">
                  <div className="p-3 bg-black rounded-xl mb-1 border border-zinc-800">
                    <div className="font-semibold text-white text-sm font-sans truncate">{currentUser.name}</div>
                    <div className="text-xs text-zinc-400 truncate font-sans">{currentUser.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-300 font-sans">
                        {currentUser.role || 'Workspace Owner'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenProfile();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-white" />
                    <span>Account & Profile Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSignOut();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-rose-400 hover:bg-rose-950/40 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
