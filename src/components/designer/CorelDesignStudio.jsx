import React, { useState, useEffect, useRef } from 'react';
import { 
  MousePointer2, Move, Crop, ZoomIn, ZoomOut, PenTool, Square, Circle, 
  Star, Grid, Type, Image as ImageIcon, Pipette, Paintbrush, Minus, 
  Compass, Hand, Ruler, Layers, Eye, EyeOff, Lock, Unlock, Copy, Trash2, 
  ArrowUp, ArrowDown, ChevronDown, Check, Download, Bookmark, Send, 
  Rocket, RefreshCw, Sparkles, HelpCircle, FileText, Minimize2, Maximize2, X,
  RotateCw, AlignLeft, AlignCenter, AlignRight, Columns, Table, ArrowRight, Share2, CornerDownRight, Plus, Box,
  Undo2, Redo2, ShieldCheck, Zap, MousePointerClick, Sliders, Palette, Sparkle, LayoutTemplate, FolderPlus,
  FilePlus, Wand2, ArrowDownRight, Layers2, AlignJustify, Spline, Upload, Film, Share, Globe, Mail, Link
} from 'lucide-react';
import { FONT_CATALOG } from './fonts';
import { exportToHtml } from './htmlExporter';
import { SOCIAL_PLATFORMS, UniformSocialIcon } from './socialIcons';

// COREL DRAW COLOR PALETTE SWATCHES
const PALETTE_COLORS = [
  '#000000', '#1E293B', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#007C89', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#F43F5E', '#D97706', '#059669', '#0284C7', '#4F46E5', '#C026D3'
];

// PRESET TEMPLATES
const STUDIO_TEMPLATES = [
  {
    id: 'blank',
    name: 'Start From Scratch (Blank Canvas)',
    description: 'Empty artboard ready for custom vector design.',
    objects: []
  },
  {
    id: 'hero-saas',
    name: 'SaaS Launch Email',
    description: 'Dark mode hero header with white content card and CTA.',
    objects: [
      { id: 'o-bg-1', name: 'Hero Header Container', type: 'rectangle', x: 0, y: 0, width: 640, height: 180, fill: '#0F172A', stroke: '#1E293B', strokeWidth: 0, radius: 0, opacity: 1, rotation: 0, locked: false, hidden: false },
      { id: 'o-badge-1', name: 'Category Tag Badge', type: 'badge', text: 'SKILLBRIDGE DESIGN STUDIO', x: 200, y: 32, width: 240, height: 28, fill: '#1E293B', color: '#38BDF8', stroke: '#334155', strokeWidth: 1, radius: 9999, align: 'center', rotation: 0, locked: false, hidden: false },
      { id: 'o-text-1', name: 'Main Campaign Heading', type: 'text', text: 'Precision Email Design Engine', x: 40, y: 76, width: 560, height: 50, fontSize: 26, fontWeight: '800', color: '#FFFFFF', align: 'center', fontFamily: 'Inter, sans-serif', rotation: 0, locked: false, hidden: false },
      { id: 'o-card-1', name: 'White Content Card', type: 'rectangle', x: 32, y: 196, width: 576, height: 420, fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 1, radius: 16, opacity: 1, rotation: 0, locked: false, hidden: false },
      { id: 'o-body-1', name: 'Body Paragraph Text', type: 'text', text: 'Hi {{first_name}},\n\nWelcome to SkillBridge Mail Design Studio. Everything on this canvas is treated as a modern vector object that automatically compiles into responsive HTML emails. Double-click any text object to edit directly on canvas.', x: 64, y: 228, width: 512, height: 100, fontSize: 15, fontWeight: '400', color: '#334155', align: 'left', fontFamily: 'Inter, sans-serif', rotation: 0, locked: false, hidden: false },
      { id: 'o-btn-1', name: 'Interactive CTA Button', type: 'button', text: 'Apply Now via Telegram', url: 'https://t.me/+AB0OloYpE7I1NTVk', x: 170, y: 356, width: 300, height: 48, fill: '#007C89', color: '#FFFFFF', radius: 12, fontSize: 15, fontWeight: '700', align: 'center', rotation: 0, locked: false, hidden: false },
      {
        id: 'o-social-1',
        name: 'Social Media Row',
        type: 'social',
        platforms: ['telegram', 'twitter', 'linkedin', 'instagram', 'github'],
        urls: {
          telegram: 'https://t.me/+AB0OloYpE7I1NTVk',
          twitter: 'https://x.com/...',
          linkedin: 'https://linkedin.com/...',
          instagram: 'https://instagram.com/...',
          github: 'https://github.com/...'
        },
        x: 180,
        y: 440,
        width: 280,
        height: 44,
        align: 'center',
        rotation: 0,
        locked: false,
        hidden: false
      }
    ]
  }
];

