import React from 'react';
import { X, HelpCircle, BookOpen, MessageSquare, Mail, ShieldCheck } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans text-white select-none">
      <div className="relative w-full max-w-xl bg-[#121212] rounded-[28px] shadow-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#09090B] px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-normal text-white font-sans">Sendaat Help & Support</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-black rounded-2xl border border-zinc-800">
            <h4 className="font-semibold text-xs text-white mb-1">Knowledge Base & Guides</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Explore step-by-step documentation on setting up custom domain DKIM keys, SPF records, Google Workspace OAuth, and IP warming protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-black hover:border-zinc-700 transition-colors">
              <BookOpen className="w-4 h-4 text-white mb-2" />
              <div className="font-semibold text-xs text-white">Setup Checklist</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">Verify DNS records and sender score thresholds.</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-black hover:border-zinc-700 transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-2" />
              <div className="font-semibold text-xs text-white">Deliverability Shield</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-normal">Learn how bounce protection protects your domain.</div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <h4 className="font-semibold text-xs text-white mb-2.5">Need direct assistance?</h4>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="mailto:support@sendaat.io"
                className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-full text-xs text-white font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Support</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-zinc-200 rounded-full text-xs text-black font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-black" />
                <span>Contact Engineering</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
