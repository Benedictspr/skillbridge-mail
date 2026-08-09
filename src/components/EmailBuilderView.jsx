import React, { useState, useEffect } from 'react';
import { 
  Eye, Copy, Check, User, Mail, Send, Tag, Zap, RefreshCw, 
  Sparkles, FileText, Layers, ShieldCheck, Palette, LayoutGrid, 
  Upload, Type, Image as ImageIcon, Minimize2, Maximize2, X, Compass, MousePointer
} from 'lucide-react';
import { EMAIL_TEMPLATES } from '../mockData';
import { extractFirstNameFromEmail } from '../utils/nameParser';
import VisualEmailDesigner from './VisualEmailDesigner';
import CorelDesignStudio from './designer/CorelDesignStudio';
import { FONT_CATALOG, loadGoogleFontsInDOM } from './designer/fonts';

export default function EmailBuilderView({ 
  campaignConfig = {}, 
  setCampaignConfig, 
  recipients = [], 
  onStartQueue, 
  setActiveTab, 
  onSendSingleTest,
  smtpConfig = {}
}) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const safeConfig = campaignConfig || {};
  const [selectedRecipientId, setSelectedRecipientId] = useState(safeRecipients[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'corel' | 'text'
  const [selectedFont, setSelectedFont] = useState(FONT_CATALOG[0].family);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load Google Fonts into document DOM
  useEffect(() => {
    loadGoogleFontsInDOM();
  }, []);

  // Synchronize sender email with Gmail SMTP address if set
  useEffect(() => {
    if (smtpConfig?.user && smtpConfig.user !== safeConfig?.senderEmail) {
      setCampaignConfig(prev => ({ ...prev, senderEmail: smtpConfig.user }));
    }
  }, [smtpConfig?.user]);

  const currentRecipient = safeRecipients.find(r => r.id === selectedRecipientId) || safeRecipients[0] || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    company: 'SkillBridge Network',
    role: 'Mathematics Tutor'
  };

  const activeSenderEmail = smtpConfig?.user || campaignConfig.senderEmail || '';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const renderTextWithMergeTags = (text) => {
    if (!text) return '';
    const firstNameVal = (currentRecipient.firstName && currentRecipient.firstName !== 'Friend') 
      ? currentRecipient.firstName 
      : extractFirstNameFromEmail(currentRecipient.email);

    return text
      .replaceAll('{{first_name}}', firstNameVal)
      .replaceAll('{{last_name}}', currentRecipient.lastName || '')
      .replaceAll('{{email}}', currentRecipient.email || '')
      .replaceAll('{{company}}', currentRecipient.company || 'SkillBridge')
      .replaceAll('{{role}}', currentRecipient.role || 'Student')
      .replaceAll('{{sender_name}}', campaignConfig.senderName || 'Benedict');
  };

  const insertMergeTag = (tag) => {
    setCampaignConfig(prev => ({
      ...prev,
      bodyText: (prev.bodyText || '') + ' ' + tag + ' '
    }));
  };

  const handleTextFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageTag = `\n[IMAGE: ${event.target.result}]\n`;
        setCampaignConfig(prev => ({
          ...prev,
          bodyText: (prev.bodyText || '') + imageTag
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatBodyContent = (text) => {
    if (!text) return '';
    let parsed = renderTextWithMergeTags(text);

    // Replace [IMAGE: url]
    parsed = parsed.replace(/\[IMAGE:\s*([^\]]+)\]/g, '<div style="text-align:center; margin:16px 0;"><img src="$1" style="max-width:100%; border-radius:8px; display:inline-block;" /></div>');

    // Replace [BUTTON: label -> url]
    parsed = parsed.replace(/\[BUTTON:\s*([^\-]+)->\s*([^\]]+)\]/g, '<div style="text-align:center; margin:20px 0;"><a href="$2" target="_blank" style="background:#007C89; color:#ffffff; font-weight:bold; padding:12px 24px; text-decoration:none; border-radius:8px; display:inline-block;">$1</a></div>');

    // Replace [NOTE: text]
    parsed = parsed.replace(/\[NOTE:\s*([^\]]+)\]/g, '<div style="background:#f1f5f9; border-left:4px solid #007C89; padding:12px 16px; border-radius:6px; margin:16px 0; color:#0f172a; font-weight:bold;">$1</div>');

    // Replace ### Headings
    parsed = parsed.replace(/^###\s*(.+)$/gm, '<h2 style="font-size:22px; font-weight:800; color:#0f172a; margin:16px 0 8px 0;">$1</h2>');

    return parsed.replace(/\n/g, '<br/>');
  };

  const generateFullHtmlEmail = () => {
    const renderedSubject = renderTextWithMergeTags(campaignConfig.subject || '');
    const renderedBody = formatBodyContent(campaignConfig.bodyText || '');
    const renderedSignature = renderTextWithMergeTags(campaignConfig.signatureText || '');
    const ctaUrl = campaignConfig.buttonUrl || 'https://t.me/+AB0OloYpE7I1NTVk';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${renderedSubject}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="font-family: ${selectedFont}; background-color: #f4f6f8; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    ${campaignConfig.headerLogoText ? `<div style="background: #000000; padding: 32px 24px; text-align: center; color: #ffffff;"><h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">${campaignConfig.headerLogoText}</h1></div>` : ''}
    <div style="padding: 36px; font-size: 15px; line-height: 1.7; color: #334155;">
      ${renderedBody}
      <div style="margin: 28px 0 20px 0; text-align: center;">
        <a href="${ctaUrl}" target="_blank" style="background: #007C89; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">Apply via Telegram</a>
      </div>
      ${campaignConfig.signatureText ? `<div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${renderedSignature}</div>` : ''}
    </div>
    <div style="background: #f9fafb; padding: 18px 36px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #e2e8f0;">
      ${activeSenderEmail ? `SkillBridge Student Outreach &bull; ${activeSenderEmail}` : 'SkillBridge Student Outreach'}
    </div>
  </div>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateFullHtmlEmail());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestSendClick = async () => {
    setIsSendingTest(true);
    await onSendSingleTest();
    setIsSendingTest(false);
  };

  // Render Visual Drop Studio in Full Screen Viewport
  if (editorMode === 'visual') {
    return (
      <VisualEmailDesigner
        campaignConfig={campaignConfig}
        setCampaignConfig={setCampaignConfig}
        recipients={recipients}
        onStartQueue={onStartQueue}
        onSendSingleTest={onSendSingleTest}
        smtpConfig={smtpConfig}
        onCloseStudio={() => setActiveTab && setActiveTab('dashboard')}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />
    );
  }

  // Render CorelDRAW-Inspired Design Studio (Beta)
  if (editorMode === 'corel') {
    return (
      <CorelDesignStudio
        campaignConfig={campaignConfig}
        setCampaignConfig={setCampaignConfig}
        recipients={recipients}
        onSendSingleTest={onSendSingleTest}
        onCloseStudio={() => setActiveTab && setActiveTab('dashboard')}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Studio Mode Selector Bar & Window Controls */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Window Control Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab && setActiveTab('dashboard')}
              className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-[9px] text-red-950 font-bold opacity-80 hover:opacity-100 transition-opacity"
              title="Close Studio (Return to Dashboard)"
            >
              ✕
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-[9px] text-amber-950 font-bold opacity-80 hover:opacity-100 transition-opacity"
              title="Minimize / Restore View"
            >
              –
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[9px] text-emerald-950 font-bold opacity-80 hover:opacity-100 transition-opacity"
              title="Maximize Full Screen"
            >
              +
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-4 h-4" /> SkillBridge Email Studio
            </div>
            <h2 className="text-base font-bold text-white">Select Your Preferred Designer Studio</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 3 Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-3.5 py-2 rounded-lg font-extrabold tracking-wide flex items-center gap-1.5 transition-all uppercase ${
                editorMode === 'visual' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>VISUAL DROP STUDIO</span>
            </button>

            <button
              onClick={() => setEditorMode('corel')}
              className={`px-3.5 py-2 rounded-lg font-extrabold tracking-wide flex items-center gap-1.5 transition-all uppercase ${
                editorMode === 'corel' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>DESIGN STUDIO (BETA)</span>
            </button>

            <button
              onClick={() => setEditorMode('text')}
              className={`px-3.5 py-2 rounded-lg font-extrabold tracking-wide flex items-center gap-1.5 transition-all ${
                editorMode === 'text' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Standard Form & Text Mode</span>
            </button>
          </div>

          {/* Explicit Window Control Action Icons */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Full Screen Mode"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-teal-400" />}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab('dashboard')}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Close Studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Standard Form & Text Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" /> Standard Template Form Editor
            </h3>
          </div>

          {/* Font Family Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-teal-600" /> Primary Font Family (System & Google Fonts)
            </label>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-teal-600"
            >
              {FONT_CATALOG.map(f => (
                <option key={f.name} value={f.family}>{f.name} ({f.type.toUpperCase()})</option>
              ))}
            </select>
          </div>

          {/* Subject Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Subject Line</label>
            <input
              type="text"
              value={campaignConfig.subject || ''}
              onChange={(e) => setCampaignConfig(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g. Remote Opportunity for {{first_name}}"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          {/* Merge Tag & Format Helpers */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quick Inserters</div>
            <div className="flex flex-wrap gap-1.5">
              {['{{first_name}}', '{{company}}', '{{role}}', '{{email}}'].map(tag => (
                <button
                  key={tag}
                  onClick={() => insertMergeTag(tag)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-teal-700 text-[11px] font-mono font-bold rounded-lg border border-gray-300"
                >
                  {tag}
                </button>
              ))}

              {/* Upload Image File for Text Mode */}
              <label className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold rounded-lg border border-teal-200 cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-teal-600" /> Insert SVG/GIF/Image File
                <input
                  type="file"
                  accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp"
                  onChange={handleTextFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Body Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Body Content (Supports Merge Tags & Markdown)</label>
            <textarea
              rows={10}
              value={campaignConfig.bodyText || ''}
              onChange={(e) => setCampaignConfig(prev => ({ ...prev, bodyText: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-teal-600 leading-relaxed font-sans"
            />
          </div>

          {/* Signature Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Signature</label>
            <input
              type="text"
              value={campaignConfig.signatureText || ''}
              onChange={(e) => setCampaignConfig(prev => ({ ...prev, signatureText: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Right Live Device Render Preview (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-100 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Live Recipient Preview</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 flex items-center gap-1 border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleTestSendClick}
                  disabled={isSendingTest}
                  className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Render Frame */}
            <div className="bg-slate-100 rounded-xl p-4 overflow-hidden border border-slate-700 text-slate-900 min-h-[480px]">
              <iframe
                srcDoc={generateFullHtmlEmail()}
                title="Live Standard Mode Render"
                className="w-full h-[460px] border-none bg-white rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
