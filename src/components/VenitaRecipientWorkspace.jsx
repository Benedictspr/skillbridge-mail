import React, { useState } from 'react';
import { Users, FileText, Upload, Plus, Trash2, Search, Sparkles, CheckCircle2, Eye, Clock, Mail, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';

export default function VenitaRecipientWorkspace({ 
  recipients, 
  setRecipients, 
  onLoadSkillBridgeData, 
  recipientTracker,
  setActiveTab 
}) {
  const [noteText, setNoteText] = useState(
    `john.doe@university.edu, John Doe, Mathematics Tutor\nmary.smith@cambridge.org, Mary Smith, Python Developer\npeter.jones@mit.edu, Peter Jones, UI/UX Designer\nsarah.connor@stanford.edu, Sarah Connor, English Tutor`
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Single recipient input fields
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualRole, setManualRole] = useState('');

  // Smart Email Parser
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

  const totalSent = Object.values(recipientTracker).filter(t => t.status === 'Sent' || t.opened).length;
  const totalOpened = Object.values(recipientTracker).filter(t => t.opened).length;

  return (
    <div className="space-y-8 font-sans">
      {/* SECTION 1: PROMINENT RECIPIENT INPUT WORKSPACE */}
      <div className="venita-panel p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="badge-venita badge-venita-ready mb-2 inline-block">Step 1: Recipient Input Center</span>
            <h2 className="text-2xl font-extrabold text-white">Paste or Upload Email Roster</h2>
            <p className="text-xs text-gray-400 mt-1">
              Add your recipient email addresses below. SkillBridge Outreach dispatches tailored emails to each person individually.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLoadSkillBridgeData}
              className="btn-venita-primary text-xs"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Load 50 SkillBridge Students</span>
            </button>
          </div>
        </div>

        {/* Input Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Method A: Paste Email List (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0B0C12] p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Option A: Paste Email List / Raw Notes</span>
              </label>
              <span className="text-[11px] text-gray-500 font-mono">Format: email, name, role</span>
            </div>

            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={5}
              placeholder="Paste email list here (e.g. john@gmail.com, John Doe, Tutor)..."
              className="input-venita font-mono text-xs leading-relaxed"
            />

            <div className="flex justify-end">
              <button onClick={parseNoteText} className="btn-venita-blue text-xs">
                <Plus className="w-4 h-4" />
                <span>Parse & Add Emails to Roster</span>
              </button>
            </div>
          </div>

          {/* Method B: Single Recipient & CSV Upload (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Add Single Email Form */}
            <form onSubmit={handleAddManual} className="bg-[#0B0C12] p-4 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-bold text-white block flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Option B: Add Single Contact</span>
              </span>

              <input
                type="email"
                required
                placeholder="Email Address (e.g. student@gmail.com) *"
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                className="input-venita text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name (e.g. John Doe)"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="input-venita text-xs"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. IT Student)"
                  value={manualRole}
                  onChange={e => setManualRole(e.target.value)}
                  className="input-venita text-xs"
                />
              </div>

              <button type="submit" className="btn-venita-primary text-xs w-full justify-center py-2">
                <Plus className="w-4 h-4" />
                <span>Add Contact to Roster</span>
              </button>
            </form>

            {/* CSV File Upload Dropzone */}
            <div className="border border-dashed border-white/20 hover:border-blue-500 rounded-2xl p-4 text-center bg-[#0B0C12] transition-colors">
              <Upload className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <span className="text-xs font-bold text-white block">Option C: Upload CSV File</span>
              <p className="text-[11px] text-gray-500 mb-2">Upload .csv or .txt file containing email column</p>
              <label className="btn-venita-primary text-[11px] py-1.5 px-3 cursor-pointer inline-flex">
                <span>Browse File</span>
                <input type="file" accept=".csv,.txt" onChange={handleCsvFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIVE RECIPIENT ROSTER TABLE */}
      <div className="venita-panel p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">Active Contact Roster</h3>
            <span className="badge-venita badge-venita-ready">
              {filteredRecipients.length} / {recipients.length} Loaded
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search email, name, role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-venita text-xs pl-10 py-2"
              />
            </div>

            <button
              onClick={() => setActiveTab('builder')}
              className="btn-venita-blue text-xs"
            >
              <span>Proceed to Email Designer &rarr;</span>
            </button>
          </div>
        </div>

        {filteredRecipients.length === 0 ? (
          <div className="text-center py-16 border border-white/10 rounded-2xl bg-[#0B0C12]">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="font-bold text-white text-sm">No recipients loaded in roster.</p>
            <p className="text-xs text-gray-500 mt-1">Paste emails in Option A above or click "Load 50 SkillBridge Students".</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#0B0C12]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121420] text-gray-400 uppercase tracking-wider font-extrabold border-b border-white/10">
                <tr>
                  <th className="px-5 py-4">Recipient Name</th>
                  <th className="px-5 py-4">Email Address</th>
                  <th className="px-5 py-4">Skill / Role</th>
                  <th className="px-5 py-4">Delivery & Open Feedback</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredRecipients.map((r) => {
                  const currentStatus = getRecipientStatus(r);
                  const trackingData = recipientTracker[r.id];

                  return (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-sans font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-black border border-white/20 text-blue-400 font-extrabold flex items-center justify-center text-xs">
                          {r.firstName.charAt(0)}
                        </div>
                        <span>{r.firstName} {r.lastName}</span>
                      </td>

                      <td className="px-5 py-4 text-blue-400 font-semibold">{r.email}</td>
                      <td className="px-5 py-4 text-gray-300 font-sans">{r.role}</td>

                      <td className="px-5 py-4 font-sans">
                        {currentStatus === 'Opened' ? (
                          <span className="badge-venita badge-venita-opened flex items-center gap-1.5 w-fit">
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>Opened {trackingData?.openedAt ? new Date(trackingData.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </span>
                        ) : currentStatus === 'Sent' ? (
                          <span className="badge-venita badge-venita-sent flex items-center gap-1.5 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Sent</span>
                          </span>
                        ) : currentStatus === 'Sending' ? (
                          <span className="badge-venita badge-venita-sending flex items-center gap-1.5 w-fit">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            <span>Sending...</span>
                          </span>
                        ) : (
                          <span className="badge-venita badge-venita-ready">
                            Ready
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setRecipients(prev => prev.filter(item => item.id !== r.id))}
                          className="text-gray-500 hover:text-rose-400 p-1.5 transition-colors"
                          title="Remove Recipient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
