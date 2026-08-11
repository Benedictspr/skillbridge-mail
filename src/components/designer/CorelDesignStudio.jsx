import React, { useState, useEffect, useRef } from 'react';
import { 
  MousePointer2, Move, Crop, ZoomIn, ZoomOut, PenTool, Square, Circle, 
  Star, Grid, Type, Image as ImageIcon, Pipette, Paintbrush, Minus, 
  Compass, Hand, Ruler, Layers, Eye, EyeOff, Lock, Unlock, Copy, Trash2, 
  ArrowUp, ArrowDown, ChevronDown, Check, Download, Bookmark, Send, 
  Rocket, RefreshCw, Sparkles, HelpCircle, FileText, Minimize2, Maximize2, X,
  RotateCw, AlignLeft, AlignCenter, AlignRight, Columns, Table, ArrowRight, Share2, CornerDownRight, Plus, Box,
  Undo2, Redo2, ShieldCheck, Zap, MousePointerClick, Sliders, Palette, Sparkle, LayoutTemplate, FolderPlus,
  FilePlus, Wand2, ArrowDownRight, Layers2, AlignJustify, Spline, Upload, Film, Share, Globe, Mail, Link,
  AlertTriangle, CheckCircle2, Scissors, Info, FolderOpen, Save, FileCode, Monitor, Smartphone
} from 'lucide-react';
import { FONT_CATALOG } from './fonts';
import { exportToHtml } from './htmlExporter';
import { SOCIAL_PLATFORMS, UniformSocialIcon } from './socialIcons';
import { validateEmailDesign } from './validator';

// VANTABLACK MONOCHROMATIC SWATCHES
const PALETTE_COLORS = [
  '#000000', '#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6'
];

