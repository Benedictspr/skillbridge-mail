import React, { useState } from 'react';
import { X, Settings, ShieldCheck, Mail, Key, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function SmtpSettingsModal({ isOpen, onClose, smtpConfig, setSmtpConfig }) {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestGmailConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    if (smtpConfig.mode === 'sandbox') {
      setTimeout(() => {
        setIsTesting(false);
        setTestResult({ status: 'success', message: 'Sandbox mode active. All dispatches will be simulated locally.' });
      }, 500);
      return;
    }

    if (!smtpConfig.user || !smtpConfig.pass) {
      setIsTesting(false);
      setTestResult({ status: 'error', message: 'Please enter both your Gmail address and 16-character App Password.' });
      return;
    }

    try {
      response = await fetch('/api/test-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpUser: smtpConfig.user, smtpPass: smtpConfig.pass })
      });

      const data = await response.json();

      setIsTesting(false);
      if (response.ok && data.success) {
        setTestResult({ status: 'success', message: 'Gmail SMTP Verified! Ready to send real emails to respondents.' });
      } else {
        setTestResult({ status: 'error', message: data.error || 'Authentication failed. Please verify your Gmail App Password.' });
      }
    } catch (err) {
      setIsTesting(false);
      setTestResult({ status: 'error', message: 'Could not connect to SMTP server: ' + err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Email Gateway & Backend Setup</h2>
            <p className="text-xs text-gray-500">Configure real Gmail SMTP sending & email open feedback.</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-2">Sending Backend Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSmtpConfig(prev => ({ ...prev, mode: 'gmail' }))}
                className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                  smtpConfig.mode === 'gmail' 
                    ? 'border-black bg-black text-white shadow-md' 
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-4 h-4 mb-1" />
                <span className="block font-bold">Real Gmail SMTP Backend</span>
                <span className="text-[10px] opacity-80 block font-normal mt-0.5">Sends real emails via Nodemailer</span>
              </button>

              <button
                type="button"
                onClick={() => setSmtpConfig(prev => ({ ...prev, mode: 'sandbox' }))}
                className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                  smtpConfig.mode === 'sandbox' 
                    ? 'border-black bg-black text-white shadow-md' 
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-1" />
                <span className="block font-bold">Sandbox (Simulated)</span>
                <span className="text-[10px] opacity-80 block font-normal mt-0.5">Safe test mode (No emails sent)</span>
              </button>
            </div>
          </div>

          {/* Gmail Credentials Form */}
          {smtpConfig.mode === 'gmail' && (
            <div className="space-y-3 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Your Gmail Address</label>
                <input
                  type="email"
                  placeholder="outreach@sendaat.io"
                  value={smtpConfig.user || ''}
                  onChange={e => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 outline-none focus:border-black font-sans text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Gmail App Password (16 Characters)</label>
                <input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={smtpConfig.pass || ''}
                  onChange={e => setSmtpConfig(prev => ({ ...prev, pass: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 outline-none focus:border-black font-mono text-xs text-gray-900"
                />
              </div>

              {/* Guide box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed">
                <span className="font-bold block mb-0.5">How to get a Gmail App Password:</span>
                1. Enable 2-Step Verification on your Google Account.<br/>
                2. Search for <strong>App Passwords</strong> in Google Account Security.<br/>
                3. Create a password for "Mail" and paste the 16-character code above.
              </div>
            </div>
          )}

          {/* Test Status Banner */}
          {testResult && (
            <div className={`p-3 rounded-xl flex items-center gap-2 font-medium ${
              testResult.status === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {testResult.status === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 text-xs">
          <button
            type="button"
            onClick={handleTestGmailConnection}
            disabled={isTesting}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Test Gmail Backend</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-lg transition-colors"
          >
            Save & Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
