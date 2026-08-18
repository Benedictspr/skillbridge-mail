import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, ArrowRight, ShieldCheck, Key, Fingerprint, Lock, Sparkles } from 'lucide-react';
import { validateCredentialsAsync, authenticatePasskeyAsync, authenticateWithGoogleTokenAsync } from '../../utils/userStore';

export default function LoginForm({ onLoginSuccess, onOpenForgotPassword, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Email + Password Sign In
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
        setErrorMsg(result.message || 'Incorrect email or password.');
        return;
      }

      onLoginSuccess(result.user);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Authentication error. Please try again.');
    }
  };

  // 2. Passkey / WebAuthn Sign In
  const handlePasskeyLogin = async () => {
    setErrorMsg('');
    setIsPasskeyLoading(true);

    try {
      const result = await authenticatePasskeyAsync(email.trim() || null);
      setIsPasskeyLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg('Passkey verification failed.');
      }
    } catch (err) {
      setIsPasskeyLoading(false);
      console.warn('Passkey login info:', err.message);
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Passkey authentication was cancelled or timed out.');
      } else {
        setErrorMsg(err.message || 'Passkey authentication failed. Please try password sign-in.');
      }
    }
  };

  // 3. Google OAuth Sign In
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);

    try {
      // In web browser or sandbox, initiate Google OIDC identity flow
      const mockGoogleToken = `mock_google_:google_sub_${email ? email.replace(/[^a-zA-Z0-9]/g, '') : 'default_alex'}:${email || 'alex.google@sendaat.io'}`;
      const result = await authenticateWithGoogleTokenAsync(mockGoogleToken);
      setIsGoogleLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setIsGoogleLoading(false);
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-[380px] mx-auto font-sans text-white">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-normal text-white tracking-tight">
          Sign in
        </h1>
        <p className="text-zinc-400 text-xs mt-1 font-normal">
          to continue to SkillBridge Workspace
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 px-3.5 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Alternative Social / FIDO2 Login Options */}
      <div className="space-y-2 mb-4">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading || isPasskeyLoading}
          className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Passkey Button */}
        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={isPasskeyLoading || isLoading || isGoogleLoading}
          className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>{isPasskeyLoading ? 'Verifying Passkey...' : 'Continue with Passkey'}</span>
        </button>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="h-px bg-zinc-800 flex-1" />
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">or email & password</span>
        <div className="h-px bg-zinc-800 flex-1" />
      </div>

      {/* Password Form */}
      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Work email address
          </label>
          <input
            type="email"
            required
            placeholder="name@company.com"
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
              className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
              className="w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none transition-all font-sans font-normal placeholder-zinc-600 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isPasskeyLoading || isGoogleLoading}
          className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-1"
        >
          {isLoading ? (
            <span>Verifying Credentials...</span>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
        <p className="text-xs text-zinc-400 font-normal">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-white font-medium hover:underline cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
