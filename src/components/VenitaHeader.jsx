import React, { useState } from 'react';
import { Mail, ShieldCheck, Key, Check, AlertCircle, RefreshCw, Send, Users, FileText, Settings } from 'lucide-react';

export default function VenitaHeader({ 
  activeTab, 
  setActiveTab, 
  smtpConfig, 
  setSmtpConfig, 
  recipientsCount, 
  sentCount, 
  openedCount 
}) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestGmail = async () => {
    setIsTesting(true);
    setTestResult(null);

    if (smtpConfig.mode === 'sandbox') {
      setTimeout(() => {
        setIsTesting(false);
        setTestResult({ success: true, msg: 'Sandbox Mode active. Dispatches simulated locally.' });
      }, 400);
      return;
    }

    if (!smtpConfig.user || !smtpConfig.pass) {
      setIsTesting(false);
      setTestResult({ success: false, msg: 'Enter your Gmail address & 16-char App Password.' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/test-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpUser: smtpConfig.user, smtpPass: smtpConfig.pass })
      });
      const data = await res.json();
      setIsTesting(false);

      if (res.ok && data.success) {
        setTestResult({ success: true, msg: 'Gmail Connected & Verified!' });
      } else {
        setTestResult({ success: false, msg: data.error || 'Gmail App Password invalid.' });
      }
    } catch (err) {
      setIsTesting(false);
      setTestResult({ success: false, msg: 'Backend offline at http://localhost:3001' });
    }
  };

  return (
    <header className="bg-[#0B0C12] border-b border-white/10 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white shadow-md">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wide text-white uppercase font-sans">
                SkillBridge <span className="text-blue-500">Outreach</span>
              </span>
              <span className="badge-venita badge-venita-ready text-[9px] py-0.5 px-2">Venita Dark v2.0</span>
            </div>
            <p className="text-[11px] text-gray-400">Personalized Email Campaign & Open Tracking Hub</p>
          </div>
        </div>

        {/* Gmail App Password Input Quick Bar */}
        <div className="flex-1 max-w-2xl bg-[#121420] p-2 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-2 text-gray-400 shrink-0">
            <Key className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">Gmail Gateway:</span>
          </div>

          <input
            type="email"
            placeholder="Gmail (e.g. outreach@skillbridge.org)"
            value={smtpConfig.user}
            onChange={e => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
            className="bg-[#0B0C12] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-full sm:w-48"
          />

          <input
            type="password"
            placeholder="App Password (16-chars)"
            value={smtpConfig.pass}
            onChange={e => setSmtpConfig(prev => ({ ...prev, pass: e.target.value }))}
            className="bg-[#0B0C12] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none w-full sm:w-44"
          />

          <button
            onClick={handleTestGmail}
            disabled={isTesting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Gmail</span>
          </button>

          {testResult && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded truncate ${testResult.success ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
              {testResult.msg}
            </span>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-[#121420] p-1 rounded-xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('recipients')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'recipients' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Recipients</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-mono">{recipientsCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'builder' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Email Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'queue' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Queue</span>
            <span className="bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px] font-mono">{sentCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
