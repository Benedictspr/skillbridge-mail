import React from 'react';
import { Mail, LayoutDashboard, Users, FileText, Send, Settings, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, recipients, campaignStatus, onLoadSkillBridgeData }) {
  const sentCount = recipients.filter(r => r.status === 'Sent').length;

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 mb-8 max-w-7xl mx-auto">
      <div className="glass-panel-elevated py-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
              <Mail className="w-6 h-6 text-white" />
            </div>
            {campaignStatus === 'SENDING' && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-gray-900 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white font-heading">
                Sendaat <span className="gradient-text">Mail</span>
              </span>
              <span className="badge-pill badge-ready text-[9px] py-0.5 px-2">Outreach v1.0</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">Smart Anti-Spam Email Automation</p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center bg-gray-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all duration-200 ${
              activeTab === 'recipients' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Recipients</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
              {recipients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all duration-200 ${
              activeTab === 'builder' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Email Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all duration-200 relative ${
              activeTab === 'queue' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sending Queue</span>
            {campaignStatus === 'SENDING' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>
        </nav>

        {/* Quick Actions & Gateway Settings */}
        <div className="flex items-center gap-3">
          {recipients.length === 0 && (
            <button
              onClick={onLoadSkillBridgeData}
              className="btn-glow-primary text-xs py-2 px-3.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample List</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-950/60 border border-white/10 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[var(--text-secondary)]">Sent:</span>
            <span className="font-extrabold text-white font-mono">{sentCount} / {recipients.length}</span>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="p-2.5 rounded-xl bg-gray-950/60 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-indigo-500/50 transition-all shadow-md"
            title="SMTP Server & Gateway Config"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
