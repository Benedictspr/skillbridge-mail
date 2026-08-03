import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import AppRightPanel from './components/AppRightPanel';
import DashboardView from './components/DashboardView';
import RecipientImportView from './components/RecipientImportView';
import GmailMintInboxView from './components/GmailMintInboxView';
import EmailBuilderView from './components/EmailBuilderView';
import SendingQueueView from './components/SendingQueueView';
import ReceivedRepliesView from './components/ReceivedRepliesView';
import SmtpSettingsModal from './components/SmtpSettingsModal';
import GmailComposeModal from './components/GmailComposeModal';
import { INITIAL_RECIPIENTS, INITIAL_CAMPAIGN, SKILLBRIDGE_STUDENTS } from './mockData';
import { extractFirstNameFromEmail } from './utils/nameParser';

const DOODLE_B64_IMAGE = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA1MDAgNDAiIGZpbGw9Im5vbmUiPgogIDwhLS0gTGVmdCBEYXNoZWQgQXhpcyAtLT4KICA8bGluZSB4MT0iMTUiIHkxPSIyMCIgeDI9Ijg1IiB5Mj0iMjAiIHN0cm9rZT0iIzcxODA5NiIgc3Ryb2tlLXdpZHRoPSIxLjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQgMyIgLz4KICAKICA8IS0tIExlZnQgRmxvdXJpc2ggLS0+CiAgPHBhdGggZD0iTSA4NSAyMCBDIDkyIDE0IDk8IDEyIDEwMiA4IE0gODUgMjAgQyA5MiAyNCA5NiAyMiAxMDIgMjIgTSA5MCAyMCBDIDkz IDE2IDk3 IDE0IDEwMCAxMSIgc3Ryb2tlPSIjQTBBRUMwIiBzdHJva2Utd2lkdGg9IjEuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIAogIDwhLS0gTW90aWYgMTogSUQgLyBDZXJ0aWZpY2F0ZSBDYXJkICh4PTExNSkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE1LCA4KSIgc3Ryb2tlPSIjQ0JENUUwIiBzdHJva2Utd2lkdGg9IjEuNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyMiIgaGVpZ2h0PSIxOCIgcng9IjMiIC8+CiAgICA8Y2lyY2xlIGN4PSI4IiBjeT0iOSIgcj0iMi41IiAvPgogICAgPHBhdGggZD0iTSA0IDE3IEMgNCAxNCA2 IDEzIDggMTMgQyAxMCAxMyAxMiAxNCAxMiAxNyIgLz4KICAgIDxsaW5lIHgxPSIxMyIgeTE9IjciIHgyPSIyMCIgeTI9IjciIC8+CiAgICA8bGluZSB4MT0iMTMiIHkxPSIxMSIgeDI9IjE5IiB5Mj0iMTEiIC8+CiAgICA8bGluZSB4MT0iMTMiIHkxPSIxNSIgeDI9IjE3IiB5Mj0iMTUiIC8+CiAgPC9nPgoKICA8IS0tIE1vdGlmIDI6IE9wZW4gQm9vayAoeD0xNjUpIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2NSwgOCkiIHN0cm9rZT0iI0UyRThGMCIgc3Ryb2tlLXdpZHRoPSIxLjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CiAgICA8cGF0aCBkPSJNIDIgNiBDIDEyIDMgMjAgNSAyMyA3IEMgMjYgNSAzNCAzIDQ0IDYgViAyMCBDIDM0IDE3IDI2IDE5IDIzIDE4IEMgMjAgMTkgMTIgMTcgMiAyMCBaIiAvPgogICAgPGxpbmUgeDE9IjIzIiB5MT0iNyIgeDI9IjIzIiB5Mj0iMTgiIC8+CiAgICA8cGF0aCBkPSJNIDYgMTAgQyAxMSA4IDE2IDkgMTkgMTAgTSA2IDE0IEMgMTEgMTIgMTYgMTMgMTkgMTQgTSAyNyAxMCBDIDMwIDkgMzUgOCA0MCAxMCBNIDI3IDE0IEMgMzAgMTMgMzUgMTIgNDAgMTQiIC8+CiAgPC9nPgoKICA8IS0tIE1vdGlmIDM6IENlbnRlcnBpZWNlIEdyYWR1YXRpb24gQ2FwIHdpdGggVGFzc2VsICh4PTIyNSkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjI1LCAyKSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjUsMiA0OCwxMiAyNSwyMiAyLDEyIiBmaWxsPSIjRTJFOEYwIiBmaWxsLW9wYWNpdHk9IjAuMSIgLz4KICAgIDxwYXRoIGQ9Ik0gMTAgMTYgViAyMyBDIDEwIDI2IDQwIDI2IDQwIDIzIFYgMTYiIC8+CiAgICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjEyIiByPSIyIiBmaWxsPSIjRkZGRkZGIiAvPgogICAgPHBhdGggZD0iTSAyNSAxMiBDIDE2IDE0IDkgMjAgNyAyNSIgLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNSwyNSA5LDMwIDQsMzAiIGZpbGw9IiNGRkZGRkYiIC8+CiAgPC9nPgoKICA8IS0tIE1vdGlmIDQ6IE1pY3Jvc2NvcGUgKHg9Mjk1KSAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTUsIDYpIiBzdHJva2U9IiNDQkQ1RTAiIHN0cm9rZS13aWR0aD0iMS40IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogICAgPGxpbmUgeDE9IjQiIHkxPSIyNCIgeDI9IjIyIiB5Mj0iMjQiIC8+CiAgICA8bGluZSB4MT0iMTMiIHkxPSIyNCIgeDI9IjEzIiB5Mj0iMTgiIC8+CiAgICA8cGF0aCBkPSJN IDEzIDE0IEMgMTggMTQgMjAgOSAxOCA1IEMgMTYgMiAxMSAyIDkgNSBMIDEzIDE0IiAvPgogICAgPHJlY3QgeD0iOCIgeT0iNyIgd2lkdGg9IjUiIGhlaWghtPSI3IiByeD0iMSIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwIDEwIDEwKSIgLz4KICAgIDxjaXJjbGUgY3g9IjE3IiBjeT0iMTgiIHI9IjEuNSIgLz4KICA8L2c+CgogIDwhLS0gTW90aWYgNTogUXVpbGwgUGVuICYgSW5rcG90ICh4PTM0NSkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzQ1LCA2KSIgc3Ryb2tlPSIjRTJFOEYwIiBzdHJva2Utd2lkdGg9IjEuNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxwYXRoIGQ9Ik0gMjAgMiBDIDEyIDUgNyAxNCA1IDI0IE0gMjAgMiBDIDE2IDggMTYgMTUgMTggMjEiIC8+CiAgICA8bGluZSB4MT0iMTUiIHkxPSI3IiB4Mj0iMTkiIHkyPSI5IiAvPgogICAgPGxpbmUgeDE9IjE0IiB5MT0iMTEiIHgyPSIxOCIgeTI9IjEzIiAvPgogICAgPGxpbmUgeDE9IjEzIiB5MT0iMTUiIHgyPSIxNyIgeTI9IjE3IiAvPgogICAgPHJlY3QgeD0iMiIgeT0iMTciIHdpZHRoPSI4IiBoZWlnaHQ9IjciIHJ4PSIxIiAvPgogICAgPHBhdGggZD0iTSA0IDE3IFYgMTQgSDggViAxNyIgLz4KICA8L2c+CgogIDwhLS0gUmlnaHQgRmxvdXJpc2ggLS0+CiAgPGcgc3Ryb2tlPSIjQTBBRUMwIiBzdHJva2Utd2lkdGg9IjEuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj4KICAgIDxwYXRoIGQ9Ik0gNDE1IDIwIEMgNDA4IDE0IDQwMiAxMiAzOTggOCBNIDQxNSAyMCBDIDQwOCAyNCA0MDQgMjIgMzk4IDIyIE0gNDEwIDIwIEMgNDA3IDE2IDQwMyAxNCA0MDAgMTEiIC8+CiAgPC9nPgoKICA8IS0tIFJpZ2h0IERhc2hlZCBBeGlzIC0tPgogIDxsaW5lIHgxPSI0MTUiIHkxPSIyMCIgeDI9IjQ4NSIgeTI9IjIwIiBzdHJva2U9IiM3MTgwOTYiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2UtZGFzaGFycmF5PSI0IDMiIC8+Cjwvc3ZnPg==`;

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('builder'); // 'dashboard' | 'recipients' | 'builder' | 'queue' | 'replies'
  const [activeInboxTab, setActiveInboxTab] = useState('primary');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Core Data Stores with LocalStorage Persistence & Safe Error Handling
  const [smtpConfig, setSmtpConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_smtpConfig');
      return saved ? JSON.parse(saved) : { mode: 'gmail', user: 'outreach@skillbridge.org', pass: '' };
    } catch (e) {
      return { mode: 'gmail', user: 'outreach@skillbridge.org', pass: '' };
    }
  });

  const [recipients, setRecipients] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_recipients');
      const parsed = saved ? JSON.parse(saved) : null;
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_RECIPIENTS;
    } catch (e) {
      return INITIAL_RECIPIENTS;
    }
  });

  const [campaignConfig, setCampaignConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_campaignConfig');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGN;
    } catch (e) {
      return INITIAL_CAMPAIGN;
    }
  });

  // Received Replies Inbox state
  const [replies, setReplies] = useState([
    {
      id: 'reply-101',
      senderEmail: 'john.doe@university.edu',
      senderName: 'John Doe',
      role: 'Mathematics Tutor',
      subject: 'Re: Remote Opportunity for Students',
      bodyText: "Hi Benedict,\n\nThank you for reaching out! I am a 3rd-year Mathematics student at University and very interested in the remote tutoring role. I have 2 years of teaching experience with high school algebra and calculus.\n\nPlease let me know the next steps for applying.\n\nBest regards,\nJohn Doe",
      receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      isUnread: true
    },
    {
      id: 'reply-102',
      senderEmail: 'mary.smith@cambridge.org',
      senderName: 'Mary Smith',
      role: 'Python Developer',
      subject: 'Re: Remote Opportunity for Students',
      bodyText: "Hello Benedict,\n\nI saw your email regarding flexible student work opportunities. I specialize in Python, Django, and Data Science. I am available for 10-15 hours per week alongside my studies.\n\nLooking forward to hearing from you!\n\nMary Smith",
      receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isUnread: false
    }
  ]);

  const [sentHistoryLog, setSentHistoryLog] = useState([]);
  const [campaignStatus, setCampaignStatus] = useState('IDLE');
  const [logs, setLogs] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);

  // Sidebar collapsed in ICON-ONLY mode by default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [recipientTracker, setRecipientTracker] = useState({});
  const isSendingRef = useRef(false);

  // Synchronize state with localStorage
  useEffect(() => {
    localStorage.setItem('skillbridge_smtpConfig', JSON.stringify(smtpConfig));
  }, [smtpConfig]);

  useEffect(() => {
    localStorage.setItem('skillbridge_recipients', JSON.stringify(recipients));
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem('skillbridge_campaignConfig', JSON.stringify(campaignConfig));
  }, [campaignConfig]);

  const addLog = (message, type = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp: timeStr, message, type }, ...prev]);
  };

  const handleLoadSkillBridgeData = () => {
    setRecipients(SKILLBRIDGE_STUDENTS);
    addLog(`Loaded SkillBridge Students dataset (${SKILLBRIDGE_STUDENTS.length} contacts).`, 'info');
  };

  const handleStartQueue = () => {
    const pending = recipients.filter(r => r.status === 'Ready' || r.status === 'Queued');
    if (pending.length === 0) {
      alert('Please add recipient emails to your roster first!');
      return;
    }
    setCampaignStatus('SENDING');
    addLog('Campaign queue initiated with 5–10 second anti-spam delay per email.', 'info');
  };

  const handlePauseQueue = () => {
    setCampaignStatus('PAUSED');
    addLog('Queue paused by user.', 'info');
  };

  const handleResetQueue = () => {
    setCampaignStatus('IDLE');
    setRecipients(prev => prev.map(r => ({ ...r, status: 'Ready' })));
    setRecipientTracker({});
    addLog('Reset all recipient statuses to Ready.', 'info');
  };

  const fetchRepliesFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/replies');
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (err) {
      // Backend starting up
    }
  };

  const fetchSentHistoryFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sent-history');
      if (response.ok) {
        const data = await response.json();
        setSentHistoryLog(data);
      }
    } catch (err) {
      // Backend starting up
    }
  };

  // Poll backend open tracking statuses & incoming replies every 3 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/recipient-statuses');
        if (response.ok) {
          const data = await response.json();
          setRecipientTracker(data);
        }
        await fetchRepliesFromBackend();
        await fetchSentHistoryFromBackend();
      } catch (err) {
        // Backend starting up
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  // Dispatch Email Function (Calls Backend Server)
  const dispatchEmailToBackend = async (recipient) => {
    const replyAddress = smtpConfig.user || campaignConfig.senderEmail || '';
    const ctaUrl = campaignConfig.buttonUrl || 'https://t.me/+AB0OloYpE7I1NTVk';

    const firstNameVal = (recipient.firstName && recipient.firstName !== 'Friend')
      ? recipient.firstName
      : extractFirstNameFromEmail(recipient.email);

    const renderedBody = campaignConfig.bodyText
      .replaceAll('{{first_name}}', firstNameVal)
      .replaceAll('{{last_name}}', recipient.lastName || '')
      .replaceAll('{{email}}', recipient.email || '')
      .replaceAll('{{company}}', recipient.company || 'SkillBridge')
      .replaceAll('{{role}}', recipient.role || 'Student')
      .replaceAll('{{sender_name}}', campaignConfig.senderName || 'Benedict')
      .replace(/\n/g, '<br/>');

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #07080D; margin: 0; padding: 20px; color: #F9FAFB; }
    .container { max-width: 580px; margin: 0 auto; background: #0D0E16; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
    .header { background: #000000; padding: 32px 24px; text-align: center; color: #ffffff; font-family: 'Cormorant Garamond', Garamond, Georgia, serif; font-weight: 700; font-size: 28px; letter-spacing: 3px; border-bottom: 1px solid rgba(255,255,255,0.12); text-transform: uppercase; }
    .content { padding: 36px; font-size: 15px; line-height: 1.8; color: #E2E8F0; }
    .signature { margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: #F1F5F9; font-size: 15px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; }
    .footer { background: #07080D; padding: 18px 36px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${campaignConfig.headerLogoText || 'SKILLBRIDGE CAREERS'}</div>
    <div class="content">
      ${renderedBody}
      <div style="margin: 28px 0 20px 0; text-align: center;">
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-collapse: separate; border-spacing: 18px 10px;">
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="background: #0f172a; color: #ffffff !important; padding: 11px 22px; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: inline-block; white-space: nowrap; margin: 6px 10px;">Apply via Telegram</a>
            </td>
            <td align="center" style="padding: 0;">
              <a href="mailto:${replyAddress || 'outreach@skillbridge.org'}" style="background: #0f172a; color: #ffffff !important; padding: 11px 22px; text-decoration: none; font-weight: 700; border-radius: 8px; font-size: 14px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: inline-block; white-space: nowrap; margin: 6px 10px;">Reply via Email</a>
            </td>
          </tr>
        </table>
      </div>
      <div class="signature">${campaignConfig.signatureText ? campaignConfig.signatureText.replace(/\n/g, '<br/>') : 'Benedict'}</div>
    </div>
    <div class="footer">${replyAddress ? `SkillBridge Student Outreach &bull; ${replyAddress}` : 'SkillBridge Student Outreach'}</div>
  </div>
</body>
</html>`;

    try {
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          to: recipient.email,
          recipientName: recipient.firstName ? `${recipient.firstName} ${recipient.lastName || ''}`.trim() : recipient.email,
          subject: campaignConfig.subject.replaceAll('{{first_name}}', recipient.firstName || 'Friend'),
          html: fullHtml,
          smtpUser: smtpConfig.user,
          smtpPass: smtpConfig.pass,
          mode: smtpConfig.mode
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        addLog(`Sent to ${recipient.email} via ${data.mode.toUpperCase()} SMTP. MessageID: ${data.messageId || 'OK'}`, 'success');
        return true;
      } else {
        addLog(`Failed delivery to ${recipient.email}: ${data.error || 'Unknown error'}`, 'error');
        return false;
      }
    } catch (err) {
      addLog(`Backend delivery error for ${recipient.email}: ${err.message}`, 'error');
      return false;
    }
  };

  const handleSendSingleTest = async () => {
    const target = recipients.find(r => r.status === 'Ready' || r.status === 'Queued') || recipients[0];
    if (!target) {
      alert('Please add at least one recipient email address first!');
      return;
    }

    addLog(`Preparing single test dispatch for ${target.firstName} (${target.email})...`, 'sending');
    setRecipients(prev => prev.map(r => r.id === target.id ? { ...r, status: 'Sending' } : r));

    const success = await dispatchEmailToBackend(target);
    setRecipients(prev => prev.map(r => r.id === target.id ? { ...r, status: success ? 'Sent' : 'Failed' } : r));
    await fetchSentHistoryFromBackend();
  };

  // Queue Execution Engine Loop with Randomized 5-10 Second Anti-Spam Pacing Delay
  useEffect(() => {
    if (campaignStatus !== 'SENDING') {
      isSendingRef.current = false;
      return;
    }

    if (isSendingRef.current) return;

    const nextRecipient = recipients.find(r => r.status === 'Ready' || r.status === 'Queued');

    if (!nextRecipient) {
      setCampaignStatus('COMPLETED');
      addLog('Campaign complete. All recipients have received individual messages.', 'success');
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      isSendingRef.current = false;
      return;
    }

    isSendingRef.current = true;

    // Randomized 5 to 10 second delay between dispatches to protect Gmail reputation
    const delayMs = Math.floor(Math.random() * 5000) + 5000;
    const delaySec = (delayMs / 1000).toFixed(1);

    setRecipients(prev => prev.map(r => r.id === nextRecipient.id ? { ...r, status: 'Sending' } : r));
    addLog(`Pacing Engine: Waiting ${delaySec}s before sending to ${nextRecipient.firstName} (${nextRecipient.email}) [5-10s delay protection active]...`, 'sending');

    const timer = setTimeout(async () => {
      const success = await dispatchEmailToBackend(nextRecipient);
      setRecipients(prev => prev.map(r => r.id === nextRecipient.id ? { ...r, status: success ? 'Sent' : 'Failed' } : r));
      await fetchSentHistoryFromBackend();
      isSendingRef.current = false;
    }, delayMs);

    return () => clearTimeout(timer);
  }, [campaignStatus, recipients, campaignConfig, smtpConfig]);

  return (
    <div className="min-h-screen bg-[#D4F1E8] flex flex-col font-sans">
      <AppHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        campaignStatus={campaignStatus}
        onRefresh={() => addLog('Refreshed workspace status.', 'info')}
        onToggleSidebar={() => {
          setIsSidebarCollapsed(!isSidebarCollapsed);
          setIsMobileSidebarOpen(!isMobileSidebarOpen);
        }}
        onOpenSettings={() => setIsSmtpModalOpen(true)}
        onNavigateHome={() => {
          setActiveTab('recipients');
          setActiveInboxTab('primary');
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'settings') setIsSmtpModalOpen(true);
            else setActiveTab(tab);
          }}
          unreadRepliesCount={replies.filter(r => r.isUnread).length}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              recipients={recipients}
              campaignStatus={campaignStatus}
              onStartQueue={handleStartQueue}
              onPauseQueue={handlePauseQueue}
              recipientTracker={recipientTracker}
              setActiveTab={setActiveTab}
              onOpenCompose={() => setIsComposeOpen(true)}
            />
          )}

          {activeTab === 'recipients' && (
            <RecipientImportView
              recipients={recipients}
              setRecipients={setRecipients}
              onLoadSkillBridgeData={handleLoadSkillBridgeData}
              onOpenCompose={() => setIsComposeOpen(true)}
              searchTerm={searchTerm}
              recipientTracker={recipientTracker}
              activeInboxTab={activeInboxTab}
              setActiveInboxTab={setActiveInboxTab}
            />
          )}

          {activeTab === 'replies' && (
            <div className="p-4 flex-1">
              <ReceivedRepliesView
                replies={replies}
                setReplies={setReplies}
                onOpenCompose={() => setIsComposeOpen(true)}
                setCampaignConfig={setCampaignConfig}
                onRefreshReplies={fetchRepliesFromBackend}
                smtpConfig={smtpConfig}
              />
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="p-4 flex-1">
              <EmailBuilderView
                campaignConfig={campaignConfig}
                setCampaignConfig={setCampaignConfig}
                recipients={recipients}
                onStartQueue={handleStartQueue}
                setActiveTab={setActiveTab}
                onSendSingleTest={handleSendSingleTest}
                smtpConfig={smtpConfig}
              />
            </div>
          )}

          {(activeTab === 'queue' || activeTab === 'sent') && (
            <div className="p-4 flex-1">
              <SendingQueueView
                recipients={recipients}
                campaignStatus={campaignStatus}
                onStartQueue={handleStartQueue}
                onPauseQueue={handlePauseQueue}
                onResetQueue={handleResetQueue}
                onSendSingleTest={handleSendSingleTest}
                logs={logs}
                campaignConfig={campaignConfig}
                setCampaignConfig={setCampaignConfig}
                recipientTracker={recipientTracker}
                sentHistoryLog={sentHistoryLog}
              />
            </div>
          )}

          {/* Fallback for settings or unhandled activeTab */}
          {!['dashboard', 'overview', 'recipients', 'replies', 'builder', 'queue', 'sent'].includes(activeTab) && (
            <div className="p-4 flex-1">
              <EmailBuilderView
                campaignConfig={campaignConfig}
                setCampaignConfig={setCampaignConfig}
                recipients={recipients}
                onStartQueue={handleStartQueue}
                setActiveTab={setActiveTab}
                onSendSingleTest={handleSendSingleTest}
                smtpConfig={smtpConfig}
              />
            </div>
          )}
        </div>

        <AppRightPanel 
          recipients={recipients} 
          setRecipients={setRecipients} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>

      <GmailComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        campaignConfig={campaignConfig}
        setCampaignConfig={setCampaignConfig}
        recipients={recipients}
        onStartQueue={handleStartQueue}
        onSendSingleTest={handleSendSingleTest}
      />

      <SmtpSettingsModal
        isOpen={isSmtpModalOpen}
        onClose={() => setIsSmtpModalOpen(false)}
        smtpConfig={smtpConfig}
        setSmtpConfig={setSmtpConfig}
      />
    </div>
  );
}
