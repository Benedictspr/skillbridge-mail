import React from 'react';
import { X, HelpCircle, BookOpen, MessageSquare, Mail, ShieldCheck } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_12px_4px_rgba(60,64,67,0.08)] border border-[#DADCE0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F8F9FA] px-6 py-4 border-b border-[#E1E3E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-normal text-[#1F1F1F]">Sendaat Help & Support</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#747775] hover:text-[#1F1F1F] rounded-full hover:bg-[#E1E3E1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-[#F0F4F9] rounded-2xl border border-[#DADCE0]">
            <h4 className="font-semibold text-xs text-[#1F1F1F] mb-1">Knowledge Base & Guides</h4>
            <p className="text-xs text-[#444746] leading-relaxed">
              Explore step-by-step documentation on setting up custom domain DKIM keys, SPF records, Google Workspace OAuth, and IP warming protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-[#E1E3E1] hover:border-[#0B57D0] transition-colors">
              <BookOpen className="w-4 h-4 text-[#0B57D0] mb-2" />
              <div className="font-semibold text-xs text-[#1F1F1F]">Setup Checklist</div>
              <div className="text-[11px] text-[#5F6368] mt-0.5">Verify DNS records and sender score thresholds.</div>
            </div>

            <div className="p-4 rounded-2xl border border-[#E1E3E1] hover:border-[#0B57D0] transition-colors">
              <ShieldCheck className="w-4 h-4 text-[#188038] mb-2" />
              <div className="font-semibold text-xs text-[#1F1F1F]">Deliverability Shield</div>
              <div className="text-[11px] text-[#5F6368] mt-0.5">Learn how bounce protection protects your domain.</div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E1E3E1]">
            <h4 className="font-semibold text-xs text-[#1F1F1F] mb-2">Need direct assistance?</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="mailto:support@sendaat.io"
                className="flex-1 px-4 py-2.5 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#DADCE0] rounded-full text-xs text-[#0B57D0] font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Support</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] rounded-full text-xs text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Engineering</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
