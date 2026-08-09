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
    if (!pwd) return { score: 0, label: '', color: 'bg-[#E1E3E1]' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-[#B3261E]' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-[#E67C73]' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-[#1A73E8]' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-[#188038]' };
      default:
        return { score: 15, label: 'Weak', color: 'bg-[#B3261E]' };
    }
  };

  const strength = getPasswordStrength(password);

  // Helper to send email OTP code via server
  const sendEmailOtp = async (cleanEmail, cleanName, code) => {
    try {
      // Save SMTP credentials locally if provided
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

    // Check if user already exists
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

    // If 2FA requested, fetch live secret and move to Google Authenticator pairing screen
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
      // Verify TOTP code against server cryptographic TOTP verification endpoint
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
  const finalizeRegistration = (is2FAEnabled, activeSecret) => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const userRecord = registerUser({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          company: companyName.trim(),
          password: password,
          role: 'Workspace Owner',
          isEmailVerified: true,
          twoFactorEnabled: is2FAEnabled,
          twoFactorSecret: activeSecret
        });

        // Dispatch Welcome Greeting Email to user inbox
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
        setErrorMsg(err.message || 'Registration failed.');
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-[380px] mx-auto font-sans animate-fade-in">
      {/* STEP 1: Account Information Form */}
      {step === 'info' && (
        <>
          <div className="mb-4">
            <h1 className="text-2xl font-normal text-[#1F1F1F] tracking-tight">
              Create account
            </h1>
            <p className="text-[#444746] text-xs mt-1">
              to start using Sendaat Deliverability Engine
            </p>
          </div>

          {errorMsg && (
            <div className="mb-3.5 px-3 py-2 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C5221F] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleInfoSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1">
                Full name *
              </label>
              <input
                type="text"
                required
                placeholder="Benedict Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-xs outline-none transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1">
                Work email address *
              </label>
              <input
                type="email"
                required
                placeholder="benedict@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-xs outline-none transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1">
                Company or Organization
              </label>
              <input
                type="text"
                placeholder="Acme Global Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-xs outline-none transition-all font-sans"
              />
            </div>



            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Use 8 or more characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 pr-10 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-xs outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#747775] hover:text-[#1F1F1F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#5F6368]">
                    <span>Strength:</span>
                    <span className="font-medium text-[#1F1F1F]">{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-[#E1E3E1] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Google Authenticator Option Toggle */}
            <div className="p-3 bg-[#F0F4F9] border border-[#D3E3FD] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B57D0] shrink-0" />
                <span className="text-xs text-[#1F1F1F] font-medium">Add Google Authenticator 2FA</span>
              </div>
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="w-4 h-4 rounded border-[#747775] text-[#0B57D0] focus:ring-[#0B57D0] cursor-pointer"
              />
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-[#747775] text-[#0B57D0] focus:ring-[#0B57D0]"
                />
                <span className="text-[11px] text-[#444746] leading-snug">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>

            {/* Action Row */}
            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-medium text-[#0B57D0] hover:underline transition-colors"
              >
                Sign in instead
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="w-10 h-10 rounded-2xl bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>

          <h2 className="text-2xl font-normal text-[#1F1F1F] tracking-tight">
            Verify your email
          </h2>
          <p className="text-[#444746] text-xs mt-1 leading-relaxed font-normal">
            {infoMsg || `A 6-digit verification code was sent to ${email}`}
          </p>

          {errorMsg && (
            <div className="mt-3 px-3 py-2 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C5221F] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyEmail} className="mt-4 space-y-4 font-sans">
            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={emailOtpInput}
                onChange={(e) => setEmailOtpInput(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-center font-mono text-xl tracking-[8px] outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-xs text-[#0B57D0] hover:underline font-medium"
              >
                {isLoading ? 'Resending...' : 'Resend email code'}
              </button>

              <button
                type="submit"
                disabled={isLoading || emailOtpInput.length < 6}
                className="px-6 py-2 bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="w-10 h-10 rounded-2xl bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-5 h-5" />
          </div>

          <h2 className="text-xl font-normal text-[#1F1F1F] tracking-tight">
            Set up Google Authenticator
          </h2>
          <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
            Scan this live QR code using your <strong>Google Authenticator</strong> app on your phone.
          </p>

          <div className="my-3 p-3 bg-white border border-[#DADCE0] rounded-2xl inline-block shadow-xs">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Google Authenticator Live QR Code" className="w-36 h-36 mx-auto rounded-lg" />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-xs text-[#5F6368]">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="mb-3 p-2 bg-[#F0F4F9] rounded-xl font-mono text-xs text-[#0B57D0] font-bold tracking-widest border border-[#DADCE0] select-all">
            {twoFactorSecret || 'Generating Secret...'}
          </div>

          {errorMsg && (
            <div className="mb-3 px-3 py-2 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs rounded-xl font-medium flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-[#C5221F] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify2FASetup} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1">
                Enter 6-digit Authenticator Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000 000"
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-center font-mono text-lg tracking-[6px] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || totpInput.length < 6}
              className="w-full py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-xs rounded-full shadow-xs transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
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
