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
  onUpdateOrg 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'infrastructure' | 'abuse_shield' | 'suppression' | 'spam_analyzer'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [newSuppressEmail, setNewSuppressEmail] = useState('');
  const [newSuppressReason, setNewSuppressReason] = useState('Manual Add');

  // Spam Word Tester State
  const [testSubject, setTestSubject] = useState('Remote Opportunity for Students - Earn extra income');
  const [testBody, setTestBody] = useState('Hi John,\n\nWe are offering flexible remote student roles. Click below to message us directly on Telegram.');
  const [spamAnalysis, setSpamAnalysis] = useState(null);

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

  const runSpamAnalysis = () => {
    const spamWords = [
      '100%', 'free', 'money', 'guaranteed', 'risk free', 'click here', 
      'winner', 'cash', 'earn $$$', 'act now', 'urgent', 'no cost', 'credit card'
    ];

    const combinedText = `${testSubject} ${testBody}`.toLowerCase();
    const foundSpamWords = spamWords.filter(word => combinedText.includes(word));
    const hasAllCapsSubject = testSubject === testSubject.toUpperCase() && testSubject.length > 5;
    const hasMultipleExclamations = (combinedText.match(/!{2,}/g) || []).length > 0;

    let score = 0.2; // base score
    if (foundSpamWords.length > 0) score += foundSpamWords.length * 1.5;
    if (hasAllCapsSubject) score += 3.0;
    if (hasMultipleExclamations) score += 1.5;

    let rating = 'EXCELLENT';
    let ratingColor = 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score > 2.0 && score <= 4.0) {
      rating = 'MODERATE RISK';
      ratingColor = 'text-amber-600 bg-amber-50 border-amber-300';
    } else if (score > 4.0) {
      rating = 'HIGH SPAM RISK';
      ratingColor = 'text-red-600 bg-red-50 border-red-300';
    }

    setSpamAnalysis({
      score: score.toFixed(1),
      rating,
      ratingColor,
      foundSpamWords,
      hasAllCapsSubject,
      hasMultipleExclamations,
      inboxPlacementPredict: score < 2.0 ? '98.5% Primary Inbox' : score <= 4.0 ? '75.0% Primary / 25% Spam' : '15% Primary / 85% Spam Folder'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                {currentOrg.name} [{currentOrg.id}]
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                Multi-Tenant Scoped
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Email Deliverability & Anti-Spam Command Center
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              1 million contacts mean nothing if your messages land in spam. Configure SPF, DKIM, DMARC, protect against scraped lists, monitor sender reputation, and automate bounce & suppression management.
            </p>
          </div>

          {/* Reputation Gauge Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 md:p-5 shrink-0 flex items-center gap-5 shadow-inner">
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xl shadow-lg">
              {currentOrg.reputationScore}
              <span className="text-[10px] text-slate-900 absolute bottom-1 font-bold">/100</span>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sender Reputation</div>
              <div className="text-lg font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Optimal (Pristine)</span>
              </div>
              <div className="text-[11px] text-slate-400">0.01% Complaint Rate · 0.2% Bounce</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Health & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'infrastructure' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SPF / DKIM / DMARC Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('abuse_shield')}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'abuse_shield' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Anti-Scraped Address Shield</span>
          </button>

          <button
            onClick={() => setActiveTab('suppression')}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'suppression' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Suppression & Blacklists ({orgSuppression.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('spam_analyzer')}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'spam_analyzer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Spam Word Inspector</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & HEALTH METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Deliverability Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>SPF Authentication</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">VERIFIED</div>
              <div className="text-xs text-slate-500 font-mono">v=spf1 include:_spf.skillbridge.io ~all</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>DKIM 2048-Bit</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">SIGNED</div>
              <div className="text-xs text-slate-500 font-mono">selector: skillbridge._domainkey</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>DMARC Enforcement</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">REJECT (100%)</div>
              <div className="text-xs text-slate-500 font-mono">v=DMARC1; p=reject</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Hourly Throttle</span>
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{currentOrg.hourlyQuota} / hr</div>
              <div className="text-xs text-slate-500">Adaptive Warmup Enabled</div>
            </div>
          </div>

          {/* Infrastructure Safeguard Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Deliverability Protection Checklist</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">Automated Hard & Soft Bounce Suppression</span>
                    <p className="text-slate-600">Hard bounces (550 User Unknown) are immediately added to organization suppression list to avoid domain blacklisting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">FBL Complaint Handling & Auto-Unsubscribe</span>
                    <p className="text-slate-600">Integrates with Yahoo, Gmail, and Outlook Feedback Loops for instant subscriber opt-out processing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">RFC-8058 One-Click List-Unsubscribe Header</span>
                    <p className="text-slate-600">Injects RFC compliant headers into every outbound HTML email payload.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anti-Abuse & Scraped Address Warning */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-base text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Anti-Spam & Scraped List Safeguard</span>
              </h3>
              <p className="text-xs text-amber-950 leading-relaxed">
                Importing 500,000 unverified or scraped addresses will immediately destroy your sending domain's IP reputation, cause Gmail/Outlook blocks, and freeze outreach campaigns.
              </p>
              <div className="p-4 rounded-xl bg-white border border-amber-300 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  <span>Enforced Rule for {currentOrg.name}:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>Lists with over 10,000 addresses require Double Opt-in verification token.</li>
                  <li>Automatic spam trap and honeypot filtering before dispatch.</li>
                  <li>Bounce prediction threshold capped at 2.5%.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INFRASTRUCTURE VERIFICATION (SPF / DKIM / DMARC) */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>DNS Authentication Records Wizard</span>
            </h3>

            {/* SPF Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>1. SPF Record (Sender Policy Framework)</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600">Add this TXT record to your DNS host ({currentOrg.domain}) to authorize SkillBridge servers to send emails on behalf of your domain.</p>
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs flex items-center justify-between">
                <code>v=spf1 include:_spf.skillbridge.io ~all</code>
                <button 
                  onClick={() => navigator.clipboard.writeText('v=spf1 include:_spf.skillbridge.io ~all')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-sans font-bold"
                >
                  Copy TXT
                </button>
              </div>
            </div>

            {/* DKIM Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>2. DKIM 2048-Bit Public Key (DomainKeys Identified Mail)</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full">
                  2048-BIT RSA
                </span>
              </div>
              <p className="text-xs text-slate-600">Cryptographically signs every outbound email to guarantee headers and body text are untouched in transit.</p>
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                <code>skillbridge._domainkey.{currentOrg.domain} IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuZ...IDAQAB"</code>
              </div>
            </div>

            {/* DMARC Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>3. DMARC Policy (Domain-based Message Authentication)</span>
                </div>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                  POLICY: REJECT
                </span>
              </div>
              <p className="text-xs text-slate-600">Instructs receiving mail servers (Gmail, Yahoo, Outlook) to reject unauthorized messages attempting to spoof your domain.</p>
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs flex items-center justify-between">
                <code>v=DMARC1; p=reject; pct=100; rua=mailto:dmarc-reports@{currentOrg.domain}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(`v=DMARC1; p=reject; pct=100; rua=mailto:dmarc-reports@${currentOrg.domain}`)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-sans font-bold"
                >
                  Copy Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANTI-SCRAPED ADDRESS SHIELD */}
      {activeTab === 'abuse_shield' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Anti-Scraped Address & Reputation Shield</span>
              </h3>
              <p className="text-xs text-slate-500">Prevent team members or spammers from uploading unverified scraped lists into {currentOrg.name}.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Shield Status:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-300">
                <Check className="w-4 h-4" /> ACTIVE & ENFORCED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Scraped List Threshold</div>
              <div className="text-2xl font-black text-blue-600">10,000 Max</div>
              <p className="text-slate-500">Lists exceeding 10k contacts trigger mandatory MX domain verification audit.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Spam Trap Detection</div>
              <div className="text-2xl font-black text-emerald-600">100% Filtered</div>
              <p className="text-slate-500">Known honeypots and recycled spam trap databases are automatically purged.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Auto-Pause Safeguard</div>
              <div className="text-2xl font-black text-amber-600">2.5% Bounce Cap</div>
              <p className="text-slate-500">Campaign automatically freezes if real-time bounce rate exceeds 2.5%.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPRESSION LIST & BLACKLIST */}
      {activeTab === 'suppression' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-700" />
                <span>Organization Suppression & Blacklist Database</span>
              </h3>
              <p className="text-xs text-slate-500">Emails in this list are globally blocked from receiving any campaigns from {currentOrg.name}.</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const csvData = orgSuppression.map(s => `${s.email},${s.type},${s.reason}`).join('\n');
                  const blob = new Blob([`email,type,reason\n${csvData}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `suppression-${currentOrg.id}.csv`;
                  a.click();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-300"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Add Email Bar */}
          <form onSubmit={handleAddSuppression} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <input
              type="email"
              placeholder="Enter email to suppress (e.g. user@domain.com)..."
              value={newSuppressEmail}
              onChange={(e) => setNewSuppressEmail(e.target.value)}
              className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
            />
            <select
              value={newSuppressReason}
              onChange={(e) => setNewSuppressReason(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs outline-none font-bold text-slate-700"
            >
              <option value="Manual Add">Manual Add</option>
              <option value="Unsubscribed">Unsubscribed</option>
              <option value="Hard Bounce">Hard Bounce</option>
              <option value="Complaint">Spam Complaint</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add to Suppression
            </button>
          </form>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search suppressed emails or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="HARD_BOUNCE">Hard Bounces</option>
              <option value="COMPLAINT">Spam Complaints</option>
              <option value="SCRAPED_GUARD">Scraped Guard</option>
              <option value="UNSUBSCRIBE">Unsubscribes</option>
              <option value="MANUAL">Manual Additions</option>
            </select>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Suppressed Email</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reason / Details</th>
                  <th className="px-4 py-3">Added Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredSuppression.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      No suppressed records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSuppression.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          item.type === 'HARD_BOUNCE' ? 'bg-amber-100 text-amber-800' :
                          item.type === 'COMPLAINT' ? 'bg-red-100 text-red-800' :
                          item.type === 'SCRAPED_GUARD' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.reason}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{item.addedAt}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveSuppression(item.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Remove from suppression list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI SPAM WORD INSPECTOR */}
      {activeTab === 'spam_analyzer' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>AI Content & Spam Score Inspector</span>
            </h3>
            <p className="text-xs text-slate-500">Test subject lines and email body copy before sending to ensure maximum primary inbox placement.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject Line to Test:</label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Body Copy to Test:</label>
                <textarea
                  rows="6"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={runSpamAnalysis}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Run Deliverability Audit</span>
              </button>
            </div>

            {/* Output Audit Results */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Spam Audit Diagnostics</h4>

              {spamAnalysis ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Calculated Risk Score:</span>
                    <span className={`px-3 py-1 rounded-full font-black text-sm border ${spamAnalysis.ratingColor}`}>
                      {spamAnalysis.score} / 10 ({spamAnalysis.rating})
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Predicted Placement:</div>
                    <div className="text-emerald-700 font-extrabold text-sm">{spamAnalysis.inboxPlacementPredict}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-800">Spam Triggers Detected:</div>
                    {spamAnalysis.foundSpamWords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {spamAnalysis.foundSpamWords.map((word, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-red-100 text-red-800 font-mono font-bold text-[11px]">
                            "{word}"
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-emerald-600 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> No trigger spam keywords found!
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Click "Run Deliverability Audit" to generate live spam score predictions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
