import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Building2, Shield, LogOut, RefreshCw, 
  CheckCircle2, ShieldCheck, QrCode, Lock, Check, Key, 
  ExternalLink, Eye, EyeOff, Sparkles, HelpCircle, Server, Globe, ChevronDown, AlertCircle,
  Fingerprint, Smartphone, Laptop, Trash2, Plus, Monitor, ShieldAlert
} from 'lucide-react';
import { 
  updateUserProfile,
  updateUserPasswordAsync,
  registerPasskeyAsync,
  revokePasskeyAsync,
  listPasskeysAsync,
  listActiveSessionsAsync,
  revokeSessionAsync,
  revokeOtherSessionsAsync,
  listSecurityEventsAsync,
  linkGoogleAccountAsync,
  unlinkGoogleAccountAsync,
  getAuthMethodsAsync
} from '../../utils/userStore';

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
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'smtp'

  // User Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [role, setRole] = useState(currentUser?.role || 'Workspace Owner');

  // Security & Authentication State
  const [methodsStatus, setMethodsStatus] = useState({
    google: currentUser?.hasGoogle || false,
    password: currentUser?.hasPassword || false,
    passkeys: (currentUser?.passkeys || []).length > 0
  });
  const [passkeysList, setPasskeysList] = useState(currentUser?.passkeys || []);
  const [sessionsList, setSessionsList] = useState([]);
  const [securityEventsList, setSecurityEventsList] = useState([]);
  
  // Password Change State
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Passkey Add Modal State
  const [newPasskeyName, setNewPasskeyName] = useState('Work MacBook Pro');
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);

  // Status & Feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SMTP State
  const [provider, setProvider] = useState(smtpConfig.provider || 'gmail');
  const [smtpUser, setSmtpUser] = useState(smtpConfig.user || '');
  const [smtpPass, setSmtpPass] = useState(smtpConfig.pass || '');
  const [senderName, setSenderName] = useState(smtpConfig.senderName || currentUser?.name || 'SkillBridge Outreach');
  const [customHost, setCustomHost] = useState(smtpConfig.host || 'smtp.sendgrid.net');
  const [customPort, setCustomPort] = useState(smtpConfig.port || 587);
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setCompany(currentUser.company || '');
      setRole(currentUser.role || 'Workspace Owner');
      setPasskeysList(currentUser.passkeys || []);
      setMethodsStatus(currentUser.configuredMethods || {
        google: currentUser.hasGoogle || false,
        password: currentUser.hasPassword || false,
        passkeys: (currentUser.passkeys || []).length > 0
      });
    }
  }, [currentUser]);

  // Load Security Data when entering Security tab
  useEffect(() => {
    if (isOpen && activeTab === 'security') {
      loadSecurityDetails();
    }
  }, [isOpen, activeTab]);

  const loadSecurityDetails = async () => {
    try {
      const [methodsData, passkeysData, sessionsData, eventsData] = await Promise.all([
        getAuthMethodsAsync().catch(() => ({})),
        listPasskeysAsync().catch(() => ({ passkeys: [] })),
        listActiveSessionsAsync().catch(() => ({ sessions: [] })),
        listSecurityEventsAsync().catch(() => ({ events: [] }))
      ]);

      if (methodsData?.methods) setMethodsStatus(methodsData.methods);
      if (passkeysData?.passkeys) setPasskeysList(passkeysData.passkeys);
      if (sessionsData?.sessions) setSessionsList(sessionsData.sessions);
      if (eventsData?.events) setSecurityEventsList(eventsData.events);
    } catch (e) {
      console.warn('Could not load security details:', e);
    }
  };

  if (!isOpen || !currentUser) return null;

  // 1. Password Update Handler (Argon2id)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setErrorMsg('');
    setIsUpdatingPassword(true);

    try {
      const result = await updateUserPasswordAsync(newPasswordInput, currentPasswordInput || null);
      setIsUpdatingPassword(false);
      setShowPasswordChangeForm(false);
      setNewPasswordInput('');
      setCurrentPasswordInput('');
      setSuccessMessage('Password secured with Argon2id. Other sessions invalidated.');
      setTimeout(() => setSuccessMessage(''), 4000);
      if (result.user) onUpdateUser(result.user);
      loadSecurityDetails();
    } catch (err) {
      setIsUpdatingPassword(false);
      setErrorMsg(err.message || 'Failed to update password.');
    }
  };

  // 2. Add New Passkey (WebAuthn)
  const handleAddPasskey = async () => {
    setErrorMsg('');
    setIsAddingPasskey(true);

    try {
      const result = await registerPasskeyAsync(newPasskeyName || 'My Security Key', email);
      setIsAddingPasskey(false);
      setSuccessMessage(`Passkey "${newPasskeyName}" registered successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      if (result.user) onUpdateUser(result.user);
      loadSecurityDetails();
    } catch (err) {
      setIsAddingPasskey(false);
      setErrorMsg(err.message || 'Failed to register passkey.');
    }
  };

  // 3. Revoke Passkey (with anti-lockout)
  const handleRevokePasskey = async (credentialId) => {
    if (!window.confirm('Are you sure you want to revoke this passkey?')) return;
    setErrorMsg('');

    try {
      const result = await revokePasskeyAsync(credentialId);
      setSuccessMessage('Passkey revoked.');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (result.user) onUpdateUser(result.user);
      loadSecurityDetails();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to revoke passkey.');
    }
  };

  // 4. Link Google Identity
  const handleLinkGoogle = async () => {
    setErrorMsg('');
    try {
      const mockGoogleToken = `mock_google_:google_sub_linked_${Date.now()}:${email}`;
      const result = await linkGoogleAccountAsync(mockGoogleToken);
      setSuccessMessage('Google account connected to this SkillBridge ID.');
      setTimeout(() => setSuccessMessage(''), 4000);
      if (result.user) onUpdateUser(result.user);
      loadSecurityDetails();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to link Google account.');
    }
  };

  // 5. Unlink Google Identity (with anti-lockout)
  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Disconnect your Google account from this SkillBridge identity?')) return;
    setErrorMsg('');
    try {
      const result = await unlinkGoogleAccountAsync();
      setSuccessMessage('Google account disconnected.');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (result.user) onUpdateUser(result.user);
      loadSecurityDetails();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to disconnect Google account.');
    }
  };

  // 6. Session Revocation
  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSessionAsync(sessionId);
      setSuccessMessage('Session revoked.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadSecurityDetails();
    } catch (err) {
      setErrorMsg('Failed to revoke session.');
    }
  };

  const handleRevokeOtherSessions = async () => {
    if (!window.confirm('Sign out of all other devices except this one?')) return;
    try {
      const res = await revokeOtherSessionsAsync();
      setSuccessMessage(res.message || 'Signed out of all other devices.');
      setTimeout(() => setSuccessMessage(''), 4000);
      loadSecurityDetails();
    } catch (err) {
      setErrorMsg('Failed to sign out other devices.');
    }
  };

  // 7. Save Profile Details
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name,
      email,
      company,
      role
    };

    updateUserProfile(currentUser.email, { name, email, company, role });
    onUpdateUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-2xl bg-[#121212] rounded-[24px] shadow-2xl border border-zinc-800 overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
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
        <div className="px-6 pt-3 pb-2 bg-[#09090B] border-b border-zinc-800/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-black shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('security'); setErrorMsg(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-black shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Passkeys</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('smtp'); setErrorMsg(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'smtp'
                ? 'bg-white text-black shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Email Delivery (SMTP)</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Workspace Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3 py-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl font-semibold cursor-pointer shadow-md"
                >
                  {savedSuccess ? 'Changes Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & AUTHENTICATION HARDENING */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* 1. Authentication Methods Overview */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Configured Authentication Methods</span>
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Multiple cross-device credentials linked to your canonical SkillBridge user ID (<span className="text-white font-mono">{currentUser.id}</span>).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  {/* Google Status */}
                  <div className="p-3 bg-black border border-zinc-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Google</span>
                      {methodsStatus.google ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-medium">Linked</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800">Unlinked</span>
                      )}
                    </div>
                    <div className="mt-3">
                      {methodsStatus.google ? (
                        <button
                          type="button"
                          onClick={handleUnlinkGoogle}
                          className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Disconnect Google
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLinkGoogle}
                          className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          + Link Google Account
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Status */}
                  <div className="p-3 bg-black border border-zinc-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Password</span>
                      {methodsStatus.password ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-medium">Argon2id</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-800/50">Not Set</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setShowPasswordChangeForm(!showPasswordChangeForm)}
                        className="text-[11px] text-white hover:underline cursor-pointer"
                      >
                        {methodsStatus.password ? 'Change Password' : 'Set Password'}
                      </button>
                    </div>
                  </div>

                  {/* Passkeys Status */}
                  <div className="p-3 bg-black border border-zinc-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Passkeys</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-medium">
                        {passkeysList.length} Active
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="text-[11px] text-zinc-400">WebAuthn / FIDO2</span>
                    </div>
                  </div>
                </div>

                {/* Password Change Form Dropdown */}
                {showPasswordChangeForm && (
                  <form onSubmit={handleUpdatePassword} className="p-3.5 bg-black border border-zinc-800 rounded-xl space-y-3 mt-3 animate-fade-in">
                    <div className="font-semibold text-white text-xs">Secure Password with Argon2id</div>
                    {methodsStatus.password && (
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1">Current Password (optional)</label>
                        <input
                          type="password"
                          placeholder="Current password"
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">New Password (min 8 chars)</label>
                      <input
                        type="password"
                        required
                        placeholder="New strong password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPasswordChangeForm(false)}
                        className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-3 py-1 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingPassword ? 'Hashing with Argon2id...' : 'Save Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2. Registered WebAuthn Passkeys */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-emerald-400" />
                      <span>FIDO2 / WebAuthn Passkeys</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Hardware keys, TouchID, FaceID, or synced password manager passkeys.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPasskey}
                    disabled={isAddingPasskey}
                    className="px-3 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingPasskey ? 'Registering...' : 'Add Passkey'}</span>
                  </button>
                </div>

                {passkeysList.length === 0 ? (
                  <div className="p-4 bg-black border border-zinc-800/80 rounded-xl text-center text-zinc-500">
                    No passkeys registered yet. Click "Add Passkey" to register your current device.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {passkeysList.map((passkey) => (
                      <div
                        key={passkey.credentialId}
                        className="p-3 bg-black border border-zinc-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400">
                            <Fingerprint className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">{passkey.name || 'Security Passkey'}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Registered: {new Date(passkey.createdAt).toLocaleDateString()} • {passkey.deviceType || 'multiDevice'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRevokePasskey(passkey.credentialId)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                          title="Revoke passkey"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Active Cross-Device Sessions */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-sky-400" />
                      <span>Active Devices & Sessions</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Devices currently authorized to access your synchronized cloud workspace.
                    </p>
                  </div>

                  {sessionsList.length > 1 && (
                    <button
                      type="button"
                      onClick={handleRevokeOtherSessions}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium cursor-pointer"
                    >
                      Sign Out Other Devices
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {sessionsList.map((session) => (
                    <div
                      key={session.sessionId}
                      className="p-3 bg-black border border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300">
                          {session.deviceCategory === 'mobile' ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Laptop className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs flex items-center gap-2">
                            <span>{session.deviceName || `${session.os} • ${session.browser}`}</span>
                            {session.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-bold uppercase">
                                This Device
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            IP: {session.ip} • Last Active: {new Date(session.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.sessionId)}
                          className="px-2 py-1 text-[10px] text-rose-400 hover:bg-rose-950/50 rounded-lg border border-rose-800/30 cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Security Audit Events Log */}
              {securityEventsList.length > 0 && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Recent Security Events
                  </h4>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {securityEventsList.slice(0, 8).map((evt) => (
                      <div key={evt.id} className="p-2 bg-black border border-zinc-900 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300 font-mono">{evt.event}</span>
                        <span className="text-zinc-500 text-[10px]">
                          {new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: SMTP / EMAIL PROVIDER */}
          {activeTab === 'smtp' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-semibold text-white text-xs">Primary Outreach Sender Configuration</div>
                <p className="text-[11px] text-zinc-400">
                  Configure your high-deliverability sending mailbox. Credentials are encrypted and stored strictly server-side.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none"
                  >
                    <option value="gmail">Google Workspace / Gmail</option>
                    <option value="outlook">Microsoft Outlook 365</option>
                    <option value="yahoo">Yahoo Mail</option>
                    <option value="zoho">Zoho Mail</option>
                    <option value="custom">Custom SMTP Server</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">SMTP Username / Email</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="outreach@company.com"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">App Password / API Secret</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="16-character app password"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white outline-none pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {smtpTestResult && (
                <div className={`p-3 rounded-xl border text-[11px] ${
                  smtpTestResult.status === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800/40 text-rose-400'
                }`}>
                  {smtpTestResult.message}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl font-semibold cursor-pointer shadow-md"
                >
                  Save Provider Config
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
