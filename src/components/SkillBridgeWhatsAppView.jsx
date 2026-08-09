import React, { useState } from 'react';
import { MessageCircle, CheckCircle, ShieldCheck, Send, RefreshCw, Layers } from 'lucide-react';

export default function SkillBridgeWhatsAppView({ currentOrg }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
            META BUSINESS API INTEGRATION
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-emerald-400" />
          SkillBridge WhatsApp – Business Messaging
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Official Meta WhatsApp Cloud API infrastructure. Send approved HSM broadcast templates, track read receipts, and manage student replies for {currentOrg.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="font-bold text-slate-900 text-sm">Approved HSM Templates</div>
          <div className="text-3xl font-black text-emerald-600">4 Active</div>
          <p className="text-slate-500">Student remote opportunity alert, Interview invite, Application status, Account verification.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="font-bold text-slate-900 text-sm">Read Receipt Rate</div>
          <div className="text-3xl font-black text-blue-600">96.8%</div>
          <p className="text-slate-500">WhatsApp messages boast over 4x higher open rates than standard email.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="font-bold text-slate-900 text-sm">Phone Number Tier</div>
          <div className="text-3xl font-black text-slate-900">Tier 2 (100k/day)</div>
          <p className="text-slate-500">Verified Meta Business Account: +1 (800) 555-SKILL</p>
        </div>
      </div>
    </div>
  );
}
