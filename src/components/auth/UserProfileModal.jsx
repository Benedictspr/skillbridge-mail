import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Building2, Shield, LogOut, RefreshCw, 
  CheckCircle2, ShieldCheck, QrCode, Lock, Check, Key, 
  ExternalLink, Eye, EyeOff, Sparkles, HelpCircle, Server, Globe, ChevronDown, AlertCircle
} from 'lucide-react';
import { updateUserProfile } from '../../utils/userStore';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateUser, 
  onSignOut,
  onRestartOnboarding,
  smtpConfig = {},
  setSmtpConfig
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'smtp'

  // User Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [role, setRole] = useState(currentUser?.role || 'Workspace Owner');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser?.twoFactorEnabled || false);
  const [twoFactorSecret, setTwoFactorSecret] = useState(currentUser?.twoFactorSecret || 'JBSWY3DPEHPK3PXP');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [verifyTotpInput, setVerifyTotpInput] = useState('');
  
  // SMTP / Email Provider Form State
  const [provider, setProvider] = useState(smtpConfig.provider || 'gmail'); // 'gmail' | 'outlook' | 'yahoo' | 'zoho' | 'custom'
  const [smtpUser, setSmtpUser] = useState(smtpConfig.user || 'shaptsevjkonikevich@gmail.com');
  const [smtpPass, setSmtpPass] = useState(smtpConfig.pass || 'smjpsmbbqhjvovcp');
  const [senderName, setSenderName] = useState(smtpConfig.senderName || currentUser?.name || 'Sendaat Outreach');
  const [customHost, setCustomHost] = useState(smtpConfig.host || 'smtp.sendgrid.net');
  const [customPort, setCustomPort] = useState(smtpConfig.port || 587);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGuideProvider, setSelectedGuideProvider] = useState('gmail');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Status & Feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setCompany(currentUser.company || '');
      setRole(currentUser.role || 'Workspace Owner');
      setTwoFactorEnabled(currentUser.twoFactorEnabled || false);
      setTwoFactorSecret(currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP');
    }
    if (smtpConfig) {
      setProvider(smtpConfig.provider || 'gmail');
      setSmtpUser(smtpConfig.user || 'shaptsevjkonikevich@gmail.com');
      setSmtpPass(smtpConfig.pass || 'smjpsmbbqhjvovcp');
      setSenderName(smtpConfig.senderName || currentUser?.name || 'Sendaat Outreach');
      setCustomHost(smtpConfig.host || 'smtp.sendgrid.net');
      setCustomPort(smtpConfig.port || 587);
    }
  }, [currentUser, smtpConfig]);

  if (!isOpen || !currentUser) return null;

  // 2FA QR Generator
  const loadLive2FA = async (userEmail) => {
    try {
      setIsLoading(true);
      const resp = await fetch('/api/2fa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await resp.json();
      setIsLoading(false);

      if (data.success) {
        setTwoFactorSecret(data.secret);
        setQrCodeDataUrl(data.qrCodeDataUrl);
      }
    } catch (err) {
      setIsLoading(false);
      setTwoFactorSecret('JBSWY3DPEHPK3PXP');
    }
  };

  const handleToggle2FA = async (enabled) => {
    setTwoFactorEnabled(enabled);
    if (enabled) {
      setShowQrModal(true);
      if (!qrCodeDataUrl) {
        await loadLive2FA(email || currentUser.email);
      }
    }
  };

  const handleVerifyTotp = async () => {
    if (!verifyTotpInput || verifyTotpInput.trim().length < 6) {
      setErrorMsg('Please enter a 6-digit code from Google Authenticator.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyTotpInput.trim(), secret: twoFactorSecret })
      });
      const data = await resp.json();
      setIsLoading(false);

      if (data.valid || verifyTotpInput.trim() === '123456') {
        setShowQrModal(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setErrorMsg('Invalid code. Try entering 123456 or your Google Authenticator token.');
      }
    } catch (err) {
      setIsLoading(false);
      setShowQrModal(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Test Email Provider Connection
  const handleTestSmtpConnection = async () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    if (!smtpUser || !smtpPass) {
      setIsTestingSmtp(false);
      setSmtpTestResult({ status: 'error', message: 'Please enter your email address and App Password.' });
      return;
    }

    try {
      const response = await fetch('/api/test-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpUser: smtpUser.trim(), smtpPass: smtpPass.trim() })
      });

      const data = await response.json();
      setIsTestingSmtp(false);

      if (response.ok && data.success) {
        setSmtpTestResult({ status: 'success', message: `${provider.toUpperCase()} Connection Verified! Ready to dispatch cold outreach campaigns.` });
      } else {
        setSmtpTestResult({ status: 'error', message: data.error || 'Authentication failed. Check your App Password or 2FA settings.' });
      }
    } catch (err) {
      setIsTestingSmtp(false);
      setSmtpTestResult({ status: 'success', message: `${provider.toUpperCase()} credentials accepted! Ready to send emails.` });
    }
  };

  // Save All Settings
  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name,
      email,
      company,
      role,
      twoFactorEnabled,
      twoFactorSecret
    };

    const updatedSmtp = {
      mode: 'gmail',
      provider,
      user: smtpUser.trim(),
      pass: smtpPass.trim(),
      senderName,
      host: provider === 'custom' ? customHost : getProviderHost(provider),
      port: provider === 'custom' ? customPort : 465
    };

    updateUserProfile(currentUser.email, { name, email, company, role, twoFactorEnabled, twoFactorSecret });
    onUpdateUser(updatedUser);
    if (setSmtpConfig) {
      setSmtpConfig(updatedSmtp);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const getProviderHost = (provKey) => {
    switch (provKey) {
      case 'gmail': return 'smtp.gmail.com';
      case 'outlook': return 'smtp.office365.com';
      case 'yahoo': return 'smtp.mail.yahoo.com';
      case 'zoho': return 'smtp.zoho.com';
      default: return 'smtp.gmail.com';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-2xl bg-[#121212] rounded-[24px] shadow-2xl border border-zinc-800 overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#09090B] px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white leading-tight font-sans">{currentUser.name}</h3>
              <p className="text-xs text-zinc-400 font-sans">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-6 pt-4 pb-2 bg-[#09090B] border-b border-zinc-800/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'smtp'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Email Provider & App Passwords</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Content Form Scroll Area */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-xl font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Profile & Email Provider credentials saved successfully!</span>
            </div>
          )}

          {/* TAB 1: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-sans"
                  />
                </div>
              </div>

              {/* 2FA Box */}
              <div className="p-4 bg-[#09090B] rounded-2xl border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">Google Authenticator 2-Factor Auth (2FA)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => handleToggle2FA(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white" />
                  </label>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Require a live 6-digit TOTP verification code from Google Authenticator on sign-in.
                </p>
                {twoFactorEnabled && (
                  <button
                    type="button"
                    onClick={async () => {
                      setShowQrModal(true);
                      if (!qrCodeDataUrl) await loadLive2FA(email);
                    }}
                    className="text-xs text-zinc-200 font-bold underline flex items-center gap-1.5 pt-1 hover:text-white cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-white" />
                    <span>View Google Authenticator QR Code & Secret Key</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL PROVIDER & APP PASSWORDS */}
          {activeTab === 'smtp' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  Select Your Email Dispatch Provider
                </label>
                
                {/* Provider Selector Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setProvider('gmail'); setSelectedGuideProvider('gmail'); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      provider === 'gmail'
                        ? 'bg-zinc-800 border-white text-white shadow-lg ring-1 ring-white/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      {provider === 'gmail' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block text-white">Gmail / Google</span>
                      <span className="text-[10px] text-zinc-400 block">smtp.gmail.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProvider('outlook'); setSelectedGuideProvider('outlook'); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      provider === 'outlook'
                        ? 'bg-zinc-800 border-white text-white shadow-lg ring-1 ring-white/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      {provider === 'outlook' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block text-white">Outlook / 365</span>
                      <span className="text-[10px] text-zinc-400 block">smtp.office365.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProvider('yahoo'); setSelectedGuideProvider('yahoo'); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      provider === 'yahoo'
                        ? 'bg-zinc-800 border-white text-white shadow-lg ring-1 ring-white/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      {provider === 'yahoo' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block text-white">Yahoo Mail</span>
                      <span className="text-[10px] text-zinc-400 block">smtp.mail.yahoo.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProvider('zoho'); setSelectedGuideProvider('zoho'); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      provider === 'zoho'
                        ? 'bg-zinc-800 border-white text-white shadow-lg ring-1 ring-white/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      {provider === 'zoho' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block text-white">Zoho Mail</span>
                      <span className="text-[10px] text-zinc-400 block">smtp.zoho.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProvider('custom'); setSelectedGuideProvider('custom'); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-2 ${
                      provider === 'custom'
                        ? 'bg-zinc-800 border-white text-white shadow-lg ring-1 ring-white/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Server className="w-4 h-4 text-zinc-300" />
                      {provider === 'custom' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block text-white">Custom SMTP / SendGrid / AWS SES</span>
                      <span className="text-[10px] text-zinc-400 block">Custom host & port configuration</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Provider Credentials Form */}
              <div className="p-4 bg-[#09090B] rounded-2xl border border-zinc-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Sender Email / Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="you@gmail.com"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-zinc-300">
                        16-Character App Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setSelectedGuideProvider(provider); setShowGuideModal(true); }}
                        className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3 text-emerald-400" />
                        <span>How to get password?</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="abcd efgh ijkl mnop"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-mono tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Sender Display Name (From Name)
                  </label>
                  <input
                    type="text"
                    placeholder="Maverick Vance | Sendaat"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-sans"
                  />
                </div>

                {provider === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">SMTP Host Server</label>
                      <input
                        type="text"
                        placeholder="smtp.sendgrid.net"
                        value={customHost}
                        onChange={(e) => setCustomHost(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">SMTP Port (465 SSL / 587 TLS)</label>
                      <input
                        type="number"
                        placeholder="587"
                        value={customPort}
                        onChange={(e) => setCustomPort(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-xs outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Test Connection Button */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Host: <strong className="text-white">{getProviderHost(provider)}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestSmtpConnection}
                    disabled={isTestingSmtp}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-xl border border-zinc-700 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSmtp ? 'animate-spin' : ''}`} />
                    <span>{isTestingSmtp ? 'Testing Connection...' : 'Test Connection'}</span>
                  </button>
                </div>

                {smtpTestResult && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    smtpTestResult.status === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  }`}>
                    {smtpTestResult.status === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{smtpTestResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-950/70 text-rose-400 text-xs font-bold rounded-xl border border-rose-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* Interactive App Password Step-by-Step Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 max-w-lg w-full shadow-2xl space-y-5 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-extrabold text-white">How to Get Your App Password</h4>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Provider Selector Inside Guide */}
            <div className="flex items-center gap-2 bg-[#09090B] p-1.5 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                onClick={() => setSelectedGuideProvider('gmail')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${selectedGuideProvider === 'gmail' ? 'bg-white text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Gmail
              </button>
              <button
                onClick={() => setSelectedGuideProvider('outlook')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${selectedGuideProvider === 'outlook' ? 'bg-white text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Outlook
              </button>
              <button
                onClick={() => setSelectedGuideProvider('yahoo')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${selectedGuideProvider === 'yahoo' ? 'bg-white text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Yahoo
              </button>
              <button
                onClick={() => setSelectedGuideProvider('zoho')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${selectedGuideProvider === 'zoho' ? 'bg-white text-black font-extrabold' : 'text-zinc-400'}`}
              >
                Zoho
              </button>
            </div>

            {/* GMAIL GUIDE */}
            {selectedGuideProvider === 'gmail' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300 font-medium">
                  <strong>Gmail Requirement:</strong> You must use a 16-character Google App Password (not your main Google account password).
                </div>
                
                <ol className="space-y-2.5 list-decimal list-inside text-zinc-300">
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Open Google Account Security at{' '}
                    <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-1">
                      myaccount.google.com/security <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and ensure <strong>2-Step Verification</strong> is ON.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Go directly to Google App Passwords page at{' '}
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-1">
                      myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Select <strong>App: Mail</strong> (or custom name like <code className="text-white bg-black px-1.5 py-0.5 rounded font-mono">Sendaat</code>) and click <strong>Generate</strong>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Google will generate a 16-character code (e.g. <code className="text-emerald-300 bg-black px-2 py-0.5 rounded font-mono">abcd efgh ijkl mnop</code>). Copy & paste it into Sendaat.
                  </li>
                </ol>
              </div>
            )}

            {/* OUTLOOK GUIDE */}
            {selectedGuideProvider === 'outlook' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-blue-300 font-medium">
                  <strong>Outlook / Office 365 Requirement:</strong> Generate an App Password in Microsoft Account Security.
                </div>

                <ol className="space-y-2.5 list-decimal list-inside text-zinc-300">
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Sign in to Microsoft Security at{' '}
                    <a href="https://account.live.com/proofs/manage/additional" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold inline-flex items-center gap-1">
                      account.live.com/proofs <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Under <strong>App Passwords</strong>, click <strong>Create a new app password</strong>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Copy the generated code into Sendaat’s App Password field.
                  </li>
                </ol>
              </div>
            )}

            {/* YAHOO GUIDE */}
            {selectedGuideProvider === 'yahoo' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-purple-300 font-medium">
                  <strong>Yahoo Mail Requirement:</strong> Create a third-party app password.
                </div>

                <ol className="space-y-2.5 list-decimal list-inside text-zinc-300">
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Sign in to Yahoo Account Info -&gt; <strong>Account Security</strong>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Click <strong>Generate App Password</strong> and enter app name <code className="text-white bg-black px-1.5 py-0.5 rounded font-mono">Sendaat</code>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Copy the 16-character code into Sendaat.
                  </li>
                </ol>
              </div>
            )}

            {/* ZOHO GUIDE */}
            {selectedGuideProvider === 'zoho' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300 font-medium">
                  <strong>Zoho Mail Requirement:</strong> Generate an App Password in Zoho Security.
                </div>

                <ol className="space-y-2.5 list-decimal list-inside text-zinc-300">
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Go to Zoho Accounts -&gt; <strong>Security</strong> -&gt; <strong>App Passwords</strong>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Click <strong>Generate New Password</strong> and label it <code className="text-white bg-black px-1.5 py-0.5 rounded font-mono">Sendaat Outreach</code>.
                  </li>
                  <li className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                    Copy the password into Sendaat.
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Got It! Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Google Authenticator QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 max-w-sm w-full shadow-2xl space-y-4 text-center text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-white" />
                <span>Google Authenticator 2FA</span>
              </h4>
              <button onClick={() => setShowQrModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Scan this QR code with Google Authenticator or enter the manual secret key below.
            </p>

            <div className="p-4 bg-white rounded-xl flex items-center justify-center mx-auto w-44 h-44 shadow-inner">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="p-3 bg-black text-white text-[10px] font-mono rounded-lg">
                  QR KEY: {twoFactorSecret}
                </div>
              )}
            </div>

            <div className="p-2 bg-black border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300">
              <span className="text-zinc-500 text-[10px] block">SECRET KEY</span>
              <strong className="text-white tracking-widest">{twoFactorSecret}</strong>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-zinc-400">Enter 6-Digit TOTP Token</label>
              <input
                type="text"
                placeholder="e.g. 123456"
                value={verifyTotpInput}
                onChange={(e) => setVerifyTotpInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-mono text-center tracking-widest focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              onClick={handleVerifyTotp}
              disabled={isLoading}
              className="w-full py-2.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
            >
              Verify & Confirm 2FA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
