import React, { useState, useRef } from 'react';
import { X, Minus, Maximize2, Send, Paperclip, Link, Smile, Image, Trash2, ChevronDown } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../mockData';

export default function GmailComposeModal({ 
  isOpen, 
  onClose, 
  campaignConfig, 
  setCampaignConfig, 
  recipients, 
  onStartQueue,
  onSendSingleTest 
}) {
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleInsertTag = (tag) => {
    setCampaignConfig(prev => ({
      ...prev,
      bodyText: (prev.bodyText || '') + ' ' + tag + ' '
    }));
  };

  const handleTemplateSelect = (templateId) => {
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setCampaignConfig(prev => ({
        ...prev,
        templateId: tmpl.id,
        subject: tmpl.subject,
        bodyText: tmpl.bodyText,
        headerLogoText: tmpl.headerLogoText,
        buttonText: tmpl.buttonText,
        buttonUrl: tmpl.buttonUrl,
        signatureText: tmpl.signatureText
      }));
    }
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
    <div className="fixed bottom-0 right-4 sm:right-6 z-50 shadow-2xl font-sans">
      <div className={`gmail-compose-mint-window flex flex-col transition-all ${isMinimized ? 'h-11' : 'h-[580px]'}`}>
        {/* Window Header */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-[#1E293B] text-white px-4 py-2.5 flex items-center justify-between border-b border-gray-700 cursor-pointer"
        >
          <span className="font-bold text-xs font-sans flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            New Campaign — {campaignConfig.subject || 'Remote Opportunity for Students'}
          </span>

          <div className="flex items-center gap-1 text-gray-300" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1 hover:bg-gray-700 rounded"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="p-1 hover:bg-gray-700 rounded"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Header Fields (To / Subject) */}
            <div className="bg-white px-4 py-2 border-b border-gray-200 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold w-16 shrink-0">Recipients:</span>
                <div className="flex-1 flex items-center gap-1.5 flex-wrap max-h-16 overflow-y-auto">
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-blue-200">
                    <span>All {recipients.length} Contacts (Individual 1-by-1 Queue)</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                <span className="text-gray-500 font-semibold w-16 shrink-0">Subject:</span>
                <input
                  type="text"
                  value={campaignConfig.subject}
                  onChange={e => setCampaignConfig(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject line..."
                  className="flex-1 bg-transparent outline-none font-bold text-gray-900 text-xs"
                />
              </div>
            </div>

            {/* Merge Tag Toolbar */}
            <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold text-[11px]">Insert Tag:</span>
                {['{{first_name}}', '{{role}}', '{{company}}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 font-bold text-[11px]">Template:</span>
                <select
                  value={campaignConfig.templateId}
                  onChange={e => handleTemplateSelect(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-0.5 text-[11px] font-bold text-gray-800 outline-none"
                >
                  {EMAIL_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Body Area */}
            <div className="flex-1 p-4 bg-white overflow-y-auto space-y-2">
              <textarea
                value={campaignConfig.bodyText}
                onChange={e => setCampaignConfig(prev => ({ ...prev, bodyText: e.target.value }))}
                className="w-full h-full border-none outline-none text-xs text-gray-800 leading-relaxed font-sans resize-none"
                placeholder="Write your email body..."
              />

              {attachments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                  {attachments.map((att, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{att}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-600" 
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Signature */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 font-medium whitespace-pre-wrap">
              {campaignConfig.signatureText || 'Benedict'}
            </div>

            {/* Bottom Controls Bar */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <div className="relative inline-flex rounded-lg shadow-sm">
                  <button
                    onClick={() => {
                      onClose();
                      onStartQueue();
                    }}
                    className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-5 py-2.5 rounded-l-lg flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>Send (Launch 1-by-1 Queue)</span>
                  </button>

                  <button
                    onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-2 py-2.5 rounded-r-lg border-l border-gray-700"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showScheduleDropdown && (
                    <div className="absolute left-0 bottom-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2 space-y-1 z-50 text-xs">
                      <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase">Dispatch Speeds</div>
                      <button
                        onClick={() => {
                          setCampaignConfig(prev => ({ ...prev, intervalSeconds: 5 }));
                          setShowScheduleDropdown(false);
                          onClose();
                          onStartQueue();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 font-semibold"
                      >
                        <span>Send 1 every 5 seconds (Fast Demo)</span>
                      </button>
                      <button
                        onClick={() => {
                          setCampaignConfig(prev => ({ ...prev, intervalSeconds: 30 }));
                          setShowScheduleDropdown(false);
                          onClose();
                          onStartQueue();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 font-semibold"
                      >
                        <span>Send 1 every 30 seconds (Recommended)</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onSendSingleTest}
                  className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-bold px-3 py-2.5 rounded-lg"
                >
                  <span>Test 1 Mail</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-gray-500">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileAttachment} 
                  className="hidden" 
                  multiple 
                />
                <Paperclip 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-4 h-4 cursor-pointer hover:text-black transition-colors" 
                  title="Attach file"
                />
                <Link 
                  onClick={handleInsertLink}
                  className="w-4 h-4 cursor-pointer hover:text-black transition-colors" 
                  title="Insert link"
                />
                <Trash2 
                  onClick={onClose}
                  className="w-4 h-4 cursor-pointer hover:text-red-600 transition-colors ml-2" 
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
