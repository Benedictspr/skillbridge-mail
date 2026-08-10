import React, { useState } from 'react';
import { MessageSquare, Mail, Search, RefreshCw, Send, CheckCircle2, User, Trash2, Clock, CornerUpLeft, ShieldCheck, Zap } from 'lucide-react';

export default function ReceivedRepliesView({ 
  replies = [], 
  setReplies, 
  onOpenCompose, 
  setCampaignConfig, 
  onRefreshReplies,
  smtpConfig
}) {
  const safeReplies = Array.isArray(replies) ? replies : [];
  const [selectedReply, setSelectedReply] = useState(safeReplies[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const filteredReplies = safeReplies.filter(r => 
    (r?.senderName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.senderEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.bodyText || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = safeReplies.filter(r => r?.isUnread).length;

  const handleFetchLiveGmailReplies = async () => {
    setIsSyncingLive(true);
    setSyncStatus('Connecting to imap.gmail.com:993...');

    try {
      const res = await fetch('http://localhost:3001/api/fetch-live-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser: smtpConfig?.user || '',
          smtpPass: smtpConfig?.pass || ''
        })
      });

      const data = await res.json();
      setIsSyncingLive(false);

      if (res.ok && data.success) {
        if (data.replies && Array.isArray(data.replies)) {
          setReplies(data.replies);
          if (data.replies.length > 0 && !selectedReply) {
            setSelectedReply(data.replies[0]);
          }
        }
        setSyncStatus(`Synced successfully! (${data.count || 0} new emails loaded from Gmail)`);
        setTimeout(() => setSyncStatus(''), 4000);
      } else {
        alert(data.error || 'Failed to fetch Gmail inbox. Please verify your Gmail address & 16-character App Password in Settings.');
        setSyncStatus('');
      }
    } catch (err) {
      setIsSyncingLive(false);
      alert('Backend connection error: ' + err.message);
      setSyncStatus('');
    }
  };

  const handleSimulateReply = async () => {
    setIsSimulating(true);
    const sampleNames = ['Alex Mercer', 'Sophia Taylor', 'David Miller', 'Emma Watson'];
    const sampleRoles = ['Data Science Student', 'Physics Tutor', 'React Developer', 'English Teaching Assistant'];
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const role = sampleRoles[Math.floor(Math.random() * sampleRoles.length)];
    const email = `${name.toLowerCase().replace(' ', '.')}@university.edu`;

    const bodyText = `Hi Maverick,\n\nI am replying to your email regarding the ${role} opportunity. I have prior experience and am available for 10-15 hours a week. Please let me know how to proceed.\n\nThanks,\n${name}`;

    try {
      const res = await fetch('http://localhost:3001/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: email,
          senderName: name,
          role: role,
          subject: 'Re: Remote Opportunity for Students',
          bodyText
        })
      });
      const data = await res.json();
      setIsSimulating(false);
      if (res.ok && data.reply) {
        setReplies(prev => [data.reply, ...prev]);
        setSelectedReply(data.reply);
      }
    } catch (err) {
      setIsSimulating(false);
    }
  };

  const handleReplyBack = (reply) => {
    setCampaignConfig(prev => ({
      ...prev,
      subject: `Re: ${reply.subject.replace(/^Re:\s*/i, '')}`,
      bodyText: `Hi ${reply.senderName},\n\nThank you for applying! We would love to schedule a quick chat with you regarding the ${reply.role} position.\n\nBest regards,\nMaverick`
    }));
    onOpenCompose();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* 1. Header Banner - Vantablack Monochromatic */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono font-bold px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>Real Live Gmail Inbox Sync</span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">• {unreadCount} Unread</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            Received Replies & Live Applicant Inbox
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Connects to your Gmail inbox via IMAP SSL (imap.gmail.com:993) to pull real applicant replies live.
          </p>
          {syncStatus && (
            <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
              ✓ {syncStatus}
            </p>
          )}
        </div>

        {/* Clean Monochromatic Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleFetchLiveGmailReplies}
            disabled={isSyncingLive}
            className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            {isSyncingLive ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Zap className="w-4 h-4 text-black fill-black" />}
            <span>Sync Live Gmail Inbox (IMAP)</span>
          </button>

          <button
            onClick={handleSimulateReply}
            disabled={isSimulating}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>Simulate Reply</span>
          </button>
        </div>
      </div>

      {/* 2. Main Mailbox Grid (Left List + Right Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
        
        {/* Left Replies List (5 Cols) */}
        <div className="lg:col-span-5 bg-[#121212] rounded-[24px] border border-zinc-800 shadow-md flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-black flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applicant replies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-zinc-500 font-sans"
              />
            </div>
            <button 
              onClick={handleFetchLiveGmailReplies} 
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-300 transition-colors" 
              title="Sync Gmail Inbox"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingLive ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/80">
            {filteredReplies.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs px-4 font-mono">
                <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <p className="font-bold text-white">No applicant replies in list.</p>
                <p className="text-[11px] text-zinc-500 mt-1">Click "Sync Live Gmail Inbox" to pull real replies from imap.gmail.com.</p>
              </div>
            ) : (
              filteredReplies.map((reply) => (
                <div
                  key={reply.id}
                  onClick={() => {
                    setSelectedReply(reply);
                    setReplies(prev => prev.map(r => r.id === reply.id ? { ...r, isUnread: false } : r));
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedReply?.id === reply.id ? 'bg-zinc-900/90 border-l-2 border-white' :
                    reply.isUnread ? 'bg-[#121212] font-bold' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {reply.senderName ? reply.senderName.charAt(0) : 'S'}
                      </div>
                      <span className="text-xs font-bold text-white truncate font-sans">{reply.senderName}</span>
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {new Date(reply.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-300 font-medium block truncate mb-1 font-sans">
                    {reply.senderEmail}
                  </span>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                    {reply.bodyText}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Reply Reader Detail (7 Cols) */}
        <div className="lg:col-span-7 bg-[#121212] rounded-[24px] border border-zinc-800 shadow-md p-6 flex flex-col justify-between">
          {selectedReply ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-zinc-800 pb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {selectedReply.senderName ? selectedReply.senderName.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-sans">{selectedReply.senderName}</h3>
                    <span className="text-xs font-sans text-zinc-300 font-medium block">{selectedReply.senderEmail}</span>
                    <span className="text-[11px] text-zinc-400 font-sans mt-0.5 block">Role: {selectedReply.role}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-zinc-400 block">
                    {new Date(selectedReply.receivedAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleReplyBack(selectedReply)}
                    className="mt-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>Reply Back</span>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="bg-black px-4 py-3 rounded-xl border border-zinc-800 font-bold text-xs text-white font-sans">
                Subject: {selectedReply.subject}
              </div>

              {/* Message Content */}
              <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap bg-black p-4 rounded-xl border border-zinc-800 min-h-[180px]">
                {selectedReply.bodyText}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-zinc-500 text-xs font-mono">
              <Mail className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
              <p className="font-bold text-white">Select an applicant response to read.</p>
            </div>
          )}

          {selectedReply && (
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => handleReplyBack(selectedReply)}
                className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Send Follow-Up Outreach Email &rarr;</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
