import React, { startTransition } from 'react';
import { 
  Plus, Contact2, SendHorizontal, PenTool, ShieldCheck, X, 
  MessageSquare, Home, Code2, BarChart3
} from 'lucide-react';

export default function AppSidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenCompose, 
  recipients = [], 
  campaignStatus,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  onCloseMobile,
  repliesCount = 2,
  currentOrg
}) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const readyCount = safeRecipients.filter(r => r?.status === 'Ready' || r?.status === 'Queued').length;
  const sentCount = safeRecipients.filter(r => r?.status === 'Sent').length;

  const handleNavClick = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <>
      {/* Desktop Sidebar (Matte Vantablack - Clean Icon Navigation, Perfectly Aligned Counters) */}
      <aside className={`bg-[#09090B] shrink-0 hidden md:block border-r border-zinc-800/80 transition-all duration-300 ease-in-out select-none text-white ${
        isCollapsed ? 'w-14 overflow-hidden' : 'w-56'
      }`}>
        <div className="flex flex-col justify-between h-full py-3.5 px-2">
          {/* Top Actions & Nav Folders */}
          <div className="space-y-4">
            {/* New Campaign / Compose Button */}
            {isCollapsed ? (
              <button
                onClick={onOpenCompose}
                className="w-9 h-9 mx-auto hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                title="Compose"
              >
                <Plus className="w-5 h-5 text-white stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={onOpenCompose}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-extrabold rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Compose</span>
              </button>
            )}

            {/* Folder Navigation Items (Standardized w-6 text-right aligned counters) */}
            <div className="space-y-1">
              {/* Dashboard */}
              <div
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'dashboard' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Dashboard"
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Home className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Dashboard</span>}
                </div>
              </div>

              {/* STEP 1: CREATE */}
              <div
                onClick={() => handleNavClick('builder')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'builder' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Create"
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <PenTool className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Create</span>}
                </div>
              </div>

              {/* STEP 2: AUDIENCE */}
              <div
                onClick={() => handleNavClick('recipients')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'recipients' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Audience (${safeRecipients.length})`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Contact2 className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Audience</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right shrink-0">
                    {safeRecipients.length}
                  </span>
                )}
              </div>

              {/* STEP 3: SEND */}
              <div
                onClick={() => handleNavClick('queue')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'queue' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Send (${readyCount})`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <SendHorizontal className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Send</span>}
                </div>
                {!isCollapsed && (
                  campaignStatus === 'SENDING' ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  ) : (
                    <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right shrink-0">
                      {readyCount}
                    </span>
                  )
                )}
              </div>

              {/* STEP 4: ANALYSE */}
              <div
                onClick={() => handleNavClick('sent')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'sent' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Analyse (${sentCount})`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <BarChart3 className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Analyse</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right shrink-0">
                    {sentCount}
                  </span>
                )}
              </div>

              {/* Deliverability */}
              <div
                onClick={() => handleNavClick('deliverability')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'deliverability' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Deliverability"
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Deliverability</span>}
                </div>
              </div>

              {/* Replies */}
              <div
                onClick={() => handleNavClick('replies')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'replies' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={`Replies (${repliesCount})`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <MessageSquare className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Replies</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right shrink-0">
                    {repliesCount}
                  </span>
                )}
              </div>

              {/* Documentation */}
              <div
                onClick={() => handleNavClick('api')}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  activeTab === 'api' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title="Documentation"
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Code2 className="w-4 h-4 text-white shrink-0 stroke-[1.75]" />
                  {!isCollapsed && <span>Documentation</span>}
                </div>
              </div>
            </div>
          </div>

          {!isCollapsed && (
            <div 
              onClick={() => setActiveTab('deliverability')}
              className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs text-zinc-300 cursor-pointer hover:border-zinc-700 transition-colors space-y-1"
            >
              <div className="flex items-center gap-1.5 text-white font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Anti-Spam Shield</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Domain isolation active for {currentOrg?.name || 'Sendaat'}.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/80 backdrop-blur-xs">
          <div className="w-64 bg-[#09090B] border-r border-zinc-800 h-full shadow-2xl animate-fade-in p-4 flex flex-col justify-between overflow-y-auto text-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="font-extrabold text-sm text-white flex items-center gap-2">
                  <SendHorizontal className="w-4 h-4 text-white" /> Menu
                </span>
                <button onClick={onCloseMobile} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs font-bold">
                <div onClick={() => { setActiveTab('dashboard'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center gap-3 text-zinc-200">
                  <Home className="w-4 h-4 text-white" /> Dashboard
                </div>
                <div onClick={() => { setActiveTab('builder'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center gap-3 text-zinc-200">
                  <PenTool className="w-4 h-4 text-white" /> Create
                </div>
                <div onClick={() => { setActiveTab('recipients'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-zinc-200">
                  <div className="flex items-center gap-3"><Contact2 className="w-4 h-4 text-white" /> Audience</div>
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right">{safeRecipients.length}</span>
                </div>
                <div onClick={() => { setActiveTab('queue'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-zinc-200">
                  <div className="flex items-center gap-3"><SendHorizontal className="w-4 h-4 text-white" /> Send</div>
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right">{readyCount}</span>
                </div>
                <div onClick={() => { setActiveTab('sent'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-zinc-200">
                  <div className="flex items-center gap-3"><BarChart3 className="w-4 h-4 text-white" /> Analyse</div>
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right">{sentCount}</span>
                </div>
                <div onClick={() => { setActiveTab('deliverability'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center gap-3 text-zinc-200">
                  <ShieldCheck className="w-4 h-4 text-white" /> Deliverability
                </div>
                <div onClick={() => { setActiveTab('replies'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-zinc-200">
                  <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4 text-white" /> Replies</div>
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-6 text-right">{repliesCount}</span>
                </div>
                <div onClick={() => { setActiveTab('api'); onCloseMobile(); }} className="p-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center gap-3 text-zinc-200">
                  <Code2 className="w-4 h-4 text-white" /> Documentation
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
