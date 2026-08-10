import React, { useState } from 'react';
import { Mail, X, CheckCircle2, ShieldAlert, KeyRound, ArrowRight, ShieldCheck, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { getRegisteredUsers, updateUserPassword } from '../../utils/userStore';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState(1); // 1: Email entry, 2: Verification Code & Password entry, 3: Success
  const [matchedUser, setMatchedUser] = useState(null);
  
  // SMTP Config for Live Delivery
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [smtpUser, setSmtpUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_smtpConfig');
      return saved ? JSON.parse(saved).user || '' : '';
    } catch (e) {
      return '';
    }
  });
  const [smtpPass, setSmtpPass] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_smtpConfig');
      return saved ? JSON.parse(saved).pass || '' : '';
    } catch (e) {
      return '';
    }
  });

  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('sandbox');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    // Verify email is registered in userStore
    const users = getRegisteredUsers();
    const registered = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!registered) {
      setErrorMsg('No registered account found with this email address. Please create an account.');
      return;
    }

    setMatchedUser(registered);
    setErrorMsg('');
    setIsLoading(true);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);

    try {
      // Save SMTP settings if entered
      if (smtpUser && smtpPass) {
        localStorage.setItem('skillbridge_smtpConfig', JSON.stringify({ mode: 'gmail', user: smtpUser, pass: smtpPass }));
      }

      // Send real email via backend server
      const resp = await fetch('http://localhost:3001/api/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          otpCode,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined 
        })
      });

      const data = await resp.json();
      setIsLoading(false);

      if (data.mode === 'sandbox' || data.fallback || !resp.ok) {
        setDeliveryMode('sandbox');
        setInfoMsg(`Security sandbox code generated for ${cleanEmail}: ${data.otpCode || otpCode}`);
      } else {
        setDeliveryMode('gmail');
        setInfoMsg(`A 6-digit verification code was sent to ${cleanEmail}. Please check your email inbox.`);
      }

      setErrorMsg('');
      setStep(2);
    } catch (err) {
      setIsLoading(false);
      setDeliveryMode('sandbox');
      setInfoMsg(`Security sandbox code generated for ${cleanEmail}: ${otpCode}`);
      setErrorMsg('');
      setStep(2);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (userOtpInput.trim() !== generatedOtp) {
      setErrorMsg('Invalid 6-digit email verification code. Please check your email and try again.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    // Cryptographically verify Google Authenticator 2FA token if 2FA enabled
    if (matchedUser?.twoFactorEnabled) {
      if (!twoFactorCodeInput || twoFactorCodeInput.trim().length < 6) {
        setErrorMsg('Google Authenticator 2FA is enabled for this account. Please enter your 6-digit Authenticator code.');
        return;
      }

      setIsLoading(true);
      try {
        const resp2fa = await fetch('http://localhost:3001/api/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: twoFactorCodeInput.trim(), secret: matchedUser.twoFactorSecret })
        });
        const data2fa = await resp2fa.json();
        if (!data2fa.valid) {
          setIsLoading(false);
          setErrorMsg('Invalid 6-digit Google Authenticator code. Please check your app and enter the current token.');
          return;
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMsg('Failed to verify Google Authenticator code. Please try again.');
        return;
      }
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        updateUserPassword(email, newPassword);
        setIsLoading(false);
        setStep(3);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.message || 'Failed to update password.');
      }
    }, 600);
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setUserOtpInput('');
    setTwoFactorCodeInput('');
    setNewPassword('');
    setErrorMsg('');
    setInfoMsg('');
    setMatchedUser(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_12px_4px_rgba(60,64,67,0.08)] border border-[#DADCE0] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#747775] hover:text-[#1F1F1F] rounded-full hover:bg-[#F8F9FA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* STEP 1: Enter Registered Email */}
          {step === 1 && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-normal text-[#1F1F1F] tracking-tight">
                Reset your password
              </h2>
              <p className="text-[#444746] text-sm mt-1.5 leading-relaxed font-normal">
                Enter your registered work email address. We will send a 6-digit verification code to reset your password.
              </p>

              {errorMsg && (
                <div className="mt-4 p-3 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs rounded-xl font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="mt-5 space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    Registered work email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="benedict@sendaat.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-sm outline-none transition-all"
                  />
                </div>



                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full text-[#444746] hover:bg-[#F8F9FA] text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-6 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium rounded-full shadow-xs transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send reset code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* STEP 2: Enter Verification Codes & Set New Password */}
          {step === 2 && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center mb-5">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-normal text-[#1F1F1F] tracking-tight">
                Enter verification code
              </h2>
              <p className="text-[#444746] text-sm mt-1 leading-relaxed">
                {infoMsg || `A 6-digit verification code was sent to ${email}`}
              </p>

              {errorMsg && (
                <div className="mt-3 p-3 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs rounded-xl font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="mt-5 space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    6-Digit Email Verification Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={userOtpInput}
                    onChange={(e) => setUserOtpInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-center font-mono text-lg tracking-[6px] outline-none transition-all"
                  />
                </div>

                {/* Google Authenticator Prompt if enabled on account */}
                {matchedUser?.twoFactorEnabled && (
                  <div className="p-3 bg-[#F0F4F9] border border-[#D3E3FD] rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B57D0]">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Google Authenticator Required (2FA Protected)</span>
                    </div>
                    <label className="block text-xs font-medium text-[#444746]">
                      6-Digit Authenticator App Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000 000"
                      value={twoFactorCodeInput}
                      onChange={(e) => setTwoFactorCodeInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-center font-mono text-base tracking-[6px] outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-sm outline-none transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#0B57D0] font-medium hover:underline"
                  >
                    Resend code
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !userOtpInput || !newPassword || (matchedUser?.twoFactorEnabled && !twoFactorCodeInput)}
                    className="px-6 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium rounded-full shadow-xs transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* STEP 3: Password Reset Success */}
          {step === 3 && (
            <div className="text-center py-4 font-sans">
              <div className="w-12 h-12 bg-[#E6F4EA] text-[#137333] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-normal text-[#1F1F1F]">Password Reset Complete</h2>
              <p className="text-[#444746] text-sm mt-2 leading-relaxed">
                Your password for <span className="font-semibold text-[#1F1F1F]">{email}</span> has been updated successfully. You can now sign in.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-7 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-xs rounded-full shadow-xs transition-colors"
              >
                Sign in to Sendaat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
