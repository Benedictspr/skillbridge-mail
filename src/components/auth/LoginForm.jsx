import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { validateCredentials, validateCredentialsAsync } from '../../utils/userStore';

export default function LoginForm({ onLoginSuccess, onOpenForgotPassword, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const [step, setStep] = useState('login'); // 'login' | '2fa'
  const [pendingUser, setPendingUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await validateCredentialsAsync(cleanEmail, password);
      setIsLoading(false);

      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      if (result.user.twoFactorEnabled) {
        setPendingUser(result.user);
        setStep('2fa');
      } else {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Authentication error. Please try again.');
    }
  };

  const loadLiveQrCode = async (userEmail) => {
    try {
      const resp = await fetch('http://localhost:3001/api/2fa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await resp.json();
      if (data.success) {
        setQrCodeUrl(data.qrCodeDataUrl);
      }
    } catch (err) {
      console.error('Failed to load QR code:', err);
    }
  };

  const toggleQrView = async () => {
    const nextState = !showQrModal;
    setShowQrModal(nextState);
    if (nextState && !qrCodeUrl && pendingUser) {
      await loadLiveQrCode(pendingUser.email);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit code from Google Authenticator.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const resp = await fetch('http://localhost:3001/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: twoFactorCode.trim(), secret: pendingUser?.twoFactorSecret })
      });
      const data = await resp.json();
      setIsLoading(false);

      if (data.valid) {
        onLoginSuccess(pendingUser);
      } else {
        setErrorMsg('Invalid 6-digit Google Authenticator code. Please check your app and enter the current token.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to verify 2FA code. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-[380px] mx-auto font-sans text-white">
      {step === 'login' ? (
        <>
          {/* Header - Google Sans Normal */}
          <div className="mb-5">
            <h1 className="text-2xl font-normal text-white tracking-tight">
              Sign in
            </h1>
            <p className="text-zinc-400 text-xs mt-1 font-normal">
              to continue to Sendaat Workspace
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 px-3.5 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Work email address
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onOpenForgotPassword(email)}
                  className="text-xs text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none transition-all font-sans font-normal placeholder-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Create account
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
                    <span>Sign in</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        /* STEP 2: Google Authenticator 2-Factor Authentication (2FA) */
        <div className="animate-fade-in font-sans">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-4 border border-zinc-800">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <h2 className="text-2xl font-normal text-white tracking-tight">
            2-Step Verification
          </h2>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed font-normal">
            Enter the 6-digit code generated by your <strong>Google Authenticator</strong> app for <span className="font-semibold text-white">{pendingUser?.email}</span>.
          </p>

          {errorMsg && (
            <div className="mt-3 px-3.5 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify2FA} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Google Authenticator Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000 000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-center font-mono text-xl tracking-[8px] outline-none transition-all"
              />
            </div>

            <button
              type="button"
              onClick={toggleQrView}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQrModal ? 'Hide Secret Key & QR Code' : 'View Authenticator QR Code & Secret'}</span>
            </button>

            {showQrModal && (
              <div className="p-3 bg-black border border-zinc-800 rounded-xl text-center animate-fade-in">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-28 h-28 mx-auto mb-2 rounded-lg bg-white p-1" />
                ) : (
                  <div className="w-28 h-28 mx-auto flex items-center justify-center text-xs text-zinc-500 font-mono">
                    Loading QR code...
                  </div>
                )}
                <span className="font-mono text-xs text-emerald-400 font-bold tracking-wider select-all">
                  {pendingUser?.twoFactorSecret || 'SENDAAT-2FA-784920'}
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
              >
                Back to Sign in
              </button>

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length < 6}
                className="px-6 py-2 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-full shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
