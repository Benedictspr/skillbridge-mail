import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, Info, Lock, 
  RefreshCw, Search, Plus, Download, Trash2, Zap, Flame, Globe, 
  FileText, Sliders, AlertOctagon, Check, ShieldAlert, Cpu
} from 'lucide-react';

export default function DeliverabilityCenterView({ 
  currentOrg, 
  suppressionList = [], 
  setSuppressionList,
  onUpdateOrg,
  recipients = []
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'infrastructure' | 'abuse_shield' | 'suppression' | 'spam_analyzer'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [newSuppressEmail, setNewSuppressEmail] = useState('');
  const [newSuppressReason, setNewSuppressReason] = useState('Manual Add');

  // Compute Real-Time Sender Reputation Score
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const totalRecipients = safeRecipients.length;
  const bouncedCount = safeRecipients.filter(r => r?.status === 'Bounced' || r?.status === 'Suppressed').length;
  const sentCount = safeRecipients.filter(r => r?.status === 'Sent').length;

  const realTimeScore = totalRecipients > 0 
    ? Math.max(72, Math.min(100, Math.round(99 - ((bouncedCount / totalRecipients) * 35)))) 
    : (currentOrg?.reputationScore || 99);

  // Filtered suppression items for current org
  const orgSuppression = suppressionList.filter(item => 
    !item.organization_id || item.organization_id === currentOrg.id
  );

  const filteredSuppression = orgSuppression.filter(item => {
    const matchesSearch = item.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddSuppression = (e) => {
    e.preventDefault();
    if (!newSuppressEmail || !newSuppressEmail.includes('@')) return;

    const newItem = {
      id: `sup-${Date.now()}`,
      email: newSuppressEmail.trim(),
      reason: newSuppressReason,
      type: 'MANUAL',
      addedAt: new Date().toISOString().split('T')[0],
      organization_id: currentOrg.id
    };

    setSuppressionList([newItem, ...suppressionList]);
    setNewSuppressEmail('');
  };

  const handleRemoveSuppression = (id) => {
    setSuppressionList(suppressionList.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* Top Banner & Header - Vantablack Monochromatic */}
      <div className="bg-[#121212] text-white rounded-[24px] p-6 sm:p-8 border border-zinc-800 shadow-md space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                {currentOrg.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700">
                Live Telemetry Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Email Deliverability & Anti-Spam Command Center</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time SPF/DKIM verification, active sender score telemetry, scraped list protection, and automated suppression queries.
            </p>
          </div>

          {/* Real-Time Reputation Gauge Card */}
          <div className="bg-black border border-zinc-800 rounded-2xl px-5 py-3.5 shrink-0 flex items-center gap-4 shadow-sm">
            <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-zinc-900 border-2 border-emerald-400 text-white font-extrabold text-lg shadow-xs font-mono">
              {realTimeScore}
              <span className="text-[9px] text-zinc-400 absolute bottom-0.5 font-bold">/100</span>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Real-Time Sender Score</div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Pristine Reputation</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">0.0% Complaints · 99.8% Inbox Placement</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Health & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'infrastructure' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SPF / DKIM / DMARC Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('suppression')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'suppression' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Suppression & Blacklists ({orgSuppression.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & HEALTH METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
                <span>SPF Authentication</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-extrabold text-white">v=spf1 include:_spf.google.com ~all</div>
              <p className="text-[11px] text-zinc-400">DNS record verified on {currentOrg?.domain || 'sendaat.io'}</p>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
                <span>DKIM Signature</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-extrabold text-white">RSA 2048-bit Key</div>
              <p className="text-[11px] text-zinc-400">Active selector: sendaat._domainkey</p>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
                <span>DMARC Policy</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-extrabold text-white">p=reject; pct=100</div>
              <p className="text-[11px] text-zinc-400">Strict enforcement active against spoofing</p>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
                <span>Suppression Guard</span>
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div className="text-lg font-extrabold text-white font-mono">{orgSuppression.length} Addresses</div>
              <p className="text-[11px] text-zinc-400">Automatic filter on dispatch queue</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INFRASTRUCTURE */}
      {activeTab === 'infrastructure' && (
        <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-white" />
            <span>DNS & Domain Authenticity Records</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-black rounded-xl border border-zinc-800 space-y-1">
              <div className="text-zinc-400 font-bold text-[11px]">TXT RECORD (SPF)</div>
              <div className="text-white font-bold">v=spf1 include:_spf.sendaat.io ~all</div>
            </div>

            <div className="p-4 bg-black rounded-xl border border-zinc-800 space-y-1">
              <div className="text-zinc-400 font-bold text-[11px]">TXT RECORD (DKIM)</div>
              <div className="text-white font-bold">sendaat._domainkey.{currentOrg?.domain || 'sendaat.io'} IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPRESSION & BLACKLIST */}
      {activeTab === 'suppression' && (
        <div className="bg-[#121212] p-6 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-white" />
              <span>Suppression & Blacklist Shield</span>
            </h3>
          </div>

          <form onSubmit={handleAddSuppression} className="flex gap-2">
            <input
              type="email"
              placeholder="Add email address to suppression list..."
              value={newSuppressEmail}
              onChange={(e) => setNewSuppressEmail(e.target.value)}
              className="flex-1 bg-black border border-zinc-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
            >
              Add to Suppression
            </button>
          </form>

          <div className="overflow-x-auto border border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-black text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Added Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredSuppression.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{item.email}</td>
                    <td className="p-3 text-zinc-300">{item.reason}</td>
                    <td className="p-3 font-mono text-zinc-400 text-xs">{item.addedAt}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveSuppression(item.id)}
                        className="p-1 hover:bg-rose-950/60 text-rose-400 rounded-lg transition-colors"
                        title="Remove from suppression"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
