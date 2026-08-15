import React, { startTransition } from 'react';
import { 
  PenTool, Contact2, SendHorizontal, BarChart3, 
  ShieldCheck, Layers, Plus
} from 'lucide-react';

export default function DashboardView({ 
  recipients = [], 
  campaignStatus = 'IDLE', 
  onStartQueue, 
  onPauseQueue, 
  setActiveTab, 
  onOpenCompose,
  onLoadSendaatData,
  campaignConfig = {},
  theme = 'dark',
  currentOrg = { id: 'org_sendaat_1001', name: 'Sendaat Enterprise', domain: 'sendaat.io', reputationScore: 99 }
}) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const readyCount = safeRecipients.filter(r => r?.status === 'Ready' || r?.status === 'Queued').length;
  const sentCount = safeRecipients.filter(r => r?.status === 'Sent').length;
  const totalCount = safeRecipients.length;

  const handleNavClick = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <div className="bg-[#050505] text-white p-4 sm:p-6 lg:p-8 space-y-6 font-sans animate-fade-in min-h-screen lg:min-h-0 lg:h-full flex flex-col justify-between select-none">
      
      {/* 1. Vantablack Compact Header Banner */}
      <div className="bg-[#121212] rounded-[24px] p-5 sm:p-6 border border-zinc-800/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Campaign Operations Center
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select an operational stage below to compose emails, manage rosters, dispatch with anti-spam protection, or analyze telemetry.
          </p>
        </div>
      </div>

      {/* 2. Main 4 Action Boxes Grid */}
      <div className="flex-1 flex flex-col justify-between space-y-3 min-h-0">
        <div className="flex items-center justify-between px-1 shrink-0">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <span>Campaign Pipeline Stages</span>
          </h2>
          <span className="text-xs text-zinc-400 font-mono font-medium">4 Sequential Steps</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 flex-1 min-h-0">
          
          {/* BOX 1: CREATE EMAIL */}
          <div 
            onClick={() => handleNavClick('builder')}
            className="group bg-[#121212] hover:bg-[#18181B] rounded-[24px] p-5 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-mono text-xs font-bold border border-zinc-700">
                  01
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Create Email
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Design cold outreach email templates, set merge tags like <code className="bg-zinc-800 text-zinc-200 font-mono px-1.5 py-0.5 rounded text-[10px] border border-zinc-700">{"{{first_name}}"}</code>, and check spam scores.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavClick('builder');
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Create Email</span>
              </button>
            </div>
          </div>

          {/* BOX 2: AUDIENCE */}
          <div 
            onClick={() => handleNavClick('recipients')}
            className="group bg-[#121212] hover:bg-[#18181B] rounded-[24px] p-5 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-mono text-xs font-bold border border-zinc-700">
                  02
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Audience
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Import contact lists, verify email deliverability, and screen out spam traps with the Anti-Scraped Shield.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between px-1 pointer-events-none">
                <span>Total Roster:</span>
                <strong className="text-white font-bold pointer-events-none">{totalCount} Contacts</strong>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavClick('recipients');
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Contact2 className="w-4 h-4 text-black stroke-[2]" />
                <span>Audience</span>
              </button>
            </div>
          </div>

          {/* BOX 3: SEND */}
          <div 
            onClick={() => handleNavClick('queue')}
            className="group bg-[#121212] hover:bg-[#18181B] rounded-[24px] p-5 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-mono text-xs font-bold border border-zinc-700">
                  03
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Send
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Dispatch email queues with anti-spam continuous pacing (7-15s delay), jitter intervals, and live progress monitoring.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between px-1">
                <span>Queue Ready:</span>
                <strong className="text-white font-bold">{readyCount} Pending</strong>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavClick('queue');
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <SendHorizontal className="w-4 h-4 text-black stroke-[2]" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* BOX 4: ANALYSE */}
          <div 
            onClick={() => handleNavClick('sent')}
            className="group bg-[#121212] hover:bg-[#18181B] rounded-[24px] p-5 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 font-mono text-xs font-bold border border-zinc-700">
                  04
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Analyse
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Track 1x1 open rates, click conversions, incoming IMAP reply threads, and delivered message history logs.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between px-1">
                <span>Dispatched:</span>
                <strong className="text-white font-bold">{sentCount} Sent</strong>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavClick('sent');
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-black stroke-[2]" />
                <span>Analyse</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