export default function CorelDesignStudio({
  campaignConfig = {},
  setCampaignConfig,
  recipients = [],
  onSendSingleTest,
  onCloseStudio,
  editorMode,
  setEditorMode
}) {
  // 1. Studio Workspace State
  const [projectName, setProjectName] = useState('Corel Email Vector Design #1');
  const [activeTool, setActiveTool] = useState('pick'); // 18 CorelDRAW Tools
  
  // Rulers & Grid Toggle State
  const [showRulers, setShowRulers] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Side Panels & Modals State
  const [showObjectManager, setShowObjectManager] = useState(true);
  const [showPropertyInspector, setShowPropertyInspector] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showTestMailModal, setShowTestMailModal] = useState(false);

  // Test Email Modal Form State
  const [testEmailRecipient, setTestEmailRecipient] = useState(recipients[0]?.email || 'test@skillbridge.io');
  const [testEmailSubject, setTestEmailSubject] = useState(campaignConfig.subject || 'CorelDRAW Email Studio Test Render');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Canvas Artboard Settings
  const [canvasBody, setCanvasBody] = useState({
    bg: '#F8FAFC',
    width: 640,
    fontFamily: 'Inter, sans-serif'
  });

  // Active Colors
  const [activeFillColor, setActiveFillColor] = useState('#007C89');
  const [activeStrokeColor, setActiveStrokeColor] = useState('#0284C7');

  // Canvas Objects Stack
  const [objects, setObjects] = useState(STUDIO_TEMPLATES[1].objects);
  const [selectedIds, setSelectedIds] = useState(['o-text-1']);
  const [editingTextObjId, setEditingTextObjId] = useState(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState([objects]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Mouse Drag Engine State
  const [dragState, setDragState] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const artboardRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedObjects = objects.filter(o => selectedIds.includes(o.id));
  const primarySelected = selectedObjects[0] || null;

  // History Helper
  const pushHistory = (nextObjs) => {
    const nextHist = history.slice(0, historyIdx + 1);
    nextHist.push(nextObjs);
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setObjects(nextObjs);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setObjects(history[historyIdx - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setObjects(history[historyIdx + 1]);
    }
  };

  // BLANK CANVAS / TEMPLATES
  const handleStartFromScratch = () => {
    pushHistory([]);
    setSelectedIds([]);
    setEditingTextObjId(null);
    setActiveTool('pick');
    showToast('Created Blank Canvas! Select a tool to start drawing.');
  };

  const handleLoadTemplate = (tpl) => {
    pushHistory(tpl.objects);
    setSelectedIds([]);
    setEditingTextObjId(null);
    setActiveTool('pick');
    showToast(`Loaded ${tpl.name}!`);
  };

  // OBJECT ACTION HANDLERS
  const updateObject = (id, key, val) => {
    const nextObjs = objects.map(o => {
      if (o.id !== id) return o;
      return { ...o, [key]: val };
    });
    pushHistory(nextObjs);
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newCreated = [];
    const nextObjs = [...objects];

    selectedObjects.forEach(o => {
      const dup = {
        ...o,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${o.name} (Copy)`,
        x: o.x + 20,
        y: o.y + 20
      };
      nextObjs.push(dup);
      newCreated.push(dup.id);
    });

    pushHistory(nextObjs);
    setSelectedIds(newCreated);
    showToast('Duplicated selected object(s)!');
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const nextObjs = objects.filter(o => !selectedIds.includes(o.id));
    pushHistory(nextObjs);
    setSelectedIds([]);
    setEditingTextObjId(null);
    showToast('Deleted object(s)');
  };

  const handleGroupSelected = () => {
    if (selectedIds.length < 2) {
      showToast('Select 2 or more objects to group!');
      return;
    }
    const groupId = `grp-${Date.now()}`;
    const nextObjs = objects.map(o => {
      if (selectedIds.includes(o.id)) {
        return { ...o, groupId, name: `Group (${o.name})` };
      }
      return o;
    });
    pushHistory(nextObjs);
    showToast('Grouped selected objects!');
  };

  const handleLayerOrder = (direction) => {
    if (!primarySelected) return;
    const idx = objects.findIndex(o => o.id === primarySelected.id);
    if (idx === -1) return;

    const nextObjs = [...objects];
    const item = nextObjs.splice(idx, 1)[0];

    if (direction === 'front') nextObjs.push(item);
    else if (direction === 'back') nextObjs.unshift(item);
    else if (direction === 'up') nextObjs.splice(Math.min(nextObjs.length, idx + 1), 0, item);
    else if (direction === 'down') nextObjs.splice(Math.max(0, idx - 1), 0, item);

    pushHistory(nextObjs);
  };

  // MEDIA UPLOADER HANDLER (Images, GIFs, SVGs)
  const handleMediaFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const id = `obj-media-${Date.now()}`;
        const newMediaObj = {
          id,
          name: file.name.replace(/\.[^/.]+$/, "") || 'Media Asset',
          type: 'image',
          url: event.target.result,
          x: 120,
          y: 120,
          width: 360,
          height: 220,
          radius: 12,
          opacity: 1,
          rotation: 0,
          locked: false,
          hidden: false
        };
        pushHistory([...objects, newMediaObj]);
        setSelectedIds([id]);
        setShowMediaModal(false);
        showToast(`Uploaded & inserted ${file.name}!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // ADD SOCIAL MEDIA ICONS OBJECT
  const handleAddSocialIconsObject = () => {
    const id = `obj-social-${Date.now()}`;
    const newSocialObj = {
      id,
      name: 'Social Media Icons',
      type: 'social',
      platforms: ['telegram', 'twitter', 'linkedin', 'instagram', 'github'],
      urls: {
        telegram: 'https://t.me/+AB0OloYpE7I1NTVk',
        twitter: 'https://x.com/...',
        linkedin: 'https://linkedin.com/...',
        instagram: 'https://instagram.com/...',
        github: 'https://github.com/...'
      },
      x: 180,
      y: 400,
      width: 280,
      height: 44,
      align: 'center',
      rotation: 0,
      locked: false,
      hidden: false
    };
    pushHistory([...objects, newSocialObj]);
    setSelectedIds([id]);
    showToast('Added Social Media Icons row!');
  };

  // REAL-TIME CANVAS MOUSE DRAG ENGINE
  const handleCanvasMouseDown = (e, obj, mode = 'move', handle = null) => {
    e.stopPropagation();
    if (obj.locked) return;

    setSelectedIds([obj.id]);

    const scale = zoomLevel / 100;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    if (mode === 'rotate') {
      const rect = artboardRef.current.getBoundingClientRect();
      const centerX = rect.left + (obj.x + obj.width / 2) * scale;
      const centerY = rect.top + (obj.y + obj.height / 2) * scale;
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

      setDragState({
        mode: 'rotate',
        objId: obj.id,
        centerX,
        centerY,
        startAngle,
        origRotation: obj.rotation || 0
      });
    } else {
      setDragState({
        mode,
        objId: obj.id,
        handle,
        startMouseX,
        startMouseY,
        initialObj: { ...obj }
      });
    }
  };

  const handleGlobalMouseMove = (e) => {
    if (!dragState) return;

    const scale = zoomLevel / 100;
    const dx = (e.clientX - dragState.startMouseX) / scale;
    const dy = (e.clientY - dragState.startMouseY) / scale;

    const targetObj = objects.find(o => o.id === dragState.objId);
    if (!targetObj) return;

    if (dragState.mode === 'move') {
      const nextX = Math.round(dragState.initialObj.x + dx);
      const nextY = Math.round(dragState.initialObj.y + dy);
      setObjects(prev => prev.map(o => o.id === targetObj.id ? { ...o, x: nextX, y: nextY } : o));
    } else if (dragState.mode === 'resize') {
      const init = dragState.initialObj;
      let nextW = init.width;
      let nextH = init.height;
      let nextX = init.x;
      let nextY = init.y;

      if (dragState.handle.includes('e')) nextW = Math.max(20, Math.round(init.width + dx));
      if (dragState.handle.includes('s')) nextH = Math.max(20, Math.round(init.height + dy));
      if (dragState.handle.includes('w')) {
        const wDelta = Math.min(dx, init.width - 20);
        nextW = Math.round(init.width - wDelta);
        nextX = Math.round(init.x + wDelta);
      }
      if (dragState.handle.includes('n')) {
        const hDelta = Math.min(dy, init.height - 20);
        nextH = Math.round(init.height - hDelta);
        nextY = Math.round(init.y + hDelta);
      }

      setObjects(prev => prev.map(o => o.id === targetObj.id ? { ...o, width: nextW, height: nextH, x: nextX, y: nextY } : o));
    } else if (dragState.mode === 'rotate') {
      const currentAngle = Math.atan2(e.clientY - dragState.centerY, e.clientX - dragState.centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - dragState.startAngle;
      const nextRot = Math.round((dragState.origRotation + angleDiff) % 360);
      setObjects(prev => prev.map(o => o.id === targetObj.id ? { ...o, rotation: nextRot } : o));
    }
  };

  const handleGlobalMouseUp = () => {
    if (dragState) {
      pushHistory(objects);
      setDragState(null);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, objects, zoomLevel]);

  // DRAW NEW OBJECT ON CANVAS CLICK
  const handleArtboardClick = (e) => {
    if (dragState || activeTool === 'pick') return;
    if (!artboardRef.current) return;

    const rect = artboardRef.current.getBoundingClientRect();
    const scale = zoomLevel / 100;
    const clickX = Math.round((e.clientX - rect.left) / scale);
    const clickY = Math.round((e.clientY - rect.top) / scale);

    if (activeTool === 'image') {
      setShowMediaModal(true);
      setActiveTool('pick');
      return;
    }

    const id = `obj-${Date.now()}`;
    let newObj = null;

    switch (activeTool) {
      case 'rectangle':
        newObj = { id, name: 'Rectangle Shape', type: 'rectangle', x: clickX, y: clickY, width: 200, height: 120, fill: activeFillColor, stroke: activeStrokeColor, strokeWidth: 1, radius: 8, opacity: 1, rotation: 0, locked: false, hidden: false };
        break;
      case 'ellipse':
        newObj = { id, name: 'Ellipse Vector', type: 'ellipse', x: clickX, y: clickY, width: 140, height: 140, fill: activeFillColor, stroke: activeStrokeColor, strokeWidth: 1, radius: 9999, opacity: 1, rotation: 0, locked: false, hidden: false };
        break;
      case 'star':
        newObj = { id, name: 'Star Badge', type: 'star', x: clickX, y: clickY, width: 120, height: 120, fill: '#EC4899', stroke: '#DB2777', strokeWidth: 1, rotation: 0, locked: false, hidden: false };
        break;
      case 'text':
        newObj = { id, name: 'Artistic Text', type: 'text', text: 'Double-click to edit text', x: clickX, y: clickY, width: 320, height: 40, fontSize: 20, fontWeight: '700', color: '#0F172A', align: 'left', fontFamily: 'Inter, sans-serif', rotation: 0, locked: false, hidden: false };
        break;
      case 'button':
        newObj = { id, name: 'CTA Button', type: 'button', text: 'Click Here Now', url: 'https://t.me/+AB0OloYpE7I1NTVk', x: clickX, y: clickY, width: 240, height: 48, fill: '#007C89', color: '#FFFFFF', radius: 10, fontSize: 15, fontWeight: '700', align: 'center', rotation: 0, locked: false, hidden: false };
        break;
      default:
        newObj = { id, name: 'Rectangle Object', type: 'rectangle', x: clickX, y: clickY, width: 160, height: 100, fill: activeFillColor, stroke: activeStrokeColor, strokeWidth: 1, radius: 8, rotation: 0, locked: false, hidden: false };
    }

    if (newObj) {
      pushHistory([...objects, newObj]);
      setSelectedIds([newObj.id]);
      setActiveTool('pick');
      showToast(`Created ${newObj.name} on Canvas!`);
    }
  };

  // SEND REAL INBOX TEST MAIL
  const handleSendRealInboxTest = async () => {
    setIsSendingTest(true);
    const compiledHtml = exportToHtml({ body: canvasBody, sections: [{ id: 's1', bg: canvasBody.bg, rows: [{ id: 'r1', columns: [{ id: 'c1', width: '100%', components: [] }] }] }] });
    
    if (setCampaignConfig) {
      setCampaignConfig(prev => ({
        ...prev,
        subject: testEmailSubject,
        htmlContent: compiledHtml
      }));
    }

    if (onSendSingleTest) {
      await onSendSingleTest();
    }
    setIsSendingTest(false);
    setShowTestMailModal(false);
    showToast(`Test Email sent to ${testEmailRecipient}!`);
  };

  const handleExportCorelEmail = (type) => {
    const compiledHtml = exportToHtml({ body: canvasBody, sections: [{ id: 's1', bg: canvasBody.bg, rows: [{ id: 'r1', columns: [{ id: 'c1', width: '100%', components: [] }] }] }] });

    if (type === 'download') {
      const blob = new Blob([compiledHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.html`;
      a.click();
      showToast('CorelDRAW Email Design downloaded!');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(compiledHtml);
      showToast('Compiled Email HTML copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-slate-100 flex flex-col h-screen w-screen overflow-hidden font-sans select-none antialiased">
      
      {/* 1. TOP MENUBAR */}
      <div className="h-10 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-3 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 font-black text-teal-400 mr-2 px-2 py-1 rounded-lg bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 text-xs shadow-lg shadow-teal-500/5">
            <Zap className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="tracking-wide">DESIGN STUDIO</span>
            <span className="text-[9px] px-1 py-0.2 bg-teal-500/20 text-teal-300 rounded font-mono">BETA</span>
          </div>

          {[
            { id: 'file', label: 'File' },
            { id: 'edit', label: 'Edit' },
            { id: 'view', label: 'View' },
            { id: 'arrange', label: 'Arrange' },
            { id: 'help', label: 'Help' }
          ].map(menu => (
            <div key={menu.id} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${openMenu === menu.id ? 'bg-slate-800 text-teal-400 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
              >
                {menu.label}
              </button>

              {openMenu === menu.id && (
                <div className="absolute top-full left-0 mt-1 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl py-2 w-64 z-50 animate-in fade-in duration-150">
                  {menu.id === 'file' && (
                    <>
                      <button onClick={() => { handleStartFromScratch(); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-teal-500/10 hover:text-teal-300 flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/60">
                        <span className="flex items-center gap-2"><FilePlus className="w-4 h-4 text-teal-400" /> Start From Scratch (Blank)</span>
                      </button>
                      <button onClick={() => { handleExportCorelEmail('download'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Export HTML File</span> <Download className="w-3.5 h-3.5 text-teal-400" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartFromScratch}
            className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
          >
            <FilePlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Blank Canvas</span>
          </button>

          {setEditorMode && (
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-black">
              <button onClick={() => setEditorMode('visual')} className={`px-2.5 py-1 rounded-md ${editorMode === 'visual' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>VISUAL DROP</button>
              <button onClick={() => setEditorMode('corel')} className={`px-2.5 py-1 rounded-md ${editorMode === 'corel' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>DESIGN STUDIO (BETA)</button>
            </div>
          )}

          <button onClick={onCloseStudio} className="p-1 text-slate-400 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SUB-TOOLBAR RIBBON WITH TEST MAIL BUTTON */}
      <div className="h-11 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-3 flex items-center justify-between text-xs z-40 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMediaModal(true)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-teal-400" /> Insert Media (Images/GIFs/SVGs)
          </button>

          <button onClick={handleAddSocialIconsObject} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Add Social Links
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button onClick={handleUndo} disabled={historyIdx === 0} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"><Undo2 className="w-3.5 h-3.5" /></button>
          <button onClick={handleRedo} disabled={historyIdx === history.length - 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"><Redo2 className="w-3.5 h-3.5" /></button>
          
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button onClick={handleGroupSelected} className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1 text-xs font-semibold"><Box className="w-3.5 h-3.5 text-teal-400" /> Group</button>
          <button onClick={handleDuplicateSelected} className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1 text-xs font-semibold"><Copy className="w-3.5 h-3.5 text-indigo-400" /> Duplicate</button>
          <button onClick={handleDeleteSelected} className="px-2 py-1 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1 text-xs font-semibold"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
        </div>

        {/* TEST MAIL & PUBLISH ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTestMailModal(true)}
            className="px-3.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" /> Send Inbox Test Email
          </button>

          <button onClick={() => handleExportCorelEmail('download')} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5 text-teal-400" /> Export HTML</button>
          <button onClick={() => showToast('Design Published!')} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs rounded-lg shadow-lg flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> Publish</button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT TOOLBOX */}
        <div className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-2 gap-1 z-40 overflow-y-auto scrollbar-none flex-shrink-0">
          {[
            { id: 'pick', label: 'Pick / Move Tool', key: 'V', icon: MousePointer2 },
            { id: 'shape', label: 'Shape Node Tool', key: 'A', icon: Move },
            { id: 'crop', label: 'Crop Tool', key: 'C', icon: Crop },
            { id: 'zoom', label: 'Zoom Tool', key: 'Z', icon: ZoomIn },
            { id: 'freehand', label: 'Freehand Line', key: 'P', icon: PenTool },
            { id: 'bezier', label: 'Bezier Pen', key: 'B', icon: Spline },
            { id: 'rectangle', label: 'Rectangle Shape', key: 'R', icon: Square },
            { id: 'ellipse', label: 'Ellipse Vector', key: 'O', icon: Circle },
            { id: 'star', label: 'Star Badge', key: 'S', icon: Star },
            { id: 'table', label: 'Table Grid', key: 'G', icon: Grid },
            { id: 'text', label: 'Artistic Text Tool', key: 'T', icon: Type },
            { id: 'image', label: 'Image / Media Tool', key: 'I', icon: ImageIcon },
            { id: 'eyedropper', label: 'Color Eyedropper', key: 'E', icon: Pipette },
            { id: 'fill', label: 'Paint Bucket Fill', key: 'F', icon: Paintbrush },
            { id: 'outline', label: 'Outline Stroke', key: 'K', icon: Minus },
            { id: 'connector', label: 'Callout Arrow', key: 'N', icon: ArrowRight },
            { id: 'hand', label: 'Hand Viewport Pan', key: 'H', icon: Hand }
          ].map(tool => {
            const IconCmp = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.id === 'image') setShowMediaModal(true);
                  else setActiveTool(tool.id);
                }}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/30 scale-105 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'}`}
              >
                <IconCmp className="w-4 h-4" />
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
                  <span>{tool.label}</span>
                  <span className="bg-slate-800 text-teal-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">{tool.key}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER ARTBOARD CANVAS */}
        <div className="flex-1 bg-slate-950 overflow-auto relative flex flex-col select-none">
          {showRulers && (
            <div className="h-6 bg-slate-950 border-b border-slate-800 flex items-center pl-6 text-[9px] font-mono text-slate-500 sticky top-0 z-30 select-none overflow-hidden">
              <div className="flex" style={{ width: `${canvasBody.width}px` }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-slate-800 px-1">{i * 100}px</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 relative flex items-center justify-center p-12 min-h-[800px]">
            <div
              ref={artboardRef}
              onClick={handleArtboardClick}
              className="bg-white shadow-2xl relative transition-all rounded-2xl overflow-hidden border border-slate-800"
              style={{
                width: `${canvasBody.width}px`,
                minHeight: '720px',
                backgroundColor: canvasBody.bg,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                backgroundImage: showGrid ? 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)' : 'none',
                backgroundSize: '20px 20px'
              }}
            >
              {/* OBJECTS RENDERER STACK */}
              {objects.filter(o => !o.hidden).map(obj => {
                const isSelected = selectedIds.includes(obj.id);
                const isEditingText = editingTextObjId === obj.id;

                return (
                  <div
                    key={obj.id}
                    onMouseDown={(e) => handleCanvasMouseDown(e, obj, 'move')}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (obj.type === 'text') setEditingTextObjId(obj.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${obj.x}px`,
                      top: `${obj.y}px`,
                      width: `${obj.width}px`,
                      height: `${obj.height}px`,
                      transform: `rotate(${obj.rotation || 0}deg)`,
                      opacity: obj.opacity ?? 1,
                      zIndex: objects.findIndex(o => o.id === obj.id) + 1
                    }}
                    className={`group/obj cursor-move transition-all ${isSelected ? 'outline outline-2 outline-teal-500 outline-offset-2 z-40' : 'hover:outline hover:outline-1 hover:outline-teal-400/60'}`}
                  >
                    {isSelected && (
                      <>
                        <div
                          onMouseDown={(e) => handleCanvasMouseDown(e, obj, 'rotate')}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-teal-500 rounded-full border-2 border-white cursor-grab shadow-lg flex items-center justify-center text-[10px] font-bold text-slate-950 hover:scale-125 transition-transform"
                          title="Drag to Rotate Object 360°"
                        >
                          ↻
                        </div>

                        {[
                          { pos: 'nw', class: '-top-1.5 -left-1.5 cursor-nwse-resize' },
                          { pos: 'ne', class: '-top-1.5 -right-1.5 cursor-nesw-resize' },
                          { pos: 'se', class: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
                          { pos: 'sw', class: '-bottom-1.5 -left-1.5 cursor-nesw-resize' }
                        ].map(h => (
                          <div
                            key={h.pos}
                            onMouseDown={(e) => handleCanvasMouseDown(e, obj, 'resize', h.pos)}
                            className={`absolute w-3 h-3 bg-white border-2 border-teal-500 rounded-sm shadow-md ${h.class}`}
                          />
                        ))}
                      </>
                    )}

                    {/* OBJECT TYPES */}
                    {obj.type === 'rectangle' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: obj.fill, borderColor: obj.stroke, borderWidth: `${obj.strokeWidth}px`, borderStyle: 'solid', borderRadius: `${obj.radius || 0}px` }} />
                    )}

                    {obj.type === 'ellipse' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: obj.fill, borderColor: obj.stroke, borderWidth: `${obj.strokeWidth}px`, borderStyle: 'solid', borderRadius: '9999px' }} />
                    )}

                    {obj.type === 'star' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: obj.fill, borderColor: obj.stroke, borderWidth: `${obj.strokeWidth}px`, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                    )}

                    {obj.type === 'text' && (
                      isEditingText ? (
                        <textarea
                          rows={2}
                          value={obj.text}
                          onChange={(e) => updateObject(obj.id, 'text', e.target.value)}
                          onBlur={() => setEditingTextObjId(null)}
                          autoFocus
                          className="w-full h-full bg-teal-50 border-2 border-teal-500 p-1 text-slate-900 font-bold focus:outline-none rounded"
                          style={{ fontSize: `${obj.fontSize || 16}px`, fontFamily: obj.fontFamily || 'sans-serif' }}
                        />
                      ) : (
                        <div style={{ fontSize: `${obj.fontSize || 16}px`, fontWeight: obj.fontWeight || '400', color: obj.color || '#0F172A', textAlign: obj.align || 'left', fontFamily: obj.fontFamily || 'sans-serif', lineHeight: '1.4', whiteSpace: 'pre-wrap' }} className="w-full h-full p-1">
                          {obj.text}
                        </div>
                      )
                    )}

                    {obj.type === 'button' && (
                      <div style={{ backgroundColor: obj.fill || '#007C89', color: obj.color || '#FFFFFF', borderRadius: `${obj.radius || 8}px`, fontSize: `${obj.fontSize || 15}px`, fontWeight: obj.fontWeight || '700', textAlign: obj.align || 'center' }} className="w-full h-full flex items-center justify-center font-bold shadow-md cursor-pointer">
                        {obj.text}
                      </div>
                    )}

                    {obj.type === 'badge' && (
                      <div style={{ backgroundColor: obj.fill || '#1E293B', color: obj.color || '#38BDF8', borderColor: obj.stroke || '#334155', borderWidth: `${obj.strokeWidth || 1}px`, borderRadius: '9999px' }} className="w-full h-full flex items-center justify-center font-extrabold text-xs uppercase tracking-wider shadow-sm">
                        {obj.text}
                      </div>
                    )}

                    {obj.type === 'image' && (
                      <img src={obj.url} alt={obj.name} style={{ borderRadius: `${obj.radius || 0}px` }} className="w-full h-full object-cover shadow-sm pointer-events-none" />
                    )}

                    {obj.type === 'social' && (
                      <div className="w-full h-full flex items-center justify-center gap-2">
                        {(obj.platforms || ['telegram', 'twitter', 'linkedin', 'instagram', 'github']).map(p => (
                          <UniformSocialIcon key={p} platformId={p} size={24} style="colored" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. RIGHT SIDEBAR */}
        <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col z-40 select-none flex-shrink-0">
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> Object Manager ({objects.length})
            </span>
          </div>

          <div className="h-44 overflow-y-auto border-b border-slate-800/80 p-2 space-y-1">
            {objects.slice().reverse().map(obj => {
              const isSelected = selectedIds.includes(obj.id);
              return (
                <div key={obj.id} onClick={() => setSelectedIds([obj.id])} className={`px-3 py-1.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-teal-500/10 text-teal-300 border-teal-500/50 font-bold shadow-sm' : 'bg-slate-900/40 text-slate-300 border-slate-800/60 hover:bg-slate-900'}`}>
                  <span className="truncate max-w-[140px]">{obj.name}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-teal-400" /> Property Inspector</span>
            {primarySelected && <span className="text-teal-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{primarySelected.type}</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {primarySelected ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Object Label Name</label>
                  <input type="text" value={primarySelected.name} onChange={(e) => updateObject(primarySelected.id, 'name', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
                </div>

                {/* INDIVIDUAL SOCIAL MEDIA URL LINK INPUTS */}
                {primarySelected.type === 'social' && (
                  <div className="space-y-3 border-t border-slate-800 pt-3">
                    <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5" /> Individual Social Platform Links
                    </div>
                    {SOCIAL_PLATFORMS.map(sp => (
                      <div key={sp.id} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.color }} />
                          {sp.label} Target URL
                        </label>
                        <input
                          type="text"
                          value={(primarySelected.urls && primarySelected.urls[sp.id]) || ''}
                          onChange={(e) => {
                            const newUrls = { ...(primarySelected.urls || {}), [sp.id]: e.target.value };
                            updateObject(primarySelected.id, 'urls', newUrls);
                          }}
                          placeholder={sp.defaultUrl}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {primarySelected.text !== undefined && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Text Content</label>
                    <textarea rows={3} value={primarySelected.text} onChange={(e) => updateObject(primarySelected.id, 'text', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">Select an object on the artboard canvas to inspect properties.</div>
            )}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM COLOR PALETTE BAR */}
      <div className="h-8 bg-slate-950 border-t border-slate-800 px-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-50">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2 flex-shrink-0">Color Swatches:</span>
        {PALETTE_COLORS.map(c => (
          <button
            key={c}
            onClick={() => {
              setActiveFillColor(c);
              if (primarySelected) updateObject(primarySelected.id, 'fill', c);
            }}
            style={{ backgroundColor: c }}
            className="w-5 h-5 rounded-md border border-slate-700/80 shadow-sm flex-shrink-0 hover:scale-125 transition-transform"
          />
        ))}
      </div>

      {/* MEDIA ASSET UPLOADER MODAL (Images, GIFs, SVGs) */}
      {showMediaModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" /> Insert Media Asset (PNG, JPG, Animated GIF, SVG)
              </h4>
              <button onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Direct Local File Upload */}
            <label className="border-2 border-dashed border-teal-500/40 hover:border-teal-400 bg-teal-500/5 p-8 rounded-2xl text-center cursor-pointer block transition-colors">
              <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">Click to Upload Local File</div>
              <div className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WebP, Animated GIFs, and raw vector SVG graphics</div>
              <input
                type="file"
                accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp"
                onChange={handleMediaFileUpload}
                className="hidden"
              />
            </label>

            {/* Curated Sample Media Assets */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Or Select Curated Sample Media Asset:</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Marketing Hero', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80' },
                  { name: 'Animated Tech GIF', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZxeWoxNmQ1NXBnZnd6bjVsYXdhaWN2aXVsdXdwazVsNnZ2Y2VqMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif' },
                  { name: 'Abstract Gradient SVG', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80' }
                ].map(item => (
                  <div
                    key={item.name}
                    onClick={() => {
                      const id = `obj-media-${Date.now()}`;
                      pushHistory([...objects, { id, name: item.name, type: 'image', url: item.url, x: 120, y: 120, width: 360, height: 220, radius: 12, opacity: 1, rotation: 0, locked: false, hidden: false }]);
                      setSelectedIds([id]);
                      setShowMediaModal(false);
                      showToast(`Inserted ${item.name}!`);
                    }}
                    className="group border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-teal-500 transition-colors bg-slate-950 p-1"
                  >
                    <img src={item.url} alt={item.name} className="h-20 w-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                    <div className="text-[10px] font-bold text-slate-300 mt-1 truncate px-1 text-center">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME INBOX TEST EMAIL SENDER MODAL */}
      {showTestMailModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" /> Send Real Inbox Test Email
              </h4>
              <button onClick={() => setShowTestMailModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Recipient Target Email</label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subject Line</label>
                <input
                  type="text"
                  value={testEmailSubject}
                  onChange={(e) => setTestEmailSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleSendRealInboxTest}
              disabled={isSendingTest}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingTest ? 'Dispatching to Inbox...' : 'Send Real Inbox Test Email Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* REAL-TIME TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-[999999] bg-slate-900/95 backdrop-blur-xl border border-teal-500/60 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
