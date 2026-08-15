import React, { useState, useRef, startTransition } from 'react';
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
  const [importTab, setImportTab] = useState('list'); // Default to Audience list 'list' | 'paste' | 'file'
  const fileInputRef = useRef(null);

  const safeRecipients = Array.isArray(recipients) ? recipients : [];

  // Helper to parse file text content (CSV or TXT) into structured contact objects
  const processFileContent = (rawText, filename = 'Uploaded File') => {
    if (!rawText || !rawText.trim()) return;

    const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const newParsed = [];
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

    // Check if first line is CSV header
    const firstLineLower = lines[0].toLowerCase();
    const isCsvHeader = firstLineLower.includes('email') || firstLineLower.includes('name');
    const startIdx = isCsvHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const emailsFound = line.match(emailRegex);

      if (emailsFound && emailsFound.length > 0) {
        const email = emailsFound[0].trim().toLowerCase();
        let name = '';
        let role = 'Candidate';
        let company = currentOrg?.name || 'Sendaat Network';

        if (line.includes(',')) {
          const cols = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          const emailColIdx = cols.findIndex(c => c.toLowerCase() === email);
          
          if (emailColIdx >= 0) {
            const otherCols = cols.filter((_, idx) => idx !== emailColIdx);
            if (otherCols.length >= 1) name = otherCols[0];
            if (otherCols.length >= 2) role = otherCols[1];
            if (otherCols.length >= 3) company = otherCols[2];
          } else {
            name = cols[0] !== email ? cols[0] : (cols[1] || '');
          }
        } else if (line.includes('-')) {
          const parts = line.replace(email, '').split('-');
          name = parts[0].trim();
          role = parts[1]?.trim() || 'Candidate';
        } else {
          name = line.replace(email, '').trim();
        }

        if (!name) name = email.split('@')[0];
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || 'Candidate';
        const lastName = nameParts.slice(1).join(' ') || '';

        newParsed.push({
          id: `imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          email,
          firstName,
          lastName,
          company,
          role,
          status: 'Ready',
          organization_id: currentOrg?.id || 'org_sendaat_1001'
        });
      }
    }

    if (newParsed.length > 0) {
      const existingEmails = new Set(safeRecipients.map(r => r.email.toLowerCase()));
      const uniqueNew = newParsed.filter(r => !existingEmails.has(r.email.toLowerCase()));

      if (uniqueNew.length > 0) {
        startTransition(() => {
          setRecipients(prev => [...(Array.isArray(prev) ? prev : []), ...uniqueNew]);
          setParseSuccessMsg(`Successfully imported ${uniqueNew.length} new contact(s) from ${filename}!`);
          setImportTab('list');
        });
      } else {
        setParseSuccessMsg(`All ${newParsed.length} contacts from ${filename} are already in your Audience list.`);
      }
    } else {
      setParseSuccessMsg(`No valid email addresses found in ${filename}.`);
    }

    setTimeout(() => setParseSuccessMsg(''), 5000);
  };

  // Smart Note Parser Function
  const parseRawNotes = () => {
    if (!pasteText.trim()) return;
    processFileContent(pasteText, 'Pasted Roster');
    setPasteText('');
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearAllRecipients = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 4000);
      return;
    }
    setShowClearConfirm(false);
    startTransition(() => {
      setRecipients([]);
      setParseSuccessMsg('Audience roster cleared.');
    });
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
        processFileContent(event.target.result, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        processFileContent(event.target.result, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleTabChange = (tab) => {
    startTransition(() => {
      setImportTab(tab);
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

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
              Import applicant rosters from CSV/TXT files, text notes, or manual entries for <strong className="text-white">{currentOrg?.name || 'Sendaat Enterprise'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                startTransition(() => {
                  if (onLoadSkillBridgeData) onLoadSkillBridgeData();
                });
              }}
              className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Load Sample Dataset (5)</span>
            </button>

            {safeRecipients.length > 0 && (
              <button
                onClick={clearAllRecipients}
                className={`font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  showClearConfirm 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md animate-pulse' 
                    : 'bg-rose-950/40 hover:bg-rose-950/70 text-rose-400 border border-rose-800/40'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{showClearConfirm ? 'Click to Confirm Clear All' : `Clear All (${safeRecipients.length})`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="pt-3 flex gap-2 border-t border-zinc-800">
          <button
            onClick={() => handleTabChange('list')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              importTab === 'list' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Audience Roster ({safeRecipients.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('file')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              importTab === 'file' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV / TXT File</span>
          </button>

          <button
            onClick={() => handleTabChange('paste')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              importTab === 'paste' ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Text Notes</span>
          </button>
        </div>
      </div>

      {/* Parse Status Notification Banner */}
      {parseSuccessMsg && (
        <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-between gap-3 text-white text-xs font-semibold animate-fade-in shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{parseSuccessMsg}</span>
          </div>
          <button onClick={() => setParseSuccessMsg('')} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Upload File Dropzone Section */}
      {importTab === 'file' && (
        <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-white" />
              <span>Upload CSV or TXT File</span>
            </h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Browse Files...
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
              dragActive 
                ? 'border-white bg-zinc-900 scale-[1.01]' 
                : 'border-zinc-800 hover:border-zinc-500 bg-black hover:bg-zinc-900/50'
            }`}
          >
            <div className="w-14 h-14 bg-zinc-900 group-hover:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800 transition-colors">
              <Upload className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-base font-extrabold text-white">Click or Drag & Drop your candidate roster file here</h4>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-sm mx-auto">
              Click anywhere in this box to choose a <strong className="text-zinc-200">.csv</strong> or <strong className="text-zinc-200">.txt</strong> file from your computer.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl shadow-xs group-hover:bg-zinc-200 transition-all">
              <span>Select File from Computer</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Text Notes Extractor Section */}
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
              Paste text above and click "Parse & Add to Audience".
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

      {/* 4. Audience Roster Table Section */}
      {importTab === 'list' && (
        <div className="bg-[#121212] p-6 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-white" />
              <span>Current Audience Roster ({safeRecipients.length})</span>
            </h3>
            <button
              onClick={() => {
                startTransition(() => {
                  if (onLoadSkillBridgeData) onLoadSkillBridgeData();
                });
              }}
              className="px-3.5 py-1.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Load Sample Dataset (5)
            </button>
          </div>

          {safeRecipients.length === 0 ? (
            <div className="p-8 text-center bg-black rounded-xl border border-zinc-800 text-zinc-400 text-xs font-mono space-y-3">
              <p>No contacts loaded in Audience roster yet.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleTabChange('file')}
                  className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Upload CSV File
                </button>
                <button
                  onClick={() => {
                    startTransition(() => {
                      if (onLoadSkillBridgeData) onLoadSkillBridgeData();
                    });
                  }}
                  className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-xl hover:bg-zinc-700 transition-all cursor-pointer border border-zinc-700"
                >
                  Load Sample Dataset (5)
                </button>
              </div>
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
                          onClick={() => {
                            startTransition(() => {
                              setRecipients(prev => prev.filter(rec => rec.id !== r.id));
                            });
                          }}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                          title="Delete recipient"
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
