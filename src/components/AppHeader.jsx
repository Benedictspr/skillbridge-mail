import React, { useState } from 'react';
import { Mail, Search, SlidersHorizontal, HelpCircle, Settings, RefreshCw, ShieldCheck, Sparkles, X, Send, Key, Check, Home } from 'lucide-react';

export default function AppHeader({ 
  searchTerm, 
  setSearchTerm, 
  campaignStatus, 
  onRefresh, 
  onToggleSidebar, 
  onOpenSettings,
  onNavigateHome 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setShowToast(true);
    setTimeout(() => setIsRefreshing(false), 600);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <header className="px-5 py-3 flex items-center justify-between sticky top-0 z-40 bg-[#D4F1E8] border-b border-black/10">
      {/* Brand & Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
          title="Toggle Navigation Menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className="w-full h-0.5 bg-gray-800 rounded-full" />
            <span className="w-full h-0.5 bg-gray-800 rounded-full" />
            <span className="w-full h-0.5 bg-gray-800 rounded-full" />
          </div>
        </button>

        {/* Custom SkillBridge Outreach Logo */}
        <div onClick={onNavigateHome} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm border border-white/20">
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-gray-900 tracking-tight font-sans flex items-center gap-1.5">
              SkillBridge <span className="text-blue-700 font-bold">Outreach</span>
            </span>
          </div>
        </div>

        {/* Home Button Icon */}
        <button
          onClick={onNavigateHome}
          className="p-2 hover:bg-black/10 rounded-xl text-gray-800 transition-colors flex items-center gap-1.5 font-bold text-xs bg-white/70 border border-black/15 shadow-xs"
          title="Go to Home / Dashboard Overview"
        >
          <Home className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
        <div className="gmail-mint-search px-4 py-2 flex items-center gap-3 text-gray-600">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search contacts, email body, roles, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-gray-800 placeholder-gray-500 font-sans"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          <SlidersHorizontal className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-900" />
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 relative">
        {showToast && (
          <div className="absolute -bottom-10 right-0 bg-gray-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/20 flex items-center gap-1.5 z-50 animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Roster & Gateway status refreshed!</span>
          </div>
        )}

        {/* Read-only Status Indicator Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-blue-900 text-xs font-bold border border-blue-300 shadow-xs cursor-default">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{campaignStatus === 'SENDING' ? 'Engine Sending (1-by-1)' : 'SMTP Gateway Ready'}</span>
        </div>

        {/* Refresh Icon Button (reloads data) */}
        <button 
          onClick={handleRefreshClick}
          className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
          title="Refresh Recipient Roster & Logs"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Gear Icon (Opens Settings) */}
        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
          title="Open SMTP Settings & Configuration"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Primary Setup SMTP Button */}
        <button 
          onClick={onOpenSettings}
          className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-full border border-gray-700 shadow-xs hidden lg:flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <Key className="w-3.5 h-3.5 text-yellow-400" />
          <span>Setup SMTP</span>
        </button>

        {/* User Avatar */}
        <div 
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs shadow-sm ml-1 cursor-pointer hover:bg-gray-800 border border-white/20"
          title="Benedict Outreach Account"
        >
          B
        </div>
      </div>
    </header>
  );
}
