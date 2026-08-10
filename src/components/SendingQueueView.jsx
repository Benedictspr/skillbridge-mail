import React, { useState } from 'react';
import { 
  Send, Play, Pause, RotateCcw, Clock, ShieldCheck, CheckCircle2, 
  Terminal, Eye, Mail, List, FileText, Database, Shield, Sliders, Calculator, Zap 
} from 'lucide-react';

export default function SendingQueueView({
  recipients = [],
  campaignStatus,
  onStartQueue,
  onPauseQueue,
  onResetQueue,
  onSendSingleTest,
  logs = [],
  campaignConfig = {},
  setCampaignConfig,
  recipientTracker = {},
  sentHistoryLog = []
}) {
  const [activeSubTab, setActiveSubTab] = useState('console'); // 'console' | 'sentHistory'
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const safeSentHistoryLog = Array.isArray(sentHistoryLog) ? sentHistoryLog : [];

  const readyList = safeRecipients.filter(r => r?.status === 'Ready' || r?.status === 'Queued');
  const sendingItem = safeRecipients.find(r => r?.status === 'Sending');
  const totalCount = safeRecipients.length;

  const sentRecipientsCount = safeRecipients.filter(r => r?.status === 'Sent' || recipientTracker[r?.id]?.status === 'Sent' || recipientTracker[r?.id]?.opened).length;
  const openedRecipientsCount = safeRecipients.filter(r => recipientTracker[r?.id]?.opened).length;
  const openRatePercent = sentRecipientsCount > 0 ? Math.round((openedRecipientsCount / sentRecipientsCount) * 100) : 0;

  const progressPercent = totalCount > 0 ? Math.round((sentRecipientsCount / totalCount) * 100) : 0;
  const remainingCount = readyList.length + (sendingItem ? 1 : 0);

  // Interval & Smart ETA Calculation
  const currentIntervalSec = Math.max(2, campaignConfig?.intervalSeconds || 5);
  const totalEtaSeconds = Math.max(0, remainingCount * currentIntervalSec);
  const etaMinutes = Math.floor(totalEtaSeconds / 60);
  const etaSecondsRem = totalEtaSeconds % 60;

  // Handler: Change Delay Seconds directly -> auto-updates ETA
  const handleDelayChange = (newSec) => {
    const val = Math.max(2, Math.min(300, parseInt(newSec) || 5));
    if (setCampaignConfig) {
      setCampaignConfig(prev => ({ ...prev, intervalSeconds: val }));
    }
  };

  // Handler: Change Target Total Campaign Minutes -> auto-calculates required Delay Seconds
  const handleTargetMinutesChange = (targetMins) => {
    const mins = Math.max(1, parseInt(targetMins) || 5);
    const count = remainingCount > 0 ? remainingCount : (totalCount > 0 ? totalCount : 5);
    const requiredSecPerEmail = Math.max(2, Math.round((mins * 60) / count));
    if (setCampaignConfig) {
      setCampaignConfig(prev => ({ ...prev, intervalSeconds: requiredSecPerEmail }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* 1. Main Control Header Card - Vantablack Monochromatic */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-md space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border uppercase tracking-wider ${
                campaignStatus === 'SENDING' 
                  ? 'bg-white text-black font-extrabold border-white' : 
                campaignStatus === 'PAUSED' 
                  ? 'bg-zinc-800 text-amber-300 border-zinc-700' 
                  : 'bg-zinc-800 text-emerald-400 border-zinc-700'
              }`}>
                {campaignStatus === 'SENDING' ? 'DISPATCH QUEUE ACTIVE' : campaignStatus || 'IDLE'}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>{currentIntervalSec}s Delay / Email</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
              Campaign Dispatch Engine & Live Pacing Console
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Sends individual messages sequentially via Gmail SMTP with customizable pacing delays to safeguard sender reputation.
            </p>
          </div>

          {/* Top Control Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onSendSingleTest}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
            >
              Send 1 Test Email
            </button>

            {campaignStatus === 'SENDING' ? (
              <button 
                onClick={onPauseQueue} 
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pause Queue</span>
              </button>
            ) : (
              <button 
                onClick={onStartQueue} 
                className="bg-white hover:bg-zinc-200 text-black text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 text-black fill-black" />
                <span>{campaignStatus === 'PAUSED' ? 'Resume Queue' : 'Start Dispatch Queue'} ({readyList.length > 0 ? readyList.length : totalCount})</span>
              </button>
            )}

            <button 
              onClick={onResetQueue} 
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 transition-colors cursor-pointer" 
              title="Reset Queue"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* 2. Smart Pacing Delay & Smart ETA Controls Card */}
        <div className="bg-black p-5 rounded-2xl text-white space-y-4 border border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-white" />
              <span className="font-extrabold text-xs tracking-tight text-white">Smart Pacing & Campaign ETA Controls</span>
            </div>

            {/* Quick Interval Preset Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 text-[11px] font-semibold mr-1">Presets:</span>
              {[5, 8, 10, 15, 30, 60].map(sec => (
                <button
                  key={sec}
                  onClick={() => handleDelayChange(sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentIntervalSec === sec 
                      ? 'bg-white text-black font-extrabold shadow-xs' 
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            {/* Input A: Delay Seconds per Email */}
            <div className="bg-[#121212] p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-white block">Delay Between Emails (Seconds)</label>
                <span className="text-[10px] text-zinc-400">Auto-calculates total campaign ETA duration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="2"
                  max="300"
                  value={currentIntervalSec}
                  onChange={e => handleDelayChange(e.target.value)}
                  className="w-16 bg-black border border-zinc-800 text-white font-mono font-bold text-xs px-2 py-1 rounded-lg outline-none text-center focus:border-zinc-500"
                />
                <span className="font-mono text-xs font-bold text-zinc-400">sec</span>
              </div>
            </div>

            {/* Input B: Target Campaign Duration in Minutes */}
            <div className="bg-[#121212] p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-white block">Set Target Total Campaign Time</label>
                <span className="text-[10px] text-zinc-400">Auto-calculates required delay seconds per email</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={Math.max(1, Math.round(totalEtaSeconds / 60))}
                  onChange={e => handleTargetMinutesChange(e.target.value)}
                  className="w-16 bg-black border border-zinc-800 text-white font-mono font-bold text-xs px-2 py-1 rounded-lg outline-none text-center focus:border-zinc-500"
                />
                <span className="font-mono text-xs font-bold text-zinc-400">mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Real-Time Sent & Open Metric Cards (Clean Monochromatic Typography) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-zinc-400 font-semibold block text-xs">Sent & Delivered</span>
              <span className="text-2xl font-extrabold text-white font-sans mt-0.5 block">{sentRecipientsCount}</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-white stroke-[1.75]" />
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-zinc-400 font-semibold block text-xs">Opened (Tracking Pixel)</span>
              <span className="text-2xl font-extrabold text-white font-sans mt-0.5 block">{openedRecipientsCount}</span>
            </div>
            <Eye className="w-6 h-6 text-white stroke-[1.75]" />
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-zinc-400 font-semibold block text-xs">Live Open Rate %</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-sans mt-0.5 block">{openRatePercent}%</span>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400 stroke-[1.75]" />
          </div>
        </div>

        {/* Progress Bar & Calculated ETA Banner */}
        {totalCount > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex justify-between text-xs font-medium text-zinc-400">
              <span>Progress: {sentRecipientsCount} of {totalCount} processed</span>
              <span className="font-mono text-xs font-bold text-white bg-black px-2.5 py-0.5 rounded-lg border border-zinc-800">
                ETA: ~{etaMinutes}m {etaSecondsRem}s remaining ({remainingCount} emails at {currentIntervalSec}s delay)
              </span>
            </div>
            <div className="w-full bg-black rounded-full h-2.5 p-0.5 border border-zinc-800">
              <div 
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Live Pacing Console Log Output Card */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <h3 className="font-extrabold text-sm text-white">Live Pacing Console Log ({logs.length})</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {logs.length} events recorded
          </span>
        </div>

        <div className="bg-black text-zinc-300 p-4 rounded-xl overflow-y-auto h-80 space-y-2 text-xs font-mono border border-zinc-800 shadow-inner">
          {logs.length === 0 ? (
            <div className="text-zinc-500 italic py-12 text-center">
              Console idle. Click "Start Dispatch Queue" to trigger Nodemailer pacing engine.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 border-b border-zinc-900 pb-1">
                <span className="text-zinc-500">[{log.timestamp}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400 font-bold' :
                  log.type === 'error' ? 'text-rose-400 font-bold' :
                  log.type === 'sending' ? 'text-zinc-200 font-bold' : 'text-zinc-400'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
