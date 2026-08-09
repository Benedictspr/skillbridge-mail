import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordModal from './ForgotPasswordModal';
import HelpModal from './HelpModal';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import { Send } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const handleOpenForgotPassword = (email) => {
    setForgotPasswordEmail(email);
    setForgotPasswordOpen(true);
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#F0F4F9] text-[#1F1F1F] flex flex-col justify-between items-center px-6 py-4 font-sans overflow-hidden selection:bg-[#D3E3FD] selection:text-[#041E49]">
      {/* Centered Main Wrapper: Brand Header & Auth Card */}
      <div className="w-full max-w-5xl mx-auto my-auto flex flex-col gap-3 shrink">
        {/* Top Brand Bar */}
        <header className="w-full flex items-center justify-between py-0.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0B57D0] flex items-center justify-center text-white shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <span className="font-normal text-xl text-[#1F1F1F] tracking-tight font-sans">
              Sendaat
            </span>
          </div>
        </header>

        {/* Main Google Workspace Split Container Card */}
        <div className="w-full bg-white rounded-[28px] border border-[#DADCE0] shadow-[0_1px_3px_0_rgba(60,64,67,0.08),0_4px_12px_4px_rgba(60,64,67,0.04)] overflow-hidden font-sans">
        <div className="grid md:grid-cols-12 items-stretch">
          {/* Left Column: Product Intro */}
          <div className="md:col-span-5 p-6 sm:p-8 md:p-8 bg-[#F8F9FA] border-r border-[#E1E3E1] flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-normal text-[#1F1F1F] tracking-tight leading-snug">
                High-deliverability email infrastructure.
              </h2>
              <p className="text-[#444746] text-xs sm:text-sm leading-relaxed font-normal">
                Sendaat powers high-volume cold outreach, candidate sourcing, and transactional email dispatch with automated IP warming and real-time domain score protection.
              </p>
            </div>

            {/* Clean Feature Highlights */}
            <div className="space-y-3 pt-4 border-t border-[#E1E3E1]">
              <div className="text-xs text-[#1F1F1F] leading-normal">
                <div className="font-semibold text-[#1F1F1F]">99.8% Inbox Placement</div>
                <div className="text-[#5F6368] text-[11px]">Automated IP warmup, DKIM signing, and SPF authentication.</div>
              </div>

              <div className="text-xs text-[#1F1F1F] leading-normal">
                <div className="font-semibold text-[#1F1F1F]">Sub-150ms Dispatch Latency</div>
                <div className="text-[#5F6368] text-[11px]">High-throughput queue architecture for enterprise scale.</div>
              </div>

              <div className="text-xs text-[#1F1F1F] leading-normal">
                <div className="font-semibold text-[#1F1F1F]">Scraped Address Shield</div>
                <div className="text-[#5F6368] text-[11px]">Real-time bounce suppression guarding your sender score.</div>
              </div>
            </div>

            <div className="text-[10px] text-[#747775]">
              Sendaat Enterprise Infrastructure Protocol
            </div>
          </div>

          {/* Right Column: Production Form */}
          <div className="md:col-span-7 p-6 sm:p-8 md:p-8 bg-white flex items-center justify-center">
            {authMode === 'login' ? (
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onOpenForgotPassword={handleOpenForgotPassword}
                onSwitchToSignup={() => setAuthMode('signup')}
              />
            ) : (
              <SignupForm
                onSignupSuccess={onLoginSuccess}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between py-1 text-xs text-[#5F6368] font-sans shrink-0">
        <div className="flex items-center gap-2">
          <span>English (United States)</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setHelpModalOpen(true)}
            className="hover:text-[#1F1F1F] transition-colors focus:outline-none"
          >
            Help
          </button>
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="hover:text-[#1F1F1F] transition-colors focus:outline-none"
          >
            Privacy
          </button>
          <button
            onClick={() => setTermsModalOpen(true)}
            className="hover:text-[#1F1F1F] transition-colors focus:outline-none"
          >
            Terms &amp; Conditions
          </button>
        </div>
      </footer>

      {/* Interactive Modals */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialEmail={forgotPasswordEmail}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </div>
  );
}
