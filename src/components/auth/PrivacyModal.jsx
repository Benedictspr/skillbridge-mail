import React from 'react';
import { X, Shield } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_12px_4px_rgba(60,64,67,0.08)] border border-[#DADCE0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F8F9FA] px-6 py-4 border-b border-[#E1E3E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-normal text-[#1F1F1F]">Sendaat Privacy Policy</h3>
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
            Last updated: August 2026
          </p>

          <p>
            At Sendaat Inc., we take your privacy and data security seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our enterprise email outreach and deliverability platform.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#1F1F1F]">1. Information We Collect</h4>
            <p>
              We collect information provided directly by you, including your name, work email address, company name, domain configuration details, and recipient lists required for campaign dispatch.
            </p>

            <h4 className="font-semibold text-sm text-[#1F1F1F]">2. How We Use Your Data</h4>
            <p>
              Your data is strictly processed to execute authorized email dispatches, perform DKIM/SPF authentication, monitor domain sender scores, and suppress unverified or hard-bouncing addresses. We do not sell, rent, or trade your contact data to third parties under any circumstances.
            </p>

            <h4 className="font-semibold text-sm text-[#1F1F1F]">3. Data Protection & Encryption</h4>
            <p>
              All customer data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption standards. Access to campaign metadata is restricted to authenticated workspace personnel.
            </p>

            <h4 className="font-semibold text-sm text-[#1F1F1F]">4. GDPR & CCPA Compliance</h4>
            <p>
              Users in the European Union (EU) and California enjoy full rights to request access, rectification, export, or total deletion of their account data at any time by contacting privacy@sendaat.io.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E1E3E1] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium rounded-full shadow-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
