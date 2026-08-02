import React, { useState, useEffect } from 'react';
import { Eye, Copy, Check, User, Mail, Send, Tag, Zap, RefreshCw, Sparkles, FileText, Layers, ShieldCheck } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../mockData';
import { extractFirstNameFromEmail } from '../utils/nameParser';

const DOODLE_B64_IMAGE = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA1MDAgNDAiIGZpbGw9Im5vbmUiPgogIDwhLS0gTGVmdCBEYXNoZWQgQXhpcyAtLT4KICA8bGluZSB4MT0iMTUiIHkxPSIyMCIgeDI9Ijg1IiB5Mj0iMjAiIHN0cm9rZT0iIzcxODA5NiIgc3Ryb2tlLXdpZHRoPSIxLjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQgMyIgLz4KICAKICA8IS0tIExlZnQgRmxvdXJpc2ggLS0+CiAgPHBhdGggZD0iTSA4NSAyMCBDIDkyIDE0IDk4IDEyIDEwMiA4IE0gODUgMjAgQyA5MiAyNCA5NiAyMiAxMDIgMjIgTSA5MCAyMCBDIDkzIDE2IDk3IDE0IDEwMCAxMSIgc3Ryb2tlPSIjQTBBRUMwIiBzdHJva2Utd2lkdGg9IjEuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIAogIDwhLS0gTW90aWYgMTogSUQgLyBDZXJ0aWZpY2F0ZSBDYXJkICh4PTExNSkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE1LCA4KSIgc3Ryb2tlPSIjQ0JENUUwIiBzdHJva2Utd2lkdGg9IjEuNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyMiIgaGVpZ2h0PSIxOCIgcng9IjMiIC8+CiAgICA8Y2lyY2xlIGN4PSI4IiBjeT0iOSIgcj0iMi41IiAvPgogICAgPHBhdGggZD0iTSA0IDE3IEMgNCAxNCA2 IDEzIDggMTMgQyAxMCAxMyAxMiAxNCAxMiAxNyIgLz4KICAgIDxsaW5lIHgxPSIxMyIgeTE9IjciIHgyPSIyMCIgeTI9IjciIC8+CiAgICA8bGluZSB4MT0iMTMiIHkxPSIxMSIgeDI9IjE5IiB5Mj0iMTEiIC8+CiAgICA8bGluZSB4MT0iMTMiIHkxPSIxNSIgeDI9IjE3IiB5Mj0iMTUiIC8+CiAgPC9nPgoKICA8IS0tIE1vdGlmIDI6IE9wZW4gQm9vayAoeD0xNjUpIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2NSwgOCkiIHN0cm9rZT0iI0UyRThGMCIgc3Ryb2tlLXdpZHRoPSIxLjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CiAgICA8cGF0aCBkPSJNIDIgNiBDIDEyIDMgMjAgNSAyMyA3IEMgMjYgNSAzNCAzIDQ0IDYgViAyMCBDIDM0IDE3IDI2IDE5IDIzIDE4IEMgMjAgMTkgMTIgMTcgMiAyMCBaIiAvPgogICAgPGxpbmUgeDE9IjIzIiB5MT0iNyIgeDI9IjIzIiB5Mj0iMTgiIC8+CiAgICA8cGF0aCBkPSJNIDYgMTAgQyAxMSA4IDE2IDkgMTkgMTAgTSA2IDE0IEMgMTEgMTIgMTYgMTMgMTkgMTQgTSAyNyAxMCBDIDMwIDkgMzUgOCA0MCAxMCBNIDI3IDE0IEMgMzAgMTMgMzUgMTIgNDAgMTQiIC8+CiAgPC9nPgoKICA8IS0tIE1vdGlmIDM6IENlbnRlcnBpZWNlIEdyYWR1YXRpb24gQ2FwIHdpdGggVGFzc2VsICh4PTIyNSkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjI1LCAyKSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjUsMiA0OCwxMiAyNSwyMiAyLDEyIiBmaWxsPSIjRTJFOEYwIiBmaWxsLW9wYWNpdHk9IjAuMSIgLz4KICAgIDxwYXRoIGQ9Ik0gMTAgMTYgViAyMyBDIDEwIDI2IDQwIDI2IDQwIDIzIFYgMTYiIC8+CiAgICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjEyIiByPSIyIiBmaWxsPSIjRkZGRkZGIiAvPgogICAgPHBhdGggZD0iTSAyNSAxMiBDIDE2IDE0IDkgMjAgNyAyNSIgLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNSwyNSA5LDMwIDQsMzAiIGZpbGw9IiNGRkZGRkYiIC8+CiAgPC9nPgoKICA8IS0tIE1vdGlmIDQ6IE1pY3Jvc2NvcGUgKHg9Mjk1KSAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTUsIDYpIiBzdHJva2U9IiNDQkQ1RTAiIHN0cm9rZS13aWR0aD0iMS40IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogICAgPGxpbmUgeDE9IjQiIHkxPSIyNCIgeDI9IjIyIiB5Mj0iMjQiIC8+CiAgICA8bGluZSB4MT0iMTMiIHkxPSIyNCIgeDI9IjEzIiB5Mj0iMTgiIC8+CiAgICA8cGF0aCBkPSJNIDEzIDE0IEMgMTggMTQgMjAgOSAxOCA1IEMgMTYgMiAxMSAyIDkgNSBMIDEzIDE0IiAvPgogICAgPHJlY3QgeD0iOCIgeT0iNyIgd2lkdGg9IjUiIGhlaWghtPSI3IiByeD0iMSIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwIDEwIDEwKSIgLz4KICAgIDxjaXJjbGUgY3g9IjE3IiBjeT0iMTgiIHI9IjEuNSIgLz4KICA8L2c+CgogIDwhLS0gTW90aWYgNTogUXVpbGwgUGVuICYgSW5rcG90ICh4PTM0NSkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzQ1LCA2KSIgc3Ryb2tlPSIjRTJFOEYwIiBzdHJva2Utd2lkdGg9IjEuNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxwYXRoIGQ9Ik0gMjAgMiBDIDEyIDUgNyAxNCA1IDI0IE0gMjAgMiBDIDE2IDggMTYgMTUgMTggMjEiIC8+CiAgICA8bGluZSB4MT0iMTUiIHkxPSI3IiB4Mj0iMTkiIHkyPSI5IiAvPgogICAgPGxpbmUgeDE9IjE0IiB5MT0iMTEiIHgyPSIxOCIgeTI9IjEzIiAvPgogICAgPGxpbmUgeDE9IjEzIiB5MT0iMTUiIHgyPSIxNyIgeTI9IjE3IiAvPgogICAgPHJlY3QgeD0iMiIgeT0iMTciIHdpZHRoPSI4IiBoZWlnaHQ9IjciIHJ4PSIxIiAvPgogICAgPHBhdGggZD0iTSA0IDE3IFYgMTQgSDggViAxNyIgLz4KICA8L2c+CgogIDwhLS0gUmlnaHQgRmxvdXJpc2ggLS0+CiAgPGcgc3Ryb2tlPSIjQTBBRUMwIiBzdHJva2Utd2lkdGg9IjEuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj4KICAgIDxwYXRoIGQ9Ik0gNDE1IDIwIEMgNDA4IDE0IDQwMiAxMiAzOTggOCBNIDQxNSAyMCBDIDQwOCAyNCA0MDQgMjIgMzk4IDIyIE0gNDEwIDIwIEMgNDA3IDE2IDQwMyAxNCA0MDAgMTEiIC8+CiAgPC9nPgoKICA8IS0tIFJpZ2h0IERhc2hlZCBBeGlzIC0tPgogIDxsaW5lIHgxPSI0MTUiIHkxPSIyMCIgeDI9IjQ4NSIgeTI9IjIwIiBzdHJva2U9IiM3MTgwOTYiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2UtZGFzaGFycmF5PSI0IDMiIC8+Cjwvc3ZnPg==`;

export default function EmailBuilderView({ 
  campaignConfig, 
  setCampaignConfig, 
  recipients, 
  onStartQueue, 
  setActiveTab, 
  onSendSingleTest,
  smtpConfig 
}) {
  const [selectedRecipientId, setSelectedRecipientId] = useState(recipients[0]?.id || '');
  const [deviceFrame, setDeviceFrame] = useState('macbook');
  const [copied, setCopied] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [templateTheme, setTemplateTheme] = useState('venita-black'); // 'venita-black' | 'modern-light'

  // Synchronize sender email with Gmail SMTP address if set
  useEffect(() => {
    if (smtpConfig?.user && smtpConfig.user !== campaignConfig.senderEmail) {
      setCampaignConfig(prev => ({ ...prev, senderEmail: smtpConfig.user }));
    }
  }, [smtpConfig?.user]);

  const currentRecipient = recipients.find(r => r.id === selectedRecipientId) || recipients[0] || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    company: 'SkillBridge Network',
    role: 'Mathematics Tutor'
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

  const handleTemplateSelect = (templateId) => {
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setCampaignConfig(prev => ({
        ...prev,
        templateId: tmpl.id,
        subject: tmpl.subject,
        bodyText: tmpl.bodyText,
        headerLogoText: tmpl.headerLogoText,
        buttonText: tmpl.buttonText,
        buttonUrl: tmpl.buttonUrl,
        signatureText: tmpl.signatureText
      }));
    }
  };

  const generateFullHtmlEmail = () => {
    const renderedBody = renderTextWithMergeTags(campaignConfig.bodyText).replace(/\n/g, '<br/>');
    const renderedSubject = renderTextWithMergeTags(campaignConfig.subject);
    const renderedSignature = renderTextWithMergeTags(campaignConfig.signatureText).replace(/\n/g, '<br/>');
    const ctaUrl = campaignConfig.buttonUrl || 'https://t.me/+AB0OloYpE7I1NTVk';

    if (templateTheme === 'venita-black') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${renderedSubject}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #07080D; margin: 0; padding: 24px; color: #F9FAFB;">
  <div style="max-width: 580px; margin: 0 auto; background: #0D0E16; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);">
    ${campaignConfig.headerLogoText ? `
      <div style="background: #000000; padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.12);">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; font-family: 'Cormorant Garamond', Garamond, Georgia, serif; color: #FFFFFF;">${campaignConfig.headerLogoText}</h1>
      </div>
    ` : ''}
    <div style="padding: 36px; font-size: 15px; line-height: 1.8; color: #E2E8F0;">
      ${renderedBody}
      <div style="margin: 28px 0 20px 0; text-align: center;">
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-collapse: separate; border-spacing: 18px 10px;">
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="background: #0f172a; color: #ffffff !important; padding: 11px 22px; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: inline-block; white-space: nowrap; margin: 6px 10px;">Apply via Telegram</a>
            </td>
            <td align="center" style="padding: 0;">
              <a href="mailto:${activeSenderEmail || 'outreach@skillbridge.org'}" style="background: #0f172a; color: #ffffff !important; padding: 11px 22px; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: inline-block; white-space: nowrap; margin: 6px 10px;">Reply via Email</a>
            </td>
          </tr>
        </table>
      </div>
      ${campaignConfig.signatureText ? `
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: #F1F5F9; font-size: 15px; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">${renderedSignature}</div>
      ` : ''}
    </div>
    <div style="background: #07080D; padding: 18px 36px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.06);">
      ${activeSenderEmail ? `SkillBridge Student Outreach &bull; ${activeSenderEmail}` : 'SkillBridge Student Outreach'}
    </div>
  </div>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${renderedSubject}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    ${campaignConfig.headerLogoText ? `<div style="background: #000000; padding: 32px 24px; text-align: center; color: #ffffff;"><h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; font-family: 'Cormorant Garamond', Garamond, Georgia, serif;">${campaignConfig.headerLogoText}</h1></div>` : ''}
    <div style="padding: 36px; font-size: 15px; line-height: 1.7; color: #334155;">
      ${renderedBody}
      <div style="margin: 28px 0 20px 0; text-align: center;">
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-collapse: separate; border-spacing: 18px 10px;">
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="background: #0f172a; color: #ffffff !important; padding: 11px 22px; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: inline-block; white-space: nowrap; margin: 6px 10px;">Apply via Telegram</a>
            </td>
            <td align="center" style="padding: 0;">
              <a href="mailto:${activeSenderEmail || 'outreach@skillbridge.org'}" style="background: #0f172a; color: #ffffff !important; padding: 11px 22px; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: inline-block; white-space: nowrap; margin: 6px 10px;">Reply via Email</a>
            </td>
          </tr>
        </table>
      </div>
      ${campaignConfig.signatureText ? `<div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 15px; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">${renderedSignature}</div>` : ''}
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

  return (
    <div className="space-y-6 font-sans">
      {/* Studio Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 inline-block mb-1">
            Email Designer Studio
          </span>
          <h2 className="text-xl font-bold text-gray-900">Email Personalization Studio</h2>
          <p className="text-xs text-gray-500 mt-0.5">Customize your student outreach email template and preview output with merge tags.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-300 text-xs">
            <button
              onClick={() => setTemplateTheme('venita-black')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${templateTheme === 'venita-black' ? 'bg-black text-white shadow-xs' : 'text-gray-700'}`}
            >
              Dark Venita Black
            </button>
            <button
              onClick={() => setTemplateTheme('modern-light')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${templateTheme === 'modern-light' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700'}`}
            >
              Executive Light
            </button>
          </div>

          <select
            value={campaignConfig.templateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-xs font-bold py-2 px-3 rounded-lg shadow-xs outline-none focus:border-blue-600"
          >
            {EMAIL_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>1. Header & Sender Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Sender Name</label>
                <input
                  type="text"
                  value={campaignConfig.senderName}
                  onChange={e => setCampaignConfig(prev => ({ ...prev, senderName: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center justify-between">
                  <span>Sender Email (Gmail SMTP)</span>
                  {smtpConfig?.user && <span className="text-[10px] text-emerald-600 font-bold">✓ Bound to SMTP</span>}
                </label>
                <input
                  type="email"
                  value={activeSenderEmail}
                  onChange={e => setCampaignConfig(prev => ({ ...prev, senderEmail: e.target.value }))}
                  placeholder=""
                  className="w-full bg-blue-50/50 border border-blue-300 rounded-lg p-2.5 text-xs text-blue-900 font-extrabold outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Subject Line</label>
              <input
                type="text"
                value={campaignConfig.subject}
                onChange={e => setCampaignConfig(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-bold text-gray-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>2. Content & Dynamic Variables</span>
              </h3>

              <div className="flex items-center gap-1.5">
                {['{{first_name}}', '{{role}}', '{{company}}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertMergeTag(tag)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-blue-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email Body Text</label>
              <textarea
                rows={8}
                value={campaignConfig.bodyText}
                onChange={e => setCampaignConfig(prev => ({ ...prev, bodyText: e.target.value }))}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs text-gray-900 leading-relaxed font-sans outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Header Banner Text</label>
                <input
                  type="text"
                  value={campaignConfig.headerLogoText || ''}
                  onChange={e => setCampaignConfig(prev => ({ ...prev, headerLogoText: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={campaignConfig.buttonText || ''}
                  onChange={e => setCampaignConfig(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="Reply to Apply Now"
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center justify-between">
                <span>Telegram Link (CTA Target)</span>
                <span className="text-[10px] text-blue-600 font-bold">Telegram Blue</span>
              </label>
              <input
                type="text"
                value={campaignConfig.buttonUrl || ''}
                onChange={e => setCampaignConfig(prev => ({ ...prev, buttonUrl: e.target.value }))}
                placeholder="https://t.me/+AB0OloYpE7I1NTVk"
                className="w-full bg-blue-50/50 border border-blue-200 rounded-lg p-2.5 text-xs font-mono text-blue-900 font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Sign-off Signature</label>
              <textarea
                rows={2}
                value={campaignConfig.signatureText || ''}
                onChange={e => setCampaignConfig(prev => ({ ...prev, signatureText: e.target.value }))}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Live Preview Canvas (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Live Rendering Output</span>
              </span>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                  <button
                    onClick={() => setDeviceFrame('macbook')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors ${deviceFrame === 'macbook' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600'}`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setDeviceFrame('mobile')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors ${deviceFrame === 'mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600'}`}
                  >
                    Mobile
                  </button>
                </div>

                <button onClick={handleCopyCode} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600" title="Copy HTML Code">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recipient Test Selector */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                Preview for contact:
              </span>
              <select
                value={selectedRecipientId}
                onChange={e => setSelectedRecipientId(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-xs font-bold py-1 px-3 rounded-lg outline-none"
              >
                {recipients.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.firstName} {r.lastName} ({r.email})
                  </option>
                ))}
              </select>
            </div>

            {/* HTML Email Canvas Render */}
            <div className={`flex-1 rounded-xl p-4 overflow-y-auto flex justify-center items-start border min-h-[320px] ${
              templateTheme === 'venita-black' ? 'bg-[#07080D] border-gray-800' : 'bg-gray-100 border-gray-200'
            }`}>
              {templateTheme === 'venita-black' ? (
                <div className={`w-full ${deviceFrame === 'mobile' ? 'max-w-[340px]' : 'max-w-[500px]'} bg-[#0D0E16] rounded-2xl shadow-2xl overflow-hidden border border-white/15 text-gray-100 my-auto`}>
                  {campaignConfig.headerLogoText && (
                    <div className="bg-black py-7 px-5 text-center text-white border-b border-white/10">
                      <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white font-['Cormorant_Garamond',serif]">
                        {campaignConfig.headerLogoText}
                      </h1>
                    </div>
                  )}

                  <div className="p-6 space-y-4 text-xs md:text-sm text-gray-200 leading-relaxed font-sans">
                    <div className="whitespace-pre-wrap">
                      {renderTextWithMergeTags(campaignConfig.bodyText)}
                    </div>

                    <div className="text-center py-4 space-y-4">
                      <div className="flex items-center justify-center gap-6 flex-wrap">
                        <a 
                          href={campaignConfig.buttonUrl || 'https://t.me/+AB0OloYpE7I1NTVk'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs md:text-sm py-2.5 px-5.5 rounded-lg shadow-md border border-slate-700 transition-all cursor-pointer m-1.5"
                        >
                          <span>Apply via Telegram</span>
                        </a>
                        <a 
                          href={`mailto:${activeSenderEmail || 'outreach@skillbridge.org'}`}
                          className="inline-flex items-center justify-center bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs md:text-sm py-2.5 px-5.5 rounded-lg shadow-md border border-slate-700 transition-all cursor-pointer m-1.5"
                        >
                          <span>Reply via Email</span>
                        </a>
                      </div>
                    </div>

                    {campaignConfig.signatureText && (
                      <div className="pt-4 border-t border-white/10 font-sans text-sm font-semibold text-gray-100 whitespace-pre-wrap">
                        {renderTextWithMergeTags(campaignConfig.signatureText)}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#07080D] px-6 py-3.5 border-t border-white/10 text-center text-xs text-gray-400 font-sans">
                    {activeSenderEmail ? `SkillBridge Student Outreach • ${activeSenderEmail}` : 'SkillBridge Student Outreach'}
                  </div>
                </div>
              ) : (
                <div className={`w-full ${deviceFrame === 'mobile' ? 'max-w-[340px]' : 'max-w-[500px]'} bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 text-gray-900 my-auto`}>
                  {campaignConfig.headerLogoText && (
                    <div className="bg-black py-7 px-5 text-center text-white border-b border-gray-800">
                      <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white font-['Cormorant_Garamond',serif]">
                        {campaignConfig.headerLogoText}
                      </h1>
                    </div>
                  )}

                  <div className="p-6 space-y-4 text-xs md:text-sm text-gray-800 leading-relaxed font-sans">
                    <div className="whitespace-pre-wrap">
                      {renderTextWithMergeTags(campaignConfig.bodyText)}
                    </div>

                    <div className="text-center py-4 space-y-4">
                      <div className="flex items-center justify-center gap-6 flex-wrap">
                        <a 
                          href={campaignConfig.buttonUrl || 'https://t.me/+AB0OloYpE7I1NTVk'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs md:text-sm py-2.5 px-5.5 rounded-lg shadow-md border border-slate-700 transition-all cursor-pointer m-1.5"
                        >
                          <span>Apply via Telegram</span>
                        </a>
                        <a 
                          href={`mailto:${activeSenderEmail || 'outreach@skillbridge.org'}`}
                          className="inline-flex items-center justify-center bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs md:text-sm py-2.5 px-5.5 rounded-lg shadow-md border border-slate-700 transition-all cursor-pointer m-1.5"
                        >
                          <span>Reply via Email</span>
                        </a>
                      </div>
                    </div>

                    {campaignConfig.signatureText && (
                      <div className="pt-4 border-t border-gray-200 font-sans text-sm font-semibold text-gray-900 whitespace-pre-wrap">
                        {renderTextWithMergeTags(campaignConfig.signatureText)}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 text-center text-xs text-gray-500 font-sans">
                    {activeSenderEmail ? `SkillBridge Student Outreach • ${activeSenderEmail}` : 'SkillBridge Student Outreach'}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={handleTestSendClick}
                disabled={isSendingTest}
                className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs flex-1 justify-center py-3 rounded-lg flex items-center gap-2 shadow-xs"
              >
                {isSendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-500" />}
                <span>Test 1 Email to Inbox</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('queue');
                  onStartQueue();
                }}
                className="bg-black hover:bg-gray-800 text-white font-bold text-xs flex-1 justify-center py-3 rounded-lg flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4 text-blue-400" />
                <span>Launch Full Campaign &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
