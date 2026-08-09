import React, { useState } from 'react';
import { 
  Mail, Search, SlidersHorizontal, Settings, RefreshCw, 
  ShieldCheck, Sparkles, X, Send, Key, Check, Home, Building2, 
  ChevronDown, MessageSquare, MessageCircle, Terminal, Palette, Zap
} from 'lucide-react';
import { INITIAL_ORGANIZATIONS } from '../mockData';

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
  activeSuite,
  setActiveSuite,
  setActiveTab
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setShowToast(true);
    setTimeout(() => setIsRefreshing(false), 600);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#D4F1E8] border-b border-black/10 shadow-xs">
      {/* Top Suite Ecosystem Switcher Bar */}
      <div className="bg-slate-950 text-white px-4 py-1.5 flex items-center justify-between text-xs font-sans">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-extrabold mr-2 hidden md:inline">
            SkillBridge Suite:
          </span>

          <button
            onClick={() => { setActiveSuite('mail'); setActiveTab('dashboard'); }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
              activeSuite === 'mail' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>SkillBridge Mail</span>
          </button>

          <button
            onClick={() => { setActiveSuite('sms'); setActiveTab('sms'); }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
              activeSuite === 'sms' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>SkillBridge SMS</span>
          </button>

          <button
            onClick={() => { setActiveSuite('whatsapp'); setActiveTab('whatsapp'); }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
              activeSuite === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>SkillBridge WhatsApp</span>
          </button>

          <button
            onClick={() => { setActiveSuite('design'); setActiveTab('builder'); }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
              activeSuite === 'design' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>SkillBridge Design</span>
          </button>

          <button
            onClick={() => { setActiveSuite('api'); setActiveTab('api'); }}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
              activeSuite === 'api' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>SkillBridge API</span>
          </button>
        </div>

        {/* Multi-Tenant Organization Switcher */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline font-mono">{currentOrg.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">[{currentOrg.id.replace('org_', '')}]</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Select Active Organization
              </div>
              {INITIAL_ORGANIZATIONS.map(org => (
                <div
                  key={org.id}
                  onClick={() => {
                    setCurrentOrg(org);
                    setShowOrgDropdown(false);
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                    currentOrg.id === org.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold">{org.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{org.domain}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-blue-300">
                    {org.plan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between">
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

          {/* Custom SkillBridge Logo */}
          <div onClick={onNavigateHome} className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm border border-white/20">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-gray-900 tracking-tight font-sans flex items-center gap-1.5">
                SkillBridge <span className="text-blue-700 font-bold">Infrastructure</span>
              </span>
            </div>
          </div>

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
              placeholder="Search contacts, suppression lists, deliverability logs..."
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
              <span>Multi-tenant & Deliverability status refreshed!</span>
            </div>
          )}

          <div 
            onClick={() => setActiveTab('deliverability')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-blue-900 text-xs font-bold border border-blue-300 shadow-xs cursor-pointer hover:bg-blue-50 transition-colors"
            title="Open Deliverability & Anti-Spam Command Center"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Reputation: {currentOrg.reputationScore}/100</span>
          </div>

          <button 
            onClick={handleRefreshClick}
            className={`p-2 hover:bg-black/10 rounded-full text-gray-700 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Deliverability Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
            title="SMTP & Org Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
