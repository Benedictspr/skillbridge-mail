import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Copy, Lock, Unlock, ArrowUp, ArrowDown, Move, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Tag,
  Eye, EyeOff, Sparkles, ChevronDown, Check, MousePointerClick, Play, Film, X,
  Type, Palette, Sliders, Wand2, Edit3, ExternalLink
} from 'lucide-react';
import { UniformSocialIcon } from './socialIcons';
import { FONT_CATALOG } from './fonts';

export default function DesignerCanvas({
  emailData,
  setEmailData,
  selectedId,
  setSelectedId,
  selectedType,
  setSelectedType,
  zoomLevel,
  previewDevice,
  onDropComponent,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlock
}) {
  const [dragOverSecId, setDragOverSecId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [activeVideoModalUrl, setActiveVideoModalUrl] = useState(null);

  const containerRef = useRef(null);
  const body = emailData.body || { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, sans-serif' };
  const sections = emailData.sections || [];

  const scale = zoomLevel / 100;
  const canvasWidth = previewDevice === 'mobile' ? 375 : body.width;

  const handleDragOver = (e, secId) => {
    e.preventDefault();
    setDragOverSecId(secId);
  };

  const handleDragLeave = () => {
    setDragOverSecId(null);
  };

  const handleDrop = (e, secId, colId) => {
    e.preventDefault();
    setDragOverSecId(null);
    const cmpType = e.dataTransfer.getData('skillbridge_cmp_type');
    if (cmpType) {
      onDropComponent(cmpType, secId, colId);
    }
  };

  const handleUpdateComponentProp = (cmpId, key, val) => {
    setEmailData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => ({
        ...sec,
        rows: sec.rows.map(row => ({
          ...row,
          columns: row.columns.map(col => ({
            ...col,
            components: col.components.map(cmp => {
              if (cmp.id !== cmpId) return cmp;
              if (key === 'text' || key === 'content') {
                return { ...cmp, text: val, content: val };
              }
              return { ...cmp, [key]: val };
            })
          }))
        }))
      }))
    }));
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-950/90 overflow-auto relative flex flex-col items-center py-12 px-6 min-h-[calc(100vh-3.5rem)] select-none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
      onClick={(e) => {
        if (e.target === containerRef.current) {
          setSelectedId(null);
          setSelectedType('body');
        }
      }}
    >
      
      {/* Zoom / Device Container Frame */}
      <div
        className="transition-all duration-200 shadow-2xl rounded-2xl border border-slate-800 bg-white relative"
        style={{
          width: `${canvasWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: `${(scale - 1) * 400}px`
        }}
      >

        {/* EMAIL BODY ARTBOARD */}
        <div
          className="rounded-2xl overflow-hidden min-h-[600px] transition-colors"
          style={{ backgroundColor: body.bg, fontFamily: body.fontFamily || 'Inter, sans-serif' }}
        >

          {/* SECTIONS TREE */}
          {sections.map((sec, secIdx) => {
            const isSecSelected = selectedId === sec.id;
            const isDragOver = dragOverSecId === sec.id;

            return (
              <div
                key={sec.id}
                onDragOver={(e) => handleDragOver(e, sec.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, sec.id, sec.rows[0]?.columns[0]?.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(sec.id);
                  setSelectedType('section');
                }}
                className={`relative group/sec transition-all ${isSecSelected ? 'outline outline-2 outline-teal-500 outline-offset-[-2px] z-20' : 'hover:outline hover:outline-1 hover:outline-teal-400/50 hover:outline-offset-[-1px]'} ${isDragOver ? 'bg-teal-500/10 outline outline-2 outline-dashed outline-teal-400' : ''}`}
                style={{
                  backgroundColor: sec.bg || 'transparent',
                  paddingTop: `${sec.paddingTop ?? 32}px`,
                  paddingBottom: `${sec.paddingBottom ?? 32}px`,
                  paddingLeft: `${sec.paddingLeft ?? 24}px`,
                  paddingRight: `${sec.paddingRight ?? 24}px`
                }}
              >

                {/* Section Action Overlay Header */}
                <div className={`absolute top-2 right-2 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-1 text-white shadow-xl opacity-0 group-hover/sec:opacity-100 transition-opacity z-30 ${isSecSelected ? 'opacity-100' : ''}`}>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1.5">Section #{secIdx + 1}</span>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveBlock(sec.id, 'up'); }}
                    disabled={secIdx === 0}
                    className="p-1 hover:bg-slate-800 rounded disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3 text-slate-300" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveBlock(sec.id, 'down'); }}
                    disabled={secIdx === sections.length - 1}
                    className="p-1 hover:bg-slate-800 rounded disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3 text-slate-300" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateBlock(sec.id); }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                    title="Duplicate Section"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(sec.id); }}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* ROWS & COLUMNS */}
                {(sec.rows || []).map((row) => (
                  <div key={row.id} className="flex flex-wrap -mx-2">
                    {(row.columns || []).map((col) => (
                      <div
                        key={col.id}
                        className="px-2 flex-1 min-w-[200px]"
                        style={{ flexBasis: col.width || '100%' }}
                      >
                        
                        {/* COMPONENTS INSIDE COLUMN */}
                        {(col.components || []).map((cmp) => {
                          const isCmpSelected = selectedId === cmp.id;
                          const isTextType = ['heading', 'text', 'paragraph', 'button', 'badge', 'callout', 'footer'].includes(cmp.type);

                          return (
                            <div
                              key={cmp.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(cmp.id);
                                setSelectedType('component');
                              }}
                              className={`relative group/cmp transition-all rounded-lg ${isCmpSelected ? 'outline outline-2 outline-teal-500 outline-offset-1 z-30' : 'hover:outline hover:outline-1 hover:outline-teal-400/60'}`}
                            >
                              
                              {/* CORELDRAW / FIGMA FLOATING QUICK TEXT FORMATTING TOOLBAR */}
                              {isCmpSelected && (
                                <div
                                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-teal-500/60 rounded-xl px-2 py-1 shadow-2xl flex items-center gap-1.5 z-50 text-white animate-in fade-in duration-150 whitespace-nowrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Font Family Quick Select */}
                                  <select
                                    value={cmp.fontFamily || FONT_CATALOG[0].family}
                                    onChange={(e) => handleUpdateComponentProp(cmp.id, 'fontFamily', e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-200 focus:outline-none max-w-[90px] truncate"
                                    title="Font Family"
                                  >
                                    {FONT_CATALOG.map(f => (
                                      <option key={f.name} value={f.family}>{f.name}</option>
                                    ))}
                                  </select>

                                  <div className="w-px h-3 bg-slate-800 my-auto" />

                                  {/* Font Size Quick Buttons */}
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() => handleUpdateComponentProp(cmp.id, 'size', Math.max(10, (cmp.size || 16) - 2))}
                                      className="w-5 h-5 rounded bg-slate-950 hover:bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center border border-slate-800"
                                      title="Decrease Size"
                                    >
                                      –
                                    </button>
                                    <span className="text-[10px] font-bold text-teal-400 px-1">{cmp.size || 16}px</span>
                                    <button
                                      onClick={() => handleUpdateComponentProp(cmp.id, 'size', Math.min(72, (cmp.size || 16) + 2))}
                                      className="w-5 h-5 rounded bg-slate-950 hover:bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center border border-slate-800"
                                      title="Increase Size"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="w-px h-3 bg-slate-800 my-auto" />

                                  {/* Bold Toggle */}
                                  <button
                                    onClick={() => handleUpdateComponentProp(cmp.id, 'weight', cmp.weight === '700' ? '400' : '700')}
                                    className={`p-1 rounded text-xs transition-colors ${cmp.weight === '700' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                                    title="Bold Toggle"
                                  >
                                    <Bold className="w-3 h-3" />
                                  </button>

                                  {/* Color Picker Swatch */}
                                  <label className="relative flex items-center cursor-pointer" title="Text Color">
                                    <input
                                      type="color"
                                      value={cmp.color || '#0F172A'}
                                      onChange={(e) => handleUpdateComponentProp(cmp.id, 'color', e.target.value)}
                                      className="sr-only"
                                    />
                                    <span className="w-4 h-4 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: cmp.color || '#0F172A' }} />
                                  </label>

                                  <div className="w-px h-3 bg-slate-800 my-auto" />

                                  {/* Alignment Selector */}
                                  <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
                                    {['left', 'center', 'right'].map(align => (
                                      <button
                                        key={align}
                                        onClick={() => handleUpdateComponentProp(cmp.id, 'align', align)}
                                        className={`p-0.5 rounded transition-colors ${cmp.align === align ? 'bg-slate-800 text-teal-400' : 'text-slate-400'}`}
                                      >
                                        {align === 'left' && <AlignLeft className="w-3 h-3" />}
                                        {align === 'center' && <AlignCenter className="w-3 h-3" />}
                                        {align === 'right' && <AlignRight className="w-3 h-3" />}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Insert Tag Quick Button */}
                                  <button
                                    onClick={() => {
                                      const currentVal = cmp.text || cmp.content || '';
                                      handleUpdateComponentProp(cmp.id, 'text', currentVal + ' {{first_name}}');
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 text-teal-400 text-[9px] font-mono font-bold rounded border border-slate-800"
                                    title="Insert {{first_name}}"
                                  >
                                    +Name
                                  </button>

                                  <div className="w-px h-3 bg-slate-800 my-auto" />

                                  {/* Delete Component Button */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(cmp.id); }}
                                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                                    title="Delete Element"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {/* COMPONENT RENDERER */}
                              <ComponentCanvasView
                                cmp={cmp}
                                isEditing={editingTextId === cmp.id}
                                onStartEdit={() => setEditingTextId(cmp.id)}
                                onTextChange={(val) => handleUpdateComponentProp(cmp.id, 'text', val)}
                                onOpenVideoModal={(url) => setActiveVideoModalUrl(url)}
                              />

                            </div>
                          );
                        })}

                      </div>
                    ))}
                  </div>
                ))}

                {/* Dropzone Placeholder inside Section */}
                <div
                  onDrop={(e) => handleDrop(e, sec.id, sec.rows[0]?.columns[0]?.id)}
                  className="mt-3 border-2 border-dashed border-slate-300 hover:border-teal-500/80 rounded-xl p-3 text-center transition-colors cursor-pointer group/dp"
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 group-hover/dp:text-teal-600">
                    <Plus className="w-4 h-4" /> Drop component here
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Add New Section Button */}
      <button
        onClick={() => {
          const newSec = {
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
                      { id: `cmp-${Date.now()}`, type: 'text', content: 'New text block. Double-click to edit.' }
                    ]
                  }
                ]
              }
            ]
          };
          setEmailData(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
        }}
        className="mt-6 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold text-xs rounded-xl border border-slate-800 shadow-xl transition-all hover:scale-105 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Section
      </button>

      {/* VIDEO PREVIEW PLAYER MODAL */}
      {activeVideoModalUrl && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-4 relative shadow-2xl">
            <div className="flex justify-between items-center mb-3 px-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-teal-400" /> Video Preview Player
              </h4>
              <button onClick={() => setActiveVideoModalUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              {activeVideoModalUrl.includes('youtube.com') || activeVideoModalUrl.includes('youtu.be') ? (
                <iframe
                  src={activeVideoModalUrl.replace('watch?v=', 'embed/')}
                  title="Video Player"
                  className="w-full h-full border-none"
                  allowFullScreen
                />
              ) : (
                <video src={activeVideoModalUrl} controls autoPlay className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT CANVAS VIEW RENDERER WITH LIVE INTERACTIVITY
// ----------------------------------------------------------------------
function ComponentCanvasView({ cmp, isEditing, onStartEdit, onTextChange, onOpenVideoModal }) {
  const pt = cmp.paddingTop ?? 12;
  const pb = cmp.paddingBottom ?? 12;

  // Real-time ticking countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 36, seconds: 42 });

  useEffect(() => {
    if (cmp.type !== 'countdown') return;

    const targetDate = cmp.endDate ? new Date(cmp.endDate).getTime() : Date.now() + (86400000 * 3);

    const updateTimer = () => {
      const diff = Math.max(0, targetDate - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cmp.endDate, cmp.type]);

  const fontStyle = {
    fontFamily: cmp.fontFamily || 'inherit'
  };

  switch (cmp.type) {
    case 'heading':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'left' }}>
          {isEditing ? (
            <input
              type="text"
              value={cmp.text || ''}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={() => onStartEdit(null)}
              autoFocus
              className="w-full bg-teal-50 border border-teal-400 rounded px-2 py-1 font-bold text-gray-900 focus:outline-none"
              style={{ fontSize: `${cmp.size || 24}px`, ...fontStyle }}
            />
          ) : (
            <h1
              onDoubleClick={onStartEdit}
              style={{
                fontSize: `${cmp.size || 24}px`,
                fontWeight: cmp.weight || '700',
                color: cmp.color || '#0F172A',
                margin: 0,
                ...fontStyle
              }}
              className="cursor-text"
            >
              {cmp.text || 'Heading Title'}
            </h1>
          )}
        </div>
      );

    case 'text':
    case 'paragraph':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'left' }}>
          {isEditing ? (
            <textarea
              rows={3}
              value={cmp.content || cmp.text || ''}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={() => onStartEdit(null)}
              autoFocus
              className="w-full bg-teal-50 border border-teal-400 rounded p-2 text-gray-900 focus:outline-none font-sans"
              style={{ fontSize: `${cmp.size || 16}px`, ...fontStyle }}
            />
          ) : (
            <div
              onDoubleClick={onStartEdit}
              style={{
                fontSize: `${cmp.size || 16}px`,
                color: cmp.color || '#334155',
                lineHeight: cmp.lineHeight || '1.6',
                whiteSpace: 'pre-wrap',
                ...fontStyle
              }}
              className="cursor-text"
            >
              {cmp.content || cmp.text || 'Paragraph text block...'}
            </div>
          )}
        </div>
      );

    case 'button':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'center' }}>
          <a
            href={cmp.url || '#'}
            onClick={(e) => e.preventDefault()}
            style={{
              backgroundColor: cmp.bg || '#007C89',
              color: cmp.color || '#FFFFFF',
              borderRadius: `${cmp.borderRadius || 8}px`,
              padding: `${cmp.paddingV || 14}px ${cmp.paddingH || 32}px`,
              display: 'inline-block',
              fontWeight: 'bold',
              textDecoration: 'none',
              ...fontStyle
            }}
            className="shadow-md hover:opacity-90 transition-opacity"
          >
            {cmp.text || 'Click Here'}
          </a>
        </div>
      );

    case 'badge':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'left' }}>
          <span
            style={{
              backgroundColor: cmp.bg || '#EFF6FF',
              color: cmp.color || '#3B82F6',
              border: `1px solid ${cmp.border || '#BFDBFE'}`
            }}
            className="text-xs font-bold px-3 py-1 rounded-full inline-block uppercase tracking-wider"
          >
            {cmp.text || 'Badge Tag'}
          </span>
        </div>
      );

    case 'image':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'center' }}>
          {cmp.url ? (
            <img
              src={cmp.url}
              alt={cmp.alt || ''}
              style={{
                width: cmp.width || '100%',
                borderRadius: `${cmp.borderRadius || 8}px`
              }}
              className="inline-block max-w-full shadow-sm"
            />
          ) : (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 font-semibold text-xs">
              No Image Source Selected
            </div>
          )}
        </div>
      );

    case 'divider':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}>
          <hr style={{ borderTop: `1px ${cmp.style || 'solid'} ${cmp.color || '#E2E8F0'}` }} className="border-0 m-0" />
        </div>
      );

    case 'spacer':
      return <div style={{ height: `${cmp.height || 24}px` }} />;

    case 'callout':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}>
          <div
            style={{
              backgroundColor: cmp.bg || '#F8FAFC',
              borderLeft: `4px solid ${cmp.border || '#007C89'}`,
              color: cmp.color || '#0F172A'
            }}
            className="p-4 rounded-r-xl shadow-sm"
          >
            {cmp.title && <div className="font-bold text-sm mb-1">{cmp.title}</div>}
            <div className="text-xs leading-relaxed">{cmp.content}</div>
          </div>
        </div>
      );

    case 'countdown':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'center' }}>
          <div style={{ backgroundColor: cmp.bg || '#1E2937' }} className="p-5 rounded-2xl shadow-xl text-white">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">
              {cmp.label || 'PROMOTION ENDS IN:'}
            </div>
            <div className="flex justify-center gap-3 font-mono">
              <div className="bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-center">
                <span className="text-xl font-extrabold text-amber-400">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="block text-[9px] text-slate-400 font-sans uppercase">Days</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-center">
                <span className="text-xl font-extrabold text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="block text-[9px] text-slate-400 font-sans uppercase">Hours</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-center">
                <span className="text-xl font-extrabold text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="block text-[9px] text-slate-400 font-sans uppercase">Mins</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-center">
                <span className="text-xl font-extrabold text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="block text-[9px] text-slate-400 font-sans uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'video':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'center' }}>
          <div
            onClick={() => onOpenVideoModal(cmp.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            className="group relative inline-block rounded-xl overflow-hidden cursor-pointer shadow-lg max-w-full"
          >
            <img
              src={cmp.url || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80'}
              alt="Video Thumbnail"
              className="w-full max-w-[540px] rounded-xl group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 flex items-center justify-center transition-colors">
              <div className="w-14 h-14 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'social':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'center' }}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(cmp.platforms || ['telegram', 'twitter', 'linkedin', 'instagram', 'github']).map(plat => {
              const targetUrl = (cmp.urls && cmp.urls[plat]) || '#';
              return (
                <a
                  key={plat}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.preventDefault()}
                  title={`Social Link: ${targetUrl}`}
                >
                  <UniformSocialIcon
                    platformId={plat}
                    size={cmp.iconSize || 24}
                    style={cmp.iconStyle || 'colored'}
                  />
                </a>
              );
            })}
          </div>
        </div>
      );

    case 'footer':
      return (
        <div style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px`, textAlign: cmp.align || 'center' }}>
          <div style={{ fontSize: `${cmp.size || 12}px`, color: cmp.color || '#94A3B8', ...fontStyle }}>
            {cmp.text || 'SkillBridge Network • Unsubscribe'}
          </div>
        </div>
      );

    default:
      return null;
  }
}
