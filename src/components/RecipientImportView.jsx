import React, { useState } from 'react';
import { Users, FileText, Upload, Plus, Trash2, Search, Sparkles, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight, X, UserCheck } from 'lucide-react';
import { extractFirstNameFromEmail } from '../utils/nameParser';

export default function RecipientImportView({ recipients = [], setRecipients, onLoadSkillBridgeData }) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
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
        const existing = Array.isArray(prev) ? prev : [];
        const existingEmails = new Set(existing.map(r => r?.email?.toLowerCase()));
        const uniqueNew = newRecipients.filter(r => !existingEmails.has(r.email.toLowerCase()));
        return [...existing, ...uniqueNew];
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

    setRecipients(prev => [...(Array.isArray(prev) ? prev : []), newRec]);
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
        const parsedRecs = [];
        lines.forEach((line, idx) => {
          const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols[0] && cols[0].includes('@')) {
            parsedRecs.push({
              id: `csv-${Date.now()}-${idx}`,
              email: cols[0],
              firstName: cols[1] || extractFirstNameFromEmail(cols[0]),
              lastName: cols[2] || '',
              company: cols[3] || 'SkillBridge',
              role: cols[4] || 'Student',
              status: 'Ready'
            });
          }
        });
        if (parsedRecs.length > 0) {
          setRecipients(prev => [...(Array.isArray(prev) ? prev : []), ...parsedRecs]);
        }
      }
    };
    reader.readAsText(file);
  };

  const removeRecipient = (id) => {
    setRecipients(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== id));
  };

  const clearAllRecipients = () => {
    if (window.confirm('Clear all recipients?')) {
      setRecipients([]);
    }
  };

  const filteredRecipients = safeRecipients.filter(r => 
    (r?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans p-2">
      {/* Import Controls Card (High Contrast Light Background) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Data Import Hub
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">
              Recipient Import & Smart Note Parser
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Import applicant rosters from notes, CSV files, or manual entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLoadSkillBridgeData}
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Load Sample Dataset (50)</span>
            </button>

            {safeRecipients.length > 0 && (
              <button
                onClick={clearAllRecipients}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All ({safeRecipients.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Sub-Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('note')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'note' 
                ? 'bg-black text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste from Note / Text</span>
          </button>

          <button
            onClick={() => setActiveSubTab('csv')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'csv' 
                ? 'bg-black text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload CSV / Excel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'manual' 
                ? 'bg-black text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Recipient</span>
          </button>
        </div>

        {/* SubTab 1: Note Text */}
        {activeSubTab === 'note' && (
          <div className="space-y-4 pt-2">
            <p className="text-xs font-semibold text-gray-700">
              Paste raw notes containing emails and names. Example: <code className="bg-gray-100 text-blue-800 font-mono text-xs px-2 py-0.5 rounded border border-gray-300">john@gmail.com John Doe - Math Tutor</code>
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              placeholder="Paste raw email notes here..."
              className="w-full bg-white border border-gray-300 rounded-xl p-4 text-xs font-mono text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={parseNoteText}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract Emails & Add to Roster</span>
              </button>
            </div>
          </div>
        )}

        {/* SubTab 2: CSV Drag & Drop */}
        {activeSubTab === 'csv' && (
          <div className="border-2 border-dashed border-gray-300 hover:border-black rounded-2xl p-10 text-center transition-all bg-gray-50/50">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Drag & Drop CSV File</h3>
            <p className="text-xs text-gray-500 mb-5">Supported formats: .csv, .txt (Email, First Name, Last Name, Company, Role)</p>
            <label className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-2">
              <span>Choose File</span>
              <input type="file" accept=".csv,.txt" onChange={handleCsvFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* SubTab 3: Manual Add */}
        {activeSubTab === 'manual' && (
          <form onSubmit={handleAddManual} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <input
              type="email"
              required
              placeholder="Email address *"
              value={manualEmail}
              onChange={e => setManualEmail(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-black"
            />
            <input
              type="text"
              placeholder="First name (e.g. John)"
              value={manualFirstName}
              onChange={e => setManualFirstName(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-black"
            />
            <input
              type="text"
              placeholder="Last name (e.g. Doe)"
              value={manualLastName}
              onChange={e => setManualLastName(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-black"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Role (e.g. Tutor)"
                value={manualRole}
                onChange={e => setManualRole(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-black flex-1"
              />
              <button type="submit" className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recipient Data Table Card (High Contrast White Card) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-gray-900">Active Recipient Roster</h3>
            <span className="bg-gray-100 text-gray-800 font-mono font-bold text-xs px-3 py-1 rounded-full border border-gray-200">
              {filteredRecipients.length} / {safeRecipients.length} Loaded
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, email, role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 outline-none focus:border-black"
            />
          </div>
        </div>

        {filteredRecipients.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-2xl bg-gray-50/50">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-800">No recipients found.</p>
            <p className="text-xs text-gray-500 mt-1">Paste a note above or click "Load Sample Dataset (50)".</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Recipient Name</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Skill / Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {filteredRecipients.slice(0, 100).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-sans font-bold text-gray-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-900 text-white font-black flex items-center justify-center text-xs">
                        {r.firstName ? r.firstName.charAt(0) : 'S'}
                      </div>
                      <span>{r.firstName} {r.lastName}</span>
                    </td>
                    <td className="px-5 py-3.5 text-blue-700 font-semibold">{r.email}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-sans">{r.role}</td>
                    <td className="px-5 py-3.5 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Sent' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        r.status === 'Sending' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        r.status === 'Failed' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => removeRecipient(r.id)}
                        className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors"
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
