import React from 'react';
import { Pencil, Inbox, Star, Clock, Send, FileText, ShoppingBag, ChevronDown, Settings, Sparkles, ShieldCheck, X } from 'lucide-react';

export default function GmailMintSidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenCompose, 
  recipients, 
  campaignStatus,
  onLoadSkillBridgeData,
  isOpenMobile,
  onCloseMobile
}) {
  const readyCount = recipients.filter(r => r.status === 'Ready' || r.status === 'Queued').length;
  const sentCount = recipients.filter(r => r.status === 'Sent').length;

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full py-2 px-3 font-sans">
      <div className="space-y-3">
        {/* Mobile Close X */}
        {isOpenMobile && (
          <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-300 md:hidden">
            <span className="font-bold text-sm text-gray-900">Gmail Navigation</span>
            <button onClick={onCloseMobile} className="p-1 hover:bg-black/10 rounded-full">
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* Gmail White Pill Compose Button */}
        <button
          onClick={() => {
            if (isOpenMobile) onCloseMobile();
            onOpenCompose();
          }}
          className="btn-gmail-white-compose font-sans"
        >
          <Pencil className="w-4 h-4 text-gray-700" />
          <span>Compose</span>
        </button>

        {/* Navigation Folders */}
        <div className="space-y-0.5 pt-1">
          {/* Inbox / Roster */}
          <div
            onClick={() => {
              setActiveTab('recipients');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-mint-item ${activeTab === 'recipients' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4 text-gray-700" />
              <span>Inbox</span>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-gray-200/80">
              1,830
            </span>
          </div>

          {/* Starred */}
          <div className="sidebar-mint-item">
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-gray-700" />
              <span>Starred</span>
            </div>
          </div>

          {/* Snoozed */}
          <div className="sidebar-mint-item">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-700" />
              <span>Snoozed</span>
            </div>
          </div>

          {/* Sent */}
          <div
            onClick={() => {
              setActiveTab('queue');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-mint-item ${activeTab === 'queue' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4 text-gray-700" />
              <span>Sent</span>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold">{sentCount}</span>
          </div>

          {/* Drafts */}
          <div
            onClick={() => {
              setActiveTab('builder');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-mint-item ${activeTab === 'builder' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-700" />
              <span>Drafts</span>
            </div>
            <span className="text-xs font-bold text-gray-600 font-mono">34</span>
          </div>

          {/* Purchases */}
          <div className="sidebar-mint-item">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-gray-700" />
              <span>Purchases</span>
            </div>
            <span className="text-xs font-bold text-gray-600 font-mono">14</span>
          </div>

          {/* More */}
          <div className="sidebar-mint-item">
            <div className="flex items-center gap-3">
              <ChevronDown className="w-4 h-4 text-gray-700" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Labels & Campaign Quick Tools */}
        <div className="pt-3 border-t border-gray-300/60 space-y-1">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 block mb-1">
            Labels & Lists
          </span>

          <div 
            onClick={() => {
              onLoadSkillBridgeData();
              setActiveTab('recipients');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-black/5 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>SkillBridge Students (50)</span>
          </div>

          <div 
            onClick={() => {
              setActiveTab('settings');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-black/5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-gray-600" />
            <span>SMTP Gateway Setup</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div 
        onClick={() => {
          setActiveTab('settings');
          if (isOpenMobile) onCloseMobile();
        }}
        className="p-3 bg-white rounded-xl border border-gray-300 shadow-xs space-y-1 text-xs cursor-pointer hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-blue-900 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Anti-Spam 1-by-1 Safe</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-tight">
          Delivers individually with 5s throttle delay.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-[#D4F1E8] shrink-0 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs">
          <div className="w-68 bg-[#D4F1E8] h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
