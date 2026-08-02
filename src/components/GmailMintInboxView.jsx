import React, { useState } from 'react';
import { Star, RefreshCw, MoreVertical, ChevronLeft, ChevronRight, Inbox, Tag, Users, Info, Upload, Plus, Sparkles, Trash2, CheckCircle2, Eye, Clock, UserPlus } from 'lucide-react';

export default function GmailMintInboxView({ 
  recipients, 
  setRecipients, 
  onLoadSkillBridgeData, 
  onOpenCompose, 
  searchTerm,
  recipientTracker,
  activeInboxTab,
  setActiveInboxTab
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [noteText, setNoteText] = useState(
    `john.doe@university.edu John Doe - Mathematics Tutor\nmary.smith@cambridge.org Mary Smith - Python Developer\npeter.jones@mit.edu Peter Jones - UI/UX Designer\nsarah.connor@stanford.edu Sarah Connor - English Tutor`
  );

  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualRole, setManualRole] = useState('');

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
          const parts = remaining.split(/[-|,]/);
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
      setActiveInboxTab('primary');
    }
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    const nameParts = manualName.trim().split(/\s+/);
    const newRec = {
      id: `manual-${Date.now()}`,
      email: manualEmail.trim(),
      firstName: nameParts[0] || 'Friend',
      lastName: nameParts.slice(1).join(' ') || '',
      company: 'SkillBridge Network',
      role: manualRole.trim() || 'Student',
      status: 'Ready'
    };

    setRecipients(prev => [...prev, newRec]);
    setManualEmail('');
    setManualName('');
    setManualRole('');
    setActiveInboxTab('primary');
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const lines = content.split('\n');
        const parsed = [];
        lines.forEach((line, idx) => {
          if (idx === 0 && line.toLowerCase().includes('email')) return;
          const cols = line.split(',');
          if (cols.length >= 1 && cols[0].includes('@')) {
            parsed.push({
              id: `csv-${Date.now()}-${idx}`,
              email: cols[0].trim(),
              firstName: cols[1] ? cols[1].trim() : 'Friend',
              lastName: cols[2] ? cols[2].trim() : '',
              company: cols[3] ? cols[3].trim() : 'SkillBridge',
              role: cols[4] ? cols[4].trim() : 'Student',
              status: 'Ready'
            });
          }
        });
        setRecipients(prev => [...prev, ...parsed]);
        setActiveInboxTab('primary');
      }
    };
    reader.readAsText(file);
  };

  const getRecipientStatus = (r) => {
    const tracking = recipientTracker[r.id];
    if (tracking && tracking.opened) return 'Opened';
    if (tracking && tracking.status === 'Sent') return 'Sent';
    return r.status;
  };

  const filteredRecipients = recipients.filter(r => 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const readyCount = recipients.filter(r => r.status === 'Ready' || r.status === 'Queued').length;
  const sentCount = recipients.filter(r => r.status === 'Sent' || recipientTracker[r.id]?.status === 'Sent').length;

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

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-300 shadow-sm flex flex-col overflow-hidden m-3">
      {/* Top Action Bar */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600 bg-gray-50/60">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedIds.size > 0 && selectedIds.size === filteredRecipients.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />

          {selectedIds.size > 0 ? (
            <button onClick={removeSelected} className="p-1 hover:bg-gray-200 rounded text-red-600 font-bold flex items-center gap-1">
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          ) : (
            <>
              <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>

              <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="More options">
                <MoreVertical className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Real-time pagination count */}
        <div className="flex items-center gap-3 font-sans text-xs">
          <span className="text-gray-700 font-bold font-mono">
            {recipients.length === 0 ? '0 of 0' : `1-${filteredRecipients.length} of ${recipients.length}`}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <button className="p-1 hover:bg-gray-200 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Ultra-Clean Single-Line Category Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/30 overflow-x-auto select-none">
        {/* Primary Tab */}
        <div 
          onClick={() => setActiveInboxTab('primary')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
            activeInboxTab === 'primary' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Inbox className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Primary Roster</span>
          <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200 leading-none">
            {recipients.length}
          </span>
        </div>

        {/* Add Contacts Tab */}
        <div 
          onClick={() => setActiveInboxTab('input')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
            activeInboxTab === 'input' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Add Contacts</span>
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300 leading-none">
            + Input
          </span>
        </div>

        {/* Promotions Tab */}
        <div 
          onClick={() => setActiveInboxTab('promotions')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
            activeInboxTab === 'promotions' ? 'border-purple-600 text-purple-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Tag className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Promotions</span>
          <span className="bg-purple-100 text-purple-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-200 leading-none">
            {readyCount}
          </span>
        </div>

        {/* Social Tab */}
        <div 
          onClick={() => setActiveInboxTab('social')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
            activeInboxTab === 'social' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Social</span>
          <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200 leading-none">
            {recipients.length}
          </span>
        </div>

        {/* Updates Tab */}
        <div 
          onClick={() => setActiveInboxTab('updates')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
            activeInboxTab === 'updates' ? 'border-amber-600 text-amber-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Updates</span>
          <span className="bg-amber-100 text-amber-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200 leading-none">
            {sentCount}
          </span>
        </div>
      </div>

      {/* TAB CONTENT 1: PRIMARY INBOX MAIL LIST */}
      {activeInboxTab === 'primary' && (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 font-sans">
          {filteredRecipients.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Your Primary roster is empty.</p>
              <p className="text-xs text-gray-500 mt-1">Click "Add Contacts" tab above or "Load 50 SkillBridge Students".</p>
              <button 
                onClick={onLoadSkillBridgeData}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs"
              >
                Load 50 SkillBridge Students
              </button>
            </div>
          ) : (
            filteredRecipients.map((r, idx) => {
              const currentStatus = getRecipientStatus(r);
              const trackingData = recipientTracker[r.id];

              return (
                <div 
                  key={r.id}
                  onClick={() => onOpenCompose()}
                  className={`mail-row-mint ${currentStatus === 'Ready' ? 'unread' : ''}`}
                >
                  <div className="flex items-center gap-3 mr-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <Star className="w-4 h-4 text-gray-300 hover:text-amber-500 cursor-pointer" />
                  </div>

                  <div className="w-44 font-bold text-xs text-gray-900 truncate shrink-0">
                    {r.firstName} {r.lastName}
                  </div>

                  <div className="flex-1 text-xs text-gray-600 truncate mr-4">
                    <span className="font-bold text-gray-900">Remote Opportunity for Students</span> — Hi {r.firstName}, I'm looking for students interested in flexible remote work in {r.role}...
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {currentStatus === 'Opened' ? (
                      <span className="bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-purple-700" />
                        <span>Opened {trackingData?.openedAt ? new Date(trackingData.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </span>
                    ) : currentStatus === 'Sent' ? (
                      <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Sent</span>
                      </span>
                    ) : currentStatus === 'Sending' ? (
                      <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                        <span>Sending...</span>
                      </span>
                    ) : (
                      <span className="bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}

                    <span className="text-[11px] text-gray-400 font-mono min-w-[55px] text-right">
                      {idx % 3 === 0 ? '9:21 PM' : idx % 3 === 1 ? '9:41 AM' : 'Jul 26'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ADD CONTACTS INPUT WORKSPACE */}
      {activeInboxTab === 'input' && (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-6 font-sans">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Recipients Roster</h3>
                <p className="text-xs text-gray-500">Paste raw text or comma-separated email lists into your campaign.</p>
              </div>

              <button onClick={onLoadSkillBridgeData} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Load 50 SkillBridge Students</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">
                Option A: Paste Raw Email List / Note Text
              </label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={4}
                placeholder="john.doe@gmail.com, John Doe, Math Tutor"
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs font-mono outline-none focus:border-blue-600"
              />
              <div className="flex justify-end">
                <button onClick={parseNoteText} className="bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-xs">
                  Parse & Load Emails to Roster
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleAddManual} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold text-gray-800">Option B: Add Single Contact</h4>
              <input
                type="email"
                required
                placeholder="Email Address *"
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Role / Skill"
                  value={manualRole}
                  onChange={e => setManualRole(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold text-xs py-2.5 rounded-lg">
                Add to Roster
              </button>
            </form>

            <div className="bg-white p-5 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col justify-center items-center">
              <Upload className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="text-xs font-bold text-gray-800">Option C: Upload CSV File</h4>
              <p className="text-[11px] text-gray-500 mb-3">Upload .csv or .txt file with email column</p>
              <label className="bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100">
                <span>Browse File</span>
                <input type="file" accept=".csv,.txt" onChange={handleCsvFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* OTHER CATEGORY TABS */}
      {(activeInboxTab === 'promotions' || activeInboxTab === 'social' || activeInboxTab === 'updates') && (
        <div className="flex-1 p-8 text-center text-gray-500 font-sans">
          <Info className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-sm mb-1">Campaign Category Active</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
            Viewing real-time contact roster for {activeInboxTab.toUpperCase()}.
          </p>
          <button 
            onClick={() => setActiveInboxTab('primary')}
            className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg"
          >
            Return to Primary Roster ({recipients.length})
          </button>
        </div>
      )}
    </div>
  );
}
