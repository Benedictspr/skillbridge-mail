import React, { useState } from 'react';
import { Mail, X, CheckCircle2, ShieldAlert, KeyRound, ArrowRight, ShieldCheck, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { getRegisteredUsers, updateUserPassword } from '../../utils/userStore';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState(1); // 1: Email entry, 2: Verification Code & Password entry, 3: Success
  const [matchedUser, setMatchedUser] = useState(null);
  
  // SMTP Config for Live Delivery
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

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
      const resp = await fetch('http://localhost:3001/api/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          name: registered.name, 
          otpCode: otpCode,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined
        })
      });
      const data = await resp.json();
      setIsLoading(false);
      
      setDeliveryMode(data.mode || 'live');
      setInfoMsg(`A 6-digit verification code was sent to ${cleanEmail}. Please check your email inbox.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans text-white select-none">
      <div className="relative w-full max-w-md bg-[#121212] rounded-[28px] shadow-2xl border border-zinc-800 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* STEP 1: Enter Registered Email */}
          {step === 1 && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-normal text-white tracking-tight">
                Reset your password
              </h2>
              <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed font-normal">
                Enter your registered work email address. We will send a 6-digit verification code to reset your password.
              </p>

              {errorMsg && (
                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="mt-5 space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Registered work email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maverick@sendaat.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-sm outline-none transition-all font-sans font-normal placeholder-zinc-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-full shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center mb-5">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-normal text-white tracking-tight">
                Enter verification code
              </h2>
              <p className="text-zinc-400 text-sm mt-1 leading-relaxed font-normal">
                {infoMsg || `A 6-digit verification code was sent to ${email}`}
              </p>

              {errorMsg && (
                <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="mt-5 space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    6-Digit Email Verification Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={userOtpInput}
                    onChange={(e) => setUserOtpInput(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-center font-mono text-lg tracking-[6px] outline-none transition-all"
                  />
                </div>

                {matchedUser?.twoFactorEnabled && (
                  <div className="p-3 bg-black border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Google Authenticator Required (2FA Protected)</span>
                    </div>
                    <label className="block text-xs font-medium text-zinc-400">
                      6-Digit Authenticator App Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000 000"
                      value={twoFactorCodeInput}
                      onChange={(e) => setTwoFactorCodeInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-center font-mono text-base tracking-[6px] outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-sm outline-none transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-zinc-400 font-medium hover:text-white cursor-pointer"
                  >
                    Resend code
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !userOtpInput || !newPassword || (matchedUser?.twoFactorEnabled && !twoFactorCodeInput)}
                    className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
              <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-normal text-white">Password Reset Complete</h2>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                Your password for <span className="font-semibold text-white">{email}</span> has been updated successfully. You can now sign in.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-7 py-2.5 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-full shadow-xs transition-colors cursor-pointer"
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
