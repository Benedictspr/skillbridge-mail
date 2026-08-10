import React, { useState } from 'react';
import { 
  Upload, FileText, Check, AlertCircle, Trash2, UserPlus, 
  HelpCircle, CheckCircle2, RefreshCw, X, Download, ShieldCheck, Mail
} from 'lucide-react';

export default function RecipientImportView({ 
  recipients = [], 
  setRecipients, 
  onLoadSkillBridgeData, 
  currentOrg 
}) {
  const [pasteText, setPasteText] = useState('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [importTab, setImportTab] = useState('paste'); // 'paste' | 'file' | 'list'

  const safeRecipients = Array.isArray(recipients) ? recipients : [];

  // Smart Note Parser Function
  const parseRawNotes = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n');
    const newParsed = [];
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

    lines.forEach((line, idx) => {
      const emailsFound = line.match(emailRegex);
      if (emailsFound && emailsFound.length > 0) {
        const email = emailsFound[0].trim().toLowerCase();
        
        let cleaned = line.replace(email, '').trim();
        let name = '';
        let role = 'Candidate';
        let company = currentOrg?.name || 'Sendaat Network';

        if (cleaned.includes('-')) {
          const parts = cleaned.split('-');
          name = parts[0].trim();
          role = parts[1].trim();
        } else if (cleaned.includes(',')) {
          const parts = cleaned.split(',');
          name = parts[0].trim();
          role = parts[1].trim();
        } else {
          name = cleaned.trim() || email.split('@')[0];
        }

        const nameParts = name.split(' ');
        const firstName = nameParts[0] || 'Candidate';
        const lastName = nameParts.slice(1).join(' ') || '';

        newParsed.push({
          id: `imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          email,
          firstName,
          lastName,
          company,
          role,
          status: 'Ready',
          organization_id: currentOrg?.id || 'org_sendaat_1001'
        });
      }
    });

    if (newParsed.length > 0) {
      const existingEmails = new Set(safeRecipients.map(r => r.email.toLowerCase()));
      const uniqueNew = newParsed.filter(r => !existingEmails.has(r.email.toLowerCase()));

      if (uniqueNew.length > 0) {
        setRecipients(prev => [...(Array.isArray(prev) ? prev : []), ...uniqueNew]);
        setParseSuccessMsg(`Successfully extracted ${uniqueNew.length} new contact(s)!`);
        setPasteText('');
      } else {
        setParseSuccessMsg('All extracted contacts are already in your Audience list.');
      }
    } else {
      setParseSuccessMsg('No valid email addresses found in the text.');
    }

    setTimeout(() => setParseSuccessMsg(''), 4000);
  };

  const clearAllRecipients = () => {
    if (confirm('Are you sure you want to remove all contacts from your Audience list?')) {
      setRecipients([]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setPasteText(event.target.result);
        setImportTab('paste');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* 1. Header Banner */}
      <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
              Step 2: Audience Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
              Recipient Import & Audience Roster
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Import applicant rosters from notes, CSV files, or manual entries for <strong className="text-white">{currentOrg?.name || 'Sendaat Enterprise'}</strong>.
            </p>
          </div>

          {/* Clean Load Sample Dataset (5) button - NO star logo, NO 50 */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLoadSkillBridgeData}
              className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Load Sample Dataset (5)</span>
            </button>

            {safeRecipients.length > 0 && (
              <button
                onClick={clearAllRecipients}
                className="bg-rose-950/40 hover:bg-rose-950/70 text-rose-400 border border-rose-800/40 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear All ({safeRecipients.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="pt-3 flex gap-2 border-t border-zinc-800">
          <button
            onClick={() => setImportTab('paste')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              importTab === 'paste' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Smart Note Parser</span>
          </button>

          <button
            onClick={() => setImportTab('file')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              importTab === 'file' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV / Text File</span>
          </button>

          <button
            onClick={() => setImportTab('list')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              importTab === 'list' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Audience Roster ({safeRecipients.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Box */}
      {parseSuccessMsg && (
        <div className="p-4 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-xl font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{parseSuccessMsg}</span>
        </div>
      )}

      {/* 3. TAB CONTENT */}
      {importTab === 'paste' && (
        <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              <span>Smart Note & Text Roster Extraction</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Paste raw candidate lists. Example: <code className="bg-black text-zinc-300 font-mono text-xs px-2 py-0.5 rounded border border-zinc-800">john@gmail.com John Doe - Math Tutor</code>
            </p>
          </div>

          <textarea
            rows={8}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="john.doe@university.edu John Doe - Mathematics Tutor&#10;mary.smith@cambridge.org Mary Smith - Python Developer"
            className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-zinc-500 resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-zinc-400">
              Paste a note above or click "Load Sample Dataset (5)".
            </p>

            <button
              onClick={parseRawNotes}
              disabled={!pasteText.trim()}
              className="bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Parse & Add to Audience
            </button>
          </div>
        </div>
      )}

      {importTab === 'file' && (
        <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span>Upload CSV or TXT File</span>
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              dragActive ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-black'
            }`}
          >
            <Upload className="w-10 h-10 text-white mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">Drag and drop your candidate roster file here</h4>
            <p className="text-xs text-zinc-400 mt-1">Supports .csv, .txt, or exported contacts list</p>
          </div>
        </div>
      )}

      {/* 4. Audience Roster Table */}
      {importTab === 'list' && (
        <div className="bg-[#121212] p-6 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-white" />
              <span>Current Audience Roster ({safeRecipients.length})</span>
            </h3>
            <button
              onClick={onLoadSkillBridgeData}
              className="px-3.5 py-1.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Load Sample Dataset (5)
            </button>
          </div>

          {safeRecipients.length === 0 ? (
            <div className="p-8 text-center bg-black rounded-xl border border-zinc-800 text-zinc-400 text-xs font-mono">
              No contacts loaded in Audience roster yet. Click "Load Sample Dataset (5)" above to populate instantly.
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-black text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {safeRecipients.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="p-3 font-mono text-zinc-500">{i + 1}</td>
                      <td className="p-3 font-bold text-white">{r.firstName} {r.lastName}</td>
                      <td className="p-3 font-mono text-zinc-300">{r.email}</td>
                      <td className="p-3 text-zinc-400">{r.role || 'Candidate'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {r.status || 'Ready'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setRecipients(safeRecipients.filter(item => item.id !== r.id))}
                          className="p-1 hover:bg-rose-950/60 text-rose-400 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
