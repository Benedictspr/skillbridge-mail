import React from 'react';
import { Plus, Inbox, Send, FileText, Clock, Settings, ShieldCheck, X, MessageSquare, Home } from 'lucide-react';

export default function AppSidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenCompose, 
  recipients, 
  campaignStatus,
  onLoadSkillBridgeData,
  isCollapsed,
  isOpenMobile,
  onCloseMobile,
  repliesCount = 2
}) {
  const readyCount = recipients.filter(r => r.status === 'Ready' || r.status === 'Queued').length;
  const sentCount = recipients.filter(r => r.status === 'Sent').length;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`bg-[#D4F1E8] shrink-0 hidden md:block border-r border-black/10 transition-all duration-200 select-none ${
        isCollapsed ? 'w-16 overflow-hidden' : 'w-64'
      }`}>
        <div className="flex flex-col justify-between h-full py-3 px-2">
          {/* Top Actions & Nav Folders */}
          <div className="space-y-4">
            {/* New Outreach Campaign Button */}
            {isCollapsed ? (
              <button
                onClick={onOpenCompose}
                className="w-10 h-10 mx-auto bg-white hover:bg-blue-50 text-blue-600 border border-gray-300 rounded-full flex items-center justify-center shadow-xs transition-transform hover:scale-105"
                title="New Outreach Campaign"
              >
                <Plus className="w-5 h-5 text-blue-600" />
              </button>
            ) : (
              <button
                onClick={onOpenCompose}
                className="w-full bg-white hover:bg-gray-100 text-[#001D35] border border-gray-300 font-bold rounded-2xl px-4 py-3 text-xs shadow-xs flex items-center gap-3"
              >
                <Plus className="w-5 h-5 text-blue-600 shrink-0" />
                <span>New Outreach Campaign</span>
              </button>
            )}

            {/* Folder Navigation Items */}
            <div className="space-y-1 pt-1">
              {/* Dashboard / Analytics */}
              <div
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'dashboard' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Outreach Analytics & Overview"
              >
                <div className="flex items-center gap-3 text-xs">
                  <Home className="w-5 h-5 text-indigo-600 shrink-0" />
                  {!isCollapsed && <span>Dashboard Overview</span>}
                </div>
              </div>

              {/* Contacts Roster */}
              <div
                onClick={() => setActiveTab('recipients')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'recipients' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Contacts Roster (${recipients.length})`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <Inbox className="w-5 h-5 text-blue-600 shrink-0" />
                  {!isCollapsed && <span>Contacts Roster</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 border border-gray-200">
                    {recipients.length}
                  </span>
                )}
              </div>

              {/* Received Replies Inbox */}
              <div
                onClick={() => setActiveTab('replies')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'replies' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Received Replies (${repliesCount})`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <MessageSquare className="w-5 h-5 text-purple-600 shrink-0" />
                  {!isCollapsed && <span>Received Replies</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                    {repliesCount}
                  </span>
                )}
              </div>

              {/* Email Designer */}
              <div
                onClick={() => setActiveTab('builder')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'builder' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Email Designer"
              >
                <div className="flex items-center gap-3 text-xs">
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                  {!isCollapsed && <span>Email Designer</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    Option 1
                  </span>
                )}
              </div>

              {/* Dispatch Queue */}
              <div
                onClick={() => setActiveTab('queue')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'queue' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Dispatch Queue (${readyCount})`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  {!isCollapsed && <span>Dispatch Queue</span>}
                </div>
                {!isCollapsed && (
                  campaignStatus === 'SENDING' ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  ) : (
                    <span className="text-xs font-mono font-bold text-gray-600">{readyCount}</span>
                  )
                )}
              </div>

              {/* Sent Logs */}
              <div
                onClick={() => setActiveTab('sent')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'sent' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Sent Logs (${sentCount})`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <Send className="w-5 h-5 text-emerald-600 shrink-0" />
                  {!isCollapsed && <span>Sent Logs</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono text-emerald-700 font-bold">{sentCount}</span>
                )}
              </div>

              {/* SMTP Gateway */}
              <div
                onClick={() => setActiveTab('settings')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'settings' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="SMTP Gateway"
              >
                <div className="flex items-center gap-3 text-xs">
                  <Settings className="w-5 h-5 text-gray-700 shrink-0" />
                  {!isCollapsed && <span>SMTP Gateway</span>}
                </div>
              </div>
            </div>

            {!isCollapsed && (
              <div className="pt-4 border-t border-gray-300/60 space-y-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 block">
                  Campaign Lists
                </span>

                <div 
                  onClick={() => {
                    onLoadSkillBridgeData();
                    setActiveTab('recipients');
                  }}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-800 hover:bg-black/5 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                  <span>SkillBridge Students (50)</span>
                </div>

                <div 
                  onClick={() => setActiveTab('recipients')}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-black/5 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  <span>Remote Opportunities</span>
                </div>

                <div 
                  onClick={() => setActiveTab('recipients')}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-black/5 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>Tech Tutors</span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div 
              onClick={() => setActiveTab('settings')}
              className="p-3 bg-white rounded-xl border border-gray-300 shadow-xs space-y-1 text-xs cursor-pointer hover:border-black transition-colors"
            >
              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Anti-Spam 1-by-1 Safe</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                Dispatches individually with delay.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs">
          <div className="w-72 bg-[#D4F1E8] h-full shadow-2xl animate-fade-in p-3 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                <span className="font-bold text-sm text-gray-900">Navigation Menu</span>
                <button onClick={onCloseMobile} className="p-1 hover:bg-black/10 rounded-full">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <button
                onClick={() => {
                  onCloseMobile();
                  onOpenCompose();
                }}
                className="w-full bg-white text-[#001D35] border border-gray-300 font-bold rounded-2xl px-4 py-3 text-xs shadow-xs flex items-center gap-3"
              >
                <Plus className="w-5 h-5 text-blue-600 shrink-0" />
                <span>New Outreach Campaign</span>
              </button>

              <div className="space-y-1">
                <div onClick={() => { setActiveTab('recipients'); onCloseMobile(); }} className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs">
                  <span className="flex items-center gap-3"><Inbox className="w-5 h-5 text-blue-600" /> Contacts Roster</span>
                  <span className="font-mono text-xs">{recipients.length}</span>
                </div>
                <div onClick={() => { setActiveTab('replies'); onCloseMobile(); }} className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs">
                  <span className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-purple-600" /> Received Replies</span>
                  <span className="font-mono text-xs text-purple-700 font-bold">{repliesCount}</span>
                </div>
                <div onClick={() => { setActiveTab('builder'); onCloseMobile(); }} className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs">
                  <span className="flex items-center gap-3"><FileText className="w-5 h-5 text-indigo-600" /> Email Designer</span>
                </div>
                <div onClick={() => { setActiveTab('queue'); onCloseMobile(); }} className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs">
                  <span className="flex items-center gap-3"><Clock className="w-5 h-5 text-amber-600" /> Dispatch Queue</span>
                  <span className="font-mono text-xs">{readyCount}</span>
                </div>
                <div onClick={() => { setActiveTab('sent'); onCloseMobile(); }} className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs">
                  <span className="flex items-center gap-3"><Send className="w-5 h-5 text-emerald-600" /> Sent Logs</span>
                  <span className="font-mono text-xs">{sentCount}</span>
                </div>
                <div onClick={() => { setActiveTab('settings'); onCloseMobile(); }} className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs">
                  <span className="flex items-center gap-3"><Settings className="w-5 h-5 text-gray-700" /> SMTP Gateway</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
