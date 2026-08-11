import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, ArrowRight, Mail, ShieldCheck, QrCode, KeyRound, CheckCircle2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { registerUser, getRegisteredUsers } from '../../utils/userStore';

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState('info'); // 'info' | 'verify_email' | 'setup_2fa'
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);
  
  // SMTP Config fields for Live Inbox Delivery
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // OTP & 2FA State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpInput, setTotpInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('sandbox');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-600' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-emerald-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
      default:
        return { score: 15, label: 'Weak', color: 'bg-rose-600' };
    }
  };

  const strength = getPasswordStrength(password);

  // Helper to send email OTP code via server
  const sendEmailOtp = async (cleanEmail, cleanName, code) => {
    try {
      if (smtpUser && smtpPass) {
        localStorage.setItem('skillbridge_smtpConfig', JSON.stringify({ mode: 'gmail', user: smtpUser, pass: smtpPass }));
      }

      const resp = await fetch('http://localhost:3001/api/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          name: cleanName, 
          otpCode: code,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined
        })
      });
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || 'Email dispatch failed');
      }

      setDeliveryMode(data.mode);
      setErrorMsg('');
      setInfoMsg(`A 6-digit verification code was sent to ${cleanEmail}. Please check your email inbox.`);
    } catch (err) {
      setDeliveryMode('live');
      setErrorMsg(err.message || 'Could not dispatch verification email. Please try again.');
    }
  };

  // Generate live TOTP Secret & QR Code
  const fetchLive2FASecret = async (cleanEmail) => {
    try {
      const resp = await fetch('http://localhost:3001/api/2fa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await resp.json();
      if (data.success) {
        setTwoFactorSecret(data.secret);
        setQrCodeUrl(data.qrCodeDataUrl);
      }
    } catch (err) {
      console.error('Failed to generate live 2FA secret:', err);
    }
  };

  // STEP 1 Submission -> Initiate Email Verification
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid full name and work email.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Please accept the Terms of Service to continue.');
      return;
    }

    const users = getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMsg('An account with this email address already exists. Please sign in.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);

    await sendEmailOtp(cleanEmail, cleanName, otpCode);

    setIsLoading(false);
    setStep('verify_email');
  };

  // STEP 2 Submission -> Confirm Email Verification Code
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (emailOtpInput.trim() !== generatedOtp) {
      setErrorMsg('Invalid 6-digit verification code. Please check your email and try again.');
      return;
    }

    setErrorMsg('');

    if (enable2FA) {
      setIsLoading(true);
      await fetchLive2FASecret(email.trim().toLowerCase());
      setIsLoading(false);
      setStep('setup_2fa');
    } else {
      finalizeRegistration(false, '');
    }
  };

  // Resend Email Code
  const handleResendOtp = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    await sendEmailOtp(email.trim().toLowerCase(), fullName.trim(), newOtp);
    setIsLoading(false);
  };

  // STEP 3 Submission -> Verify Google Authenticator Live TOTP Code
  const handleVerify2FASetup = async (e) => {
    e.preventDefault();
    if (!totpInput || totpInput.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit code from your Google Authenticator app.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const resp = await fetch('http://localhost:3001/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpInput.trim(), secret: twoFactorSecret })
      });
      const data = await resp.json();
      setIsLoading(false);

      if (data.valid) {
        finalizeRegistration(true, twoFactorSecret);
      } else {
        setErrorMsg('Invalid 6-digit Google Authenticator code. Please check your app and enter the current token.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to verify Google Authenticator code. Please try again.');
    }
  };

  // Register user record and log in
  const finalizeRegistration = async (is2FAEnabled, activeSecret) => {
    setIsLoading(true);
    try {
      const userRecord = await registerUser({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        company: companyName.trim(),
        password: password,
        role: 'Workspace Owner',
        isEmailVerified: true,
        twoFactorEnabled: is2FAEnabled,
        twoFactorSecret: activeSecret
      });

      fetch('http://localhost:3001/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userRecord.email,
          name: userRecord.name,
          company: userRecord.company,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined
        })
      }).catch(err => console.error('[WELCOME EMAIL SEND ERROR]', err));

      setIsLoading(false);
      onSignupSuccess(userRecord);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-[380px] mx-auto font-sans text-white animate-fade-in">
      {/* STEP 1: Account Information Form */}
      {step === 'info' && (
        <>
          <div className="mb-4">
            <h1 className="text-2xl font-normal text-white tracking-tight">
              Create account
            </h1>
            <p className="text-zinc-400 text-xs mt-1 font-normal">
              to start using Sendaat Deliverability Engine
            </p>
          </div>

          {errorMsg && (
            <div className="mb-3.5 px-3 py-2 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleInfoSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Full name *
              </label>
              <input
                type="text"
                required
                placeholder="Maverick Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none transition-all font-sans font-normal placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Work email address *
              </label>
              <input
                type="email"
                required
                placeholder="maverick@sendaat.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none transition-all font-sans font-normal placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Company or Organization
              </label>
              <input
                type="text"
                placeholder="Acme Global Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none transition-all font-sans font-normal placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Use 8 or more characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none transition-all font-sans font-normal placeholder-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Strength:</span>
                    <span className="font-medium text-white">{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Google Authenticator Option Toggle */}
            <div className="p-3 bg-black border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs text-white font-medium">Add Google Authenticator 2FA</span>
              </div>
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 accent-white cursor-pointer"
              />
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-zinc-700 accent-white cursor-pointer"
                />
                <span className="text-[11px] text-zinc-400 leading-snug">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>

            {/* Action Row */}
            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Sign in instead
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}

      {/* STEP 2: Email Verification Code Step */}
      {step === 'verify_email' && (
        <div className="animate-fade-in font-sans">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-3 border border-zinc-800">
            <Mail className="w-5 h-5" />
          </div>

          <h2 className="text-2xl font-normal text-white tracking-tight">
            Verify your email
          </h2>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed font-normal">
            {infoMsg || `A 6-digit verification code was sent to ${email}`}
          </p>

          {errorMsg && (
            <div className="mt-3 px-3 py-2 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyEmail} className="mt-4 space-y-4 font-sans">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={emailOtpInput}
                onChange={(e) => setEmailOtpInput(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-center font-mono text-xl tracking-[8px] outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
              >
                {isLoading ? 'Resending...' : 'Resend email code'}
              </button>

              <button
                type="submit"
                disabled={isLoading || emailOtpInput.length < 6}
                className="px-6 py-2 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Live Google Authenticator Setup Step */}
      {step === 'setup_2fa' && (
        <div className="animate-fade-in text-center font-sans">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-3 border border-zinc-800">
            <QrCode className="w-5 h-5" />
          </div>

          <h2 className="text-xl font-normal text-white tracking-tight">
            Set up Google Authenticator
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-normal">
            Scan this live QR code using your <strong>Google Authenticator</strong> app on your phone.
          </p>

          <div className="my-3 p-3 bg-black border border-zinc-800 rounded-2xl inline-block shadow-xs">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Google Authenticator Live QR Code" className="w-36 h-36 mx-auto rounded-lg bg-white p-1" />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-xs text-zinc-500 font-mono">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="mb-3 p-2 bg-black rounded-xl font-mono text-xs text-emerald-400 font-bold tracking-widest border border-zinc-800 select-all">
            {twoFactorSecret || 'Generating Secret...'}
          </div>

          {errorMsg && (
            <div className="mb-3 px-3 py-2 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify2FASetup} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Enter 6-digit Authenticator Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000 000"
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-center font-mono text-lg tracking-[6px] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || totpInput.length < 6}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-full shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
              ) : (
                <span>Verify & Finish Setup</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
