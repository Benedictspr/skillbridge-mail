import React, { useState } from 'react';
import { Send, Play, Pause, RotateCcw, Clock, ShieldCheck, CheckCircle2, Terminal, Eye, Mail, List, FileText, Database, Shield } from 'lucide-react';

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
  const avgPacingSeconds = Math.max(5, campaignConfig?.intervalSeconds || 7);
  const etaSeconds = remainingCount * avgPacingSeconds;
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
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                ⚡ 5–10s Anti-Spam Pacing Delay Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Dispatch Engine & Live Sent Log</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sends individual emails 5–10 seconds apart via Gmail SMTP to safeguard sender reputation and prevent anti-spam rate limits.
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
              <button onClick={onPauseQueue} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors">
                <Pause className="w-4 h-4 inline mr-1" />
                Pause Queue
              </button>
            ) : (
              <button 
                onClick={onStartQueue} 
                disabled={readyList.length === 0}
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                <Play className="w-4 h-4 inline mr-1 fill-white" />
                {campaignStatus === 'PAUSED' ? 'Resume Queue' : 'Start Dispatch Queue'} ({readyList.length})
              </button>
            )}

            <button onClick={onResetQueue} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Reset Queue">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Time Sent & Open Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
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

        {/* Progress Bar & Pacing Banner */}
        {totalCount > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Progress: {sentRecipientsCount} of {totalCount} processed</span>
              <span className="font-mono">ETA: ~{etaMinutes} min ({etaSeconds}s remaining with 5-10s delay)</span>
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

      {/* Tabs for Console Output vs Sent Messages History Log */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('console')}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors ${
                activeSubTab === 'console' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Live Console Log ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('sentHistory')}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors ${
                activeSubTab === 'sentHistory' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Persistent Sent History ({sentHistoryLog.length})</span>
            </button>
          </div>

          <span className="text-xs text-gray-500 font-mono">
            {activeSubTab === 'console' ? `${logs.length} events logged` : `${sentHistoryLog.length} messages saved`}
          </span>
        </div>

        {/* Tab 1: Live Console Output */}
        {activeSubTab === 'console' && (
          <div className="bg-[#0B0C12] text-gray-200 p-4 rounded-xl overflow-y-auto h-80 space-y-2 text-xs font-mono border border-gray-800">
            {logs.length === 0 ? (
              <div className="text-gray-500 italic py-12 text-center">
                Console idle. Click "Start Dispatch Queue" to trigger 5–10 second paced Nodemailer engine.
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
        )}

        {/* Tab 2: Persistent Sent History Log Table */}
        {activeSubTab === 'sentHistory' && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Delivery Status</th>
                  <th className="px-4 py-3">Message ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {sentHistoryLog.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 font-sans italic">
                      No sent message history recorded yet. Sent emails will be saved here persistently.
                    </td>
                  </tr>
                ) : (
                  sentHistoryLog.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(item.sentAt || item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 font-sans">
                        {item.recipientName || item.to}
                        <span className="text-[11px] text-gray-400 block font-mono">{item.to}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-sans max-w-xs truncate">
                        {item.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.mode === 'gmail' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.mode === 'gmail' ? 'REAL GMAIL' : 'SANDBOX'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {item.status || 'Sent'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-400 truncate max-w-xs">
                        {item.messageId || 'OK'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
