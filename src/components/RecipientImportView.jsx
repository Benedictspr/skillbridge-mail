import React, { useState } from 'react';
import { Users, FileText, Upload, Plus, Trash2, Search, Sparkles, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight, X, UserCheck } from 'lucide-react';
import { extractFirstNameFromEmail } from '../utils/nameParser';

export default function RecipientImportView({ recipients, setRecipients, onLoadSkillBridgeData }) {
  const [activeSubTab, setActiveSubTab] = useState('note');
  const [noteText, setNoteText] = useState(
    `john.doe@university.edu John Doe - Mathematics Tutor\nmary.smith@cambridge.org Mary Smith - Python Developer\npeter.jones@mit.edu Peter Jones - UI/UX Designer\nsarah.connor@stanford.edu Sarah Connor - English Tutor`
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [manualEmail, setManualEmail] = useState('');
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');
  const [manualRole, setManualRole] = useState('');

  // Smart Note Parser
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
        
        let firstName = extractFirstNameFromEmail(email);
        let lastName = '';
        let role = 'Student';

        if (remaining) {
          const parts = remaining.split(/[-|]/);
          const namePart = parts[0].trim();
          const rolePart = parts[1] ? parts[1].trim() : 'Student';

          const nameWords = namePart.split(/\s+/);
          firstName = (nameWords[0] && nameWords[0] !== 'Friend') ? nameWords[0] : extractFirstNameFromEmail(email);
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

    const email = manualEmail.trim();
    const newRec = {
      id: `manual-${Date.now()}`,
      email,
      firstName: manualFirstName.trim() || extractFirstNameFromEmail(email),
      lastName: manualLastName.trim() || '',
      company: 'SkillBridge Network',
      role: manualRole.trim() || 'Student',
      status: 'Ready'
    };

    setRecipients(prev => [...prev, newRec]);
    setManualEmail('');
    setManualFirstName('');
    setManualLastName('');
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
            const email = cols[0].trim();
            parsed.push({
              id: `csv-${Date.now()}-${idx}`,
              email,
              firstName: (cols[1] && cols[1].trim()) ? cols[1].trim() : extractFirstNameFromEmail(email),
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

  const removeRecipient = (id) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const clearAllRecipients = () => {
    if (window.confirm('Clear all recipients?')) {
      setRecipients([]);
    }
  };

  const filteredRecipients = recipients.filter(r => 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Import Controls Header */}
      <div className="glass-panel-elevated p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="badge-pill badge-ready mb-1.5">Data Import Hub</span>
            <h2 className="text-2xl font-black text-white font-heading">Recipient Import & Smart Note Parser</h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onLoadSkillBridgeData} className="btn-glow-primary text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Load Sample (50)</span>
            </button>
            {recipients.length > 0 && (
              <button onClick={clearAllRecipients} className="btn-glass-secondary text-xs text-rose-400 hover:border-rose-500/40">
                <Trash2 className="w-4 h-4" />
                <span>Clear ({recipients.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Sub-Tab Pill Switcher */}
        <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-4 mb-6">
          <button
            onClick={() => setActiveSubTab('note')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-heading flex items-center gap-2 transition-all ${
              activeSubTab === 'note' 
                ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste from Note / Text</span>
          </button>

          <button
            onClick={() => setActiveSubTab('csv')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-heading flex items-center gap-2 transition-all ${
              activeSubTab === 'csv' 
                ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload CSV / Excel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-heading flex items-center gap-2 transition-all ${
              activeSubTab === 'manual' 
                ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-white/5'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Recipient</span>
          </button>
        </div>

        {/* SubTab 1: Note Text */}
        {activeSubTab === 'note' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Paste raw notes containing emails and names. Example: <code className="text-indigo-300 font-mono">john@gmail.com John Doe - Math Tutor</code>
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              placeholder="Paste raw email note here..."
              className="input-glass font-mono text-xs leading-relaxed"
            />
            <div className="flex justify-end">
              <button onClick={parseNoteText} className="btn-glow-primary text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Extract Emails & Add to Campaign</span>
              </button>
            </div>
          </div>
        )}

        {/* SubTab 2: CSV Drag & Drop */}
        {activeSubTab === 'csv' && (
          <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500/80 rounded-2xl p-10 text-center transition-all bg-gray-950/60">
            <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-white font-heading mb-1">Drag & Drop CSV File</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-5">Supported formats: .csv, .txt (Email, First Name, Last Name, Company, Role)</p>
            <label className="btn-glow-primary text-xs cursor-pointer inline-flex">
              <span>Choose File</span>
              <input type="file" accept=".csv,.txt" onChange={handleCsvFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* SubTab 3: Manual Add */}
        {activeSubTab === 'manual' && (
          <form onSubmit={handleAddManual} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="email"
              required
              placeholder="Email address *"
              value={manualEmail}
              onChange={e => setManualEmail(e.target.value)}
              className="input-glass text-xs"
            />
            <input
              type="text"
              placeholder="First name (e.g. John)"
              value={manualFirstName}
              onChange={e => setManualFirstName(e.target.value)}
              className="input-glass text-xs"
            />
            <input
              type="text"
              placeholder="Last name (e.g. Doe)"
              value={manualLastName}
              onChange={e => setManualLastName(e.target.value)}
              className="input-glass text-xs"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Role (e.g. Tutor)"
                value={manualRole}
                onChange={e => setManualRole(e.target.value)}
                className="input-glass text-xs"
              />
              <button type="submit" className="btn-glow-primary text-xs whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recipient Data Table */}
      <div className="glass-panel-elevated p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-white font-heading">Active Recipient Roster</h3>
            <span className="badge-pill badge-ready">{filteredRecipients.length} / {recipients.length} Loaded</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, email, role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-glass text-xs pl-10 py-2.5"
            />
          </div>
        </div>

        {filteredRecipients.length === 0 ? (
          <div className="text-center py-16 border border-white/10 rounded-2xl bg-gray-950/60">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">No recipients found.</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Paste a note above or click "Load Sample (50)".</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/90 text-[var(--text-secondary)] uppercase tracking-wider font-extrabold font-heading border-b border-white/10">
                <tr>
                  <th className="px-5 py-4">Recipient Name</th>
                  <th className="px-5 py-4">Email Address</th>
                  <th className="px-5 py-4">Skill / Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 font-mono">
                {filteredRecipients.slice(0, 100).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4 font-sans font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-extrabold flex items-center justify-center text-xs">
                        {r.firstName.charAt(0)}
                      </div>
                      <span>{r.firstName} {r.lastName}</span>
                    </td>
                    <td className="px-5 py-4 text-indigo-300 font-semibold">{r.email}</td>
                    <td className="px-5 py-4 text-gray-300 font-sans">{r.role}</td>
                    <td className="px-5 py-4 font-sans">
                      <span className={`badge-pill ${
                        r.status === 'Sent' ? 'badge-sent' :
                        r.status === 'Sending' ? 'badge-sending' :
                        r.status === 'Failed' ? 'badge-failed' : 'badge-ready'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => removeRecipient(r.id)}
                        className="text-gray-500 hover:text-rose-400 p-1.5 transition-colors"
                        title="Remove Recipient"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
