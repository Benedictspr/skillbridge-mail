import React, { useState } from 'react';
import { Send, Play, Pause, RotateCcw, Clock, ShieldCheck, CheckCircle2, Terminal, Eye, Mail, List, FileText, Database, Shield, Sliders, Calculator, Zap } from 'lucide-react';

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
  const currentIntervalSec = Math.max(2, campaignConfig?.intervalSeconds || 7);
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
    const count = remainingCount > 0 ? remainingCount : (totalCount > 0 ? totalCount : 50);
    const requiredSecPerEmail = Math.max(2, Math.round((mins * 60) / count));
    if (setCampaignConfig) {
      setCampaignConfig(prev => ({ ...prev, intervalSeconds: requiredSecPerEmail }));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Control Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                campaignStatus === 'SENDING' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                campaignStatus === 'PAUSED' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {campaignStatus === 'SENDING' ? 'DISPATCH QUEUE ACTIVE' : campaignStatus}
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span>{currentIntervalSec}s Delay / Email</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Dispatch Engine & Live Pacing Console</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sends individual messages sequentially via Gmail SMTP with customizable pacing delays to safeguard sender reputation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSendSingleTest}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-lg border border-gray-300 transition-colors"
            >
              Send 1 Test Email
            </button>

            {campaignStatus === 'SENDING' ? (
              <button onClick={onPauseQueue} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                <Pause className="w-4 h-4 inline mr-1" />
                Pause Queue
              </button>
            ) : (
              <button 
                onClick={onStartQueue} 
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                <Play className="w-4 h-4 inline mr-1 fill-white" />
                {campaignStatus === 'PAUSED' ? 'Resume Queue' : 'Start Dispatch Queue'} ({readyList.length > 0 ? readyList.length : totalCount})
              </button>
            )}

            <button onClick={onResetQueue} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Reset Queue">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smart Pacing Delay & Smart ETA Calculator Control Bar */}
        <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-4 rounded-xl text-white space-y-3 shadow-md border border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span className="font-extrabold text-xs tracking-tight">Smart Pacing & Campaign ETA Controls</span>
            </div>

            {/* Quick Interval Preset Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-400 text-[11px] font-medium mr-1">Presets:</span>
              {[5, 8, 10, 15, 30, 60].map(sec => (
                <button
                  key={sec}
                  onClick={() => handleDelayChange(sec)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors ${
                    currentIntervalSec === sec ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            {/* Input A: Delay Seconds per Email */}
            <div className="bg-black/40 p-3 rounded-lg border border-white/10 flex items-center justify-between gap-3">
              <div>
                <label className="text-[11px] text-gray-400 font-bold block">Delay Between Emails (Seconds)</label>
                <span className="text-[10px] text-gray-500">Auto-calculates total campaign ETA duration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="2"
                  max="300"
                  value={currentIntervalSec}
                  onChange={e => handleDelayChange(e.target.value)}
                  className="w-16 bg-white text-black font-mono font-bold text-sm px-2 py-1 rounded outline-none text-center"
                />
                <span className="font-mono text-xs font-bold text-indigo-300">sec</span>
              </div>
            </div>

            {/* Input B: Target Campaign Duration in Minutes */}
            <div className="bg-black/40 p-3 rounded-lg border border-white/10 flex items-center justify-between gap-3">
              <div>
                <label className="text-[11px] text-gray-400 font-bold block">Set Target Total Campaign Time</label>
                <span className="text-[10px] text-gray-500">Auto-calculates required delay seconds per email</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={Math.max(1, Math.round(totalEtaSeconds / 60))}
                  onChange={e => handleTargetMinutesChange(e.target.value)}
                  className="w-16 bg-white text-black font-mono font-bold text-sm px-2 py-1 rounded outline-none text-center"
                />
                <span className="font-mono text-xs font-bold text-indigo-300">mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Time Sent & Open Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-blue-700 font-bold block">Sent & Delivered</span>
              <span className="text-2xl font-black text-blue-900 font-mono">{sentRecipientsCount}</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-purple-700 font-bold block">Opened (Tracking Pixel)</span>
              <span className="text-2xl font-black text-purple-900 font-mono">{openedRecipientsCount}</span>
            </div>
            <Eye className="w-6 h-6 text-purple-600" />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-emerald-700 font-bold block">Live Open Rate %</span>
              <span className="text-2xl font-black text-emerald-900 font-mono">{openRatePercent}%</span>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Progress Bar & Calculated ETA Banner */}
        {totalCount > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Progress: {sentRecipientsCount} of {totalCount} processed</span>
              <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                ETA: ~{etaMinutes}m {etaSecondsRem}s remaining ({remainingCount} emails at {currentIntervalSec}s delay)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 p-0.5 border border-gray-200">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Console Output Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-700" />
            <h3 className="font-bold text-xs text-gray-900">Live Pacing Console Log ({logs.length})</h3>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {logs.length} events recorded
          </span>
        </div>

        <div className="bg-[#0B0C12] text-gray-200 p-4 rounded-xl overflow-y-auto h-80 space-y-2 text-xs font-mono border border-gray-800">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic py-12 text-center">
              Console idle. Click "Start Dispatch Queue" to trigger Nodemailer pacing engine.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 border-b border-gray-800/60 pb-1">
                <span className="text-gray-500">[{log.timestamp}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400 font-bold' :
                  log.type === 'error' ? 'text-red-400 font-bold' :
                  log.type === 'sending' ? 'text-blue-300' : 'text-gray-300'
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
