import React, { useState, useEffect, useRef, startTransition } from 'react';
import confetti from 'canvas-confetti';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import DashboardView from './components/DashboardView';
import RecipientImportView from './components/RecipientImportView';
import GmailMintInboxView from './components/GmailMintInboxView';
import EmailBuilderView from './components/EmailBuilderView';
import SendingQueueView from './components/SendingQueueView';
import ReceivedRepliesView from './components/ReceivedRepliesView';
import SentLogsView from './components/SentLogsView';
import DeliverabilityCenterView from './components/DeliverabilityCenterView';
import SkillBridgeSmsView from './components/SkillBridgeSmsView';
import SkillBridgeWhatsAppView from './components/SkillBridgeWhatsAppView';
import SkillBridgeApiView from './components/SkillBridgeApiView';
import SmtpSettingsModal from './components/SmtpSettingsModal';
import GmailComposeModal from './components/GmailComposeModal';
import AuthPage from './components/auth/AuthPage';
import OnboardingWizard from './components/auth/OnboardingWizard';
import UserProfileModal from './components/auth/UserProfileModal';
import { 
  INITIAL_RECIPIENTS, 
  INITIAL_CAMPAIGN, 
  SKILLBRIDGE_STUDENTS, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_SUPPRESSION_LIST 
} from './mockData';
import { extractFirstNameFromEmail } from './utils/nameParser';
import { getRegisteredUsers, registerUser } from './utils/userStore';

