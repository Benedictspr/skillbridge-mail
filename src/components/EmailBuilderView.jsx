import React, { useState, useEffect } from 'react';
import { 
  Eye, Copy, Check, User, Mail, Send, Tag, Zap, RefreshCw, 
  Sparkles, FileText, Layers, ShieldCheck, Palette, LayoutGrid, 
  Upload, Type, Image as ImageIcon, Code2, LayoutTemplate
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
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'design' | 'text'
  const [selectedFont, setSelectedFont] = useState(FONT_CATALOG[0].family);

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
    company: 'Sendaat Network',
    role: 'Candidate'
  };

  const activeSenderEmail = smtpConfig?.user || campaignConfig.senderEmail || '';

  const renderTextWithMergeTags = (text) => {
    if (!text) return '';
    const firstNameVal = (currentRecipient.firstName && currentRecipient.firstName !== 'Friend') 
      ? currentRecipient.firstName 
      : extractFirstNameFromEmail(currentRecipient.email);

    return text
      .replaceAll('{{first_name}}', firstNameVal)
      .replaceAll('{{last_name}}', currentRecipient.lastName || '')
      .replaceAll('{{email}}', currentRecipient.email || '')
      .replaceAll('{{company}}', currentRecipient.company || 'Sendaat')
      .replaceAll('{{role}}', currentRecipient.role || 'User')
      .replaceAll('{{sender_name}}', campaignConfig.senderName || 'Sendaat');
  };

  const insertMergeTag = (tag) => {
    setCampaignConfig(prev => ({
      ...prev,
      bodyText: (prev.bodyText || '') + ' ' + tag + ' '
    }));
  };

  const formatBodyContent = (text) => {
    if (!text) return '';
    let parsed = renderTextWithMergeTags(text);
    parsed = parsed.replace(/\[IMAGE:\s*([^\]]+)\]/g, '<div style="text-align:center; margin:16px 0;"><img src="$1" style="max-width:100%; border-radius:8px; display:inline-block;" /></div>');
    parsed = parsed.replace(/\[BUTTON:\s*([^\-]+)->\s*([^\]]+)\]/g, '<div style="text-align:center; margin:20px 0;"><a href="$2" target="_blank" style="background:#FFFFFF; color:#000000; font-weight:bold; padding:12px 24px; text-decoration:none; border-radius:8px; display:inline-block;">$1</a></div>');
    return parsed.replace(/\n/g, '<br/>');
  };

  const generateFullHtmlEmail = () => {
    const renderedSubject = renderTextWithMergeTags(campaignConfig.subject || '');
    const renderedBody = formatBodyContent(campaignConfig.bodyText || '');
    const renderedSignature = renderTextWithMergeTags(campaignConfig.signatureText || '');
    const ctaUrl = campaignConfig.buttonUrl || 'https://sendaat.io';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${renderedSubject}</title>
</head>
<body style="font-family: ${selectedFont}; background-color: #050505; margin: 0; padding: 24px; color: #ffffff;">
  <div style="max-width: 580px; margin: 0 auto; background: #121212; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
    <div style="padding: 36px; font-size: 15px; line-height: 1.7; color: #e4e4e7;">
      ${renderedBody}
      <div style="margin: 28px 0 20px 0; text-align: center;">
        <a href="${ctaUrl}" target="_blank" style="background: #ffffff; color: #000000; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">View Details</a>
      </div>
      ${campaignConfig.signatureText ? `<div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #27272a; font-weight: 600; color: #ffffff;">${renderedSignature}</div>` : ''}
    </div>
    <div style="background: #09090b; padding: 18px 36px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px solid #27272a;">
      ${activeSenderEmail ? `Sendaat Mail Infrastructure &bull; ${activeSenderEmail}` : 'Sendaat Mail Infrastructure'}
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

  // Render Visual Mode
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

  // Render Design Mode
  if (editorMode === 'design') {
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

  // Render Text Mode (Interwoven Monochromatic Black & White Workspace)
  return (
    <div className="space-y-6 font-sans bg-[#050505] text-white p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Sleek Interwoven Mode Sub-Nav Bar */}
      <div className="bg-[#121212] text-white p-4 rounded-2xl border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-black border border-zinc-800 rounded-lg font-sans font-extrabold text-xs shadow-inner" title="Switch Editor Workspaces">
            <button
              onClick={() => setEditorMode('visual')}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${editorMode === 'visual' ? 'bg-white text-black font-extrabold shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              title="Visual Drag & Drop Studio (Visual)"
            >
              <LayoutTemplate className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditorMode('design')}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${editorMode === 'design' ? 'bg-white text-black font-extrabold shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              title="Vector Design Studio Canvas (Design)"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditorMode('text')}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${editorMode === 'text' ? 'bg-white text-black font-extrabold shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              title="Plain Text & Form Editor Mode (Text)"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-zinc-400 hidden sm:inline">Standard Form & Direct Text Editor</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl border border-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-300" />}
            <span>{copied ? 'Copied' : 'Copy HTML'}</span>
          </button>

          <button
            onClick={handleTestSendClick}
            disabled={isSendingTest}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
          </button>
        </div>
      </div>

      {/* Main Text Editor Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls & Template Selector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#121212] rounded-2xl p-5 border border-zinc-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              <span>Email Content Controls</span>
            </h2>

            {/* Template Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Preset Template</label>
              <select
                onChange={(e) => {
                  const tpl = EMAIL_TEMPLATES.find(t => t.id === e.target.value);
                  if (tpl) {
                    setCampaignConfig(prev => ({
                      ...prev,
                      subject: tpl.subject,
                      bodyText: tpl.bodyText,
                      senderName: tpl.senderName || prev.senderName
                    }));
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-sans"
              >
                <option value="">Select a pre-built template...</option>
                {EMAIL_TEMPLATES.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
            </div>

            {/* Subject Line */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Subject Line</label>
              <input
                type="text"
                value={campaignConfig.subject || ''}
                onChange={(e) => setCampaignConfig(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g. Quick question regarding {{company}}"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>

            {/* Merge Tag Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Insert Merge Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {['{{first_name}}', '{{last_name}}', '{{company}}', '{{email}}', '{{role}}'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => insertMergeTag(tag)}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono rounded-lg border border-zinc-800 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Body Text</label>
              <textarea
                rows={10}
                value={campaignConfig.bodyText || ''}
                onChange={(e) => setCampaignConfig(prev => ({ ...prev, bodyText: e.target.value }))}
                placeholder="Write your email body here..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-zinc-500 font-sans resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Instant Live HTML Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#121212] rounded-2xl p-5 border border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-white" />
                <span>Live Email Preview</span>
              </h2>
              <span className="text-[11px] font-mono text-zinc-400">Recipient: {currentRecipient.email}</span>
            </div>

            {/* Preview Card */}
            <div className="bg-[#050505] rounded-xl p-4 border border-zinc-800 text-xs space-y-4">
              <div className="border-b border-zinc-800 pb-3 space-y-1">
                <div className="text-zinc-400"><strong className="text-white">Subject:</strong> {renderTextWithMergeTags(campaignConfig.subject || '')}</div>
                <div className="text-zinc-400"><strong className="text-white">From:</strong> {activeSenderEmail || 'outreach@sendaat.io'}</div>
                <div className="text-zinc-400"><strong className="text-white">To:</strong> {currentRecipient.email}</div>
              </div>

              <div 
                className="prose prose-invert text-xs leading-relaxed text-zinc-200"
                dangerouslySetInnerHTML={{ __html: formatBodyContent(campaignConfig.bodyText || '') }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
