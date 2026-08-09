import React from 'react';
import { Users, Send, CheckCircle2, Clock, Play, Sparkles, FileText, ArrowRight, ShieldCheck, Mail, Zap, TrendingUp, AlertTriangle, Home } from 'lucide-react';

export default function DashboardView({ 
  recipients = [], 
  campaignStatus = 'IDLE', 
  onStartQueue, 
  onPauseQueue, 
  setActiveTab, 
  onLoadSkillBridgeData,
  campaignConfig = {}
}) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const readyCount = safeRecipients.filter(r => r?.status === 'Ready' || r?.status === 'Queued').length;
  const sentCount = safeRecipients.filter(r => r?.status === 'Sent').length;
  const failedCount = safeRecipients.filter(r => r?.status === 'Failed').length;
  const totalCount = safeRecipients.length;
  const successRate = sentCount + failedCount > 0 ? Math.round((sentCount / (sentCount + failedCount)) * 100) : 100;
  const intervalSec = campaignConfig?.intervalSeconds || 7;

  return (
    <div className="bg-[#0B0F19] text-white p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8 animate-fade-in font-sans">
      {/* Hero Banner with Dark Contrast Gradient & Ambient Orbs */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111827] via-[#1E1B4B] to-[#0F172A] p-8 md:p-10 border border-white/15 shadow-xl">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Home className="w-4 h-4 text-indigo-400" />
              <span>SkillBridge Outreach Dashboard</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Dispatch Tailored Emails <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                One-by-One Without Spam
              </span>
            </h1>
            
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              Reach out to students and applicants individually using custom merge tags (<code className="text-amber-300 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">{"{{first_name}}"}</code>). Every email is queued with anti-spam throttle intervals to maximize inbox deliverability.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0">
            {recipients.length === 0 ? (
              <button 
                onClick={onLoadSkillBridgeData} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>Load SkillBridge Sample List</span>
              </button>
            ) : campaignStatus === 'SENDING' ? (
              <button 
                onClick={onPauseQueue} 
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Pause Queue ({readyCount} Remaining)</span>
              </button>
            ) : readyCount > 0 ? (
              <button 
                onClick={onStartQueue} 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Launch Campaign ({readyCount} Recipients)</span>
              </button>
            ) : null}

            <button 
              onClick={() => setActiveTab('recipients')} 
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm py-3.5 px-6 rounded-2xl border border-white/20 flex items-center justify-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
            >
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Import Recipients</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Sequential Outreach Protocol Workflow Hub */}
      <div className="bg-[#151C2C] border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Sendaat Outreach Protocol</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              4 Steps to Launch Your Campaign
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-3xl leading-relaxed">
              Follow these four sequential operational stages to build templates, target contacts, dispatch queued emails, and track deliverability metrics. Each aspect leads directly into the next step.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Infrastructure Active & Warm</span>
          </div>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* STEP 1: CREATE */}
          <div className="bg-[#1E293B]/90 hover:bg-[#1E293B] border border-blue-500/40 hover:border-blue-400 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all duration-200 shadow-md group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-black tracking-wider">
                  STEP 1
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                  CREATE
                </h3>
                <span className="text-[11px] font-mono text-blue-400 block font-semibold">
                  (Visual Email Designer & Studio)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Design responsive, high-converting outreach templates in our visual studio. Inject dynamic personalization variables (<code className="text-amber-300 font-mono text-[10px]">{"{{first_name}}"}</code>, <code className="text-amber-300 font-mono text-[10px]">{"{{company}}"}</code>) and run instant spam word inspections to guarantee top inbox placement.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('builder')}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Open Email Designer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 2: AUDIENCE */}
          <div className="bg-[#1E293B]/90 hover:bg-[#1E293B] border border-purple-500/40 hover:border-purple-400 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all duration-200 shadow-md group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-mono text-xs font-black tracking-wider">
                  STEP 2
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                  AUDIENCE
                </h3>
                <span className="text-[11px] font-mono text-purple-400 block font-semibold">
                  (Contact Roster & Address Shield)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Import, clean, and validate contact lists with real-time hard bounce suppression and domain score checks. Our automated Anti-Scraped Address Shield protects your sender score against bad lists and spam trap domains.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('recipients')}
              className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Manage Contact Roster</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 3: SEND */}
          <div className="bg-[#1E293B]/90 hover:bg-[#1E293B] border border-amber-500/40 hover:border-amber-400 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all duration-200 shadow-md group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-mono text-xs font-black tracking-wider">
                  STEP 3
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  SEND
                </h3>
                <span className="text-[11px] font-mono text-amber-400 block font-semibold">
                  (Campaign Dispatch & Pacing Console)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Execute rate-limited cold outreach with adaptive throttle pacing (7-15s per email), sub-150ms dispatch latency, multi-account SMTP rotation, and DKIM/SPF authentication to bypass spam filters seamlessly.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('queue')}
              className="w-full mt-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Open Dispatch Pacing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 4: ANALYZE */}
          <div className="bg-[#1E293B]/90 hover:bg-[#1E293B] border border-emerald-500/40 hover:border-emerald-400 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all duration-200 shadow-md group relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-black tracking-wider">
                  STEP 4
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                  ANALYZE
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 block font-semibold">
                  (Sent Outreach History Logs & Analytics)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Inspect 1x1 open tracking pixel receipts, click rates, message IDs, and live IMAP reply threads in real-time. Continuously monitor your domain reputation score and refine your outreach performance.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('sent')}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>View Sent History Logs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* High Contrast Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-[#151C2C] border border-white/10 hover:border-indigo-500/50 p-6 rounded-2xl space-y-3 shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Contacts</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-black text-white">{totalCount}</div>
            <p className="text-xs text-slate-400 mt-1">Ready for individual dispatch</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#151C2C] border border-white/10 hover:border-emerald-500/50 p-6 rounded-2xl space-y-3 shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Delivered</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-black text-emerald-400">{sentCount}</div>
            <p className="text-xs text-emerald-300/90 font-semibold mt-1">{successRate}% Delivery Success Rate</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#151C2C] border border-white/10 hover:border-amber-500/50 p-6 rounded-2xl space-y-3 shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">In Queue</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-black text-amber-300">{readyCount}</div>
            <p className="text-xs text-slate-400 mt-1">Throttle: 1 email every {campaignConfig.intervalSeconds}s</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#151C2C] border border-white/10 hover:border-cyan-500/50 p-6 rounded-2xl space-y-3 shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Anti-Spam Health</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-cyan-300 flex items-center gap-2">
              <span>Smart Jitter Active</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Human-like delay patterns enabled</p>
          </div>
        </div>
      </div>

      {/* Feature Walkthrough Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('builder')} 
          className="bg-[#151C2C] hover:bg-[#1C253B] border border-white/10 p-6 rounded-2xl space-y-3 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
            <span>Email Designer</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Customize header style, body copy, and telegram call-to-action button with live preview.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('recipients')} 
          className="bg-[#151C2C] hover:bg-[#1C253B] border border-white/10 p-6 rounded-2xl space-y-3 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
            <span>Contact Roster & Parser</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Paste raw text or upload CSVs. Smart parser extracts first names automatically.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('queue')} 
          className="bg-[#151C2C] hover:bg-[#1C253B] border border-white/10 p-6 rounded-2xl space-y-3 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
            <span>Dispatch Engine</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monitor real-time logs, rate limits, and test individual dispatches before full launch.
          </p>
        </div>
      </div>
    </div>
  );
}
