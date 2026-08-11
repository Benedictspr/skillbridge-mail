import React, { useState } from 'react';
import { 
  Sliders, AlignLeft, AlignCenter, AlignRight, Palette, Layout, 
  Maximize2, Type, MoveVertical, Sparkles, Smartphone, Eye, ShieldCheck,
  Link, CornerDownRight, Plus, Hash, Upload, Image as ImageIcon, Video, Clock, Share2,
  ChevronRight, Globe, ExternalLink, Bold, Quote, List, Menu, Code
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
      <div className="w-80 bg-[#121212] border-l border-zinc-800 p-6 flex flex-col items-center justify-center text-center h-[calc(100vh-3rem)] z-30 select-none relative text-white font-sans">
        <div className="absolute top-3 left-3 flex items-center">
          <button
            onClick={onToggleOpen}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
            title="Minimize Right Inspector Panel"
          >
            <span>Minimize</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
        <Sliders className="w-10 h-10 text-zinc-700 mb-3" />
        <h3 className="text-sm font-bold text-white">No Element Selected</h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-normal">
          Click on any canvas section, heading, text, button, image, video, or countdown block to inspect and edit properties.
        </p>
      </div>
    );
  }

  // Find target block data
  let target = null;
  if (selectedType === 'body') {
    target = emailData?.body || { bg: '#FFFFFF', width: 640, fontFamily: 'Inter, sans-serif' };
  } else if (selectedType === 'section') {
    target = (emailData?.sections || []).find(s => s.id === selectedId);
  } else if (selectedType === 'component') {
    (emailData?.sections || []).forEach(sec => {
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
    <div className="w-80 bg-[#121212] border-l border-zinc-800 flex flex-col h-[calc(100vh-3rem)] z-30 select-none relative text-white font-sans">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-zinc-800 bg-[#09090B] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Properties Inspector</div>
          <div className="text-xs font-extrabold text-white capitalize mt-0.5">
            {selectedType === 'body' ? 'Email Body Container' : (target.type || selectedType)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab('style')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTab === 'style' ? 'bg-white text-black font-extrabold shadow-xs' : 'text-zinc-400'}`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTab === 'layout' ? 'bg-white text-black font-extrabold shadow-xs' : 'text-zinc-400'}`}
            >
              Layout
            </button>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Minimize Panel"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Property Controls Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 font-sans">

        {/* 1. BODY CONTAINER PROPERTIES */}
        {selectedType === 'body' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={target.bg || '#FFFFFF'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-800 bg-black cursor-pointer"
                />
                <input
                  type="text"
                  value={target.bg || '#FFFFFF'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Canvas Width ({target.width || 640}px)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[560, 600, 640, 700].map(w => (
                  <button
                    key={w}
                    onClick={() => updateTarget('width', w)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${target.width === w ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-black text-zinc-400 border border-zinc-800'}`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Global Font Family (Google & System)</label>
              <select
                value={target.fontFamily || FONT_CATALOG[0].family}
                onChange={(e) => updateTarget('fontFamily', e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
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
              <label className="text-xs font-semibold text-zinc-300">Section Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={target.bg || '#FFFFFF'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-800 bg-black cursor-pointer"
                />
                <input
                  type="text"
                  value={target.bg || '#FFFFFF'}
                  onChange={(e) => updateTarget('bg', e.target.value)}
                  className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>Vertical Padding Top</span>
                <span>{target.paddingTop ?? 32}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={target.paddingTop ?? 32}
                onChange={(e) => updateTarget('paddingTop', parseInt(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>Vertical Padding Bottom</span>
                <span>{target.paddingBottom ?? 32}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={target.paddingBottom ?? 32}
                onChange={(e) => updateTarget('paddingBottom', parseInt(e.target.value))}
                className="w-full accent-white"
              />
            </div>
          </div>
        )}

        {/* 3. COMPONENT PROPERTIES */}
        {selectedType === 'component' && (
          <div className="space-y-4">
            
            {/* Text & Heading Component Properties */}
            {(target.type === 'heading' || target.type === 'text' || target.type === 'paragraph' || target.type === 'rich_text') && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Text Content</label>
                  <textarea
                    rows={4}
                    value={target.type === 'heading' ? (target.text || '') : (target.content || target.text || '')}
                    onChange={(e) => {
                      if (target.type === 'heading') updateTarget('text', e.target.value);
                      else updateTarget('content', e.target.value);
                    }}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-sans"
                  />

                  {/* Insert Merge Tag Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['{{first_name}}', '{{company}}', '{{role}}', '{{email}}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertMergeTag(tag)}
                        className="px-2 py-0.5 bg-black border border-zinc-800 hover:border-zinc-500 rounded text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={target.color || '#0F172A'}
                      onChange={(e) => updateTarget('color', e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-800 bg-black cursor-pointer"
                    />
                    <input
                      type="text"
                      value={target.color || '#0F172A'}
                      onChange={(e) => updateTarget('color', e.target.value)}
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Text Alignment</label>
                  <div className="grid grid-cols-3 gap-1 bg-black p-1 border border-zinc-800 rounded-xl">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => updateTarget('align', align)}
                        className={`py-1.5 rounded-lg text-xs capitalize font-semibold transition-all cursor-pointer ${target.align === align ? 'bg-white text-black font-extrabold shadow-xs' : 'text-zinc-400'}`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-300">
                    <span>Font Size</span>
                    <span>{target.size || 16}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={target.size || 16}
                    onChange={(e) => updateTarget('size', parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </>
            )}

            {/* Button CTA Component Properties */}
            {target.type === 'button' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Button Label</label>
                  <input
                    type="text"
                    value={target.text || ''}
                    onChange={(e) => updateTarget('text', e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Destination Link URL</label>
                  <input
                    type="text"
                    value={target.url || ''}
                    onChange={(e) => updateTarget('url', e.target.value)}
                    placeholder="https://sendaat.io"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Button Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={target.bg || '#007C89'}
                      onChange={(e) => updateTarget('bg', e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-800 bg-black cursor-pointer"
                    />
                    <input
                      type="text"
                      value={target.bg || '#007C89'}
                      onChange={(e) => updateTarget('bg', e.target.value)}
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={target.color || '#FFFFFF'}
                      onChange={(e) => updateTarget('color', e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-800 bg-black cursor-pointer"
                    />
                    <input
                      type="text"
                      value={target.color || '#FFFFFF'}
                      onChange={(e) => updateTarget('color', e.target.value)}
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Button Corner Radius</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 8, 16, 9999].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateTarget('borderRadius', r)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${target.borderRadius === r ? 'bg-white text-black font-extrabold shadow-xs' : 'bg-black text-zinc-400 border border-zinc-800'}`}
                      >
                        {r === 9999 ? 'Pill' : `${r}px`}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Hero Header Component Properties */}
            {target.type === 'hero' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Hero Main Title</label>
                  <input
                    type="text"
                    value={target.title || target.text || ''}
                    onChange={(e) => {
                      updateTarget('title', e.target.value);
                      updateTarget('text', e.target.value);
                    }}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={target.subtitle || target.content || ''}
                    onChange={(e) => {
                      updateTarget('subtitle', e.target.value);
                      updateTarget('content', e.target.value);
                    }}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Hero CTA Button Text</label>
                  <input
                    type="text"
                    value={target.buttonText || ''}
                    onChange={(e) => updateTarget('buttonText', e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Hero CTA Link URL</label>
                  <input
                    type="text"
                    value={target.buttonUrl || ''}
                    onChange={(e) => updateTarget('buttonUrl', e.target.value)}
                    placeholder="https://sendaat.io"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </>
            )}

            {/* Image Media Component Properties */}
            {target.type === 'image' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Image Source URL</label>
                  <input
                    type="text"
                    value={target.url || ''}
                    onChange={(e) => updateTarget('url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Upload Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'url')}
                    className="w-full text-xs text-zinc-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Alt Text Description</label>
                  <input
                    type="text"
                    value={target.alt || ''}
                    onChange={(e) => updateTarget('alt', e.target.value)}
                    placeholder="Image description..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Image Link Destination</label>
                  <input
                    type="text"
                    value={target.linkUrl || ''}
                    onChange={(e) => updateTarget('linkUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </>
            )}

            {/* Video Component Properties */}
            {target.type === 'video' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Video Destination URL (YouTube/Vimeo)</label>
                  <input
                    type="text"
                    value={target.videoUrl || target.url || ''}
                    onChange={(e) => {
                      updateTarget('videoUrl', e.target.value);
                      updateTarget('url', e.target.value);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </>
            )}

            {/* Social Links Properties */}
            {target.type === 'social' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-300">Social Platforms & Links</label>
                {(target.platforms || ['telegram', 'twitter', 'linkedin', 'instagram', 'github']).map(plat => (
                  <div key={plat} className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 capitalize">{plat} URL</span>
                    <input
                      type="text"
                      value={(target.urls && target.urls[plat]) || ''}
                      onChange={(e) => {
                        const newUrls = { ...(target.urls || {}), [plat]: e.target.value };
                        updateTarget('urls', newUrls);
                      }}
                      placeholder={`https://${plat}.com/...`}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