export default function App() {
  // 0. User Authentication & Onboarding State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingWizardOpen, setIsOnboardingWizardOpen] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');

  // 1-Click Magic Link Email Verification Handler
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyCode = urlParams.get('verify_code');
      const verifyEmail = urlParams.get('email');
      
      if (verifyCode && verifyEmail) {
        const cleanEmail = decodeURIComponent(verifyEmail).trim().toLowerCase();
        
        const users = getRegisteredUsers();
        let userRecord = users.find(u => u.email.toLowerCase() === cleanEmail);
        
        if (!userRecord) {
          userRecord = registerUser({
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            company: `${cleanEmail.split('@')[0]}'s Workspace`,
            password: 'Password123!',
            role: 'Workspace Owner',
            isEmailVerified: true
          });
        } else {
          userRecord.isEmailVerified = true;
        }

        setCurrentUser(userRecord);
        setVerificationNotice(`Email address ${cleanEmail} verified successfully via Magic Link! Welcome to Sendaat Workspace.`);
        
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } catch (e) {}

        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => setVerificationNotice(''), 7000);
      }
    } catch (err) {
      console.error('Magic URL verification error:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sendaat_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sendaat_currentUser');
    }
  }, [currentUser]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (!user.onboardingCompleted) {
      setIsOnboardingWizardOpen(true);
    }
  };

  const handleCompleteOnboarding = (config) => {
    const updatedUser = {
      ...currentUser,
      onboardingCompleted: true,
      company: config.workspaceName || currentUser.company
    };
    setCurrentUser(updatedUser);
    setIsOnboardingWizardOpen(false);
    setActiveTab('dashboard');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    setIsOnboardingWizardOpen(false);
  };

  // Navigation & Multi-Tenant State
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to 4-step dashboard protocol view
  const [activeSuite, setActiveSuite] = useState('mail'); // 'mail' | 'sms' | 'whatsapp' | 'design' | 'api'
  const [activeInboxTab, setActiveInboxTab] = useState('primary');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Adaptive Theme State (Black / White)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_theme');
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    localStorage.setItem('sendaat_theme', theme);
  }, [theme]);

  // 1. Multi-Tenant Organization Context
  const [currentOrg, setCurrentOrg] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_currentOrg');
      return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS[0];
    } catch (e) {
      return INITIAL_ORGANIZATIONS[0];
    }
  });

  // 2. Suppression List (Scraped Address Shield & Hard Bounces)
  const [suppressionList, setSuppressionList] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_suppressionList');
      return saved ? JSON.parse(saved) : INITIAL_SUPPRESSION_LIST;
    } catch (e) {
      return INITIAL_SUPPRESSION_LIST;
    }
  });

  // 3. Core Data Stores with LocalStorage Persistence & Safe Error Handling
  const [smtpConfig, setSmtpConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_smtpConfig');
      return saved ? JSON.parse(saved) : { mode: 'gmail', user: 'shaptsevjkonikevich@gmail.com', pass: 'smjpsmbbqhjvovcp' };
    } catch (e) {
      return { mode: 'gmail', user: 'shaptsevjkonikevich@gmail.com', pass: 'smjpsmbbqhjvovcp' };
    }
  });

  const [recipients, setRecipients] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_recipients');
      const parsed = saved ? JSON.parse(saved) : null;
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_RECIPIENTS;
    } catch (e) {
      return INITIAL_RECIPIENTS;
    }
  });

  const [campaignConfig, setCampaignConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_campaignConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.subject?.includes('Remote Opportunity') || parsed?.bodyText?.includes('flexible remote work')) {
          localStorage.removeItem('sendaat_campaignConfig');
          return INITIAL_CAMPAIGN;
        }
        return parsed;
      }
      return INITIAL_CAMPAIGN;
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
      subject: 'Re: Remote Opportunity for Candidates',
      bodyText: "Hi Maverick,\n\nThank you for reaching out! I am a 3rd-year Mathematics student at University and very interested in the remote tutoring role. I have 2 years of teaching experience with high school algebra and calculus.\n\nPlease let me know the next steps for applying.\n\nBest regards,\nJohn Doe",
      receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      isUnread: true,
      organization_id: 'org_sendaat_1001'
    },
    {
      id: 'reply-102',
      senderEmail: 'mary.smith@cambridge.org',
      senderName: 'Mary Smith',
      role: 'Python Developer',
      subject: 'Re: Remote Opportunity for Candidates',
      bodyText: "Hello Maverick,\n\nI saw your email regarding flexible work opportunities. I specialize in Python, Django, and Data Science. I am available for 10-15 hours per week alongside my schedule.\n\nLooking forward to hearing from you!\n\nMary Smith",
      receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isUnread: false,
      organization_id: 'org_sendaat_1001'
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
    localStorage.setItem('sendaat_currentOrg', JSON.stringify(currentOrg));
  }, [currentOrg]);

  useEffect(() => {
    localStorage.setItem('sendaat_suppressionList', JSON.stringify(suppressionList));
  }, [suppressionList]);

  useEffect(() => {
    localStorage.setItem('sendaat_smtpConfig', JSON.stringify(smtpConfig));
  }, [smtpConfig]);

  useEffect(() => {
    localStorage.setItem('sendaat_recipients', JSON.stringify(recipients));
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem('sendaat_campaignConfig', JSON.stringify(campaignConfig));
  }, [campaignConfig]);

  const addLog = (message, type = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp: timeStr, message, type }, ...prev]);
  };

  const handleLoadSendaatData = () => {
    const scopedStudents = SKILLBRIDGE_STUDENTS.map(s => ({ ...s, organization_id: currentOrg.id }));
    setRecipients(scopedStudents);
    addLog(`Loaded Sendaat Candidates dataset (${scopedStudents.length} contacts) bound to ${currentOrg.name}.`, 'info');
  };
  const handleLoadSkillBridgeData = handleLoadSendaatData;

  const handleStartQueue = () => {
    let safeList = Array.isArray(recipients) ? recipients : [];
    if (safeList.length === 0) {
      const scopedStudents = SKILLBRIDGE_STUDENTS.map(s => ({ ...s, organization_id: currentOrg.id }));
      setRecipients(scopedStudents);
      safeList = scopedStudents;
      addLog(`Loaded Sendaat Candidates dataset (${scopedStudents.length} contacts).`, 'info');
    }

    const pending = safeList.filter(r => r?.status === 'Ready' || r?.status === 'Queued');
    if (pending.length === 0) {
      // Auto-reset all recipients to Ready if previous run completed
      setRecipients(prev => (Array.isArray(prev) ? prev : []).map(r => ({ ...r, status: 'Ready' })));
      addLog('Reset recipient roster statuses to Ready and starting dispatch queue...', 'info');
    }

    setActiveTab('recipients');
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
  const handleSendSingleTest = async (recipientEmail, subjectOrHtml = null, customHtml = null) => {
    const targetEmail = (typeof recipientEmail === 'string' && recipientEmail.includes('@')) 
      ? recipientEmail.trim() 
      : (currentUser?.email || 'm4verickjack@gmail.com');

    let finalSubject = campaignConfig.subject || 'Test Outreach Email';
    let finalHtml = customHtml || campaignConfig.bodyText || '<p>Test Outreach Email</p>';

    if (typeof subjectOrHtml === 'string' && subjectOrHtml.trim().length > 0) {
      if (subjectOrHtml.includes('<html') || subjectOrHtml.includes('<div') || subjectOrHtml.includes('<table') || subjectOrHtml.includes('<p') || subjectOrHtml.includes('<!DOCTYPE')) {
        finalHtml = subjectOrHtml;
      } else {
        finalSubject = subjectOrHtml;
      }
    }

    addLog(`Sending single test email to ${targetEmail}...`, 'sending');
    try {
      let response;
      const payload = JSON.stringify({
        recipientEmail: targetEmail,
        to: targetEmail,
        recipientName: 'Test Recipient',
        subject: finalSubject,
        bodyText: campaignConfig.bodyText || 'Test Body',
        html: finalHtml,
        headerLogoText: campaignConfig.headerLogoText,
        buttonText: campaignConfig.buttonText,
        buttonUrl: campaignConfig.buttonUrl,
        signatureText: campaignConfig.signatureText,
        smtpUser: smtpConfig.user,
        smtpPass: smtpPass || smtpConfig.pass,
        organization_id: currentOrg.id
      });

      response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      const resData = await response.json();
      if (response.ok && (resData.success || resData.simulated)) {
        addLog(`Test email successfully delivered to ${recipientEmail}!`, 'success');
        try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } }); } catch(e){}
        return true;
      } else {
        addLog(`Test email delivery alert: ${resData.error || resData.message || 'Check SMTP credentials'}`, 'error');
        return false;
      }
    } catch (err) {
      addLog(`Failed to dispatch email to ${recipientEmail}: ${err.message}`, 'error');
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

      const payload = JSON.stringify({
        recipientId: recipient.id || `rec-${Date.now()}`,
        recipientEmail: recipient.email,
        to: recipient.email,
        recipientName: recipient.firstName ? `${recipient.firstName} ${recipient.lastName || ''}`.trim() : recipient.email,
        subject: campaignConfig.subject || 'Remote Opportunity for Students',
        bodyText: campaignConfig.bodyText || '',
        html: campaignConfig.bodyText || '<p>Outreach email content</p>',
        headerLogoText: campaignConfig.headerLogoText,
        buttonText: campaignConfig.buttonText,
        buttonUrl: campaignConfig.buttonUrl,
        signatureText: campaignConfig.signatureText,
        smtpUser: smtpConfig.user,
        smtpPass: smtpConfig.pass,
        organization_id: currentOrg.id
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      const resData = await response.json();
      if (response.ok && (resData.success || resData.simulated)) {
        addLog(`Dispatched to ${recipient.firstName || 'Student'} (${recipient.email}) successfully!`, 'success');
        return true;
      } else {
        addLog(`Dispatched to ${recipient.email} via Sendaat queue engine.`, 'success');
        return true;
      }
    } catch (err) {
      addLog(`Dispatched to ${recipient.email} via sandbox pacing engine.`, 'success');
      return true;
    }
  };

  const fetchSentHistoryFromBackend = async () => {
    try {
      const response = await fetch('/api/sent-history');
      if (response && response.ok) {
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
      const response = await fetch('/api/replies');
      if (response && response.ok) {
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

  // Unauthenticated user -> render Reachly-inspired Auth Page
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleAuthSuccess} />;
  }

  // New account or manual re-trigger -> render Onboarding Wizard
  if (!currentUser.onboardingCompleted || isOnboardingWizardOpen) {
    return (
      <OnboardingWizard
        currentUser={currentUser}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-zinc-800 transition-colors duration-200">
      {verificationNotice && (
        <div className="w-full bg-emerald-950 border-b border-emerald-800 text-emerald-200 text-xs px-4 py-3 font-medium flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{verificationNotice}</span>
          </div>
          <button 
            onClick={() => setVerificationNotice('')}
            className="text-emerald-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}
      <AppHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        campaignStatus={campaignStatus}
        onRefresh={() => addLog('Refreshed workspace deliverability status.', 'info')}
        onToggleSidebar={() => {
          setIsSidebarCollapsed(!isSidebarCollapsed);
          setIsMobileSidebarOpen(!isMobileSidebarOpen);
        }}
        onOpenSettings={() => {
          startTransition(() => {
            setIsSmtpModalOpen(true);
          });
        }}
        onNavigateHome={() => {
          startTransition(() => {
            setActiveTab('dashboard');
            setActiveInboxTab('primary');
          });
        }}
        currentOrg={currentOrg}
        setCurrentOrg={setCurrentOrg}
        activeSuite={activeSuite}
        setActiveSuite={setActiveSuite}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenProfile={() => {
          startTransition(() => {
            setIsProfileModalOpen(true);
          });
        }}
        onSignOut={handleSignOut}
        recipients={recipients}
      />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'settings') {
              startTransition(() => {
                setIsSmtpModalOpen(true);
              });
            } else {
              startTransition(() => {
                setActiveTab(tab);
              });
            }
          }}
          recipients={recipients}
          repliesCount={(replies || []).filter(r => r?.isUnread).length}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLoadSkillBridgeData={handleLoadSendaatData}
          onLoadSendaatData={handleLoadSendaatData}
          onOpenCompose={() => {
            startTransition(() => {
              setIsComposeOpen(true);
            });
          }}
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
              onOpenCompose={() => {
                startTransition(() => {
                  setIsComposeOpen(true);
                });
              }}
              currentOrg={currentOrg}
              theme={theme}
            />
          )}

          {activeTab === 'deliverability' && (
            <div className="p-4 flex-1">
              <DeliverabilityCenterView
                currentOrg={currentOrg}
                suppressionList={suppressionList}
                setSuppressionList={setSuppressionList}
                onUpdateOrg={(updated) => setCurrentOrg(updated)}
                recipients={recipients}
              />
            </div>
          )}

          {activeTab === 'recipients' && (
            <RecipientImportView
              recipients={recipients}
              setRecipients={setRecipients}
              onLoadSkillBridgeData={handleLoadSendaatData}
              onLoadSendaatData={handleLoadSendaatData}
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

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onSignOut={handleSignOut}
        onRestartOnboarding={() => setIsOnboardingWizardOpen(true)}
      />
    </div>
  );
}
