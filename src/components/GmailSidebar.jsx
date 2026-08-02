import React from 'react';
import { Plus, Inbox, Send, FileText, Clock, Settings, Sparkles, Star, ShieldCheck, X } from 'lucide-react';

export default function GmailSidebar({ 
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
    <div className="flex flex-col justify-between h-full p-3 font-sans">
      <div className="space-y-4">
        {/* Mobile Header X Close */}
        {isOpenMobile && (
          <div className="flex items-center justify-between px-2 pb-2 border-b border-[#E0E3E7] md:hidden">
            <span className="font-bold text-sm text-gray-900">SkillBridge Mail Navigation</span>
            <button onClick={onCloseMobile} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Gmail Compose Button */}
        <button
          onClick={() => {
            if (isOpenMobile) onCloseMobile();
            onOpenCompose();
          }}
          className="btn-gmail-compose w-full justify-start shadow-md hover:shadow-lg font-sans"
        >
          <Plus className="w-5 h-5 text-[#001D35]" />
          <span>Compose Campaign</span>
        </button>

        {/* Navigation Folders */}
        <div className="space-y-1">
          <div
            onClick={() => {
              setActiveTab('recipients');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-item ${activeTab === 'recipients' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>Recipients Roster</span>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-gray-200/80">
              {recipients.length}
            </span>
          </div>

          <div
            onClick={() => {
              setActiveTab('builder');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-item ${activeTab === 'builder' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Email Templates</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              Option 1
            </span>
          </div>

          <div
            onClick={() => {
              setActiveTab('queue');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-item ${activeTab === 'queue' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span>Sending Queue</span>
            </div>
            {campaignStatus === 'SENDING' ? (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            ) : (
              <span className="text-xs font-mono font-bold text-gray-500">{readyCount}</span>
            )}
          </div>

          <div
            onClick={() => {
              setActiveTab('sent');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-item ${activeTab === 'sent' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4" />
              <span>Sent Emails</span>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">{sentCount}</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('settings');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>SMTP & Gateway</span>
            </div>
          </div>
        </div>

        {/* Preset Sample Quick Load */}
        <div className="pt-4 border-t border-[#E0E3E7] space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 block">
            Campaign Lists
          </span>

          <div 
            onClick={() => {
              onLoadSkillBridgeData();
              setActiveTab('recipients');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200/60 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span>SkillBridge Students (50)</span>
          </div>

          <div 
            onClick={() => {
              setActiveTab('recipients');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Remote Opportunities</span>
          </div>

          <div 
            onClick={() => {
              setActiveTab('recipients');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200/60 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Tech Tutors</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div 
        onClick={() => {
          setActiveTab('settings');
          if (isOpenMobile) onCloseMobile();
        }}
        className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-1 text-xs cursor-pointer hover:border-black transition-colors"
      >
        <div className="flex items-center gap-1.5 text-black font-bold">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Anti-Spam 1-by-1 Safe</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-tight">
          Individual delivery with delay & human jitter.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#F6F8FC] border-r border-[#E0E3E7] shrink-0 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs">
          <div className="w-72 bg-[#F6F8FC] h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
