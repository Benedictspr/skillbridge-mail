import React from 'react';
import { 
  Plus, Inbox, Send, FileText, Clock, Settings, ShieldCheck, X, 
  MessageSquare, Home, GitCommit, Lock, MessageCircle, Terminal, Cpu, Zap
} from 'lucide-react';

export default function AppSidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenCompose, 
  recipients = [], 
  campaignStatus,
  onLoadSkillBridgeData,
  isCollapsed,
  isOpenMobile,
  onCloseMobile,
  repliesCount = 2,
  currentOrg
}) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const readyCount = safeRecipients.filter(r => r?.status === 'Ready' || r?.status === 'Queued').length;
  const sentCount = safeRecipients.filter(r => r?.status === 'Sent').length;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`bg-[#D4F1E8] shrink-0 hidden md:block border-r border-black/10 transition-all duration-200 select-none ${
        isCollapsed ? 'w-16 overflow-hidden' : 'w-64'
      }`}>
        <div className="flex flex-col justify-between h-full py-3 px-2">
          {/* Top Actions & Nav Folders */}
          <div className="space-y-3">
            {/* New Campaign Button */}
            {isCollapsed ? (
              <button
                onClick={onOpenCompose}
                className="w-10 h-10 mx-auto bg-white hover:bg-blue-50 text-blue-600 border border-gray-300 rounded-full flex items-center justify-center shadow-xs transition-transform hover:scale-105"
                title="New Campaign"
              >
                <Plus className="w-5 h-5 text-blue-600" />
              </button>
            ) : (
              <button
                onClick={onOpenCompose}
                className="w-full bg-white hover:bg-gray-100 text-[#001D35] border border-gray-300 font-bold rounded-2xl px-4 py-3 text-xs shadow-xs flex items-center gap-3"
              >
                <Plus className="w-5 h-5 text-blue-600 shrink-0" />
                <span>New Campaign</span>
              </button>
            )}

            {/* Folder Navigation Items */}
            <div className="space-y-1">
              {/* Dashboard */}
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

              {/* Campaign Pipeline (Lifecycle Engine) */}
              <div
                onClick={() => setActiveTab('lifecycle')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'lifecycle' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Campaign Pipeline (Lifecycle Engine)"
              >
                <div className="flex items-center gap-3 text-xs">
                  <GitCommit className="w-5 h-5 text-purple-600 shrink-0" />
                  {!isCollapsed && <span>Campaign Pipeline</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    Flowchart
                  </span>
                )}
              </div>

              {/* Deliverability & Anti-Spam Command Center */}
              <div
                onClick={() => setActiveTab('deliverability')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'deliverability' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Deliverability & Anti-Spam Command Center"
              >
                <div className="flex items-center gap-3 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  {!isCollapsed && <span>Deliverability & Spam</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    99/100
                  </span>
                )}
              </div>

              {/* Contacts Roster */}
              <div
                onClick={() => setActiveTab('recipients')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'recipients' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Contacts Roster (${safeRecipients.length})`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <Inbox className="w-5 h-5 text-blue-600 shrink-0" />
                  {!isCollapsed && <span>Contacts Roster</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 border border-gray-200">
                    {safeRecipients.length}
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

              {/* Visual Designer & Renderer */}
              <div
                onClick={() => setActiveTab('builder')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'builder' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Visual Content & Template Studio"
              >
                <div className="flex items-center gap-3 text-xs">
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                  {!isCollapsed && <span>Template Designer</span>}
                </div>
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
                  {!isCollapsed && <span>Sent Logs & Bounces</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono text-emerald-700 font-bold">{sentCount}</span>
                )}
              </div>

              {/* Developer API & Webhooks */}
              <div
                onClick={() => setActiveTab('api')}
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'api' ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'text-gray-700 hover:bg-black/5 font-semibold'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="SkillBridge API Keys & Webhooks"
              >
                <div className="flex items-center gap-3 text-xs">
                  <Terminal className="w-5 h-5 text-slate-800 shrink-0" />
                  {!isCollapsed && <span>API & Webhooks</span>}
                </div>
              </div>
            </div>
          </div>

          {!isCollapsed && (
            <div 
              onClick={() => setActiveTab('deliverability')}
              className="p-3 bg-white rounded-xl border border-gray-300 shadow-xs space-y-1 text-xs cursor-pointer hover:border-black transition-colors"
            >
              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Anti-Scraped Address Shield</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                Protects {currentOrg?.name || 'SkillBridge'} reputation against bad lists.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs">
          <div className="w-72 bg-[#D4F1E8] h-full shadow-2xl animate-fade-in p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                <span className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" /> Navigation Menu
                </span>
                <button onClick={onCloseMobile} className="p-1 hover:bg-black/10 rounded-full">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="space-y-1 text-xs font-bold">
                <div onClick={() => { setActiveTab('dashboard'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <Home className="w-5 h-5 text-indigo-600" /> Dashboard Overview
                </div>
                <div onClick={() => { setActiveTab('lifecycle'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <GitCommit className="w-5 h-5 text-purple-600" /> Campaign Pipeline
                </div>
                <div onClick={() => { setActiveTab('deliverability'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Deliverability & Spam Center
                </div>
                <div onClick={() => { setActiveTab('recipients'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <Inbox className="w-5 h-5 text-blue-600" /> Contacts Roster ({safeRecipients.length})
                </div>
                <div onClick={() => { setActiveTab('replies'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600" /> Received Replies ({repliesCount})
                </div>
                <div onClick={() => { setActiveTab('builder'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" /> Template Designer
                </div>
                <div onClick={() => { setActiveTab('api'); onCloseMobile(); }} className="p-2.5 rounded-xl hover:bg-black/5 cursor-pointer flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-slate-800" /> API & Webhooks
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
