import React, { useState } from 'react';
import { MessageSquare, Mail, Search, RefreshCw, Send, CheckCircle2, User, Sparkles, Trash2, Clock, CornerUpLeft } from 'lucide-react';

export default function ReceivedRepliesView({ 
  replies, 
  setReplies, 
  onOpenCompose, 
  setCampaignConfig, 
  onRefreshReplies 
}) {
  const [selectedReply, setSelectedReply] = useState(replies[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const filteredReplies = replies.filter(r => 
    r.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bodyText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = replies.filter(r => r.isUnread).length;

  const handleSimulateReply = async () => {
    setIsSimulating(true);
    const sampleNames = ['Alex Mercer', 'Sophia Taylor', 'David Miller', 'Emma Watson'];
    const sampleRoles = ['Data Science Student', 'Physics Tutor', 'React Developer', 'English Teaching Assistant'];
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const role = sampleRoles[Math.floor(Math.random() * sampleRoles.length)];
    const email = `${name.toLowerCase().replace(' ', '.')}@university.edu`;

    const bodyText = `Hi Benedict,\n\nI am replying to your email regarding the ${role} opportunity. I have prior experience and am available for 10-15 hours a week. Please let me know how to proceed.\n\nThanks,\n${name}`;

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
      bodyText: `Hi ${reply.senderName},\n\nThank you for applying! We would love to schedule a quick chat with you regarding the ${reply.role} position.\n\nBest regards,\nBenedict`
    }));
    onOpenCompose();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
              <span>Received Applicant Responses</span>
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">• {unreadCount} Unread</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Received Replies & Applicant Responses</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Incoming replies from students responding to your outreach emails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateReply}
            disabled={isSimulating}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
            <span>Simulate Incoming Student Reply</span>
          </button>
        </div>
      </div>

      {/* Main Mailbox Grid (Left List + Right Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
        {/* Left Replies List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applicant replies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-purple-600"
              />
            </div>
            <button onClick={onRefreshReplies} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredReplies.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700">No applicant replies yet.</p>
                <p className="text-[11px] text-gray-400 mt-1">Click "Simulate Incoming Student Reply" to test receiving responses.</p>
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
                    selectedReply?.id === reply.id ? 'bg-purple-50 border-l-4 border-purple-600' :
                    reply.isUnread ? 'bg-white font-bold' : 'bg-gray-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-purple-900 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {reply.senderName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-gray-900 truncate">{reply.senderName}</span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-mono shrink-0">
                      {new Date(reply.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-xs text-blue-700 font-semibold block truncate mb-1">
                    {reply.senderEmail}
                  </span>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {reply.bodyText}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Reply Reader Detail (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedReply ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {selectedReply.senderName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">{selectedReply.senderName}</h3>
                    <span className="text-xs font-mono text-blue-700 font-semibold block">{selectedReply.senderEmail}</span>
                    <span className="text-[11px] text-gray-500 font-sans mt-0.5 block">Role: {selectedReply.role}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-gray-400 block">
                    {new Date(selectedReply.receivedAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleReplyBack(selectedReply)}
                    className="mt-2 bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5 text-blue-400" />
                    <span>Reply Back</span>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-800">
                Subject: {selectedReply.subject}
              </div>

              {/* Message Content */}
              <div className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200">
                {selectedReply.bodyText}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400 text-xs">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-700">Select an applicant response to read.</p>
            </div>
          )}

          {selectedReply && (
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleReplyBack(selectedReply)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Send Follow-Up Outreach Email &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
