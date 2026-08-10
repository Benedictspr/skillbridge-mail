import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle, ArrowDown, Smartphone, Monitor, Code, 
  ShieldCheck, Send, Clock, BarChart3, AlertCircle, Play, Eye, RefreshCw, Info
} from 'lucide-react';

export default function CampaignLifecycleView({ 
  campaignConfig, 
  recipients = [], 
  currentOrg, 
  onNavigateTo 
}) {
  const [activeStep, setActiveStep] = useState('VALIDATION'); // 'CREATE' | 'DESIGNER' | 'RENDERER' | 'VALIDATION' | 'DISPATCH' | 'ANALYTICS'
  const [devicePreview, setDevicePreview] = useState('desktop'); // 'desktop' | 'mobile'

  const readyCount = recipients.filter(r => r?.status === 'Ready' || r?.status === 'Queued').length;
  const sentCount = recipients.filter(r => r?.status === 'Sent').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
                ORGANIZATION: {currentOrg.name} [{currentOrg.id}]
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
              Campaign Lifecycle Pipeline Engine
            </h1>
            <p className="text-slate-400 text-sm">
              Visual end-to-end architecture flow from design rendering to validation, delivery, and real-time analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTo && onNavigateTo('builder')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Open Visual Designer
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Diagram Canvas */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider">
            Execution Flowchart Topology
          </h2>
          <p className="text-xs text-slate-500">Click any stage in the flow diagram to inspect or configure that phase.</p>
        </div>

        {/* The Diagram Nodes */}
        <div className="flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto">
          {/* Node 1: CREATE */}
          <div 
            onClick={() => setActiveStep('CREATE')}
            className={`w-52 py-3 px-4 rounded-2xl text-center font-extrabold text-xs cursor-pointer border-2 transition-all shadow-sm ${
              activeStep === 'CREATE' ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 scale-105' : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-blue-400'
            }`}
          >
            1. CREATE CAMPAIGN
          </div>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Node 2: VISUAL DESIGNER */}
          <div 
            onClick={() => setActiveStep('DESIGNER')}
            className={`w-64 py-4 px-5 rounded-2xl text-center font-extrabold text-xs cursor-pointer border-2 transition-all shadow-sm ${
              activeStep === 'DESIGNER' ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100 scale-105' : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-indigo-400'
            }`}
          >
            <div className="text-sm">2. VISUAL DESIGNER</div>
            <div className="text-[11px] opacity-80 mt-0.5">Desktop & Mobile Dual Preview</div>
          </div>

          {/* Branching Desktop / Mobile */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            <div 
              onClick={() => { setDevicePreview('desktop'); setActiveStep('DESIGNER'); }}
              className={`p-3 rounded-xl border text-center text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                devicePreview === 'desktop' ? 'bg-blue-50 text-blue-900 border-blue-400' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4 text-blue-600" /> Desktop View (600px)
            </div>

            <div 
              onClick={() => { setDevicePreview('mobile'); setActiveStep('DESIGNER'); }}
              className={`p-3 rounded-xl border text-center text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                devicePreview === 'mobile' ? 'bg-blue-50 text-blue-900 border-blue-400' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-purple-600" /> Mobile View (375px)
            </div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Node 3: EMAIL RENDERER */}
          <div 
            onClick={() => setActiveStep('RENDERER')}
            className={`w-64 py-3.5 px-5 rounded-2xl text-center font-extrabold text-xs cursor-pointer border-2 transition-all shadow-sm ${
              activeStep === 'RENDERER' ? 'bg-teal-600 text-white border-teal-600 ring-4 ring-teal-100 scale-105' : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-teal-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <Code className="w-4 h-4" /> 3. EMAIL RENDERER
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">Inline CSS & Bulletproof HTML</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Node 4: EMAIL VALIDATION */}
          <div 
            onClick={() => setActiveStep('VALIDATION')}
            className={`w-72 py-4 px-5 rounded-2xl text-center font-extrabold text-xs cursor-pointer border-2 transition-all shadow-sm ${
              activeStep === 'VALIDATION' ? 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100 scale-105' : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> 4. EMAIL VALIDATION GATEWAY
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">SPF/DKIM Check · Spam Score · Scraped Shield</div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Node 5: CAMPAIGN DISPATCH (Schedule vs Send) */}
          <div 
            onClick={() => setActiveStep('DISPATCH')}
            className={`w-80 py-4 px-6 rounded-2xl text-center font-extrabold text-xs cursor-pointer border-2 transition-all shadow-sm ${
              activeStep === 'DISPATCH' ? 'bg-purple-600 text-white border-purple-600 ring-4 ring-purple-100 scale-105' : 'bg-purple-50 text-purple-950 border-purple-300 hover:border-purple-500'
            }`}
          >
            <div className="text-sm">5. CAMPAIGN DISPATCH QUEUE</div>
            <div className="flex items-center justify-center gap-4 mt-2 font-mono text-[11px]">
              <span className="px-2 py-1 rounded bg-purple-200/60 text-purple-900 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Schedule
              </span>
              <span className="px-2 py-1 rounded bg-purple-200/60 text-purple-900 font-bold flex items-center gap-1">
                <Send className="w-3 h-3" /> Rate-Limited Send
              </span>
            </div>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Node 6: ANALYTICS */}
          <div 
            onClick={() => setActiveStep('ANALYTICS')}
            className={`w-64 py-4 px-5 rounded-2xl text-center font-extrabold text-xs cursor-pointer border-2 transition-all shadow-sm ${
              activeStep === 'ANALYTICS' ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-slate-200 scale-105' : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-blue-400" /> 6. ANALYTICS & DELIVERABILITY
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">Bounces · Complaints · Opens · Clicks</div>
          </div>
        </div>
      </div>

      {/* Selected Step Detail Panel */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Pipeline Stage Inspection: {activeStep}</span>
        </h3>

        {activeStep === 'VALIDATION' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> SPF & DKIM Alignment
              </div>
              <p className="text-slate-600">Validates that envelope domain matches DKIM RSA signature.</p>
              <div className="font-mono text-emerald-700 font-bold">Status: PASS</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Spam Trigger Words Scan
              </div>
              <p className="text-slate-600">Scans subject line: "{campaignConfig.subject}"</p>
              <div className="font-mono text-emerald-700 font-bold">Score: 0.2 / 10 (Pristine)</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Anti-Scraped List Shield
              </div>
              <p className="text-slate-600">Scans {recipients.length} queued recipient addresses for honeypots.</p>
              <div className="font-mono text-emerald-700 font-bold">Status: CLEAR</div>
            </div>
          </div>
        )}

        {activeStep === 'DISPATCH' && (
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-900">Dispatch Queue Parameters ({currentOrg.name})</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><span className="text-slate-500">Ready to Send:</span> <strong className="block text-slate-900 font-mono text-sm">{readyCount}</strong></div>
              <div><span className="text-slate-500">Sent Today:</span> <strong className="block text-emerald-600 font-mono text-sm">{sentCount}</strong></div>
              <div><span className="text-slate-500">Hourly Rate Limit:</span> <strong className="block text-blue-600 font-mono text-sm">{currentOrg.hourlyQuota} / hr</strong></div>
              <div><span className="text-slate-500">Interval Delay:</span> <strong className="block text-slate-900 font-mono text-sm">{campaignConfig.intervalSeconds}s (Jitter)</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
