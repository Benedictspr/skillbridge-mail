import React from 'react';
import { X, FileText } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_12px_4px_rgba(60,64,67,0.08)] border border-[#DADCE0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F8F9FA] px-6 py-4 border-b border-[#E1E3E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-normal text-[#1F1F1F]">Terms of Service & Conditions</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#747775] hover:text-[#1F1F1F] rounded-full hover:bg-[#E1E3E1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-[#444746] leading-relaxed">
          <p className="font-medium text-[#1F1F1F]">
            Effective Date: August 2026
          </p>

          <p>
            Welcome to Sendaat. By registering for or using our services, software, or web console, you agree to be bound by the following Terms of Service and Anti-Spam Compliance Guidelines.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#1F1F1F]">1. Acceptable Use & Anti-Spam Policy</h4>
            <p>
              Users must strictly adhere to CAN-SPAM Act, GDPR, and RFC 8058 standards. Purchased, rented, or scraped email lists associated with high spam traps are prohibited. Sendaat reserves the right to suspend any account violating sender reputation limits.
            </p>

            <h4 className="font-semibold text-[#1F1F1F] text-sm">2. Account Responsibility & Credentials</h4>
            <p>
              You are responsible for maintaining the confidentiality of your workspace credentials and API keys. Any action taken under your authenticated session remains your legal responsibility.
            </p>

            <h4 className="font-semibold text-sm text-[#1F1F1F]">3. Deliverability Service Level & Quotas</h4>
            <p>
              Sendaat provides real-time IP warming, DKIM key signing, and domain score tracking. Service availability is targeted at 99.99% uptime, subject to provider maintenance schedules.
            </p>

            <h4 className="font-semibold text-sm text-[#1F1F1F]">4. Limitation of Liability</h4>
            <p>
              Sendaat Inc. shall not be liable for indirect, incidental, or consequential damages resulting from third-party ISP blocks, user configuration errors, or domain registrar suspensions.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E1E3E1] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium rounded-full shadow-xs transition-colors"
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
