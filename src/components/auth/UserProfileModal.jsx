import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building2, Shield, LogOut, RefreshCw, CheckCircle2, ShieldCheck, QrCode, Lock, ShieldAlert } from 'lucide-react';
import { updateUserProfile } from '../../utils/userStore';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateUser, 
  onSignOut,
  onRestartOnboarding
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [role, setRole] = useState(currentUser?.role || 'Workspace Owner');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser?.twoFactorEnabled || false);
  const [twoFactorSecret, setTwoFactorSecret] = useState(currentUser?.twoFactorSecret || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [verifyTotpInput, setVerifyTotpInput] = useState('');
  const [totpVerified, setTotpVerified] = useState(false);
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setCompany(currentUser.company || '');
      setRole(currentUser.role || 'Workspace Owner');
      setTwoFactorEnabled(currentUser.twoFactorEnabled || false);
      setTwoFactorSecret(currentUser.twoFactorSecret || '');
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const loadLive2FA = async (userEmail) => {
    try {
      setIsLoading(true);
      const resp = await fetch('http://localhost:3001/api/2fa/generate', {
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
      console.error('Failed to load 2FA secret & QR code:', err);
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
      setErrorMsg('Please enter the 6-digit code from Google Authenticator.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const resp = await fetch('http://localhost:3001/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyTotpInput.trim(), secret: twoFactorSecret })
      });
      const data = await resp.json();
      setIsLoading(false);

      if (data.valid) {
        setTotpVerified(true);
        setShowQrModal(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setErrorMsg('Invalid Google Authenticator code. Please enter the current 6-digit token.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to verify 2FA code. Please try again.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name,
      email,
      company,
      role,
      twoFactorEnabled,
      twoFactorSecret
    };

    updateUserProfile(currentUser.email, { name, email, company, role, twoFactorEnabled, twoFactorSecret });
    onUpdateUser(updated);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-[0_1px_3px_0_rgba(60,64,67,0.1),0_4px_12px_4px_rgba(60,64,67,0.08)] border border-[#DADCE0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F8F9FA] px-6 py-5 border-b border-[#E1E3E1] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0B57D0]/20"
            />
            <div>
              <h3 className="text-base font-semibold text-[#1F1F1F]">{currentUser.name}</h3>
              <p className="text-xs text-[#5F6368] font-mono">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#747775] hover:text-[#1F1F1F] rounded-full hover:bg-[#E1E3E1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#137333]" />
              <span>Profile settings saved successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-xl text-[#1F1F1F] text-xs outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-xl text-[#1F1F1F] text-xs outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                Workspace
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-xl text-[#1F1F1F] text-xs outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] mb-1.5">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-xl text-[#1F1F1F] text-xs outline-none font-sans"
              />
            </div>
          </div>

          {/* 2-Factor Authentication (2FA) Google Authenticator Box */}
          <div className="p-4 bg-[#F0F4F9] rounded-2xl border border-[#DADCE0] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B57D0]" />
                <span className="text-xs font-semibold text-[#1F1F1F]">Google Authenticator 2-Factor Auth (2FA)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => handleToggle2FA(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#C4C7C5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B57D0]" />
              </label>
            </div>
            <p className="text-[11px] text-[#444746] leading-relaxed">
              Require a live 6-digit TOTP verification code from Google Authenticator on every sign-in.
            </p>
            {twoFactorEnabled && (
              <button
                type="button"
                onClick={async () => {
                  setShowQrModal(true);
                  if (!qrCodeDataUrl) await loadLive2FA(email);
                }}
                className="text-xs text-[#0B57D0] font-medium hover:underline flex items-center gap-1 pt-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>View Google Authenticator QR Code & Secret Key</span>
              </button>
            )}
          </div>

          {/* Setup Wizard Link */}
          <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-[#E1E3E1] flex items-center justify-between text-xs">
            <span className="text-[#444746]">Run Sendaat setup wizard again</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRestartOnboarding();
              }}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#747775] text-[#0B57D0] hover:bg-[#E8F0FE] font-medium transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Launch Wizard</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E1E3E1] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="px-4 py-2 rounded-full border border-[#FAD2CF] bg-[#FCE8E6] hover:bg-[#F8D7DA] text-[#C5221F] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-[#444746] hover:bg-[#F8F9FA] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium transition-colors shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Google Authenticator QR Code Setup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-[24px] p-6 shadow-2xl border border-[#DADCE0] text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-normal text-[#1F1F1F]">Google Authenticator Setup</h3>
            <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
              Scan this QR code using the Google Authenticator app on your phone.
            </p>

            <div className="my-3 p-3 bg-white border border-[#DADCE0] rounded-2xl inline-block shadow-xs">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Google Authenticator QR Code" className="w-36 h-36 mx-auto rounded-lg" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs text-[#5F6368]">
                  Generating QR code...
                </div>
              )}
            </div>

            <div className="mb-3 p-2.5 bg-[#F0F4F9] rounded-xl font-mono text-xs text-[#0B57D0] font-bold tracking-widest border border-[#DADCE0] select-all">
              {twoFactorSecret || 'SENDAAT-2FA-784920'}
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs rounded-xl font-medium flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-medium text-[#444746] mb-1">
                  Test & Verify 6-digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000 000"
                  value={verifyTotpInput}
                  onChange={(e) => setVerifyTotpInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-xl text-center font-mono text-base tracking-[6px] outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="w-1/2 py-2 bg-[#F8F9FA] hover:bg-[#E1E3E1] text-[#444746] font-medium text-xs rounded-full transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleVerifyTotp}
                  disabled={isLoading || verifyTotpInput.length < 6}
                  className="w-1/2 py-2 bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-xs rounded-full transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
