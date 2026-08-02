import React, { useState } from 'react';
import { Star, Trash2, RefreshCw, Sparkles, FileText, CheckCircle2, Clock, Eye, Mail, ShieldCheck } from 'lucide-react';

export default function GmailRecipientListView({ 
  recipients, 
  setRecipients, 
  onLoadSkillBridgeData,
  onOpenCompose,
  searchTerm,
  recipientTracker
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showNoteParser, setShowNoteParser] = useState(false);
  const [noteText, setNoteText] = useState(
    `john.doe@university.edu John Doe - Mathematics Tutor\nmary.smith@cambridge.org Mary Smith - Python Developer\npeter.jones@mit.edu Peter Jones - UI/UX Designer\nsarah.connor@stanford.edu Sarah Connor - English Tutor`
  );

  const parseNoteText = () => {
    if (!noteText.trim()) return;
    const lines = noteText.split('\n');
    const newRecipients = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const emailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        const email = emailMatch[1];
        const remaining = trimmed.replace(email, '').trim().replace(/^[-:,\s]+|[-:,\s]+$/g, '');
        let firstName = 'Friend';
        let lastName = '';
        let role = 'Student';

        if (remaining) {
          const parts = remaining.split(/[-|]/);
          const namePart = parts[0].trim();
          const rolePart = parts[1] ? parts[1].trim() : 'Student';
          const nameWords = namePart.split(/\s+/);
          firstName = nameWords[0] || 'Friend';
          lastName = nameWords.slice(1).join(' ') || '';
          role = rolePart;
        }

        newRecipients.push({
          id: `note-${Date.now()}-${index}`,
          email,
          firstName,
          lastName,
          company: 'SkillBridge Network',
          role,
          status: 'Ready'
        });
      }
    });

    if (newRecipients.length > 0) {
      setRecipients(prev => {
        const existingEmails = new Set(prev.map(r => r.email.toLowerCase()));
        const uniqueNew = newRecipients.filter(r => !existingEmails.has(r.email.toLowerCase()));
        return [...prev, ...uniqueNew];
      });
      setNoteText('');
      setShowNoteParser(false);
    }
  };

  const getRecipientStatus = (r) => {
    const tracking = recipientTracker[r.id];
    if (tracking && tracking.opened) return 'Opened';
    if (tracking && tracking.status === 'Sent') return 'Sent';
    return r.status;
  };

  const filteredRecipients = recipients.filter(r => {
    const matchesSearch = 
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const currentStatus = getRecipientStatus(r);
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && currentStatus === filterStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecipients.map(r => r.id)));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const removeSelected = () => {
    setRecipients(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  // Stats Counters
  const totalSent = Object.values(recipientTracker).filter(t => t.status === 'Sent' || t.opened).length;
  const totalOpened = Object.values(recipientTracker).filter(t => t.opened).length;
  const openRatePercent = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden font-sans">
      {/* Real-Time Sent & Open Feedback Header */}
      <div className="bg-gray-900 text-white px-6 py-3 border-b border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Total Contact Roster: <strong className="text-white font-mono">{recipients.length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sent: <strong className="text-emerald-400 font-mono">{totalSent}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Opened Feedback: <strong className="text-purple-300 font-mono">{totalOpened} ({openRatePercent}% Open Rate)</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Tracking Pixel Active</span>
        </div>
      </div>

      {/* Gmail Inbox Action Bar */}
      <div className="bg-[#F6F8FC] border-b border-[#E0E3E7] px-4 py-2.5 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedIds.size > 0 && selectedIds.size === filteredRecipients.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-black rounded cursor-pointer"
          />

          {selectedIds.size > 0 ? (
            <button onClick={removeSelected} className="p-1.5 hover:bg-gray-200 rounded text-red-600 flex items-center gap-1 font-bold">
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-full font-bold ${filterStatus === 'ALL' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
              >
                All ({recipients.length})
              </button>
              <button 
                onClick={() => setFilterStatus('Ready')}
                className={`px-3 py-1 rounded-full font-bold ${filterStatus === 'Ready' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
              >
                Ready ({recipients.filter(r => getRecipientStatus(r) === 'Ready').length})
              </button>
              <button 
                onClick={() => setFilterStatus('Sent')}
                className={`px-3 py-1 rounded-full font-bold ${filterStatus === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-200'}`}
              >
                Sent ({recipients.filter(r => getRecipientStatus(r) === 'Sent').length})
              </button>
              <button 
                onClick={() => setFilterStatus('Opened')}
                className={`px-3 py-1 rounded-full font-bold ${filterStatus === 'Opened' ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-200'}`}
              >
                Opened ({recipients.filter(r => getRecipientStatus(r) === 'Opened').length})
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNoteParser(!showNoteParser)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-black" />
            <span>{showNoteParser ? 'Close Note Parser' : '+ Paste Note List'}</span>
          </button>

          <button
            onClick={onLoadSkillBridgeData}
            className="bg-black hover:bg-gray-800 text-white font-bold px-3.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Load SkillBridge Sample (50)</span>
          </button>
        </div>
      </div>

      {/* Note Parser Box */}
      {showNoteParser && (
        <div className="bg-[#F2F6FC] p-4 border-b border-[#E0E3E7] space-y-2">
          <label className="text-xs font-bold text-gray-700 block">
            Paste raw text/note with emails and names:
          </label>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={3}
            className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-black"
            placeholder="john@gmail.com John Doe - Mathematics Tutor"
          />
          <div className="flex justify-end gap-2">
            <button onClick={parseNoteText} className="bg-black text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm">
              Extract & Add Recipients
            </button>
          </div>
        </div>
      )}

      {/* Roster Mail List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredRecipients.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700">No contacts found in filter.</p>
          </div>
        ) : (
          filteredRecipients.map((r, idx) => {
            const currentStatus = getRecipientStatus(r);
            const trackingData = recipientTracker[r.id];

            return (
              <div 
                key={r.id}
                onClick={() => onOpenCompose()}
                className={`mail-row ${currentStatus === 'Ready' ? 'unread' : ''}`}
              >
                <div className="flex items-center gap-3 mr-4" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    onChange={() => toggleSelectRow(r.id)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                  <Star className="w-4 h-4 text-gray-300 hover:text-amber-500 cursor-pointer" />
                </div>

                <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mr-3">
                  {r.firstName.charAt(0)}
                </div>

                <div className="w-44 font-bold text-xs text-gray-900 truncate shrink-0">
                  {r.firstName} {r.lastName}
                </div>

                <div className="flex-1 text-xs text-gray-600 truncate mr-4">
                  <span className="font-bold text-gray-800">Remote Opportunity for Students</span> — Hi {r.firstName}, I'm looking for students interested in flexible remote work in {r.role}...
                </div>

                {/* Sent & Open Status Feedback Badge */}
                <div className="flex items-center gap-3 shrink-0 font-sans">
                  {currentStatus === 'Opened' ? (
                    <span className="bg-purple-100 border border-purple-300 text-purple-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Opened {trackingData?.openedAt ? new Date(trackingData.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </span>
                  ) : currentStatus === 'Sent' ? (
                    <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sent</span>
                    </span>
                  ) : currentStatus === 'Sending' ? (
                    <span className="bg-blue-100 border border-blue-300 text-blue-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      Ready
                    </span>
                  )}

                  <span className="text-[11px] text-gray-400 font-mono">
                    {`9:${String((idx * 2) % 60).padStart(2, '0')} AM`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
