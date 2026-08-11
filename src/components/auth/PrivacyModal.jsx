import React from 'react';
import { X, Shield } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans text-white select-none">
      <div className="relative w-full max-w-2xl bg-[#121212] rounded-[28px] shadow-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#09090B] px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-normal text-white font-sans">Sendaat Privacy Policy</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-zinc-400 leading-relaxed font-normal">
          <p className="font-semibold text-white">
            Last updated: August 2026
          </p>

          <p>
            At Sendaat Inc., we take your privacy and data security seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our enterprise email outreach and deliverability platform.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white pt-2">1. Information We Collect</h4>
            <p>
              We collect information provided directly by you, including your name, work email address, company name, domain configuration details, and recipient lists required for campaign dispatch.
            </p>

            <h4 className="font-semibold text-sm text-white pt-2">2. How We Use Your Data</h4>
            <p>
              Your data is strictly processed to execute authorized email dispatches, perform DKIM/SPF authentication, monitor domain sender scores, and suppress unverified or hard-bouncing addresses. We do not sell, rent, or trade your contact data to third parties under any circumstances.
            </p>

            <h4 className="font-semibold text-sm text-white pt-2">3. Data Protection & Encryption</h4>
            <p>
              All customer data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption standards. Access to campaign metadata is restricted to authenticated workspace personnel.
            </p>

            <h4 className="font-semibold text-sm text-white pt-2">4. GDPR & CCPA Compliance</h4>
            <p>
              Users in the European Union (EU) and California enjoy full rights to request access, rectification, export, or total deletion of their account data at any time by contacting privacy@sendaat.io.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-full shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
