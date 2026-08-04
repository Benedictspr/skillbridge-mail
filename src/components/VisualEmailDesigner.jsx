import React, { useState, useEffect, useRef } from 'react';
import DesignerTopToolbar from './designer/DesignerTopToolbar';
import DesignerLeftSidebar from './designer/DesignerLeftSidebar';
import DesignerCanvas from './designer/DesignerCanvas';
import DesignerRightPanel from './designer/DesignerRightPanel';
import DesignerStartModal from './designer/DesignerStartModal';
import DesignerPreviewModal from './designer/DesignerPreviewModal';
import { TEMPLATES_LIST } from './designer/templatesData';
import { exportToHtml } from './designer/htmlExporter';
import { Send, Check, X, Code, Sparkles, FileText, CheckCircle2, Bookmark, Download, Menu, Sliders, PanelLeftOpen, PanelRightOpen } from 'lucide-react';

export default function VisualEmailDesigner({
  campaignConfig = {},
  setCampaignConfig,
  recipients = [],
  onStartQueue,
  onSendSingleTest,
  smtpConfig = {},
  onCloseStudio,
  editorMode,
  setEditorMode
}) {
  // 1. Core State
  const [projectName, setProjectName] = useState('SkillBridge Student Outreach Campaign');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isStartModalOpen, setIsStartModalOpen] = useState(() => {
    return !localStorage.getItem('skillbridge_email_designer_data');
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendTestOpen, setIsSendTestOpen] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState('john.doe@university.edu');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sidebar Collapse / Expand States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Active Selection State
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState('body'); // 'body' | 'section' | 'component'

  // Canvas Email Model Data
  const [emailData, setEmailData] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_email_designer_data');
      return saved ? JSON.parse(saved) : TEMPLATES_LIST[0];
    } catch (e) {
      return TEMPLATES_LIST[0];
    }
  });

  // Saved Custom Templates stored in localStorage
  const [mySavedTemplates, setMySavedTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_my_saved_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Undo / Redo History Stack
  const [history, setHistory] = useState([emailData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Toast notification trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle HTML5 Fullscreen API
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Synchronize history when emailData changes
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(emailData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Trigger Autosave
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      localStorage.setItem('skillbridge_email_designer_data', JSON.stringify(emailData));
      setSaveStatus('Saved');
    }, 600);
    return () => clearTimeout(timer);
  }, [emailData]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      } else if (e.key === 'Escape') {
        setSelectedId(null);
        setSelectedType('body');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Undo Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setEmailData(prev);
    }
  };

  // Redo Action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setEmailData(next);
    }
  };

  // Drag Component onto Canvas
  const handleDragStartComponent = (e, type) => {
    e.dataTransfer.setData('skillbridge_cmp_type', type);
  };

  // Drop Component Action
  const handleDropComponent = (cmpType, secId, colId) => {
    const newCmp = createDefaultComponent(cmpType);

    setEmailData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          rows: sec.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.id !== colId && col.id !== sec.rows[0]?.columns[0]?.id) return col;
              return {
                ...col,
                components: [...col.components, newCmp]
              };
            })
          }))
        };
      })
    }));

    setSelectedId(newCmp.id);
    setSelectedType('component');
  };

  // Select Blank Email
  const handleSelectBlank = () => {
    const blankModel = {
      id: 'blank-email',
      name: 'Blank Canvas Email',
      body: { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, sans-serif' },
      sections: [
        {
          id: `sec-${Date.now()}`,
          bg: '#FFFFFF',
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 24,
          paddingRight: 24,
          rows: [
            {
              id: `r-${Date.now()}`,
              columns: [
                {
                  id: `c-${Date.now()}`,
                  width: '100%',
                  components: [
                    { id: `cmp-${Date.now()}`, type: 'text', content: 'Start building your email here by dragging components from the left sidebar.' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    setEmailData(blankModel);
    setSelectedId(null);
    setSelectedType('body');
  };

  // Select Template
  const handleSelectTemplate = (template) => {
    setEmailData(template);
    setSelectedId(null);
    setSelectedType('body');
  };

  // AI Generation Handler
  const handleGenerateAi = (prompt) => {
    const aiModel = {
      id: `ai-${Date.now()}`,
      name: `AI Generated: ${prompt.slice(0, 20)}...`,
      body: { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, sans-serif' },
      sections: [
        {
          id: `sec-ai-1`,
          bg: '#0F172A',
          paddingTop: 36,
          paddingBottom: 36,
          paddingLeft: 24,
          paddingRight: 24,
          rows: [
            {
              id: `r-ai-1`,
              columns: [
                {
                  id: `c-ai-1`,
                  width: '100%',
                  components: [
                    { id: `cmp-badge`, type: 'badge', text: 'AI GENERATED OUTREACH', bg: '#1E293B', color: '#38BDF8', border: '#334155', align: 'center' },
                    { id: `cmp-h1`, type: 'heading', text: 'Exclusive Career Opportunity for {{first_name}}', color: '#FFFFFF', size: 26, weight: '800', align: 'center', paddingTop: 12 }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: `sec-ai-2`,
          bg: '#FFFFFF',
          paddingTop: 40,
          paddingBottom: 40,
          paddingLeft: 32,
          paddingRight: 32,
          rows: [
            {
              id: `r-ai-2`,
              columns: [
                {
                  id: `c-ai-2`,
                  width: '100%',
                  components: [
                    { id: `cmp-p1`, type: 'text', content: `Hi {{first_name}},\n\nBased on your profile at {{company}}, we would love to introduce a remote role tailored to your background in {{role}}.`, color: '#334155', size: 16, lineHeight: '1.6' },
                    { id: `cmp-btn`, type: 'button', text: 'Apply Now via Telegram', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#007C89', color: '#FFFFFF', borderRadius: 8, paddingV: 14, paddingH: 32, align: 'center', paddingTop: 24 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    setEmailData(aiModel);
  };

  // Block Duplicate & Delete Handlers
  const handleDuplicateBlock = (id) => {
    setEmailData(prev => {
      const secToDup = prev.sections.find(s => s.id === id);
      if (secToDup) {
        const dupSec = {
          ...secToDup,
          id: `sec-${Date.now()}`
        };
        const idx = prev.sections.findIndex(s => s.id === id);
        const nextSecs = [...prev.sections];
        nextSecs.splice(idx + 1, 0, dupSec);
        return { ...prev, sections: nextSecs };
      }
      return prev;
    });
  };

  const handleDeleteBlock = (id) => {
    setEmailData(prev => {
      const nextSecs = prev.sections.filter(s => s.id !== id).map(sec => ({
        ...sec,
        rows: sec.rows.map(row => ({
          ...row,
          columns: row.columns.map(col => ({
            ...col,
            components: col.components.filter(cmp => cmp.id !== id)
          }))
        }))
      }));
      return { ...prev, sections: nextSecs };
    });
    setSelectedId(null);
    setSelectedType('body');
  };

  const handleMoveBlock = (id, direction) => {
    setEmailData(prev => {
      const idx = prev.sections.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.sections.length) return prev;

      const nextSecs = [...prev.sections];
      const temp = nextSecs[idx];
      nextSecs[idx] = nextSecs[targetIdx];
      nextSecs[targetIdx] = temp;
      return { ...prev, sections: nextSecs };
    });
  };

  // REAL-TIME EXPORT ACTIONS
  const handleExportHtml = (type) => {
    const compiledHtml = exportToHtml(emailData);
    if (type === 'download') {
      const blob = new Blob([compiledHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.html`;
      a.click();
      showToast('HTML Email File downloaded successfully!');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(compiledHtml);
      showToast('Compiled Inline HTML copied to clipboard!');
    } else if (type === 'json') {
      navigator.clipboard.writeText(JSON.stringify(emailData, null, 2));
      showToast('Design JSON Schema copied to clipboard!');
    }
  };

  // REAL-TIME SAVE CUSTOM TEMPLATE
  const handleSaveAsTemplate = () => {
    const newTmpl = {
      ...emailData,
      id: `custom-tmpl-${Date.now()}`,
      name: `${projectName} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      savedAt: new Date().toISOString()
    };
    const updated = [newTmpl, ...mySavedTemplates];
    setMySavedTemplates(updated);
    localStorage.setItem('skillbridge_my_saved_templates', JSON.stringify(updated));
    showToast('Template saved to "My Templates" drawer in real-time!');
  };

  // Send Test Email Action
  const handleSendTestSubmit = (e) => {
    e.preventDefault();
    if (!testRecipientEmail.trim()) return;
    setIsSendingTest(true);
    setTimeout(() => {
      if (onSendSingleTest) {
        onSendSingleTest(testRecipientEmail, exportToHtml(emailData));
      }
      setIsSendingTest(false);
      setTestSentSuccess(true);
      setTimeout(() => {
        setTestSentSuccess(false);
        setIsSendTestOpen(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-slate-100 flex flex-col h-screen w-screen overflow-hidden font-sans">
      
      {/* Top Region: Apple/Linear Toolbar */}
      <DesignerTopToolbar
        projectName={projectName}
        setProjectName={setProjectName}
        saveStatus={saveStatus}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenPreview={() => setIsPreviewOpen(true)}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        onOpenSendTest={() => setIsSendTestOpen(true)}
        onExportHtml={handleExportHtml}
        onSaveAsTemplate={handleSaveAsTemplate}
        onPublish={() => {
          if (setCampaignConfig) {
            setCampaignConfig(prev => ({
              ...prev,
              htmlContent: exportToHtml(emailData)
            }));
          }
          showToast('Email layout published to active campaign queue!');
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onCloseStudio={onCloseStudio || (() => {})}
        isLeftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />

      {/* Main Studio Viewport split into Left Sidebar, Center Canvas, Right Properties */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Region Sidebar */}
        <DesignerLeftSidebar
          isOpen={isLeftSidebarOpen}
          onToggleOpen={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          onDragStartComponent={handleDragStartComponent}
          onSelectTemplate={handleSelectTemplate}
          mySavedTemplates={mySavedTemplates}
          onApplyBrandAsset={(type, val) => {
            if (type === 'color') {
              setEmailData(prev => ({ ...prev, body: { ...prev.body, bg: val } }));
            }
          }}
          onGenerateAiSection={handleGenerateAi}
        />

        {/* Floating Icon Handle to Expand Left Sidebar when Collapsed */}
        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 bg-slate-900/90 backdrop-blur border border-slate-700 hover:border-teal-500 text-teal-400 p-2.5 rounded-xl shadow-2xl transition-all hover:scale-110 flex items-center gap-1.5 text-xs font-bold"
            title="Expand Components Library"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </button>
        )}

        {/* Center Region Canvas Workspace */}
        <DesignerCanvas
          emailData={emailData}
          setEmailData={setEmailData}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          zoomLevel={zoomLevel}
          previewDevice={previewDevice}
          onDropComponent={handleDropComponent}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
        />

        {/* Floating Icon Handle to Expand Right Panel when Collapsed */}
        {!isRightPanelOpen && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute top-4 right-4 z-40 bg-slate-900/90 backdrop-blur border border-slate-700 hover:border-teal-500 text-teal-400 p-2.5 rounded-xl shadow-2xl transition-all hover:scale-110 flex items-center gap-1.5 text-xs font-bold"
            title="Expand Properties Inspector"
          >
            <PanelRightOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Inspector</span>
          </button>
        )}

        {/* Right Region Dynamic Property Inspector */}
        <DesignerRightPanel
          isOpen={isRightPanelOpen}
          onToggleOpen={() => setIsRightPanelOpen(!isRightPanelOpen)}
          selectedId={selectedId}
          selectedType={selectedType}
          emailData={emailData}
          setEmailData={setEmailData}
        />

      </div>

      {/* FLOATING REAL-TIME TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 border border-teal-500/60 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. START EXPERIENCE MODAL */}
      <DesignerStartModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSelectBlank={handleSelectBlank}
        onSelectTemplate={handleSelectTemplate}
        onGenerateAi={handleGenerateAi}
      />

      {/* 2. LIVE PREVIEW MODAL */}
      <DesignerPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        emailData={emailData}
        recipient={recipients[0]}
      />

      {/* 3. SEND TEST EMAIL MODAL */}
      {isSendTestOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Send Real Test Email</h3>
              <button onClick={() => setIsSendTestOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Send an actual test email compiled from your design directly to your inbox via configured SMTP relay.
            </p>

            <form onSubmit={handleSendTestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSendTestOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  {isSendingTest ? (
                    <span>Sending...</span>
                  ) : testSentSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Dispatch Test Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER: CREATE DEFAULT COMPONENT MODELS
// ----------------------------------------------------------------------
function createDefaultComponent(type) {
  const id = `cmp-${Date.now()}`;
  switch (type) {
    case 'heading':
      return { id, type: 'heading', text: 'New Heading Title', size: 24, weight: '700', color: '#0F172A', align: 'left' };
    case 'text':
      return { id, type: 'text', content: 'New text block. Double click on canvas to edit content.', size: 16, color: '#334155', align: 'left' };
    case 'button':
      return { id, type: 'button', text: 'Click Here Now', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#007C89', color: '#FFFFFF', borderRadius: 8, paddingV: 14, paddingH: 32, align: 'center' };
    case 'image':
      return { id, type: 'image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', alt: 'Sample Image', width: '100%', borderRadius: 8, align: 'center' };
    case 'badge':
      return { id, type: 'badge', text: 'FEATURED TAG', bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE', align: 'left' };
    case 'divider':
      return { id, type: 'divider', style: 'solid', color: '#E2E8F0' };
    case 'spacer':
      return { id, type: 'spacer', height: 24 };
    case 'callout':
      return { id, type: 'callout', title: 'Important Note', content: 'This callout box brings key information to light.', bg: '#F8FAFC', border: '#007C89', color: '#0F172A' };
    case 'countdown':
      return { id, type: 'countdown', label: 'LIMITED TIME OFFER:', bg: '#1E2937' };
    case 'social':
      return { id, type: 'social', platforms: ['telegram', 'twitter', 'linkedin', 'instagram', 'github'], align: 'center' };
    case 'footer':
      return { id, type: 'footer', text: 'SkillBridge Network • Unsubscribe', color: '#94A3B8', size: 12, align: 'center' };
    default:
      return { id, type: 'text', content: 'Content block' };
  }
}
