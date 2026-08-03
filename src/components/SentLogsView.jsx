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
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sent Messages Database</span>
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">• {totalSentCount} Recorded Logs</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sent Outreach History Logs</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete persistent record of all individual email dispatches across Real Gmail SMTP and Sandbox modes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={safeHistory.length === 0}
            className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Log</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-gray-500 font-bold block">Total Dispatches</span>
            <span className="text-2xl font-black text-gray-900 font-mono">{totalSentCount}</span>
          </div>
          <Send className="w-6 h-6 text-gray-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-emerald-700 font-bold block">Real Gmail Dispatches</span>
            <span className="text-2xl font-black text-emerald-900 font-mono">{realGmailCount}</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-blue-700 font-bold block">Sandbox Simulated</span>
            <span className="text-2xl font-black text-blue-900 font-mono">{sandboxCount}</span>
          </div>
          <Mail className="w-6 h-6 text-blue-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-purple-700 font-bold block">Verified Opens</span>
            <span className="text-2xl font-black text-purple-900 font-mono">{openedCount}</span>
          </div>
          <Eye className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sent log by email, name, subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterMode === 'ALL' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Logs ({totalSentCount})
          </button>
          <button
            onClick={() => setFilterMode('GMAIL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterMode === 'GMAIL' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Real Gmail ({realGmailCount})
          </button>
          <button
            onClick={() => setFilterMode('SANDBOX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterMode === 'SANDBOX' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sandbox ({sandboxCount})
          </button>
        </div>
      </div>

      {/* Sent Logs Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Subject Line</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">Message ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 font-sans italic">
                    <Send className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No sent history records found.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Dispatched emails will automatically record here persistently.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(item.sentAt || item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 font-sans">
                      {item.recipientName || item.to}
                      <span className="text-[11px] text-gray-400 block font-mono">{item.to}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-800 font-sans max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        item.mode === 'gmail' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}>
                        {item.mode === 'gmail' ? 'REAL GMAIL' : 'SANDBOX'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {item.status || 'Sent'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-gray-400 truncate max-w-xs">
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