// PRESET TEMPLATES (VANTABLACK BLACK & WHITE THEME)
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
    description: 'Vantablack hero header with white content card and CTA.',
    objects: [
      { id: 'o-bg-1', name: 'Hero Header Container', type: 'rectangle', x: 0, y: 0, width: 640, height: 180, fill: '#121212', stroke: '#27272a', strokeWidth: 0, radius: 0, opacity: 1, rotation: 0, locked: false, hidden: false },
      { id: 'o-badge-1', name: 'Category Tag Badge', type: 'badge', text: 'SKILLBRIDGE DESIGN STUDIO', x: 200, y: 32, width: 240, height: 28, fill: '#18181b', color: '#FFFFFF', stroke: '#27272a', strokeWidth: 1, radius: 9999, align: 'center', rotation: 0, locked: false, hidden: false },
      { id: 'o-text-1', name: 'Main Campaign Heading', type: 'text', text: 'Precision Email Design Engine', x: 40, y: 76, width: 560, height: 50, fontSize: 26, fontWeight: '800', color: '#FFFFFF', align: 'center', fontFamily: 'Inter, sans-serif', rotation: 0, locked: false, hidden: false },
      { id: 'o-card-1', name: 'White Content Card', type: 'rectangle', x: 32, y: 196, width: 576, height: 420, fill: '#FFFFFF', stroke: '#E4E4E7', strokeWidth: 1, radius: 16, opacity: 1, rotation: 0, locked: false, hidden: false },
      { id: 'o-body-1', name: 'Body Paragraph Text', type: 'text', text: 'Hi {{first_name}},\n\nWelcome to SkillBridge Mail Design Studio. Everything on this canvas is treated as a modern vector object that automatically compiles into responsive HTML emails. Double-click any text object to edit directly on canvas.', x: 64, y: 228, width: 512, height: 100, fontSize: 15, fontWeight: '400', color: '#18181b', align: 'left', fontFamily: 'Inter, sans-serif', rotation: 0, locked: false, hidden: false },
      { id: 'o-btn-1', name: 'Interactive CTA Button', type: 'button', text: 'Apply Now via Telegram', url: 'https://t.me/+AB0OloYpE7I1NTVk', x: 170, y: 356, width: 300, height: 48, fill: '#000000', color: '#FFFFFF', radius: 12, fontSize: 15, fontWeight: '700', align: 'center', rotation: 0, locked: false, hidden: false },
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
  
  // Rulers, Guides, Grid & Zoom Toggle State
  const [showRulers, setShowRulers] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Side Panels & Modals State
  const [openMenu, setOpenMenu] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showTestMailModal, setShowTestMailModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTopic, setHelpTopic] = useState('shortcuts');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showOpenSavedModal, setShowOpenSavedModal] = useState(false);
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);
  const [customHexColor, setCustomHexColor] = useState('#000000');

  // Canvas Artboard Body Settings
  const [canvasBody, setCanvasBody] = useState({
    width: 640,
    bg: '#000000',
    padding: 24,
    fontFamily: 'Inter, sans-serif'
  });

  // Vector Objects Tree State
  const [objects, setObjects] = useState(STUDIO_TEMPLATES[1].objects);
  const [selectedIds, setSelectedIds] = useState(['o-text-1']);
  const [clipboard, setClipboard] = useState(null);

  // History Stack (Undo/Redo)
  const [history, setHistory] = useState([STUDIO_TEMPLATES[1].objects]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Dragging / Resizing / Rotating State
  const [dragState, setDragState] = useState(null);
  const [activeSnapGuides, setActiveSnapGuides] = useState([]);
  const [editingTextObjId, setEditingTextObjId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Test Email Sending State
  const [testEmailRecipient, setTestEmailRecipient] = useState(recipients[0]?.email || 'maverick@sendaat.io');
  const [testEmailSubject, setTestEmailSubject] = useState('Vector Design Studio Test Email');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const artboardRef = useRef(null);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Push Canvas State to History
  const pushHistory = (nextObjs) => {
    const nextH = history.slice(0, historyIdx + 1);
    nextH.push(nextObjs);
    setHistory(nextH);
    setHistoryIdx(nextH.length - 1);
    setObjects(nextObjs);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setObjects(history[historyIdx - 1]);
      showToast('Undo executed');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setObjects(history[historyIdx + 1]);
      showToast('Redo executed');
    }
  };

  // Selection & Primary Selected Object
  const primarySelected = objects.find(o => selectedIds.includes(o.id));

  // Modify Selected Object Property
  const updateObject = (id, key, val) => {
    const nextObjs = objects.map(o => o.id === id ? { ...o, [key]: val } : o);
    pushHistory(nextObjs);
  };

  // Quick Object Handlers
  const handleCopy = () => {
    if (selectedIds.length > 0) {
      const selectedObjs = objects.filter(o => selectedIds.includes(o.id));
      setClipboard(selectedObjs);
      showToast(`Copied ${selectedObjs.length} object(s)`);
    }
  };

  const handleCut = () => {
    if (selectedIds.length > 0) {
      handleCopy();
      const nextObjs = objects.filter(o => !selectedIds.includes(o.id));
      pushHistory(nextObjs);
      setSelectedIds([]);
      showToast('Cut selected objects');
    }
  };

  const handlePaste = () => {
    if (clipboard && clipboard.length > 0) {
      const pasted = clipboard.map(item => ({
        ...item,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        x: item.x + 20,
        y: item.y + 20
      }));
      const nextObjs = [...objects, ...pasted];
      pushHistory(nextObjs);
      setSelectedIds(pasted.map(p => p.id));
      showToast(`Pasted ${pasted.length} object(s)`);
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length > 0) {
      const selectedObjs = objects.filter(o => selectedIds.includes(o.id));
      const duplicated = selectedObjs.map(item => ({
        ...item,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        x: item.x + 24,
        y: item.y + 24
      }));
      const nextObjs = [...objects, ...duplicated];
      pushHistory(nextObjs);
      setSelectedIds(duplicated.map(d => d.id));
      showToast(`Duplicated ${duplicated.length} object(s)`);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      const nextObjs = objects.filter(o => !selectedIds.includes(o.id));
      pushHistory(nextObjs);
      setSelectedIds([]);
      showToast('Deleted selected object(s)');
    }
  };

  // Align Objects
  const handleAlign = (type) => {
    if (selectedIds.length === 0) return;
    const boundsWidth = canvasBody.width;
    const nextObjs = objects.map(o => {
      if (selectedIds.includes(o.id)) {
        if (type === 'left') return { ...o, x: canvasBody.padding };
        if (type === 'center') return { ...o, x: Math.round((boundsWidth - o.width) / 2) };
        if (type === 'right') return { ...o, x: boundsWidth - o.width - canvasBody.padding };
      }
      return o;
    });
    pushHistory(nextObjs);
    showToast(`Aligned ${type}`);
  };

  // Reorder Layer Position
  const handleLayerOrder = (direction) => {
    if (!primarySelected) return;
    const idx = objects.findIndex(o => o.id === primarySelected.id);
    if (idx === -1) return;

    const nextObjs = [...objects];
    const [item] = nextObjs.splice(idx, 1);

    if (direction === 'up' && idx < objects.length - 1) {
      nextObjs.splice(idx + 1, 0, item);
    } else if (direction === 'down' && idx > 0) {
      nextObjs.splice(idx - 1, 0, item);
    } else if (direction === 'front') {
      nextObjs.push(item);
    } else if (direction === 'back') {
      nextObjs.unshift(item);
    }

    pushHistory(nextObjs);
  };

  // Group Objects
  const handleGroupSelected = () => {
    if (selectedIds.length < 2) return;
    const groupName = `Group (${selectedIds.length} objects)`;
    const groupId = `grp-${Date.now()}`;
    const nextObjs = objects.map(o => selectedIds.includes(o.id) ? { ...o, groupId, groupName } : o);
    pushHistory(nextObjs);
    showToast('Grouped selected objects!');
  };

  const handleUngroupSelected = () => {
    const nextObjs = objects.map(o => selectedIds.includes(o.id) ? { ...o, groupId: undefined, groupName: undefined } : o);
    pushHistory(nextObjs);
    showToast('Ungrouped objects!');
  };

  // Global Keybindings for CorelDRAW Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        handleCut();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(objects.map(o => o.id));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedIds([]);
        setEditingTextObjId(null);
        setContextMenu(null);
      } else if (e.key === 'v' || e.key === 'V') setActiveTool('pick');
      else if (e.key === 't' || e.key === 'T') setActiveTool('text');
      else if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      else if (e.key === 'o' || e.key === 'O') setActiveTool('ellipse');
      else if (e.key === 's' || e.key === 'S') setActiveTool('star');
      else if (e.key === 'h' || e.key === 'H') setActiveTool('hand');
      else if (e.key === 'i' || e.key === 'I') setShowMediaModal(true);
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) setShowHelpModal(true);
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const nextObjs = objects.map(o => selectedIds.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o);
        pushHistory(nextObjs);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIdx, history, selectedIds, objects, clipboard]);

  // Handle Tool Object Spawning on Artboard Click
  const handleArtboardClick = (e) => {
    if (dragState) return;

    if (activeTool !== 'pick' && activeTool !== 'hand' && activeTool !== 'shape') {
      const rect = artboardRef.current.getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left) / (zoomLevel / 100));
      const clickY = Math.round((e.clientY - rect.top) / (zoomLevel / 100));

      const newId = `obj-${Date.now()}`;
      let newObj = null;

      if (activeTool === 'rectangle') {
        newObj = { id: newId, name: 'Rectangle Object', type: 'rectangle', x: clickX - 80, y: clickY - 50, width: 160, height: 100, fill: '#18181b', stroke: '#27272a', strokeWidth: 1, radius: 8, opacity: 1, rotation: 0, locked: false, hidden: false };
      } else if (activeTool === 'ellipse') {
        newObj = { id: newId, name: 'Ellipse Vector', type: 'ellipse', x: clickX - 50, y: clickY - 50, width: 100, height: 100, fill: '#18181b', stroke: '#27272a', strokeWidth: 1, opacity: 1, rotation: 0, locked: false, hidden: false };
      } else if (activeTool === 'star') {
        newObj = { id: newId, name: 'Star Vector Badge', type: 'star', x: clickX - 50, y: clickY - 50, width: 100, height: 100, fill: '#FFFFFF', stroke: '#27272a', strokeWidth: 1, opacity: 1, rotation: 0, locked: false, hidden: false };
      } else if (activeTool === 'text') {
        newObj = { id: newId, name: 'Artistic Text', type: 'text', text: 'Double click to edit text', x: clickX - 100, y: clickY - 20, width: 200, height: 40, fontSize: 18, fontWeight: '700', color: '#000000', align: 'left', fontFamily: 'Inter, sans-serif', rotation: 0, locked: false, hidden: false };
      } else if (activeTool === 'outline' || activeTool === 'connector') {
        newObj = { id: newId, name: 'Divider Line', type: 'line', x: clickX - 150, y: clickY, width: 300, height: 10, stroke: '#27272a', strokeWidth: 2, rotation: 0, locked: false, hidden: false };
      } else if (activeTool === 'table') {
        newObj = { id: newId, name: 'Container Box', type: 'rectangle', x: clickX - 200, y: clickY - 100, width: 400, height: 200, fill: '#F4F4F5', stroke: '#E4E4E7', strokeWidth: 1, radius: 12, opacity: 1, rotation: 0, locked: false, hidden: false };
      }

      if (newObj) {
        pushHistory([...objects, newObj]);
        setSelectedIds([newObj.id]);
        setActiveTool('pick');
        showToast(`Created new ${newObj.type} object!`);
      }
    }
  };

  // Mouse Dragging for Movement, Resize, Rotation
  const handleCanvasMouseDown = (e, targetObj, mode, handlePos = null) => {
    e.stopPropagation();
    if (targetObj.locked) return;

    if (!selectedIds.includes(targetObj.id) && !e.shiftKey) {
      setSelectedIds([targetObj.id]);
    } else if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(targetObj.id) ? prev.filter(id => id !== targetObj.id) : [...prev, targetObj.id]);
    }

    setDragState({
      mode,
      handlePos,
      startX: e.clientX,
      startY: e.clientY,
      origX: targetObj.x,
      origY: targetObj.y,
      origW: targetObj.width,
      origH: targetObj.height,
      origRotation: targetObj.rotation || 0,
      centerX: targetObj.x + targetObj.width / 2,
      centerY: targetObj.y + targetObj.height / 2,
      startAngle: Math.atan2(e.clientY - (targetObj.y + targetObj.height / 2), e.clientX - (targetObj.x + targetObj.width / 2)) * (180 / Math.PI)
    });
  };

  const handleGlobalMouseMove = (e) => {
    if (!dragState || selectedIds.length === 0) return;

    const dx = Math.round((e.clientX - dragState.startX) / (zoomLevel / 100));
    const dy = Math.round((e.clientY - dragState.startY) / (zoomLevel / 100));
    const targetObj = primarySelected;
    if (!targetObj) return;

    if (dragState.mode === 'move') {
      let nextX = dragState.origX + dx;
      let nextY = dragState.origY + dy;

      if (snapToGrid) {
        nextX = Math.round(nextX / 10) * 10;
        nextY = Math.round(nextY / 10) * 10;
      }

      // Smart Alignment Guides
      const guides = [];
      const centerX = nextX + targetObj.width / 2;
      const artboardCenterX = canvasBody.width / 2;
      if (Math.abs(centerX - artboardCenterX) < 5) {
        nextX = artboardCenterX - targetObj.width / 2;
        guides.push({ pos: artboardCenterX, label: 'Center Snap' });
      }

      setActiveSnapGuides(guides);
      setObjects(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, x: o.x + (nextX - targetObj.x), y: o.y + (nextY - targetObj.y) } : o));
    } else if (dragState.mode === 'resize') {
      let nextW = dragState.origW;
      let nextH = dragState.origH;
      let nextX = dragState.origX;
      let nextY = dragState.origY;

      if (dragState.handlePos.includes('e')) nextW = Math.max(10, dragState.origW + dx);
      if (dragState.handlePos.includes('s')) nextH = Math.max(10, dragState.origH + dy);
      if (dragState.handlePos.includes('w')) {
        const diff = dragState.origW - dx;
        if (diff > 10) { nextW = diff; nextX = dragState.origX + dx; }
      }
      if (dragState.handlePos.includes('n')) {
        const diff = dragState.origH - dy;
        if (diff > 10) { nextH = diff; nextY = dragState.origY + dy; }
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
      setActiveSnapGuides([]);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, objects, zoomLevel, snapToGrid, showGuides]);

  // Context Menu Handler
  const handleContextMenu = (e, obj) => {
    e.preventDefault();
    setSelectedIds([obj.id]);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Start from Scratch (Blank Canvas)
  const handleStartFromScratch = () => {
    if (window.confirm('Clear all objects and start from a blank canvas?')) {
      pushHistory([]);
      setSelectedIds([]);
      showToast('Cleared canvas for blank design!');
    }
  };

  // Export HTML Handler
  const handleExportCorelEmail = (mode = 'download') => {
    const htmlCode = exportToHtml(objects, canvasBody);

    if (mode === 'download') {
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      showToast('Exported email HTML file!');
    } else if (mode === 'json') {
      const blob = new Blob([JSON.stringify({ projectName, canvasBody, objects }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      showToast('Exported Vector JSON Project file!');
    }
  };

  // Run Pre-Flight Validation Audit
  const handleRunPublishValidation = () => {
    const report = validateEmailDesign(objects, canvasBody);
    setValidationResult(report);
    setShowPublishModal(true);
  };

  // Send Real Inbox Test Email Handler
  const handleSendRealInboxTest = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    setIsSendingTest(true);
    const compiledHtml = exportToHtml(objects, canvasBody);

    try {
      if (onSendSingleTest) {
        await onSendSingleTest(testEmailRecipient, testEmailSubject, compiledHtml);
      }
      setIsSendingTest(false);
      setShowTestMailModal(false);
      showToast(`Test email dispatched to ${testEmailRecipient}!`);
    } catch (err) {
      setIsSendingTest(false);
      alert('Failed to send test email: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col font-sans select-none overflow-hidden animate-fade-in">
      
      {/* 1. TOP COREL MENU BAR (File, Edit, View, Arrange, Help) */}
      <div className="h-12 bg-[#050505] border-b border-zinc-800 px-4 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-black font-extrabold flex items-center justify-center text-xs shadow-md">
              C
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              DESIGN STUDIO <span className="bg-zinc-800 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-zinc-700 ml-1">PRO</span>
            </span>
          </div>

          {/* Menus Dropdowns */}
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${openMenu === menu.id ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                {menu.label}
              </button>

              {openMenu === menu.id && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 font-sans text-xs">
                  {menu.id === 'file' && (
                    <>
                      <button onClick={() => { handleStartFromScratch(); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span className="flex items-center gap-2"><FilePlus className="w-4 h-4 text-white" /> Blank Canvas</span>
                      </button>
                      <button onClick={() => { handleExportCorelEmail('download'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span className="flex items-center gap-2"><Download className="w-4 h-4 text-zinc-300" /> Export HTML File</span>
                      </button>
                      <button onClick={() => { handleExportCorelEmail('json'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span className="flex items-center gap-2"><FileCode className="w-4 h-4 text-zinc-300" /> Export Project JSON</span>
                      </button>
                    </>
                  )}

                  {menu.id === 'edit' && (
                    <>
                      <button onClick={() => { handleUndo(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200"><span>Undo</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+Z</span></button>
                      <button onClick={() => { handleRedo(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200"><span>Redo</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+Y</span></button>
                      <div className="my-1 border-t border-zinc-800" />
                      <button onClick={() => { handleCopy(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200"><span>Copy</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+C</span></button>
                      <button onClick={() => { handlePaste(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200"><span>Paste</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+V</span></button>
                      <button onClick={() => { handleDuplicateSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200"><span>Duplicate</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+D</span></button>
                      <button onClick={() => { handleDeleteSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-rose-950/40 text-rose-400 flex items-center justify-between"><span>Delete</span> <span className="font-mono text-[10px] text-rose-400">Del</span></button>
                    </>
                  )}

                  {menu.id === 'view' && (
                    <>
                      <button onClick={() => setShowGrid(!showGrid)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span>Show Canvas Grid</span> {showGrid ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                      </button>
                      <button onClick={() => setSnapToGrid(!snapToGrid)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span>Snap to Grid</span> {snapToGrid ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                      </button>
                      <button onClick={() => setShowRulers(!showRulers)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span>Show Rulers</span> {showRulers ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                      </button>
                      <button onClick={() => setShowGuides(!showGuides)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                        <span>Show Smart Alignment Guides</span> {showGuides ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                      </button>
                      <div className="my-1 border-t border-zinc-800" />
                      {[50, 75, 100, 125, 150].map(z => (
                        <button key={z} onClick={() => { setZoomLevel(z); setOpenMenu(null); }} className="w-full px-3.5 py-1 text-left text-xs hover:bg-zinc-800 flex items-center justify-between text-zinc-200">
                          <span>Zoom {z}%</span> {zoomLevel === z ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                        </button>
                      ))}
                    </>
                  )}

                  {menu.id === 'arrange' && (
                    <>
                      <button onClick={() => { handleAlign('left'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Align Left</button>
                      <button onClick={() => { handleAlign('center'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Align Center</button>
                      <button onClick={() => { handleAlign('right'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Align Right</button>
                      <div className="my-1 border-t border-zinc-800" />
                      <button onClick={() => { handleLayerOrder('front'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Bring to Front</button>
                      <button onClick={() => { handleLayerOrder('back'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Send to Back</button>
                      <div className="my-1 border-t border-zinc-800" />
                      <button onClick={() => { handleGroupSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Group Objects</button>
                      <button onClick={() => { handleUngroupSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-zinc-800 text-zinc-200">Ungroup Objects</button>
                    </>
                  )}

                  {menu.id === 'help' && (
                    <>
                      <button onClick={() => { setShowHelpModal(true); setHelpTopic('shortcuts'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-zinc-800 text-zinc-200 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-white" /> Keyboard Shortcuts
                      </button>
                      <button onClick={() => { setShowHelpModal(true); setHelpTopic('guide'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-zinc-800 text-zinc-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-300" /> Design Studio Guide
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
            className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <FilePlus className="w-3.5 h-3.5 text-white" />
            <span>Blank Canvas</span>
          </button>

          {setEditorMode && (
            <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg font-sans shadow-inner" title="Switch Editor Workspaces">
              <button
                onClick={() => setEditorMode('visual')}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  editorMode === 'visual'
                    ? 'bg-white text-black shadow-md font-extrabold scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                title="Visual Drag & Drop Studio (Visual)"
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditorMode('design')}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  editorMode === 'design'
                    ? 'bg-white text-black shadow-md font-extrabold scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                title="Vector Design Studio Canvas (Design)"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditorMode('text')}
                className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  editorMode === 'text'
                    ? 'bg-white text-black shadow-md font-extrabold scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                title="Plain Text & Form Editor Mode (Text)"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          )}

          <button onClick={onCloseStudio} className="p-1 text-zinc-400 hover:text-rose-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SUB-TOOLBAR RIBBON WITH ACTIONS */}
      <div className="h-11 bg-[#121212] border-b border-zinc-800 px-3 flex items-center justify-between text-xs z-40 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMediaModal(true)} className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Upload className="w-3.5 h-3.5 text-white" /> Insert Media (Images/GIFs/SVGs)
          </button>

          <button onClick={() => setShowSocialModal(true)} className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Share2 className="w-3.5 h-3.5 text-white" /> Add Social Links
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button onClick={handleUndo} disabled={historyIdx === 0} className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800" title="Undo (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></button>
          <button onClick={handleRedo} disabled={historyIdx === history.length - 1} className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800" title="Redo (Ctrl+Y)"><Redo2 className="w-3.5 h-3.5" /></button>
          
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button onClick={handleGroupSelected} className="px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg flex items-center gap-1 text-xs font-semibold"><Box className="w-3.5 h-3.5 text-white" /> Group</button>
          <button onClick={handleDuplicateSelected} className="px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg flex items-center gap-1 text-xs font-semibold"><Copy className="w-3.5 h-3.5 text-white" /> Duplicate</button>
          <button onClick={handleDeleteSelected} className="px-2 py-1 text-zinc-300 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-1 text-xs font-semibold"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
        </div>

        {/* TEST MAIL & PUBLISH ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTestMailModal(true)}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Send className="w-3.5 h-3.5 text-white" /> Send Inbox Test Email
          </button>

          <button onClick={() => handleExportCorelEmail('download')} className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg border border-zinc-800 flex items-center gap-1.5 shadow-xs"><Download className="w-3.5 h-3.5 text-white" /> Export HTML</button>
          <button onClick={handleRunPublishValidation} className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-lg shadow-md flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 stroke-[2.5]" /> Publish</button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT TOOLBOX (18 CorelDRAW / Figma Tools) */}
        <div className="w-16 bg-[#121212] border-r border-zinc-800 flex flex-col items-center py-2 gap-1 z-40 overflow-y-auto scrollbar-none flex-shrink-0">
          {[
            { id: 'pick', label: 'Pick / Selection Tool', key: 'V', icon: MousePointer2 },
            { id: 'shape', label: 'Shape Node Tool', key: 'A', icon: Move },
            { id: 'crop', label: 'Image Crop Tool', key: 'C', icon: Crop },
            { id: 'zoom', label: 'Zoom Tool', key: 'Z', icon: ZoomIn },
            { id: 'freehand', label: 'Freehand Line Tool', key: 'P', icon: PenTool },
            { id: 'bezier', label: 'Bezier Curve Pen', key: 'B', icon: Spline },
            { id: 'rectangle', label: 'Rectangle Shape Tool', key: 'R', icon: Square },
            { id: 'ellipse', label: 'Ellipse Vector Tool', key: 'O', icon: Circle },
            { id: 'star', label: 'Star / Badge Tool', key: 'S', icon: Star },
            { id: 'table', label: 'Grid Container Tool', key: 'G', icon: Grid },
            { id: 'text', label: 'Artistic Text Tool', key: 'T', icon: Type },
            { id: 'image', label: 'Image / Media Asset', key: 'I', icon: ImageIcon },
            { id: 'eyedropper', label: 'Color Eyedropper', key: 'E', icon: Pipette },
            { id: 'fill', label: 'Paint Bucket Fill', key: 'F', icon: Paintbrush },
            { id: 'outline', label: 'Outline Stroke Tool', key: 'K', icon: Minus },
            { id: 'connector', label: 'Callout / Arrow Line', key: 'N', icon: ArrowRight },
            { id: 'hand', label: 'Hand Viewport Pan', key: 'H', icon: Hand }
          ].map(tool => {
            const IconCmp = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (tool.id === 'image') setShowMediaModal(true);
                  else if (tool.id === 'eyedropper') setShowColorPickerModal(true);
                  else setActiveTool(tool.id);
                }}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-white text-black font-extrabold shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-800'}`}
              >
                <IconCmp className="w-4 h-4" />
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#121212] border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
                  <span>{tool.label}</span>
                  <span className="bg-zinc-800 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">{tool.key}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER ARTBOARD CANVAS */}
        <div className="flex-1 bg-[#050505] overflow-auto relative flex flex-col select-none">
          {showRulers && (
            <div className="h-6 bg-[#0a0a0a] border-b border-zinc-800 flex items-center pl-6 text-[9px] font-mono text-zinc-500 sticky top-0 z-30 select-none overflow-hidden">
              <div className="flex" style={{ width: `${canvasBody.width}px` }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-zinc-800 px-1">{i * 100}px</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 relative flex items-center justify-center p-12 min-h-[800px]">
            <div
              ref={artboardRef}
              onClick={handleArtboardClick}
              className="bg-white shadow-2xl relative transition-all rounded-2xl overflow-hidden border border-zinc-800"
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
              {/* SMART SNAP GUIDES */}
              {activeSnapGuides.map((g, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${g.pos}px`,
                    width: '1px',
                    backgroundColor: '#FFFFFF',
                    zIndex: 999
                  }}
                />
              ))}

              {/* OBJECTS RENDERER STACK */}
              {objects.filter(o => !o.hidden).map(obj => {
                const isSelected = selectedIds.includes(obj.id);
                const isEditingText = editingTextObjId === obj.id;

                return (
                  <div
                    key={obj.id}
                    onMouseDown={(e) => handleCanvasMouseDown(e, obj, 'move')}
                    onContextMenu={(e) => handleContextMenu(e, obj)}
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
                    className={`group/obj cursor-move transition-all ${isSelected ? 'outline outline-2 outline-white outline-offset-2 z-40' : 'hover:outline hover:outline-1 hover:outline-zinc-400/60'}`}
                  >
                    {isSelected && (
                      <>
                        <div
                          onMouseDown={(e) => handleCanvasMouseDown(e, obj, 'rotate')}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white text-black rounded-full border-2 border-black cursor-grab shadow-lg flex items-center justify-center text-[10px] font-bold hover:scale-125 transition-transform"
                          title="Drag to Rotate Object 360°"
                        >
                          ↻
                        </div>

                        {[
                          { pos: 'nw', class: '-top-1.5 -left-1.5 cursor-nwse-resize' },
                          { pos: 'ne', class: '-top-1.5 -right-1.5 cursor-nesw-resize' },
                          { pos: 'se', class: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
                          { pos: 'sw', class: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
                          { pos: 'n', class: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
                          { pos: 's', class: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
                          { pos: 'e', class: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize' },
                          { pos: 'w', class: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize' }
                        ].map(h => (
                          <div
                            key={h.pos}
                            onMouseDown={(e) => handleCanvasMouseDown(e, obj, 'resize', h.pos)}
                            className={`absolute w-3 h-3 bg-white border-2 border-black rounded-sm shadow-md ${h.class}`}
                          />
                        ))}
                      </>
                    )}

                    {/* OBJECT TYPES */}
                    {obj.type === 'rectangle' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: obj.fill, borderColor: obj.stroke, borderWidth: `${obj.strokeWidth}px`, borderStyle: obj.style || 'solid', borderRadius: `${obj.radius || 0}px` }} />
                    )}

                    {obj.type === 'ellipse' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: obj.fill, borderColor: obj.stroke, borderWidth: `${obj.strokeWidth}px`, borderStyle: 'solid', borderRadius: '9999px' }} />
                    )}

                    {obj.type === 'star' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: obj.fill, borderColor: obj.stroke, borderWidth: `${obj.strokeWidth}px`, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                    )}

                    {obj.type === 'line' && (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: `${obj.strokeWidth || 2}px`, backgroundColor: obj.stroke || '#18181B' }} />
                      </div>
                    )}

                    {obj.type === 'text' && (
                      isEditingText ? (
                        <textarea
                          rows={2}
                          value={obj.text}
                          onChange={(e) => updateObject(obj.id, 'text', e.target.value)}
                          onBlur={() => setEditingTextObjId(null)}
                          autoFocus
                          className="w-full h-full bg-zinc-900 text-white border-2 border-white p-1 font-bold focus:outline-none rounded"
                          style={{ fontSize: `${obj.fontSize || 16}px`, fontFamily: obj.fontFamily || 'sans-serif' }}
                        />
                      ) : (
                        <div style={{ fontSize: `${obj.fontSize || 16}px`, fontWeight: obj.fontWeight || '400', color: obj.color || '#FFFFFF', textAlign: obj.align || 'left', fontFamily: obj.fontFamily || 'sans-serif', lineHeight: '1.4', whiteSpace: 'pre-wrap' }} className="w-full h-full p-1">
                          {obj.text}
                        </div>
                      )
                    )}

                    {obj.type === 'button' && (
                      <div style={{ backgroundColor: obj.fill || '#000000', color: obj.color || '#FFFFFF', borderRadius: `${obj.radius || 8}px`, fontSize: `${obj.fontSize || 15}px`, fontWeight: obj.fontWeight || '700', textAlign: obj.align || 'center' }} className="w-full h-full flex items-center justify-center font-bold shadow-md cursor-pointer border border-zinc-800">
                        {obj.text}
                      </div>
                    )}

                    {obj.type === 'badge' && (
                      <div style={{ backgroundColor: obj.fill || '#18181b', color: obj.color || '#FFFFFF', borderColor: obj.stroke || '#27272a', borderWidth: `${obj.strokeWidth || 1}px`, borderRadius: `${obj.radius || 9999}px`, textAlign: obj.align || 'center' }} className="w-full h-full flex items-center justify-center font-mono text-[11px] font-bold tracking-wider uppercase">
                        {obj.text}
                      </div>
                    )}

                    {obj.type === 'image' && (
                      <img src={obj.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'} alt={obj.name} style={{ borderRadius: `${obj.radius || 0}px` }} className="w-full h-full object-cover shadow-sm pointer-events-none" />
                    )}

                    {obj.type === 'social' && (
                      <div className="w-full h-full flex items-center justify-center gap-3">
                        {(obj.platforms || ['telegram', 'twitter', 'linkedin']).map(p => (
                          <div key={p} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center shadow-xs">
                            <UniformSocialIcon platform={p} className="w-4 h-4 text-white" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: OBJECT MANAGER (LAYERS) & PROPERTY INSPECTOR */}
        <div className="w-80 bg-[#121212] border-l border-zinc-800 flex flex-col z-40 font-sans flex-shrink-0">
          
          {/* SECTION A: OBJECT MANAGER (LAYERS) */}
          <div className="h-1/2 border-b border-zinc-800 flex flex-col p-3 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-white" />
                <span>Object Manager ({objects.length})</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {objects.slice().reverse().map(obj => {
                const isSelected = selectedIds.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    onClick={() => setSelectedIds([obj.id])}
                    className={`p-2 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 text-white border-zinc-700 font-bold shadow-md'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border-zinc-800/80'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{obj.name || obj.type}</span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateObject(obj.id, 'hidden', !obj.hidden);
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        {obj.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateObject(obj.id, 'locked', !obj.locked);
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        {obj.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: PROPERTY INSPECTOR */}
          <div className="h-1/2 flex flex-col p-3 space-y-3 overflow-y-auto scrollbar-none text-xs">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-white" />
                <span>Property Inspector</span>
              </span>
              {primarySelected && (
                <span className="font-mono text-[10px] bg-zinc-800 text-white px-2 py-0.5 rounded font-extrabold uppercase">
                  {primarySelected.type}
                </span>
              )}
            </div>

            {primarySelected ? (
              <div className="space-y-3 font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Object Label Name</label>
                  <input
                    type="text"
                    value={primarySelected.name || ''}
                    onChange={(e) => updateObject(primarySelected.id, 'name', e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Position X (px)</label>
                    <input type="number" value={primarySelected.x} onChange={(e) => updateObject(primarySelected.id, 'x', parseInt(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Position Y (px)</label>
                    <input type="number" value={primarySelected.y} onChange={(e) => updateObject(primarySelected.id, 'y', parseInt(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Width W (px)</label>
                    <input type="number" value={primarySelected.width} onChange={(e) => updateObject(primarySelected.id, 'width', parseInt(e.target.value) || 10)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Height H (px)</label>
                    <input type="number" value={primarySelected.height} onChange={(e) => updateObject(primarySelected.id, 'height', parseInt(e.target.value) || 10)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none" />
                  </div>
                </div>

                {primarySelected.type === 'text' && (
                  <div className="space-y-3 border-t border-zinc-800 pt-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Personalization Tag</label>
                      <select onChange={(e) => updateObject(primarySelected.id, 'text', primarySelected.text + ' ' + e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none">
                        <option value="">+ Insert Personalization Tag</option>
                        <option value="{{first_name}}">First Name ({"{{first_name}}"})</option>
                        <option value="{{last_name}}">Last Name ({"{{last_name}}"})</option>
                        <option value="{{company}}">Company ({"{{company}}"})</option>
                        <option value="{{email}}">Recipient Email ({"{{email}}"})</option>
                        <option value="{{unsubscribe_url}}">Unsubscribe URL ({"{{unsubscribe_url}}"})</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Font Family</label>
                      <select value={primarySelected.fontFamily || 'Inter, sans-serif'} onChange={(e) => updateObject(primarySelected.id, 'fontFamily', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none">
                        {FONT_CATALOG.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Font Size (px)</label>
                        <input type="number" value={primarySelected.fontSize || 16} onChange={(e) => updateObject(primarySelected.id, 'fontSize', parseInt(e.target.value) || 12)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Font Color</label>
                        <input type="color" value={primarySelected.color || '#FFFFFF'} onChange={(e) => updateObject(primarySelected.id, 'color', e.target.value)} className="w-full h-9 bg-black border border-zinc-800 rounded-xl p-1 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                )}

                {(primarySelected.type === 'rectangle' || primarySelected.type === 'button') && (
                  <div className="space-y-3 border-t border-zinc-800 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Fill Color</label>
                        <input type="color" value={primarySelected.fill || '#121212'} onChange={(e) => updateObject(primarySelected.id, 'fill', e.target.value)} className="w-full h-9 bg-black border border-zinc-800 rounded-xl p-1 cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-300">Border Radius (px)</label>
                        <input type="number" value={primarySelected.radius || 0} onChange={(e) => updateObject(primarySelected.id, 'radius', parseInt(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-xs font-sans">
                Select an object on the artboard canvas to inspect properties.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM COREL DRAW PALETTE COLOR SWATCHES */}
      <div className="h-10 bg-[#121212] border-t border-zinc-800 px-4 flex items-center justify-between text-xs z-40 font-mono">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mr-2">Color Swatches:</span>
          {PALETTE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => {
                if (primarySelected) {
                  const key = primarySelected.type === 'text' ? 'color' : 'fill';
                  updateObject(primarySelected.id, key, c);
                } else {
                  setCanvasBody(prev => ({ ...prev, bg: c }));
                }
              }}
              style={{ backgroundColor: c }}
              className="w-5 h-5 rounded-full border border-zinc-700/80 hover:scale-125 transition-transform shrink-0 shadow-xs cursor-pointer"
              title={`Apply Swatch Color: ${c}`}
            />
          ))}
        </div>
      </div>

      {/* MEDIA ASSET PICKER MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-[#121212] border border-zinc-800 rounded-[28px] max-w-lg w-full p-6 relative shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-white" /> Insert Media Asset
              </h4>
              <button onClick={() => setShowMediaModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'SaaS Hero', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600' },
                  { name: 'Analytics', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600' },
                  { name: 'Team Workspace', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600' }
                ].map(item => (
                  <div
                    key={item.name}
                    onClick={() => {
                      const id = `obj-img-${Date.now()}`;
                      pushHistory([...objects, { id, name: item.name, type: 'image', url: item.url, x: 120, y: 180, width: 400, height: 220, radius: 12, opacity: 1, rotation: 0, locked: false, hidden: false }]);
                      setSelectedIds([id]);
                      setShowMediaModal(false);
                      showToast(`Inserted ${item.name} image!`);
                    }}
                    className="group border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-white transition-colors bg-black p-1"
                  >
                    <img src={item.url} alt={item.name} className="h-20 w-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                    <div className="text-[10px] font-bold text-zinc-300 mt-1 truncate px-1 text-center">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL LINKS MODAL */}
      {showSocialModal && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-[#121212] border border-zinc-800 rounded-[28px] max-w-lg w-full p-6 relative shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-white" /> Configure Social Links Row
              </h4>
              <button onClick={() => setShowSocialModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {SOCIAL_PLATFORMS.map(sp => (
                <div key={sp.id} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                    {sp.label} Target URL
                  </label>
                  <input
                    type="text"
                    defaultValue={sp.defaultUrl}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const id = `obj-social-${Date.now()}`;
                pushHistory([...objects, {
                  id,
                  name: 'Social Links Row',
                  type: 'social',
                  platforms: ['telegram', 'twitter', 'linkedin', 'instagram', 'github'],
                  urls: { telegram: 'https://t.me/+AB0OloYpE7I1NTVk' },
                  x: 180, y: 400, width: 280, height: 44, align: 'center', rotation: 0, locked: false, hidden: false
                }]);
                setSelectedIds([id]);
                setShowSocialModal(false);
                showToast('Inserted Social Links row!');
              }}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full shadow-lg transition-colors cursor-pointer"
            >
              Insert Configured Social Row
            </button>
          </div>
        </div>
      )}

      {/* PRE-FLIGHT VALIDATION & PUBLISH REPORT MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-[#121212] border border-zinc-800 rounded-[28px] max-w-lg w-full p-6 relative shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-white" /> Pre-Flight Email Audit Report
              </h4>
              <button onClick={() => setShowPublishModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            {validationResult && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {validationResult.issues.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
                    <div className="text-sm font-bold text-white">All Pre-Flight Checks Passed!</div>
                    <div className="text-xs text-zinc-400">Your design is 100% compliant with mobile & email client standards.</div>
                  </div>
                ) : (
                  validationResult.issues.map((iss, i) => (
                    <div key={i} className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${iss.type === 'error' ? 'bg-rose-950/40 border-rose-800/40 text-rose-300' : 'bg-amber-950/40 border-amber-800/40 text-amber-300'}`}>
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">{iss.title}</div>
                        <div className="text-[11px] opacity-90 mt-0.5">{iss.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
              <button onClick={() => setShowPublishModal(false)} className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-full border border-zinc-800">Back to Design</button>
              <button onClick={() => { setShowPublishModal(false); showToast('Design Published successfully!'); }} className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full shadow-lg">Confirm & Publish Now</button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME INBOX TEST EMAIL SENDER MODAL */}
      {showTestMailModal && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-[#121212] border border-zinc-800 rounded-[28px] max-w-md w-full p-6 relative shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-white" /> Send Real Inbox Test Email
              </h4>
              <button onClick={() => setShowTestMailModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Recipient Target Email</label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Subject Line</label>
                <input
                  type="text"
                  value={testEmailSubject}
                  onChange={(e) => setTestEmailSubject(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <button
              onClick={handleSendRealInboxTest}
              disabled={isSendingTest}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingTest ? 'Dispatching to Inbox...' : 'Send Real Inbox Test Email Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* HELP & SHORTCUTS MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 font-sans">
          <div className="bg-[#121212] border border-zinc-800 rounded-[28px] max-w-xl w-full p-6 relative shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-white" /> Design Studio Help & Shortcuts
              </h4>
              <button onClick={() => setShowHelpModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold border-b border-zinc-800 pb-2">
              {[
                { id: 'shortcuts', label: 'Keyboard Shortcuts' },
                { id: 'guide', label: 'Design Guidelines' }
              ].map(t => (
                <button key={t.id} onClick={() => setHelpTopic(t.id)} className={`py-2 rounded-xl transition-colors ${helpTopic === t.id ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:bg-zinc-900'}`}>{t.label}</button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs text-zinc-300">
              {helpTopic === 'shortcuts' ? (
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>V</span><span className="text-white font-bold">Selection Tool</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>T</span><span className="text-white font-bold">Text Tool</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>R</span><span className="text-white font-bold">Rectangle Tool</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>O</span><span className="text-white font-bold">Ellipse Tool</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>Ctrl+Z</span><span className="text-white font-bold">Undo Action</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>Ctrl+Y</span><span className="text-white font-bold">Redo Action</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>Ctrl+D</span><span className="text-white font-bold">Duplicate Object</span></div>
                  <div className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between"><span>Delete</span><span className="text-white font-bold">Delete Object</span></div>
                </div>
              ) : (
                <div className="space-y-2 text-zinc-300 leading-relaxed">
                  <p>1. <strong>Vector Freedom:</strong> Move, resize, and rotate objects freely on artboard.</p>
                  <p>2. <strong>Email Compatibility:</strong> All objects compile automatically into bulletproof HTML tables.</p>
                  <p>3. <strong>Personalization:</strong> Insert merge tags like <code>{"{{first_name}}"}</code> for dynamic customization.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-CLICK CONTEXT MENU */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-[999999] bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl py-1.5 w-48 text-xs text-zinc-200 font-sans"
        >
          <button onClick={() => { handleDuplicateSelected(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between"><span>Duplicate</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+D</span></button>
          <button onClick={() => { handleCopy(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between"><span>Copy</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+C</span></button>
          <button onClick={() => { handleCut(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between"><span>Cut</span> <span className="font-mono text-[10px] text-zinc-400">Ctrl+X</span></button>
          <div className="my-1 border-t border-zinc-800" />
          <button onClick={() => { handleLayerOrder('front'); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-zinc-800">Bring to Front</button>
          <button onClick={() => { handleLayerOrder('back'); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-zinc-800">Send to Back</button>
          <div className="my-1 border-t border-zinc-800" />
          <button onClick={() => { handleDeleteSelected(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-rose-950/40 text-rose-400 font-bold flex items-center justify-between"><span>Delete</span> <span className="font-mono text-[10px]">Del</span></button>
        </div>
      )}

      {/* REAL-TIME TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-[999999] bg-[#121212]/95 backdrop-blur-xl border border-zinc-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
