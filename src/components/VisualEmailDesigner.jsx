import React, { useState, useEffect, useRef, startTransition } from 'react';
import DesignerTopToolbar from './designer/DesignerTopToolbar';
import DesignerLeftSidebar from './designer/DesignerLeftSidebar';
import DesignerCanvas from './designer/DesignerCanvas';
import DesignerRightPanel from './designer/DesignerRightPanel';
import DesignerStartModal from './designer/DesignerStartModal';
import DesignerPreviewModal from './designer/DesignerPreviewModal';
import { TEMPLATES_LIST } from './designer/templatesData';
import { exportToHtml } from './designer/htmlExporter';
import { Send, Check, X, Code, Sparkles, FileText, CheckCircle2, Bookmark, Download, Menu, Sliders, PanelLeftOpen, PanelRightOpen, AlertCircle } from 'lucide-react';
import syncEngine from '../utils/syncEngine';

export default function VisualEmailDesigner({
  campaignConfig = {},
  setCampaignConfig,
  recipients = [],
  onStartQueue,
  onSendSingleTest,
  smtpConfig = {},
  onCloseStudio,
  editorMode = 'visual',
  setEditorMode
}) {
  // 1. Core State
  const [projectName, setProjectName] = useState('Sendaat Email Studio');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isStartModalOpen, setIsStartModalOpen] = useState(() => {
    return !localStorage.getItem('sendaat_email_designer_data');
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendTestOpen, setIsSendTestOpen] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState(recipients[0]?.email || 'user@sendaat.io');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [testSendError, setTestSendError] = useState('');

  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedClipboard, setCopiedClipboard] = useState(null);

  // Sidebar Collapse / Expand States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Active Selection State
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState('body'); // 'body' | 'section' | 'component'

  // Canvas Email Model Data
  const [emailData, setEmailData] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_email_designer_data');
      return saved ? JSON.parse(saved) : TEMPLATES_LIST[0];
    } catch (e) {
      return TEMPLATES_LIST[0];
    }
  });

  // Saved Custom Templates stored in localStorage
  const [mySavedTemplates, setMySavedTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_my_saved_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Undo / Redo History Stack
  const [history, setHistory] = useState([emailData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Toast notification helper
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

  // Listen for remote updates from other devices for email design
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((eventType, data) => {
      if (eventType === 'REMOTE_UPDATE' && data.delta) {
        if (data.delta.emailDesignerData) {
          isUndoRedoAction.current = true;
          setEmailData(data.delta.emailDesignerData);
        }
        if (data.delta.mySavedTemplates) {
          setMySavedTemplates(data.delta.mySavedTemplates);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Synchronize history & persistence when emailData changes
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
      try {
        localStorage.setItem('sendaat_email_designer_data', JSON.stringify(emailData));
        syncEngine.pushState({ emailDesignerData: emailData });
        if (setCampaignConfig) {
          startTransition(() => {
            setCampaignConfig(prev => ({
              ...prev,
              htmlContent: exportToHtml(emailData)
            }));
          });
        }
        setSaveStatus('Saved');
      } catch (err) {
        setSaveStatus('Save failed');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [emailData]);

  // Global Editor Keyboard Shortcuts Engine
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside text inputs, textareas, or contentEditable elements
      const tag = e.target.tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (!isInput && selectedId) {
          e.preventDefault();
          handleDuplicateSelected();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isInput && selectedId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        setSelectedId(null);
        setSelectedType('body');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedId, emailData]);

  // Undo Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setEmailData(history[prevIndex]);
      showToast('Undo performed');
    }
  };

  // Redo Action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setEmailData(history[nextIndex]);
      showToast('Redo performed');
    }
  };

  // Duplicate Selected Object
  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    if (selectedType === 'section') {
      handleDuplicateBlock(selectedId);
    } else if (selectedType === 'component') {
      // Find component and duplicate inside column
      setEmailData(prev => {
        let dupCmp = null;
        prev.sections.forEach(sec => {
          sec.rows.forEach(row => {
            row.columns.forEach(col => {
              const found = col.components.find(c => c.id === selectedId);
              if (found) dupCmp = found;
            });
          });
        });

        if (!dupCmp) return prev;

        const newCmp = { ...dupCmp, id: `cmp-${Date.now()}` };

        const nextSecs = prev.sections.map(sec => ({
          ...sec,
          rows: sec.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              const idx = col.components.findIndex(c => c.id === selectedId);
              if (idx === -1) return col;
              const nextCmps = [...col.components];
              nextCmps.splice(idx + 1, 0, newCmp);
              return { ...col, components: nextCmps };
            })
          }))
        }));
        return { ...prev, sections: nextSecs };
      });
      showToast('Component duplicated!');
    }
  };

  // Delete Selected Object
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    handleDeleteBlock(selectedId);
  };

  // Drag Component onto Canvas
  const handleDragStartComponent = (e, cmpType) => {
    e.dataTransfer.setData('sendaat_cmp_type', cmpType);
  };

  // Insert Component Action
  const handleInsertComponentDirect = (cmpType) => {
    const newCmp = createDefaultComponent(cmpType);
    setEmailData(prev => {
      let targetSec = prev.sections[prev.sections.length - 1];
      if (!targetSec) {
        targetSec = {
          id: `sec-${Date.now()}`,
          bg: '#FFFFFF',
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 24,
          paddingRight: 24,
          rows: [{ id: `r-1`, columns: [{ id: `c-1`, width: '100%', components: [] }] }]
        };
        return { ...prev, sections: [targetSec] };
      }

      const nextSecs = prev.sections.map(sec => {
        if (sec.id !== targetSec.id) return sec;
        return {
          ...sec,
          rows: sec.rows.map(row => ({
            ...row,
            columns: row.columns.map((col, cIdx) => {
              if (cIdx !== 0) return col;
              return { ...col, components: [...col.components, newCmp] };
            })
          }))
        };
      });

      return { ...prev, sections: nextSecs };
    });

    setSelectedId(newCmp.id);
    setSelectedType('component');
    showToast(`Added ${cmpType} block to canvas!`);
  };

  // Drop Component Action
  const handleDropComponent = (cmpType, targetSecId, targetColId) => {
    const newCmp = createDefaultComponent(cmpType);

    setEmailData(prev => {
      const nextSecs = prev.sections.map(sec => {
        if (sec.id !== targetSecId) return sec;
        return {
          ...sec,
          rows: sec.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (targetColId && col.id !== targetColId) return col;
              return {
                ...col,
                components: [...col.components, newCmp]
              };
            })
          }))
        };
      });
      return { ...prev, sections: nextSecs };
    });

    setSelectedId(newCmp.id);
    setSelectedType('component');
    showToast(`Inserted ${cmpType} block!`);
  };

  // Select Blank Canvas
  const handleSelectBlank = () => {
    const blankModel = {
      id: 'blank-email',
      name: 'Blank Canvas Email',
      body: { bg: '#FFFFFF', width: 640, fontFamily: 'Inter, sans-serif' },
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
    const loadedData = template.data || template;
    setEmailData(loadedData);
    setSelectedId(null);
    setSelectedType('body');
    showToast(`Loaded ${template.name || 'Email Template'}!`);
  };

  // AI Generation Handler
  const handleGenerateAi = (prompt) => {
    const aiSec = {
      id: `sec-ai-${Date.now()}`,
      bg: '#09090B',
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 32,
      paddingRight: 32,
      rows: [
        {
          id: `r-ai-1`,
          columns: [
            {
              id: `c-ai-1`,
              width: '100%',
              components: [
                { id: `cmp-ai-badge`, type: 'badge', text: 'AI GENERATED LAYOUT', bg: '#000000', color: '#FFFFFF', border: '#27272A', align: 'center' },
                { id: `cmp-ai-h1`, type: 'heading', text: `Exclusive Opportunity: ${prompt.slice(0, 30)}...`, color: '#FFFFFF', size: 26, weight: '800', align: 'center' },
                { id: `cmp-ai-p`, type: 'text', content: `Hi {{first_name}},\n\nBased on your profile, we are pleased to present this update regarding ${prompt}. Click below to get started immediately.`, color: '#A1A1AA', size: 15, align: 'center' },
                { id: `cmp-ai-btn`, type: 'button', text: 'Explore Now →', url: 'https://sendaat.io', bg: '#FFFFFF', color: '#000000', borderRadius: 9999, align: 'center' }
              ]
            }
          ]
        }
      ]
    };

    setEmailData(prev => ({ ...prev, sections: [...(prev.sections || []), aiSec] }));
    showToast('AI layout section generated & added to canvas!');
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
    showToast('Section duplicated!');
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
    showToast('Element deleted');
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

  // Real-Time Export Actions
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

  // Real-Time Save Custom Template
  const handleSaveAsTemplate = () => {
    const templateName = prompt('Enter a name for your custom email template:', projectName || 'My Custom Email Template');
    if (!templateName || !templateName.trim()) return;

    const newTmpl = {
      id: `custom-tmpl-${Date.now()}`,
      name: templateName.trim(),
      savedAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(emailData))
    };

    const updated = [newTmpl, ...mySavedTemplates];
    setMySavedTemplates(updated);
    localStorage.setItem('sendaat_my_saved_templates', JSON.stringify(updated));
    syncEngine.pushState({ mySavedTemplates: updated });
    showToast(`Template "${templateName.trim()}" saved to "Saved" tab!`);
  };

  const handleDeleteSavedTemplate = (id) => {
    const updated = mySavedTemplates.filter((st, idx) => (st.id || idx) !== id);
    setMySavedTemplates(updated);
    localStorage.setItem('sendaat_my_saved_templates', JSON.stringify(updated));
    syncEngine.pushState({ mySavedTemplates: updated });
    showToast('Template deleted');
  };

  const handleRenameSavedTemplate = (id, newName) => {
    if (!newName.trim()) return;
    const updated = mySavedTemplates.map((st, idx) => {
      if ((st.id || idx) === id) return { ...st, name: newName.trim() };
      return st;
    });
    setMySavedTemplates(updated);
    localStorage.setItem('sendaat_my_saved_templates', JSON.stringify(updated));
    syncEngine.pushState({ mySavedTemplates: updated });
    showToast('Template renamed');
  };

  const handleDuplicateSavedTemplate = (id) => {
    const found = mySavedTemplates.find((st, idx) => (st.id || idx) === id);
    if (!found) return;
    const dup = {
      ...found,
      id: `custom-tmpl-${Date.now()}`,
      name: `${found.name} (Copy)`,
      savedAt: new Date().toISOString()
    };
    const updated = [dup, ...mySavedTemplates];
    setMySavedTemplates(updated);
    localStorage.setItem('sendaat_my_saved_templates', JSON.stringify(updated));
    syncEngine.pushState({ mySavedTemplates: updated });
    showToast('Template duplicated');
  };

  // Send Test Email Action
  const handleSendTestSubmit = async (e) => {
    e.preventDefault();
    setTestSendError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testRecipientEmail.trim())) {
      setTestSendError('Please enter a valid recipient email address.');
      return;
    }

    setIsSendingTest(true);
    const compiledHtml = exportToHtml(emailData);

    try {
      if (onSendSingleTest) {
        await onSendSingleTest(testRecipientEmail.trim(), compiledHtml);
      }
      setIsSendingTest(false);
      setTestSentSuccess(true);
      showToast(`Test Email successfully dispatched to ${testRecipientEmail.trim()}!`);
      setTimeout(() => {
        setTestSentSuccess(false);
        setIsSendTestOpen(false);
      }, 1500);
    } catch (err) {
      setIsSendingTest(false);
      setTestSendError(err.message || 'Failed to dispatch test email. Check SMTP settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050505] text-white flex flex-col h-screen w-screen overflow-hidden font-sans">
      
      {/* Top Region: Toolbar */}
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
          if (!emailData?.sections || emailData.sections.length === 0) {
            alert('Cannot publish an empty email layout. Add at least one section or component.');
            return;
          }
          const compiledHtml = exportToHtml(emailData);
          if (setCampaignConfig) {
            setCampaignConfig(prev => ({
              ...prev,
              htmlContent: compiledHtml
            }));
          }
          showToast('Email layout published to active campaign queue!');
          if (onStartQueue) onStartQueue();
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onCloseStudio={onCloseStudio}
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
          onInsertComponent={handleInsertComponentDirect}
          onSelectTemplate={handleSelectTemplate}
          mySavedTemplates={mySavedTemplates}
          onDeleteSavedTemplate={handleDeleteSavedTemplate}
          onRenameSavedTemplate={handleRenameSavedTemplate}
          onDuplicateSavedTemplate={handleDuplicateSavedTemplate}
          onApplyBrandAsset={(type, val) => {
            if (type === 'bg-color') {
              setEmailData(prev => ({ ...prev, body: { ...prev.body, bg: val } }));
              showToast(`Applied brand background color ${val}`);
            } else if (type === 'image-url') {
              handleInsertComponentDirect('image');
            } else if (type === 'footer-text') {
              handleInsertComponentDirect('footer');
            }
          }}
          onGenerateAiSection={handleGenerateAi}
        />

        {/* Floating Icon Handle to Expand Left Sidebar when Collapsed */}
        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 bg-[#09090B] border border-zinc-700 text-white p-2.5 rounded-xl shadow-2xl transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Expand Components Library"
          >
            <PanelLeftOpen className="w-4 h-4 text-white" />
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
            className="absolute top-4 right-4 z-40 bg-[#09090B] border border-zinc-700 text-white p-2.5 rounded-xl shadow-2xl transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Expand Properties Inspector"
          >
            <PanelRightOpen className="w-4 h-4 text-white" />
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
        <div className="fixed bottom-6 right-6 z-[999999] bg-[#121212] border border-zinc-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Send Real Test Email</h3>
              <button onClick={() => setIsSendTestOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-normal">
              Send an actual test email compiled from your visual design directly to your inbox via configured SMTP relay.
            </p>

            {testSendError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{testSendError}</span>
              </div>
            )}

            <form onSubmit={handleSendTestSubmit} className="space-y-4 font-sans">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSendTestOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSendingTest ? (
                    <span>Dispatching...</span>
                  ) : testSentSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-black" /> Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-black" /> Dispatch Test Email
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
    case 'paragraph':
    case 'rich_text':
      return { id, type: 'text', content: 'New text paragraph block. Double-click on canvas to edit content directly.', size: 16, color: '#334155', align: 'left' };
    case 'button':
      return { id, type: 'button', text: 'Click Here Now', url: 'https://sendaat.io', bg: '#007C89', color: '#FFFFFF', borderRadius: 9999, paddingV: 14, paddingH: 32, align: 'center' };
    case 'image':
      return { id, type: 'image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', alt: 'Sample Image', width: '100%', borderRadius: 8, align: 'center' };
    case 'hero':
      return { id, type: 'hero', title: 'Special Campaign Hero Header', subtitle: 'Engage your subscribers with a bold headline and primary CTA.', buttonText: 'Get Started Now →', buttonUrl: 'https://sendaat.io', bg: '#09090B', color: '#FFFFFF', align: 'center' };
    case 'badge':
      return { id, type: 'badge', text: 'FEATURED TAG', bg: '#000000', color: '#FFFFFF', border: '#27272A', align: 'left' };
    case 'quote':
      return { id, type: 'quote', text: 'Quality is not an act, it is a habit.', author: 'Aristotle', bg: '#F8FAFC', border: '#3B82F6', color: '#334155' };
    case 'list':
      return { id, type: 'list', items: ['First key takeaway point', 'Second key feature benefit', 'Third action item'], size: 15, color: '#334155', align: 'left' };
    case 'divider':
      return { id, type: 'divider', style: 'solid', color: '#E2E8F0' };
    case 'spacer':
      return { id, type: 'spacer', height: 24 };
    case 'callout':
      return { id, type: 'callout', title: 'Important Highlight', content: 'This callout box brings essential information to light.', bg: '#F8FAFC', border: '#007C89', color: '#0F172A' };
    case 'countdown':
      return { id, type: 'countdown', label: 'LIMITED TIME PROMOTION ENDS IN:', bg: '#1E2937' };
    case 'video':
      return { id, type: 'video', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', align: 'center' };
    case 'social':
      return { id, type: 'social', platforms: ['telegram', 'twitter', 'linkedin', 'instagram', 'github'], align: 'center' };
    case 'menu':
    case 'navigation':
      return { id, type: 'navigation', links: [{ label: 'Home', url: '#' }, { label: 'Features', url: '#' }, { label: 'Pricing', url: '#' }], align: 'center' };
    case 'custom_html':
    case 'html':
      return { id, type: 'custom_html', content: '<div style="padding:12px; background:#000; color:#fff; border-radius:8px; text-align:center;">Custom HTML snippet</div>' };
    case 'footer':
      return { id, type: 'footer', text: 'Sendaat Email Studio • All rights reserved • Unsubscribe', color: '#94A3B8', size: 12, align: 'center' };
    default:
      return { id, type: 'text', content: 'Content block' };
  }
}
