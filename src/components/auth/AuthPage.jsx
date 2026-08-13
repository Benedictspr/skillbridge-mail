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
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between items-center px-4 sm:px-6 py-4 font-sans overflow-y-auto select-none">
      {/* Centered Main Wrapper: Brand Header & Auth Card */}
      <div className="w-full max-w-5xl mx-auto my-auto py-2 flex flex-col gap-3 shrink-0">
        {/* Top Brand Bar */}
        <header className="w-full flex items-center justify-between py-0.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4 text-black" />
            </div>
            <span className="font-normal text-xl text-white tracking-tight font-sans">
              Sendaat
            </span>
          </div>
        </header>

        {/* Main Monochromatic Container Card */}
        <div className="w-full bg-[#121212] rounded-[28px] border border-zinc-800 shadow-2xl overflow-hidden font-sans">
          <div className="grid md:grid-cols-12 items-stretch">
            {/* Left Column: Product Intro */}
            <div className="md:col-span-5 p-5 sm:p-7 md:p-8 bg-black border-r border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight leading-snug">
                  High-deliverability email infrastructure.
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                  Sendaat powers high-volume cold outreach, candidate sourcing, and transactional email dispatch with automated IP warming and real-time domain score protection.
                </p>
              </div>

              {/* Clean Feature Highlights */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-800">
                <div className="text-xs leading-normal">
                  <div className="font-semibold text-white">99.8% Inbox Placement</div>
                  <div className="text-zinc-400 text-[11px] font-normal">Automated IP warmup, DKIM signing, and SPF authentication.</div>
                </div>

                <div className="text-xs leading-normal">
                  <div className="font-semibold text-white">Sub-150ms Dispatch Latency</div>
                  <div className="text-zinc-400 text-[11px] font-normal">High-throughput queue architecture for enterprise scale.</div>
                </div>

                <div className="text-xs leading-normal">
                  <div className="font-semibold text-white">Scraped Address Shield</div>
                  <div className="text-zinc-400 text-[11px] font-normal">Real-time bounce suppression guarding your sender score.</div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Login / Signup Form Container */}
            <div className="md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-center bg-[#121212] overflow-y-auto">
              {authMode === 'login' ? (
                <LoginForm 
                  onLoginSuccess={onLoginSuccess}
                  onSwitchToSignup={() => setAuthMode('signup')}
                  onOpenForgotPassword={handleOpenForgotPassword}
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

      {/* Footer Navigation */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-500 py-1 shrink-0 font-sans font-normal">
        <span>English (United States)</span>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setHelpModalOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Help
          </button>
          <button 
            onClick={() => setPrivacyModalOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button 
            onClick={() => setTermsModalOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms & Conditions
          </button>
        </div>
      </footer>

      {/* Modals */}
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
