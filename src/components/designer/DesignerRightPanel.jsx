import React, { useState } from 'react';
import { 
  Sliders, AlignLeft, AlignCenter, AlignRight, Palette, Layout, 
  Maximize2, Type, MoveVertical, Sparkles, Smartphone, Eye, ShieldCheck,
  Link, CornerDownRight, Plus, Hash, Upload, Image as ImageIcon, Video, Clock, Share2,
  ChevronRight, Globe, ExternalLink
} from 'lucide-react';
import { FONT_CATALOG } from './fonts';
import { SOCIAL_PLATFORMS } from './socialIcons';

export default function DesignerRightPanel({
  isOpen = true,
  onToggleOpen,
  selectedId,
  selectedType,
  emailData,
  setEmailData
}) {
  const [activeTab, setActiveTab] = useState('style'); // 'style' | 'layout'

  if (!isOpen) return null;

  if (!selectedId && selectedType !== 'body') {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800/80 p-6 flex flex-col items-center justify-center text-center h-[calc(100vh-3.5rem)] z-30 select-none relative">
        <div className="absolute top-3 left-3 flex items-center">
          <button
            onClick={onToggleOpen}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold"
            title="Minimize Right Panel"
          >
            <span>Minimize</span>
            <ChevronRight className="w-4 h-4 text-teal-400" />
          </button>
        </div>
        <Sliders className="w-10 h-10 text-slate-700 mb-3" />
        <h3 className="text-sm font-bold text-slate-300">No Element Selected</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Click on any section, text, button, image, video, or countdown timer on the canvas to inspect and edit its properties.
        </p>
      </div>
    );
  }

  // Find target block data
  let target = null;
  if (selectedType === 'body') {
    target = emailData.body || { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, sans-serif' };
  } else if (selectedType === 'section') {
    target = (emailData.sections || []).find(s => s.id === selectedId);
  } else if (selectedType === 'component') {
    (emailData.sections || []).forEach(sec => {
      (sec.rows || []).forEach(row => {
        (row.columns || []).forEach(col => {
          (col.components || []).forEach(cmp => {
            if (cmp.id === selectedId) target = cmp;
          });
        });
      });
    });
  }

  if (!target) return null;

  // Helper updater for properties
  const updateTarget = (key, value) => {
    setEmailData(prev => {
      if (selectedType === 'body') {
        return { ...prev, body: { ...prev.body, [key]: value } };
      }

      if (selectedType === 'section') {
        const nextSecs = prev.sections.map(sec => {
          if (sec.id !== selectedId) return sec;
          return { ...sec, [key]: value };
        });
        return { ...prev, sections: nextSecs };
      }

      if (selectedType === 'component') {
        const nextSecs = prev.sections.map(sec => ({
          ...sec,
          rows: sec.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => ({
              ...col,
              components: col.components.map(cmp => {
                if (cmp.id !== selectedId) return cmp;
                return { ...cmp, [key]: value };
              })
            }))
          }))
        }));
        return { ...prev, sections: nextSecs };
      }

      return prev;
    });
  };

  // Image / Media file upload reader
  const handleFileUpload = (e, fieldName = 'url') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateTarget(fieldName, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertMergeTag = (tag) => {
    const currentContent = target.content || target.text || '';
    updateTarget('text', currentContent + ' ' + tag);
    updateTarget('content', currentContent + ' ' + tag);
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800/80 flex flex-col h-[calc(100vh-3.5rem)] z-30 select-none relative">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Properties Inspector</div>
          <div className="text-xs font-extrabold text-white capitalize mt-0.5">
            {selectedType === 'body' ? 'Email Body Container' : (target.type || selectedType)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('style')}
              className={`px-2 py-1 text-[10px] font-bold rounded ${activeTab === 'style' ? 'bg-slate-800 text-teal-400' : 'text-slate-400'}`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-2 py-1 text-[10px] font-bold rounded ${activeTab === 'layout' ? 'bg-slate-800 text-teal-400' : 'text-slate-400'}`}
            >
              Layout
            </button>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Minimize Right Panel"
          >
            <ChevronRight className="w-4 h-4 text-teal-400" />
          </button>
        </div>
      </div>

      {/* Property Controls Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* 1. BODY CONTAINER PROPERTIES */}
        {selectedType === 'body' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={target.bg || '#F8FAFC'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-800 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={target.bg || '#F8FAFC'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Canvas Width ({target.width || 640}px)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[560, 600, 640, 700].map(w => (
                  <button
                    key={w}
                    onClick={() => updateTarget('width', w)}
                    className={`py-1.5 rounded text-xs font-bold ${target.width === w ? 'bg-teal-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Global Font Family (Google & System)</label>
              <select
                value={target.fontFamily || FONT_CATALOG[0].family}
                onChange={(e) => updateTarget('fontFamily', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
              >
                {FONT_CATALOG.map(f => (
                  <option key={f.name} value={f.family}>{f.name} ({f.type.toUpperCase()})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 2. SECTION PROPERTIES */}
        {selectedType === 'section' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Section Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={target.bg || '#FFFFFF'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-800 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={target.bg || '#FFFFFF'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Vertical Padding Top</span>
                <span>{target.paddingTop ?? 32}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={target.paddingTop ?? 32}
                onChange={(e) => updateTarget('paddingTop', parseInt(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Vertical Padding Bottom</span>
                <span>{target.paddingBottom ?? 32}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={target.paddingBottom ?? 32}
                onChange={(e) => updateTarget('paddingBottom', parseInt(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>
        )}

        {/* 3. HEADING & TEXT COMPONENTS */}
        {(target.type === 'heading' || target.type === 'text' || target.type === 'paragraph') && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Text Content</label>
              <textarea
                rows={4}
                value={target.content || target.text || ''}
                onChange={(e) => {
                  updateTarget('text', e.target.value);
                  updateTarget('content', e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Font Family</label>
              <select
                value={target.fontFamily || FONT_CATALOG[0].family}
                onChange={(e) => updateTarget('fontFamily', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
              >
                {FONT_CATALOG.map(f => (
                  <option key={f.name} value={f.family}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Merge Tag Inserters */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Insert Dynamic Merge Tags</div>
              <div className="flex flex-wrap gap-1">
                {['{{first_name}}', '{{last_name}}', '{{company}}', '{{role}}', '{{email}}'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => insertMergeTag(tag)}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-teal-400 text-[10px] font-mono rounded border border-slate-800"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Font Size ({target.size || 16}px)</label>
                <input
                  type="number"
                  value={target.size || 16}
                  onChange={(e) => updateTarget('size', parseInt(e.target.value) || 16)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Font Weight</label>
                <select
                  value={target.weight || '400'}
                  onChange={(e) => updateTarget('weight', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                >
                  <option value="400">Regular (400)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Text Alignment</label>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateTarget('align', align)}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded transition-colors ${target.align === align ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400'}`}
                  >
                    {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Text Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={target.color || '#0F172A'}
                  onChange={(e) => updateTarget('color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-800 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={target.color || '#0F172A'}
                  onChange={(e) => updateTarget('color', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. BUTTON COMPONENT */}
        {target.type === 'button' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Button Text</label>
              <input
                type="text"
                value={target.text || ''}
                onChange={(e) => updateTarget('text', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Link URL</label>
              <input
                type="text"
                value={target.url || ''}
                onChange={(e) => updateTarget('url', e.target.value)}
                placeholder="https://t.me/..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={target.bg || '#007C89'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-800 bg-slate-950 cursor-pointer"
                />
                <input
                  type="text"
                  value={target.bg || '#007C89'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. IMAGE COMPONENT WITH FILE UPLOADER */}
        {target.type === 'image' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Upload Image File (SVG, PNG, JPG, GIF)</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-teal-500 rounded-xl p-4 cursor-pointer bg-slate-950 transition-colors">
                <Upload className="w-6 h-6 text-teal-400 mb-1" />
                <span className="text-xs font-bold text-slate-300">Choose Image or Drag File</span>
                <span className="text-[10px] text-slate-500">Supports SVG, GIF, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Image Source URL</label>
              <input
                type="text"
                value={target.url || ''}
                onChange={(e) => updateTarget('url', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Alt Text (Accessibility)</label>
              <input
                type="text"
                value={target.alt || ''}
                onChange={(e) => updateTarget('alt', e.target.value)}
                placeholder="Describe image..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        )}

        {/* 6. SOCIAL MEDIA ICONS CUSTOM URLS */}
        {target.type === 'social' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400" /> Social Icons Target URLs
              </label>
              <p className="text-[11px] text-slate-400">Specify custom destination links for each social icon:</p>

              <div className="space-y-3 mt-2">
                {SOCIAL_PLATFORMS.map(plat => {
                  const isEnabled = (target.platforms || []).includes(plat.id);
                  const currentUrl = (target.urls && target.urls[plat.id]) || plat.defaultUrl;

                  return (
                    <div key={plat.id} className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plat.color }} />
                          <span className="text-xs font-bold text-slate-200">{plat.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            const currentPlats = target.platforms || [];
                            const nextPlats = e.target.checked 
                              ? [...currentPlats, plat.id] 
                              : currentPlats.filter(id => id !== plat.id);
                            updateTarget('platforms', nextPlats);
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-teal-500 accent-teal-500 cursor-pointer"
                        />
                      </div>

                      {isEnabled && (
                        <div className="pt-1 space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-slate-500" /> Custom Destination URL
                          </label>
                          <input
                            type="text"
                            value={currentUrl}
                            onChange={(e) => {
                              const nextUrls = { ...(target.urls || {}), [plat.id]: e.target.value };
                              updateTarget('urls', nextUrls);
                            }}
                            placeholder={plat.defaultUrl}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 7. COUNTDOWN TIMER COMPONENT */}
        {target.type === 'countdown' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Header Label Text</label>
              <input
                type="text"
                value={target.label || 'PROMOTION ENDS IN:'}
                onChange={(e) => updateTarget('label', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target End Date & Time</label>
              <input
                type="datetime-local"
                value={target.endDate ? new Date(target.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateTarget('endDate', new Date(e.target.value).toISOString())}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
