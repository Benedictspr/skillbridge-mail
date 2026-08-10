import React, { useState } from 'react';
import { Send, Database, Search, CheckCircle2, ShieldCheck, Download, Trash2, Eye, Mail, Clock } from 'lucide-react';

export default function SentLogsView({ 
  sentHistoryLog = [], 
  recipientTracker = {}, 
  recipients = [] 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'GMAIL' | 'SANDBOX'

  const safeHistory = Array.isArray(sentHistoryLog) ? sentHistoryLog : [];
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  
  // Calculate aggregate metrics
  const totalSentCount = safeHistory.length;
  const realGmailCount = safeHistory.filter(item => item.mode === 'gmail').length;
  const sandboxCount = safeHistory.filter(item => item.mode === 'sandbox').length;
  const openedCount = safeRecipients.filter(r => recipientTracker[r.id]?.opened).length;

  const filteredHistory = safeHistory.filter(item => {
    const matchesSearch = 
      (item.to || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.messageId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = 
      filterMode === 'ALL' ? true :
      filterMode === 'GMAIL' ? item.mode === 'gmail' :
      filterMode === 'SANDBOX' ? item.mode === 'sandbox' : true;

    return matchesSearch && matchesMode;
  });

  const handleExportCsv = () => {
    if (safeHistory.length === 0) return;

    const headers = ['Timestamp', 'Recipient Name', 'Email', 'Subject', 'Mode', 'Status', 'Message ID'];
    const rows = safeHistory.map(item => [
      `"${new Date(item.sentAt || item.timestamp).toLocaleString()}"`,
      `"${item.recipientName || item.to}"`,
      `"${item.to}"`,
      `"${(item.subject || '').replace(/"/g, '""')}"`,
      `"${item.mode || 'sandbox'}"`,
      `"${item.status || 'Sent'}"`,
      `"${item.messageId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sent_email_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* 1. Header Banner - Vantablack Monochromatic */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono font-bold px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Sent Messages Database</span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">• {totalSentCount} Recorded Logs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            Sent Outreach History Logs
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Complete persistent record of all individual email dispatches across Real Gmail SMTP and Sandbox modes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCsv}
            disabled={safeHistory.length === 0}
            className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Export CSV Log</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics Cards (Clean Monochromatic Typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-zinc-400 font-semibold block text-xs">Total Dispatches</span>
            <span className="text-2xl font-extrabold text-white font-sans mt-0.5 block">{totalSentCount}</span>
          </div>
          <Send className="w-6 h-6 text-white stroke-[1.75]" />
        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-zinc-400 font-semibold block text-xs">Real Gmail Dispatches</span>
            <span className="text-2xl font-extrabold text-white font-sans mt-0.5 block">{realGmailCount}</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-white stroke-[1.75]" />
        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-zinc-400 font-semibold block text-xs">Sandbox Simulated</span>
            <span className="text-2xl font-extrabold text-white font-sans mt-0.5 block">{sandboxCount}</span>
          </div>
          <Mail className="w-6 h-6 text-white stroke-[1.75]" />
        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-zinc-400 font-semibold block text-xs">Verified Opens</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-sans mt-0.5 block">{openedCount}</span>
          </div>
          <Eye className="w-6 h-6 text-emerald-400 stroke-[1.75]" />
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#121212] p-4 rounded-[24px] border border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sent log by email, name, subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-zinc-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'ALL' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Logs ({totalSentCount})
          </button>
          <button
            onClick={() => setFilterMode('GMAIL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'GMAIL' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Real Gmail ({realGmailCount})
          </button>
          <button
            onClick={() => setFilterMode('SANDBOX')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'SANDBOX' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Sandbox ({sandboxCount})
          </button>
        </div>
      </div>

      {/* 4. Sent Logs Data Table */}
      <div className="bg-[#121212] rounded-[24px] border border-zinc-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-black text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Subject Line</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">Message ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-500 font-mono">
                    <Send className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                    <p className="font-bold text-white font-sans">No sent history records found.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Dispatched emails will automatically record here persistently.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 font-mono whitespace-nowrap">
                      {new Date(item.sentAt || item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white font-sans">
                      {item.recipientName || item.to}
                      <span className="text-[11px] text-zinc-400 block font-mono font-normal">{item.to}</span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-300 font-sans max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {item.mode === 'gmail' ? 'REAL GMAIL' : 'SANDBOX'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {item.status || 'Sent'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-zinc-400 font-mono truncate max-w-xs">
                      {item.messageId || 'OK'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
