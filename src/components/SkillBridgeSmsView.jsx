import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, Zap, Phone, CheckCircle, Send, Users, AlertCircle } from 'lucide-react';

export default function SkillBridgeSmsView({ currentOrg }) {
  const [smsText, setSmsText] = useState('Hi {first_name}, your SkillBridge remote tutoring application has been received. Reply YES to confirm your interview slot!');
  const [testNumber, setTestNumber] = useState('+1 (555) 019-2834');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
            SKILLBRIDGE INFRASTRUCTURE SUITE
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            10DLC Compliant
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          SkillBridge SMS – Enterprise Bulk Messaging
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          High-throughput SMS campaign infrastructure with carrier-grade 10DLC brand registration, TCPA opt-out management, and automated carrier routing for {currentOrg.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-extrabold text-base text-slate-900">Compose SMS Campaign</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Message Body (160 Chars per SMS segment):</label>
            <textarea
              rows="4"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Characters: {smsText.length} / 160</span>
              <span>Segments: {Math.ceil(smsText.length / 160)} SMS</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>TCPA Opt-Out Safeguard & STOP Keyword Handling</span>
            </div>
            <p className="text-xs text-slate-600">Every outgoing SMS automatically appends "Reply STOP to opt out". Opt-outs are automatically added to the organization suppression list.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">10DLC Carrier Status</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900">Brand Registration</div>
              <div className="text-emerald-700 font-mono">Status: VERIFIED (T-Mobile / AT&T / Verizon)</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">Campaign Type</div>
              <div className="text-slate-600 font-mono">Mixed / Transactional Outreach</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">Throughput Limit</div>
              <div className="text-blue-600 font-bold font-mono">75 SMS / sec</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
