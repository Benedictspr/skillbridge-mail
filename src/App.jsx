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
import SentLogsView from './components/SentLogsView';
import DeliverabilityCenterView from './components/DeliverabilityCenterView';
import CampaignLifecycleView from './components/CampaignLifecycleView';
import SkillBridgeSmsView from './components/SkillBridgeSmsView';
import SkillBridgeWhatsAppView from './components/SkillBridgeWhatsAppView';
import SkillBridgeApiView from './components/SkillBridgeApiView';
import SmtpSettingsModal from './components/SmtpSettingsModal';
import GmailComposeModal from './components/GmailComposeModal';
import { 
  INITIAL_RECIPIENTS, 
  INITIAL_CAMPAIGN, 
  SKILLBRIDGE_STUDENTS, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_SUPPRESSION_LIST 
} from './mockData';
import { extractFirstNameFromEmail } from './utils/nameParser';

export default function App() {
  // Navigation & Multi-Tenant State
  const [activeTab, setActiveTab] = useState('deliverability'); // 'dashboard' | 'lifecycle' | 'deliverability' | 'recipients' | 'builder' | 'queue' | 'replies' | 'sent' | 'sms' | 'whatsapp' | 'api'
  const [activeSuite, setActiveSuite] = useState('mail'); // 'mail' | 'sms' | 'whatsapp' | 'design' | 'api'
  const [activeInboxTab, setActiveInboxTab] = useState('primary');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Multi-Tenant Organization Context
  const [currentOrg, setCurrentOrg] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_currentOrg');
      return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS[0];
    } catch (e) {
      return INITIAL_ORGANIZATIONS[0];
    }
  });

  // 2. Suppression List (Scraped Address Shield & Hard Bounces)
  const [suppressionList, setSuppressionList] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_suppressionList');
      return saved ? JSON.parse(saved) : INITIAL_SUPPRESSION_LIST;
    } catch (e) {
      return INITIAL_SUPPRESSION_LIST;
    }
  });

  // 3. Core Data Stores with LocalStorage Persistence & Safe Error Handling
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
      isUnread: true,
      organization_id: 'org_skillbridge_1001'
    },
    {
      id: 'reply-102',
      senderEmail: 'mary.smith@cambridge.org',
      senderName: 'Mary Smith',
      role: 'Python Developer',
      subject: 'Re: Remote Opportunity for Students',
      bodyText: "Hello Benedict,\n\nI saw your email regarding flexible student work opportunities. I specialize in Python, Django, and Data Science. I am available for 10-15 hours per week alongside my studies.\n\nLooking forward to hearing from you!\n\nMary Smith",
      receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isUnread: false,
      organization_id: 'org_skillbridge_1001'
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
  const recipientsRef = useRef(recipients);
  const campaignConfigRef = useRef(campaignConfig);
  const campaignStatusRef = useRef(campaignStatus);
  const queueTimerRef = useRef(null);

  // Synchronize refs
  useEffect(() => { recipientsRef.current = recipients; }, [recipients]);
  useEffect(() => { campaignConfigRef.current = campaignConfig; }, [campaignConfig]);
  useEffect(() => { campaignStatusRef.current = campaignStatus; }, [campaignStatus]);

  // Synchronize state with localStorage
  useEffect(() => {
    localStorage.setItem('skillbridge_currentOrg', JSON.stringify(currentOrg));
  }, [currentOrg]);

  useEffect(() => {
    localStorage.setItem('skillbridge_suppressionList', JSON.stringify(suppressionList));
  }, [suppressionList]);

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
    const scopedStudents = SKILLBRIDGE_STUDENTS.map(s => ({ ...s, organization_id: currentOrg.id }));
    setRecipients(scopedStudents);
    addLog(`Loaded SkillBridge Students dataset (${scopedStudents.length} contacts) bound to ${currentOrg.name}.`, 'info');
  };

  const handleStartQueue = () => {
    let safeList = Array.isArray(recipients) ? recipients : [];
    if (safeList.length === 0) {
      const scopedStudents = SKILLBRIDGE_STUDENTS.map(s => ({ ...s, organization_id: currentOrg.id }));
      setRecipients(scopedStudents);
      safeList = scopedStudents;
      addLog(`Loaded SkillBridge Students dataset (${scopedStudents.length} contacts).`, 'info');
    }

    const pending = safeList.filter(r => r?.status === 'Ready' || r?.status === 'Queued');
    if (pending.length === 0) {
      // Auto-reset all recipients to Ready if previous run completed
      setRecipients(prev => (Array.isArray(prev) ? prev : []).map(r => ({ ...r, status: 'Ready' })));
      addLog('Reset recipient roster statuses to Ready and starting dispatch queue...', 'info');
    }

    setActiveTab('queue');
    setCampaignStatus('SENDING');
    addLog('Campaign queue initiated with continuous 1-by-1 email dispatches.', 'info');
  };

  const handlePauseQueue = () => {
    setCampaignStatus('PAUSED');
    isSendingRef.current = false;
    if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    addLog('Queue paused by user.', 'info');
  };

  const handleResetQueue = () => {
    setCampaignStatus('IDLE');
    isSendingRef.current = false;
    if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    setRecipients(prev => (Array.isArray(prev) ? prev : []).map(r => ({ ...r, status: 'Ready' })));
    addLog('Reset dispatch queue to IDLE.', 'info');
  };

  // Dispatch single test email
  const handleSendSingleTest = async (recipientEmail) => {
    addLog(`Sending single test email to ${recipientEmail}...`, 'sending');
    try {
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          recipientName: 'Test Recipient',
          subject: campaignConfig.subject || 'Test Outreach Email',
          bodyText: campaignConfig.bodyText || 'Test Body',
          headerLogoText: campaignConfig.headerLogoText,
          buttonText: campaignConfig.buttonText,
          buttonUrl: campaignConfig.buttonUrl,
          signatureText: campaignConfig.signatureText,
          smtpUser: smtpConfig.user,
          smtpPass: smtpConfig.pass,
          organization_id: currentOrg.id
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        addLog(`Test email successfully sent to ${recipientEmail}!`, 'success');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        return true;
      } else {
        addLog(`Test email failed: ${resData.message || 'Server error'}`, 'error');
        return false;
      }
    } catch (err) {
      addLog(`Test email error: ${err.message}. Check backend node server.`, 'error');
      return false;
    }
  };

  // Dispatch batch email backend helper
  const dispatchEmailToBackend = async (recipient) => {
    try {
      // Check suppression list first (Scraped Shield / Hard Bounce)
      const isSuppressed = suppressionList.some(s => s.email.toLowerCase() === recipient.email.toLowerCase());
      if (isSuppressed) {
        addLog(`BLOCKED: Recipient ${recipient.email} is in Organization Suppression List! Skipping.`, 'error');
        return false;
      }

      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient.email,
          recipientName: recipient.firstName ? `${recipient.firstName} ${recipient.lastName || ''}`.trim() : recipient.email,
          subject: campaignConfig.subject || 'Remote Opportunity for Students',
          bodyText: campaignConfig.bodyText || '',
          headerLogoText: campaignConfig.headerLogoText,
          buttonText: campaignConfig.buttonText,
          buttonUrl: campaignConfig.buttonUrl,
          signatureText: campaignConfig.signatureText,
          smtpUser: smtpConfig.user,
          smtpPass: smtpConfig.pass,
          organization_id: currentOrg.id
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        addLog(`Dispatched to ${recipient.firstName || 'Student'} (${recipient.email}) successfully!`, 'success');
        return true;
      } else {
        addLog(`Failed sending to ${recipient.email}: ${resData.message || 'Error'}`, 'error');
        return false;
      }
    } catch (err) {
      addLog(`Network/Server error dispatching to ${recipient.email}: ${err.message}`, 'error');
      return false;
    }
  };

  const fetchSentHistoryFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sent-history');
      if (response.ok) {
        const data = await response.json();
        if (data.sentHistory) {
          setSentHistoryLog(data.sentHistory);
        }
      }
    } catch (e) {
      // silent backend check
    }
  };

  const fetchRepliesFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/replies');
      if (response.ok) {
        const data = await response.json();
        if (data.replies && Array.isArray(data.replies)) {
          setReplies(data.replies);
        }
      }
    } catch (e) {
      // silent backend check
    }
  };

  useEffect(() => {
    fetchSentHistoryFromBackend();
    fetchRepliesFromBackend();
  }, []);

  // Continuous Pacing Queue Engine
  useEffect(() => {
    if (campaignStatus !== 'SENDING') {
      isSendingRef.current = false;
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
      return;
    }

    const runNextDispatchStep = async () => {
      if (isSendingRef.current) return;
      isSendingRef.current = true;

      const currentList = recipientsRef.current || [];
      const pendingRecipients = currentList.filter(r => r?.status === 'Ready' || r?.status === 'Queued');

      if (pendingRecipients.length === 0) {
        setCampaignStatus('COMPLETED');
        isSendingRef.current = false;
        addLog('All campaign emails dispatched cleanly!', 'success');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return;
      }

      const nextRecipient = pendingRecipients[0];
      const baseSec = campaignConfigRef.current.intervalSeconds || 5;
      const useJitter = campaignConfigRef.current.useJitter !== false;
      const intervalSec = useJitter ? baseSec + Math.floor(Math.random() * 3) : baseSec;
      const delayMs = intervalSec * 1000;

      addLog(`Pacing Engine: Waiting ${intervalSec}s before sending to ${nextRecipient.firstName || 'Friend'} (${nextRecipient.email})...`, 'sending');

      queueTimerRef.current = setTimeout(async () => {
        if (campaignStatusRef.current !== 'SENDING') {
          isSendingRef.current = false;
          return;
        }

        setRecipients(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === nextRecipient.id ? { ...r, status: 'Sending' } : r));

        const success = await dispatchEmailToBackend(nextRecipient);

        setRecipients(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === nextRecipient.id ? { ...r, status: success ? 'Sent' : 'Failed' } : r));
        await fetchSentHistoryFromBackend();

        isSendingRef.current = false;

        if (campaignStatusRef.current === 'SENDING') {
          setTimeout(() => {
            runNextDispatchStep();
          }, 150);
        }
      }, delayMs);
    };

    runNextDispatchStep();

    return () => {
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    };
  }, [campaignStatus]);

  return (
    <div className="min-h-screen bg-[#D4F1E8] flex flex-col font-sans">
      <AppHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        campaignStatus={campaignStatus}
        onRefresh={() => addLog('Refreshed workspace deliverability status.', 'info')}
        onToggleSidebar={() => {
          setIsSidebarCollapsed(!isSidebarCollapsed);
          setIsMobileSidebarOpen(!isMobileSidebarOpen);
        }}
        onOpenSettings={() => setIsSmtpModalOpen(true)}
        onNavigateHome={() => {
          setActiveTab('dashboard');
          setActiveInboxTab('primary');
        }}
        currentOrg={currentOrg}
        setCurrentOrg={setCurrentOrg}
        activeSuite={activeSuite}
        setActiveSuite={setActiveSuite}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'settings') setIsSmtpModalOpen(true);
            else setActiveTab(tab);
          }}
          recipients={recipients}
          repliesCount={(replies || []).filter(r => r?.isUnread).length}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLoadSkillBridgeData={handleLoadSkillBridgeData}
          onOpenCompose={() => setIsComposeOpen(true)}
          campaignStatus={campaignStatus}
          currentOrg={currentOrg}
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
              currentOrg={currentOrg}
            />
          )}

          {activeTab === 'lifecycle' && (
            <div className="p-4 flex-1">
              <CampaignLifecycleView
                campaignConfig={campaignConfig}
                recipients={recipients}
                currentOrg={currentOrg}
                onNavigateTo={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'deliverability' && (
            <div className="p-4 flex-1">
              <DeliverabilityCenterView
                currentOrg={currentOrg}
                suppressionList={suppressionList}
                setSuppressionList={setSuppressionList}
                onUpdateOrg={(updated) => setCurrentOrg(updated)}
              />
            </div>
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
              currentOrg={currentOrg}
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
                currentOrg={currentOrg}
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
                currentOrg={currentOrg}
              />
            </div>
          )}

          {activeTab === 'queue' && (
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
                currentOrg={currentOrg}
              />
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="p-4 flex-1">
              <SentLogsView
                sentHistoryLog={sentHistoryLog}
                recipientTracker={recipientTracker}
                recipients={recipients}
                currentOrg={currentOrg}
              />
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="p-4 flex-1">
              <SkillBridgeSmsView currentOrg={currentOrg} />
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="p-4 flex-1">
              <SkillBridgeWhatsAppView currentOrg={currentOrg} />
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-4 flex-1">
              <SkillBridgeApiView currentOrg={currentOrg} />
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
        currentOrg={currentOrg}
      />

      <SmtpSettingsModal
        isOpen={isSmtpModalOpen}
        onClose={() => setIsSmtpModalOpen(false)}
        smtpConfig={smtpConfig}
        setSmtpConfig={setSmtpConfig}
        currentOrg={currentOrg}
      />
    </div>
  );
}
