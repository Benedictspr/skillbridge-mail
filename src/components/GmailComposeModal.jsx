import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Paperclip, Link, Trash2, ChevronDown, Save, Check, Plus, Bookmark } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../mockData';
import syncEngine from '../utils/syncEngine';

export default function GmailComposeModal({ 
  isOpen, 
  onClose, 
  campaignConfig = {}, 
  setCampaignConfig, 
  recipients = [], 
  onStartQueue,
  onSendSingleTest 
}) {
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Custom Saved Templates State (Persisted in Cloud & LocalStorage)
  const [savedTemplates, setSavedTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_savedTemplates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove legacy hardcoded templates if found in localStorage
          return parsed.filter(t => 
            t && 
            !['tmpl_1', 'tmpl_2', 'option-1-best', 'option-2-fellowship'].includes(t.id) &&
            !t.name?.includes('Option 1') &&
            !t.name?.includes('Fellowship') &&
            !t.name?.includes('Remote Opportunity') &&
            !t.subject?.includes('Remote Opportunity')
          );
        }
      }
    } catch (e) {}
    return [];
  });

  // Listen for remote updates
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((eventType, data) => {
      if (eventType === 'REMOTE_UPDATE' && data.delta?.savedTemplates) {
        setSavedTemplates(data.delta.savedTemplates);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sendaat_savedTemplates', JSON.stringify(savedTemplates));
      syncEngine.pushState({ savedTemplates });
    } catch (e) {}
  }, [savedTemplates]);

  if (!isOpen) return null;

  const handleInsertTag = (tag) => {
    setCampaignConfig(prev => ({
      ...prev,
      bodyText: (prev.bodyText || '') + ' ' + tag + ' '
    }));
  };

  const handleSelectTemplate = (templateId) => {
    const tmpl = savedTemplates.find(t => t.id === templateId);
    if (tmpl) {
      setCampaignConfig(prev => ({
        ...prev,
        templateId: tmpl.id,
        subject: tmpl.subject || prev.subject,
        bodyText: tmpl.bodyText || prev.bodyText,
        signatureText: tmpl.signatureText || prev.signatureText
      }));
    }
  };

  const handleSaveCurrentAsTemplate = () => {
    const name = window.prompt('Enter a name for this email template:', campaignConfig.subject || 'Custom Outreach Template');
    if (!name || !name.trim()) return;

    const newTmpl = {
      id: `tmpl_${Date.now()}`,
      name: name.trim(),
      subject: campaignConfig.subject || '',
      bodyText: campaignConfig.bodyText || '',
      signatureText: campaignConfig.signatureText || ''
    };

    setSavedTemplates(prev => [newTmpl, ...prev]);
    setCampaignConfig(prev => ({ ...prev, templateId: newTmpl.id }));
    setSaveSuccessMsg('Template saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL:', 'https://t.me/+AB0OloYpE7I1NTVk');
    if (url) {
      setCampaignConfig(prev => ({
        ...prev,
        bodyText: (prev.bodyText || '') + ` ${url} `
      }));
    }
  };

  return (
    <div className="fixed bottom-0 right-4 sm:right-6 z-50 shadow-2xl font-sans text-white">
      <div className={`w-full sm:w-[640px] bg-[#121212] border border-zinc-800 rounded-t-2xl shadow-2xl flex flex-col transition-all overflow-hidden ${isMinimized ? 'h-12' : 'h-[600px]'}`}>
        
        {/* Window Header Bar */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-[#09090B] text-white px-4 py-3 flex items-center justify-between border-b border-zinc-800 cursor-pointer select-none"
        >
          <span className="font-semibold text-xs font-sans text-white flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            New Campaign — {campaignConfig.subject || 'Remote Opportunity for Candidates'}
          </span>

          <div className="flex items-center gap-1.5 text-zinc-400" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1 hover:bg-zinc-800 rounded-lg hover:text-white transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1 hover:bg-zinc-800 rounded-lg hover:text-white transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-rose-950/60 rounded-lg hover:text-rose-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Header Fields (Recipients / Subject) */}
            <div className="bg-[#121212] px-4 py-3 border-b border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-semibold w-20 shrink-0">Recipients:</span>
                <div className="flex-1 flex items-center gap-1.5 flex-wrap max-h-16 overflow-y-auto">
                  <span className="bg-zinc-900 text-zinc-200 border border-zinc-800 px-3 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1">
                    <span>All {recipients.length} Contacts (Individual 1-by-1 Queue)</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-2">
                <span className="text-zinc-400 font-semibold w-20 shrink-0">Subject:</span>
                <input
                  type="text"
                  value={campaignConfig.subject}
                  onChange={e => setCampaignConfig(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject line..."
                  className="flex-1 bg-transparent outline-none font-semibold text-white text-xs placeholder-zinc-500 font-sans"
                />
              </div>
            </div>

            {/* Merge Tag Toolbar & Save/Select Template System */}
            <div className="bg-black px-4 py-2 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-semibold text-[11px]">Insert Tag:</span>
                {['{{first_name}}', '{{role}}', '{{company}}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Select Saved Template */}
                <select
                  value={campaignConfig.templateId || ''}
                  onChange={e => handleSelectTemplate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1 text-xs font-semibold text-white outline-none cursor-pointer focus:border-zinc-500 font-sans max-w-[200px] truncate"
                >
                  <option value="" disabled>
                    {savedTemplates.length === 0 ? 'No Saved Templates Yet' : 'Select Saved Template...'}
                  </option>
                  {savedTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                {/* Save Current as New Template */}
                <button
                  type="button"
                  onClick={handleSaveCurrentAsTemplate}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-700 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Save current subject & body as a template"
                >
                  <Bookmark className="w-3.5 h-3.5 text-white" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Email Text Area */}
            <div className="flex-1 p-4 bg-black overflow-y-auto space-y-2">
              <textarea
                value={campaignConfig.bodyText}
                onChange={e => setCampaignConfig(prev => ({ ...prev, bodyText: e.target.value }))}
                className="w-full h-full bg-transparent border-none outline-none text-xs text-zinc-200 leading-relaxed font-sans resize-none placeholder-zinc-500"
                placeholder="Write your email body..."
              />

              {attachments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-800">
                  {attachments.map((att, i) => (
                    <span key={i} className="bg-zinc-900 text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center gap-1.5">
                      <span>{att}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-rose-400" 
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Photo 3: Fully Editable Signature Textarea */}
            <div className="px-4 py-2 bg-[#09090B] border-t border-zinc-800 space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Sender Signature (Editable)</label>
              <textarea
                rows={2}
                value={campaignConfig.signatureText || 'Maverick Jack\nDirector of Outreach | Sendaat Network'}
                onChange={e => setCampaignConfig(prev => ({ ...prev, signatureText: e.target.value }))}
                placeholder="Enter your name, title, and organization..."
                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-zinc-500 resize-none leading-snug"
              />
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#09090B] px-4 py-3 border-t border-zinc-800 flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onStartQueue();
                  }}
                  className="bg-white hover:bg-zinc-200 text-black text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <span>Send</span>
                </button>

                <button
                  onClick={onSendSingleTest}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Test 1 Mail</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileAttachment} 
                  className="hidden" 
                  multiple 
                />
                <Paperclip 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
                  title="Attach file"
                />
                <Link 
                  onClick={handleInsertLink}
                  className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
                  title="Insert link"
                />
                <Trash2 
                  onClick={onClose}
                  className="w-4 h-4 cursor-pointer hover:text-rose-400 transition-colors ml-1" 
                  title="Discard Draft"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
