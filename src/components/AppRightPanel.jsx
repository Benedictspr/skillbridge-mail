import React, { useState } from 'react';
import { Calendar, Lightbulb, CheckSquare, User, Plus, ChevronRight, X, Check, FileText, Send, Sparkles } from 'lucide-react';

export default function AppRightPanel({ recipients, setRecipients, activeTab, setActiveTab }) {
  const [activeDrawer, setActiveDrawer] = useState(null); // null | 'calendar' | 'keep' | 'tasks' | 'contacts' | 'add'

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Configure Gmail Address & 16-char App Password', done: true },
    { id: 2, text: 'Paste or upload contact recipient list', done: recipients.length > 0 },
    { id: 3, text: 'Customize Option 1 email template in Designer', done: true },
    { id: 4, text: 'Send 1 test email to verify delivery', done: false },
    { id: 5, text: 'Launch full 1-by-1 campaign queue', done: false }
  ]);

  // Notes state
  const [notes, setNotes] = useState([
    { id: 1, title: 'Outreach Strategy Note', content: 'Follow up with applicants who opened the email within 24 hours.' },
    { id: 2, title: 'Subject Line A/B Test', content: 'Current subject: Remote Opportunity for Students (85% open rate).' }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');

  // Add Contact Quick Form
  const [quickEmail, setQuickEmail] = useState('');
  const [quickName, setQuickName] = useState('');

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    setNotes(prev => [{ id: Date.now(), title: newNoteTitle.trim(), content: newNoteBody.trim() }, ...prev]);
    setNewNoteTitle('');
    setNewNoteBody('');
  };

  const handleAddQuickContact = (e) => {
    e.preventDefault();
    if (!quickEmail.trim()) return;
    const nameParts = quickName.trim().split(/\s+/);
    setRecipients(prev => [...prev, {
      id: `quick-${Date.now()}`,
      email: quickEmail.trim(),
      firstName: nameParts[0] || 'Friend',
      lastName: nameParts.slice(1).join(' ') || '',
      company: 'SkillBridge Network',
      role: 'Student Applicant',
      status: 'Ready'
    }]);
    setQuickEmail('');
    setQuickName('');
    setActiveDrawer(null);
    setActiveTab('recipients');
  };

  return (
    <>
      {/* Right Sidebar Icon Column */}
      <aside className="w-14 bg-[#0F172A] border-l border-slate-800/80 py-4 flex flex-col items-center justify-between shrink-0 hidden lg:flex select-none text-white">
        <div className="space-y-4">
          {/* Calendar Icon */}
          <button 
            onClick={() => setActiveDrawer(activeDrawer === 'calendar' ? null : 'calendar')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeDrawer === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-blue-400'
            }`} 
            title="Campaign Schedule & Calendar"
          >
            <div className="relative font-bold text-xs">
              <Calendar className="w-5 h-5" />
              <span className={`absolute top-1 left-1.5 text-[9px] font-extrabold ${activeDrawer === 'calendar' ? 'text-white' : 'text-blue-900'}`}>31</span>
            </div>
          </button>

          {/* Keep Lightbulb Icon */}
          <button 
            onClick={() => setActiveDrawer(activeDrawer === 'keep' ? null : 'keep')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeDrawer === 'keep' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-black/10 text-amber-500'
            }`} 
            title="Outreach Notes & Snippets"
          >
            <Lightbulb className="w-5 h-5" />
          </button>

          {/* Tasks Checkmark Icon */}
          <button 
            onClick={() => setActiveDrawer(activeDrawer === 'tasks' ? null : 'tasks')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeDrawer === 'tasks' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/10 text-blue-500'
            }`} 
            title="Outreach Checklist & Tasks"
          >
            <CheckSquare className="w-5 h-5" />
          </button>

          {/* Contacts User Icon */}
          <button 
            onClick={() => setActiveDrawer(activeDrawer === 'contacts' ? null : 'contacts')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeDrawer === 'contacts' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-black/10 text-indigo-500'
            }`} 
            title="Quick Contact Viewer"
          >
            <User className="w-5 h-5" />
          </button>

          <div className="w-6 border-b border-black/10 my-2" />

          {/* Plus Add Icon */}
          <button 
            onClick={() => setActiveDrawer(activeDrawer === 'add' ? null : 'add')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeDrawer === 'add' ? 'bg-black text-white shadow-md' : 'hover:bg-black/10 text-gray-800'
            }`} 
            title="Quick Add Contact"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => setActiveDrawer(null)}
          className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-600 transition-colors"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>

      {/* Interactive Pop-over Drawers */}
      {activeDrawer && (
        <div className="fixed inset-y-0 right-14 z-50 w-80 bg-white border-l border-gray-300 shadow-2xl p-5 flex flex-col justify-between font-sans animate-fade-in">
          {/* DRAWER 1: CALENDAR */}
          {activeDrawer === 'calendar' && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Outreach Calendar</span>
                </div>
                <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <span className="font-bold text-blue-900 block">Today's Schedule</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5">5s interval dispatches active</span>
                </div>

                <div className="border border-gray-200 p-3 rounded-xl space-y-2">
                  <span className="font-bold text-gray-900 block">Upcoming Events</span>
                  <div className="flex items-start gap-2 text-[11px] text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <span>09:00 AM — Initial Batch Dispatch (25 contacts)</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                    <span>02:00 PM — Applicant Responses Follow-Up</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DRAWER 2: KEEP NOTES */}
          {activeDrawer === 'keep' && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>Outreach Notes & Snippets</span>
                </div>
                <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs font-bold outline-none"
                />
                <textarea
                  placeholder="Snippet or idea..."
                  value={newNoteBody}
                  onChange={e => setNewNoteBody(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs outline-none"
                />
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-1 rounded">
                  Save Note
                </button>
              </form>

              <div className="space-y-2">
                {notes.map(n => (
                  <div key={n.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-amber-900 block">{n.title}</span>
                    <p className="text-gray-700 text-[11px] leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DRAWER 3: TASKS CHECKLIST */}
          {activeDrawer === 'tasks' && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <CheckSquare className="w-4 h-4" />
                  <span>Outreach Checklist</span>
                </div>
                <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {tasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => toggleTask(t.id)}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                      t.done ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400'
                    }`}>
                      {t.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={t.done ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}>
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DRAWER 4: CONTACTS QUICK VIEW */}
          {activeDrawer === 'contacts' && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <User className="w-4 h-4" />
                  <span>Quick Contact Roster ({recipients.length})</span>
                </div>
                <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-96">
                {recipients.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-6 text-center">No contacts loaded in roster.</p>
                ) : (
                  recipients.map(r => (
                    <div key={r.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <span className="font-bold text-gray-900 block">{r.firstName} {r.lastName}</span>
                      <span className="text-blue-600 text-[11px] block">{r.email}</span>
                      <span className="text-gray-500 text-[10px] block">{r.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* DRAWER 5: QUICK ADD CONTACT */}
          {activeDrawer === 'add' && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Quick Add Contact</span>
                </div>
                <button onClick={() => setActiveDrawer(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddQuickContact} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={quickEmail}
                    onChange={e => setQuickEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded-lg shadow-sm">
                  Add Contact to Queue
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
