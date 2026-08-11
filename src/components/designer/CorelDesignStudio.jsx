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
  const [customHexColor, setCustomHexColor] = useState('#007C89');

  // Hidden File Input Ref for Project JSON Import
  const jsonInputRef = useRef(null);

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
  const [clipboard, setClipboard] = useState([]);

  // Undo / Redo History Stack
  const [history, setHistory] = useState([STUDIO_TEMPLATES[1].objects]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);

  // Mouse Drag Engine State
  const [dragState, setDragState] = useState(null);
  const [activeSnapGuides, setActiveSnapGuides] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const artboardRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedObjects = objects.filter(o => selectedIds.includes(o.id));
  const primarySelected = selectedObjects[0] || null;

  // History Helper Engine
  const pushHistory = (nextObjs) => {
    const nextHist = history.slice(0, historyIdx + 1);
    nextHist.push(nextObjs);
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setObjects(nextObjs);

    // Sync compiled HTML with parent campaignConfig
    if (setCampaignConfig) {
      const compiled = exportToHtml({ body: canvasBody, objects: nextObjs, name: projectName });
      setCampaignConfig(prev => ({ ...prev, htmlContent: compiled }));
    }
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setObjects(prev);
      if (setCampaignConfig) {
        setCampaignConfig(p => ({ ...p, htmlContent: exportToHtml({ body: canvasBody, objects: prev, name: projectName }) }));
      }
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      setObjects(next);
      if (setCampaignConfig) {
        setCampaignConfig(p => ({ ...p, htmlContent: exportToHtml({ body: canvasBody, objects: next, name: projectName }) }));
      }
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if (isInput) return;

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
    setShowOpenSavedModal(false);
    showToast(`Loaded template: ${tpl.name}!`);
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

  const handleCopy = () => {
    if (selectedObjects.length === 0) return;
    setClipboard(selectedObjects);
    showToast(`Copied ${selectedObjects.length} object(s) to clipboard`);
  };

  const handleCut = () => {
    if (selectedObjects.length === 0) return;
    setClipboard(selectedObjects);
    handleDeleteSelected();
    showToast('Cut selected object(s)');
  };

  const handlePaste = () => {
    if (clipboard.length === 0) return;
    const newPasted = [];
    const nextObjs = [...objects];
    clipboard.forEach(o => {
      const pasted = {
        ...o,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${o.name} (Pasted)`,
        x: o.x + 30,
        y: o.y + 30
      };
      nextObjs.push(pasted);
      newPasted.push(pasted.id);
    });
    pushHistory(nextObjs);
    setSelectedIds(newPasted);
    showToast(`Pasted ${clipboard.length} object(s)`);
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

  const handleUngroupSelected = () => {
    const nextObjs = objects.map(o => {
      if (selectedIds.includes(o.id) && o.groupId) {
        const { groupId: _, ...rest } = o;
        return rest;
      }
      return o;
    });
    pushHistory(nextObjs);
    showToast('Ungrouped selected objects!');
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

  // ALIGNMENT COMMANDS (Left, Center, Right, Top, Middle, Bottom)
  const handleAlign = (type) => {
    if (selectedObjects.length === 0) return;
    let nextObjs = [...objects];

    if (selectedObjects.length === 1) {
      const obj = selectedObjects[0];
      let nextX = obj.x;
      let nextY = obj.y;
      if (type === 'left') nextX = 0;
      else if (type === 'center') nextX = Math.round((canvasBody.width - obj.width) / 2);
      else if (type === 'right') nextX = canvasBody.width - obj.width;
      else if (type === 'top') nextY = 0;
      else if (type === 'middle') nextY = 180;
      else if (type === 'bottom') nextY = 600;

      nextObjs = nextObjs.map(o => o.id === obj.id ? { ...o, x: nextX, y: nextY } : o);
    } else {
      const minX = Math.min(...selectedObjects.map(o => o.x));
      const maxX = Math.max(...selectedObjects.map(o => o.x + o.width));
      const minY = Math.min(...selectedObjects.map(o => o.y));
      const maxY = Math.max(...selectedObjects.map(o => o.y + o.height));
      const groupW = maxX - minX;
      const groupH = maxY - minY;

      nextObjs = nextObjs.map(o => {
        if (!selectedIds.includes(o.id)) return o;
        let nx = o.x;
        let ny = o.y;
        if (type === 'left') nx = minX;
        else if (type === 'center') nx = minX + Math.round((groupW - o.width) / 2);
        else if (type === 'right') nx = maxX - o.width;
        else if (type === 'top') ny = minY;
        else if (type === 'middle') ny = minY + Math.round((groupH - o.height) / 2);
        else if (type === 'bottom') ny = maxY - o.height;
        return { ...o, x: nx, y: ny };
      });
    }

    pushHistory(nextObjs);
    showToast(`Aligned objects (${type})`);
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

  // REAL-TIME CANVAS MOUSE DRAG ENGINE
  const handleCanvasMouseDown = (e, obj, mode = 'move', handle = null) => {
    e.stopPropagation();
    if (obj.locked) return;

    if (!selectedIds.includes(obj.id)) {
      if (e.shiftKey) setSelectedIds(prev => [...prev, obj.id]);
      else setSelectedIds([obj.id]);
    }

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
      let nextX = Math.round(dragState.initialObj.x + dx);
      let nextY = Math.round(dragState.initialObj.y + dy);

      if (snapToGrid) {
        nextX = Math.round(nextX / 20) * 20;
        nextY = Math.round(nextY / 20) * 20;
      }

      const newGuides = [];
      if (showGuides) {
        const objCenterX = nextX + targetObj.width / 2;
        if (Math.abs(objCenterX - canvasBody.width / 2) < 6) {
          nextX = Math.round(canvasBody.width / 2 - targetObj.width / 2);
          newGuides.push({ type: 'v', pos: canvasBody.width / 2 });
        }
      }
      setActiveSnapGuides(newGuides);

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
      case 'connector':
        newObj = { id, name: 'Line / Arrow', type: 'line', x: clickX, y: clickY, width: 240, height: 20, stroke: activeStrokeColor, strokeWidth: 2, style: 'solid', rotation: 0, locked: false, hidden: false };
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

  // PRE-FLIGHT VALIDATION & PUBLISH WORKFLOW
  const handleRunPublishValidation = () => {
    const res = validateEmailDesign(objects, canvasBody.width);
    setValidationResult(res);
    setShowPublishModal(true);
  };

  // SEND REAL INBOX TEST MAIL
  const handleSendRealInboxTest = async () => {
    setIsSendingTest(true);
    const compiledHtml = exportToHtml({ body: canvasBody, objects, name: projectName });
    
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
    const compiledHtml = exportToHtml({ body: canvasBody, objects, name: projectName });

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
    } else if (type === 'json') {
      const dataStr = JSON.stringify({ name: projectName, canvasBody, objects }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.json`;
      a.click();
      showToast('Project JSON exported!');
    }
  };

  const handleImportJsonProject = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.objects) {
            pushHistory(parsed.objects);
            if (parsed.canvasBody) setCanvasBody(parsed.canvasBody);
            if (parsed.name) setProjectName(parsed.name);
            showToast(`Imported project: ${parsed.name || file.name}`);
          }
        } catch {
          showToast('Failed to parse project JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  // RIGHT-CLICK CONTEXT MENU HANDLER
  const handleContextMenu = (e, obj) => {
    e.preventDefault();
    e.stopPropagation();
    if (obj) setSelectedIds([obj.id]);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      obj
    });
  };

  return (
    <div
      onClick={() => setContextMenu(null)}
      className="fixed inset-0 z-[99999] bg-slate-950 text-slate-100 flex flex-col h-screen w-screen overflow-hidden font-sans select-none antialiased"
    >
      {/* Hidden File Input for Importing Project JSON */}
      <input
        type="file"
        ref={jsonInputRef}
        accept=".json"
        onChange={handleImportJsonProject}
        className="hidden"
      />
      
      {/* 1. TOP MENUBAR */}
      <div className="h-10 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-3 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 font-black text-teal-400 mr-2 px-2 py-1 rounded-lg bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 text-xs shadow-lg shadow-teal-500/5">
            <Zap className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="tracking-wide">DESIGN STUDIO</span>
            <span className="text-[9px] px-1 py-0.2 bg-teal-500/20 text-teal-300 rounded font-mono">PRO</span>
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
                      <button onClick={() => { setShowOpenSavedModal(true); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-indigo-400" /> Open Template Library</span>
                      </button>
                      <button onClick={() => { jsonInputRef.current?.click(); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span className="flex items-center gap-2"><Upload className="w-4 h-4 text-cyan-400" /> Import Project JSON</span>
                      </button>
                      <button onClick={() => { pushHistory(objects); showToast('Design Saved!'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span className="flex items-center gap-2"><Save className="w-4 h-4 text-emerald-400" /> Save Design</span>
                      </button>
                      <button onClick={() => { handleExportCorelEmail('download'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Export HTML File</span> <Download className="w-3.5 h-3.5 text-teal-400" />
                      </button>
                      <button onClick={() => { handleExportCorelEmail('json'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Export Project JSON</span> <FileCode className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                    </>
                  )}

                  {menu.id === 'edit' && (
                    <>
                      <button onClick={() => { handleUndo(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"><span>Undo</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+Z</span></button>
                      <button onClick={() => { handleRedo(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"><span>Redo</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+Y</span></button>
                      <div className="my-1 border-t border-slate-800" />
                      <button onClick={() => { handleCopy(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"><span>Copy</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+C</span></button>
                      <button onClick={() => { handlePaste(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"><span>Paste</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+V</span></button>
                      <button onClick={() => { handleDuplicateSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"><span>Duplicate</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+D</span></button>
                      <button onClick={() => { handleDeleteSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-red-500/10 text-red-300 flex items-center justify-between"><span>Delete</span> <span className="font-mono text-[10px] text-red-400">Del</span></button>
                    </>
                  )}

                  {menu.id === 'view' && (
                    <>
                      <button onClick={() => setShowGrid(!showGrid)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Show Canvas Grid</span> {showGrid ? <Check className="w-3.5 h-3.5 text-teal-400" /> : null}
                      </button>
                      <button onClick={() => setSnapToGrid(!snapToGrid)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Snap to Grid</span> {snapToGrid ? <Check className="w-3.5 h-3.5 text-teal-400" /> : null}
                      </button>
                      <button onClick={() => setShowRulers(!showRulers)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Show Rulers</span> {showRulers ? <Check className="w-3.5 h-3.5 text-teal-400" /> : null}
                      </button>
                      <button onClick={() => setShowGuides(!showGuides)} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                        <span>Show Smart Alignment Guides</span> {showGuides ? <Check className="w-3.5 h-3.5 text-teal-400" /> : null}
                      </button>
                      <div className="my-1 border-t border-slate-800" />
                      {[50, 75, 100, 125, 150].map(z => (
                        <button key={z} onClick={() => { setZoomLevel(z); setOpenMenu(null); }} className="w-full px-3.5 py-1 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200">
                          <span>Zoom {z}%</span> {zoomLevel === z ? <Check className="w-3.5 h-3.5 text-teal-400" /> : null}
                        </button>
                      ))}
                    </>
                  )}

                  {menu.id === 'arrange' && (
                    <>
                      <button onClick={() => { handleAlign('left'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Align Left</button>
                      <button onClick={() => { handleAlign('center'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Align Center</button>
                      <button onClick={() => { handleAlign('right'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Align Right</button>
                      <div className="my-1 border-t border-slate-800" />
                      <button onClick={() => { handleLayerOrder('front'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Bring to Front</button>
                      <button onClick={() => { handleLayerOrder('back'); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Send to Back</button>
                      <div className="my-1 border-t border-slate-800" />
                      <button onClick={() => { handleGroupSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Group Objects</button>
                      <button onClick={() => { handleUngroupSelected(); setOpenMenu(null); }} className="w-full px-3.5 py-1.5 text-left text-xs hover:bg-slate-800 text-slate-200">Ungroup Objects</button>
                    </>
                  )}

                  {menu.id === 'help' && (
                    <>
                      <button onClick={() => { setShowHelpModal(true); setHelpTopic('shortcuts'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-teal-400" /> Keyboard Shortcuts
                      </button>
                      <button onClick={() => { setShowHelpModal(true); setHelpTopic('guide'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" /> Design Studio Guide
                      </button>
                      <button onClick={() => { setShowHelpModal(true); setHelpTopic('clients'); setOpenMenu(null); }} className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" /> Email Compatibility Guide
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
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl font-sans shadow-inner">
              <button
                onClick={() => setEditorMode('visual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editorMode === 'visual'
                    ? 'bg-white text-slate-950 shadow-md font-extrabold scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-950" />
                <span>Visual</span>
              </button>
              <button
                onClick={() => setEditorMode('design')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editorMode === 'design'
                    ? 'bg-white text-slate-950 shadow-md font-extrabold scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-slate-950" />
                <span>Design</span>
              </button>
              <button
                onClick={() => setEditorMode('text')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editorMode === 'text'
                    ? 'bg-white text-slate-950 shadow-md font-extrabold scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-950" />
                <span>Text</span>
              </button>
            </div>
          )}

          <button onClick={onCloseStudio} className="p-1 text-slate-400 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SUB-TOOLBAR RIBBON WITH ACTIONS */}
      <div className="h-11 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-3 flex items-center justify-between text-xs z-40 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMediaModal(true)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-teal-400" /> Insert Media (Images/GIFs/SVGs)
          </button>

          <button onClick={() => setShowSocialModal(true)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Add Social Links
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button onClick={handleUndo} disabled={historyIdx === 0} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800" title="Undo (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></button>
          <button onClick={handleRedo} disabled={historyIdx === history.length - 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800" title="Redo (Ctrl+Y)"><Redo2 className="w-3.5 h-3.5" /></button>
          
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
          <button onClick={handleRunPublishValidation} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs rounded-lg shadow-lg flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> Publish</button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT TOOLBOX (18 CorelDRAW / Figma Tools) */}
        <div className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-2 gap-1 z-40 overflow-y-auto scrollbar-none flex-shrink-0">
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
                    backgroundColor: '#EF4444',
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
                          { pos: 'sw', class: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
                          { pos: 'n', class: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
                          { pos: 's', class: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize' },
                          { pos: 'e', class: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize' },
                          { pos: 'w', class: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize' }
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
                        <div style={{ width: '100%', height: `${obj.strokeWidth || 2}px`, backgroundColor: obj.stroke || '#0284C7' }} />
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
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); updateObject(obj.id, 'hidden', !obj.hidden); }} className="text-slate-400 hover:text-white">
                      {obj.hidden ? <EyeOff className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); updateObject(obj.id, 'locked', !obj.locked); }} className="text-slate-400 hover:text-white">
                      {obj.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
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

                <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Position X (px)</label>
                    <input type="number" value={primarySelected.x} onChange={(e) => updateObject(primarySelected.id, 'x', parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Position Y (px)</label>
                    <input type="number" value={primarySelected.y} onChange={(e) => updateObject(primarySelected.id, 'y', parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Width W (px)</label>
                    <input type="number" value={primarySelected.width} onChange={(e) => updateObject(primarySelected.id, 'width', parseInt(e.target.value) || 10)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Height H (px)</label>
                    <input type="number" value={primarySelected.height} onChange={(e) => updateObject(primarySelected.id, 'height', parseInt(e.target.value) || 10)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono" />
                  </div>
                </div>

                {primarySelected.type === 'text' && (
                  <div className="space-y-3 border-t border-slate-800 pt-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Personalization Tag</label>
                      <select onChange={(e) => updateObject(primarySelected.id, 'text', primarySelected.text + ' ' + e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-teal-400 font-mono">
                        <option value="">+ Insert Personalization Tag</option>
                        <option value="{{first_name}}">First Name ({"{{first_name}}"})</option>
                        <option value="{{last_name}}">Last Name ({"{{last_name}}"})</option>
                        <option value="{{company}}">Company ({"{{company}}"})</option>
                        <option value="{{email}}">Recipient Email ({"{{email}}"})</option>
                        <option value="{{unsubscribe_url}}">Unsubscribe URL ({"{{unsubscribe_url}}"})</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Font Family</label>
                      <select value={primarySelected.fontFamily || 'Inter, sans-serif'} onChange={(e) => updateObject(primarySelected.id, 'fontFamily', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200">
                        {FONT_CATALOG.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Font Size (px)</label>
                        <input type="number" value={primarySelected.fontSize || 16} onChange={(e) => updateObject(primarySelected.id, 'fontSize', parseInt(e.target.value) || 12)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Font Weight</label>
                        <select value={primarySelected.fontWeight || '400'} onChange={(e) => updateObject(primarySelected.id, 'fontWeight', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono">
                          <option value="400">Regular (400)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

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
              setActiveStrokeColor(c);
              if (primarySelected) {
                if (primarySelected.type === 'text') updateObject(primarySelected.id, 'color', c);
                else updateObject(primarySelected.id, 'fill', c);
              }
            }}
            style={{ backgroundColor: c }}
            className="w-5 h-5 rounded-md border border-slate-700/80 shadow-sm flex-shrink-0 hover:scale-125 transition-transform"
          />
        ))}
      </div>

      {/* ADVANCED COLOR PICKER MODAL */}
      {showColorPickerModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-teal-400" /> Custom Color Picker
              </h4>
              <button onClick={() => setShowColorPickerModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customHexColor}
                  onChange={(e) => setCustomHexColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={customHexColor}
                  onChange={(e) => setCustomHexColor(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <button
                onClick={() => {
                  setActiveFillColor(customHexColor);
                  if (primarySelected) {
                    if (primarySelected.type === 'text') updateObject(primarySelected.id, 'color', customHexColor);
                    else updateObject(primarySelected.id, 'fill', customHexColor);
                  }
                  setShowColorPickerModal(false);
                  showToast(`Applied custom color ${customHexColor}`);
                }}
                className="w-full py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                Apply Custom Color
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPEN TEMPLATES LIBRARY MODAL */}
      {showOpenSavedModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" /> Open Design Studio Templates
              </h4>
              <button onClick={() => setShowOpenSavedModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {STUDIO_TEMPLATES.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => handleLoadTemplate(tpl)}
                  className="border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-teal-500 hover:bg-teal-500/5 transition-all space-y-2 bg-slate-950"
                >
                  <div className="font-bold text-xs text-white">{tpl.name}</div>
                  <div className="text-[11px] text-slate-400">{tpl.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MEDIA ASSET UPLOADER MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" /> Insert Media Asset (PNG, JPG, Animated GIF, SVG)
              </h4>
              <button onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

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

      {/* SOCIAL LINKS MODAL */}
      {showSocialModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" /> Configure Social Links Row
              </h4>
              <button onClick={() => setShowSocialModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {SOCIAL_PLATFORMS.map(sp => (
                <div key={sp.id} className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                    {sp.label} Target URL
                  </label>
                  <input
                    type="text"
                    defaultValue={sp.defaultUrl}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
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
              className="w-full py-2 bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              Insert Configured Social Row
            </button>
          </div>
        </div>
      )}

      {/* PRE-FLIGHT VALIDATION & PUBLISH REPORT MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-teal-400" /> Pre-Flight Email Audit Report
              </h4>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {validationResult && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {validationResult.issues.length === 0 ? (
                  <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                    <div className="text-sm font-bold text-white">All Pre-Flight Checks Passed!</div>
                    <div className="text-xs text-slate-400">Your design is 100% compliant with mobile & email client standards.</div>
                  </div>
                ) : (
                  validationResult.issues.map((iss, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${iss.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
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

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowPublishModal(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl">Back to Design</button>
              <button onClick={() => { setShowPublishModal(false); showToast('Design Published successfully!'); }} className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg">Confirm & Publish Now</button>
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

      {/* HELP & SHORTCUTS MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-400" /> Design Studio Help & Shortcuts
              </h4>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold border-b border-slate-800 pb-2">
              {[
                { id: 'shortcuts', label: 'Keyboard Shortcuts' },
                { id: 'guide', label: 'Design Guidelines' }
              ].map(t => (
                <button key={t.id} onClick={() => setHelpTopic(t.id)} className={`py-1.5 rounded-lg transition-colors ${helpTopic === t.id ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>{t.label}</button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs text-slate-300">
              {helpTopic === 'shortcuts' ? (
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>V</span><span className="text-teal-400">Selection Tool</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>T</span><span className="text-teal-400">Text Tool</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>R</span><span className="text-teal-400">Rectangle Tool</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>O</span><span className="text-teal-400">Ellipse Tool</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>Ctrl+Z</span><span className="text-teal-400">Undo Action</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>Ctrl+Y</span><span className="text-teal-400">Redo Action</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>Ctrl+D</span><span className="text-teal-400">Duplicate Object</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between"><span>Delete</span><span className="text-teal-400">Delete Object</span></div>
                </div>
              ) : (
                <div className="space-y-2 text-slate-300 leading-relaxed">
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
          className="fixed z-[999999] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 w-48 text-xs text-slate-200 animate-in fade-in duration-100"
        >
          <button onClick={() => { handleDuplicateSelected(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between"><span>Duplicate</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+D</span></button>
          <button onClick={() => { handleCopy(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between"><span>Copy</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+C</span></button>
          <button onClick={() => { handleCut(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between"><span>Cut</span> <span className="font-mono text-[10px] text-slate-400">Ctrl+X</span></button>
          <div className="my-1 border-t border-slate-800" />
          <button onClick={() => { handleLayerOrder('front'); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800">Bring to Front</button>
          <button onClick={() => { handleLayerOrder('back'); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800">Send to Back</button>
          <div className="my-1 border-t border-slate-800" />
          <button onClick={() => { handleDeleteSelected(); setContextMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-red-500/10 text-red-400 font-bold flex items-center justify-between"><span>Delete</span> <span className="font-mono text-[10px]">Del</span></button>
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
