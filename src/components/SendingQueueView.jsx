import React from 'react';
import { Send, Play, Pause, RotateCcw, Clock, ShieldCheck, CheckCircle2, Terminal, Eye, Mail } from 'lucide-react';

export default function SendingQueueView({
  recipients,
  campaignStatus,
  onStartQueue,
  onPauseQueue,
  onResetQueue,
  onSendSingleTest,
  logs,
  campaignConfig,
  setCampaignConfig,
  recipientTracker
}) {
  const readyList = recipients.filter(r => r.status === 'Ready' || r.status === 'Queued');
  const sendingItem = recipients.find(r => r.status === 'Sending');
  const totalCount = recipients.length;

  // Real-time calculations from both recipients state and recipientTracker polling
  const sentRecipientsCount = recipients.filter(r => r.status === 'Sent' || recipientTracker[r.id]?.status === 'Sent' || recipientTracker[r.id]?.opened).length;
  const openedRecipientsCount = recipients.filter(r => recipientTracker[r.id]?.opened).length;
  const openRatePercent = sentRecipientsCount > 0 ? Math.round((openedRecipientsCount / sentRecipientsCount) * 100) : 0;

  const progressPercent = totalCount > 0 ? Math.round((sentRecipientsCount / totalCount) * 100) : 0;
  const remainingCount = readyList.length + (sendingItem ? 1 : 0);
  const etaSeconds = remainingCount * campaignConfig.intervalSeconds;
  const etaMinutes = Math.ceil(etaSeconds / 60);

  return (
    <div className="space-y-6 font-sans">
      {/* Control Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                campaignStatus === 'SENDING' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                campaignStatus === 'PAUSED' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {campaignStatus === 'SENDING' ? 'DISPATCH QUEUE ACTIVE' : campaignStatus}
              </span>
              <span className="text-xs font-mono text-gray-500">• Interval: {campaignConfig.intervalSeconds}s</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Dispatch & Live Open Tracking</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sends individual messages sequentially via Gmail SMTP backend with live tracking pixel open detection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSendSingleTest}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-lg border border-gray-300"
            >
              Send 1 Test Email
            </button>

            {campaignStatus === 'SENDING' ? (
              <button onClick={onPauseQueue} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg">
                <Pause className="w-4 h-4 inline mr-1" />
                Pause Queue
              </button>
            ) : (
              <button 
                onClick={onStartQueue} 
                disabled={readyList.length === 0}
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4 inline mr-1 fill-white" />
                {campaignStatus === 'PAUSED' ? 'Resume Queue' : 'Start Dispatch Queue'} ({readyList.length})
              </button>
            )}

            <button onClick={onResetQueue} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Time Sent & Open Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-blue-700 font-bold block">Sent (Delivered)</span>
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

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Progress: {sentRecipientsCount} of {totalCount} processed</span>
              <span className="font-mono">ETA: ~{etaMinutes} min ({etaSeconds}s remaining)</span>
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

      {/* Real Time Console Output */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-black" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Backend Dispatch & Tracking Console</h3>
          </div>
          <span className="text-xs text-gray-500 font-mono">{logs.length} Log Events</span>
        </div>

        <div className="bg-[#0B0C12] text-gray-200 p-4 rounded-xl overflow-y-auto h-80 space-y-2 text-xs font-mono border border-gray-800">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic py-12 text-center">
              Console idle. Add recipient emails and click "Start Dispatch Queue" to trigger Nodemailer engine.
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
