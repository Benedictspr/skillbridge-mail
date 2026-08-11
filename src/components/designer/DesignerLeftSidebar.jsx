import React, { useState } from 'react';
import { 
  Type, Image as ImageIcon, MousePointerClick, Minus, Share2, Layout, 
  Sparkles, FolderOpen, Tag, Palette, Layers, Columns, Video, Clock, 
  HelpCircle, Box, Search, Plus, Bookmark, Wand2, RefreshCw, Check, Upload,
  Grid, Move, AlignLeft, ShieldCheck, Heart, Film, PanelLeftClose, Code, Quote, List, Menu, Trash2, Edit2, Copy
} from 'lucide-react';
import { TEMPLATES_LIST, TEMPLATE_CATEGORIES } from './templatesData';

export default function DesignerLeftSidebar({
  isOpen = true,
  onToggleOpen,
  onDragStartComponent,
  onInsertComponent,
  onSelectTemplate,
  mySavedTemplates = [],
  onDeleteSavedTemplate,
  onRenameSavedTemplate,
  onDuplicateSavedTemplate,
  onApplyBrandAsset,
  onGenerateAiSection
}) {
  const [activeTab, setActiveTab] = useState('components'); // 'components' | 'templates' | 'my-templates' | 'brand' | 'images' | 'ai'
  const [templateSearch, setTemplateSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [savedSearch, setSavedSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedMediaList, setUploadedMediaList] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');

  if (!isOpen) {
    return null;
  }

  // Content & Layout Component catalog
  const componentCatalog = [
    { type: 'heading', name: 'Heading Title', icon: Type, desc: 'H1 / H2 Title banner' },
    { type: 'text', name: 'Text Paragraph', icon: AlignLeft, desc: 'Rich body text block' },
    { type: 'button', name: 'Button CTA', icon: MousePointerClick, desc: 'Interactive CTA button' },
    { type: 'image', name: 'Image Media', icon: ImageIcon, desc: 'SVG, GIF, PNG, JPG image' },
    { type: 'hero', name: 'Hero Header', icon: Box, desc: 'Hero section with background' },
    { type: 'columns', name: 'Multi Column', icon: Columns, desc: '2-column or 3-column split' },
    { type: 'badge', name: 'Badge Pill', icon: Tag, desc: 'Category or tag highlight' },
    { type: 'callout', name: 'Callout Box', icon: ShieldCheck, desc: 'Highlighted alert box' },
    { type: 'quote', name: 'Quote / Testimonial', icon: Quote, desc: 'Blockquote with author' },
    { type: 'list', name: 'Bullet List', icon: List, desc: 'Unordered bullet points' },
    { type: 'video', name: 'Video Player', icon: Video, desc: 'Video player modal' },
    { type: 'countdown', name: 'Live Countdown', icon: Clock, desc: 'Real-time ticking timer' },
    { type: 'social', name: 'Social Icons', icon: Share2, desc: 'Equal-sized social links' },
    { type: 'menu', name: 'Nav Menu Links', icon: Menu, desc: 'Header navigation links' },
    { type: 'custom_html', name: 'Custom HTML', icon: Code, desc: 'Raw HTML code snippet' },
    { type: 'divider', name: 'Divider Line', icon: Minus, desc: 'Horizontal rule line' },
    { type: 'spacer', name: 'Spacer Gap', icon: Move, desc: 'Vertical spacing block' },
    { type: 'footer', name: 'Email Footer', icon: Layout, desc: 'Unsubscribe & copyright' }
  ];

  // Stock photos collection
  const stockPhotos = [
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', title: 'Students Collaborating' },
    { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80', title: 'Tech Workshop' },
    { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80', title: 'Office Presentation' },
    { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', title: 'Graduation Ceremony' },
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', title: 'Data Analytics' },
    { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', title: 'Shopping Deal' }
  ];

  const filteredStock = stockPhotos.filter(p => p.title.toLowerCase().includes(stockSearch.toLowerCase()));

  const filteredTemplates = TEMPLATES_LIST.filter(t => {
    const matchCat = activeCat === 'All' || t.category === activeCat;
    const matchSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredSavedTemplates = mySavedTemplates.filter(st => 
    (st.name || '').toLowerCase().includes(savedSearch.toLowerCase())
  );

  const handleLocalImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setUploadedMediaList(prev => [{ url: dataUrl, name: file.name }, ...prev]);
        if (onApplyBrandAsset) onApplyBrandAsset('image-url', dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      if (onGenerateAiSection) {
        onGenerateAiSection(`${aiTone} tone: ${aiPrompt}`);
      }
      setIsGenerating(false);
      setAiPrompt('');
    }, 1000);
  };

  return (
    <div className="w-72 sm:w-80 bg-[#121212] border-r border-zinc-800 flex flex-col h-[calc(100vh-3rem)] z-30 select-none transition-all duration-300 relative flex-shrink-0 text-white font-sans">
      
      {/* Clean Drawer Header */}
      <div className="p-3 border-b border-zinc-800 bg-[#09090B] flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-sans">Components & Library</span>
        <button
          onClick={onToggleOpen}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Collapse Left Sidebar"
        >
          <PanelLeftClose className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Sidebar Navigation Tabs - Clean Minimal Icons */}
      <div className="grid grid-cols-6 border-b border-zinc-800 bg-[#09090B] p-1 text-[11px] font-semibold text-zinc-400 font-sans">
        <button
          onClick={() => setActiveTab('components')}
          className={`py-1.5 flex flex-col items-center gap-0.5 rounded-md transition-all cursor-pointer ${activeTab === 'components' ? 'bg-white text-black font-bold shadow-xs' : 'hover:text-white'}`}
          title="Add Components Catalog"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="text-[9px]">Add</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-1.5 flex flex-col items-center gap-0.5 rounded-md transition-all cursor-pointer ${activeTab === 'templates' ? 'bg-white text-black font-bold shadow-xs' : 'hover:text-white'}`}
          title="Layouts & Templates Catalog"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="text-[9px]">Layouts</span>
        </button>
        <button
          onClick={() => setActiveTab('my-templates')}
          className={`py-1.5 flex flex-col items-center gap-0.5 rounded-md transition-all cursor-pointer ${activeTab === 'my-templates' ? 'bg-white text-black font-bold shadow-xs' : 'hover:text-white'}`}
          title="My Saved Custom Templates"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="text-[9px]">Saved</span>
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`py-1.5 flex flex-col items-center gap-0.5 rounded-md transition-all cursor-pointer ${activeTab === 'brand' ? 'bg-white text-black font-bold shadow-xs' : 'hover:text-white'}`}
          title="Brand System & Assets"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="text-[9px]">Brand</span>
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`py-1.5 flex flex-col items-center gap-0.5 rounded-md transition-all cursor-pointer ${activeTab === 'images' ? 'bg-white text-black font-bold shadow-xs' : 'hover:text-white'}`}
          title="Media Library & Uploads"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[9px]">Media</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-1.5 flex flex-col items-center gap-0.5 rounded-md transition-all cursor-pointer ${activeTab === 'ai' ? 'bg-white text-black font-bold shadow-xs' : 'hover:text-white'}`}
          title="AI Content Assistant"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span className="text-[9px]">AI</span>
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans scrollbar-thin">

        {/* 1. COMPONENTS DRAWER - Sleek Minimal Icon Cards */}
        {activeTab === 'components' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-sans">Drag or Click to Add</h3>
              <span className="text-[10px] text-zinc-500 font-medium">{componentCatalog.length} elements</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {componentCatalog.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStartComponent(e, item.type)}
                    onClick={() => onInsertComponent && onInsertComponent(item.type)}
                    className="group bg-black border border-zinc-800/90 hover:border-zinc-500 hover:bg-zinc-900/90 rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-md text-left flex flex-col justify-between"
                    title={`Drag or Click to add ${item.name}`}
                  >
                    <IconComponent className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors mb-1.5" />
                    <div>
                      <div className="text-xs font-bold text-white tracking-tight font-sans">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5 font-normal">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. LAYOUTS & TEMPLATES DRAWER */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search email templates..."
                className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TEMPLATE_CATEGORIES.slice(0, 10).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${activeCat === cat ? 'bg-white text-black font-bold' : 'bg-black text-zinc-400 hover:text-white border border-zinc-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {filteredTemplates.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => onSelectTemplate(tmpl)}
                  className="group bg-black border border-zinc-800 hover:border-zinc-500 rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm"
                >
                  <div className="h-24 relative bg-zinc-900">
                    <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-white">{tmpl.name}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{tmpl.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MY SAVED TEMPLATES */}
        {activeTab === 'my-templates' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Saved Templates ({mySavedTemplates.length})</h3>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={savedSearch}
                onChange={(e) => setSavedSearch(e.target.value)}
                placeholder="Search saved templates..."
                className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>

            {filteredSavedTemplates.length === 0 ? (
              <div className="text-center py-8 px-4 bg-black border border-zinc-800 rounded-xl">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-zinc-400">No saved templates found</div>
                <div className="text-[10px] text-zinc-500 mt-1">Click "Save Template" in the top bar to store reusable layouts.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSavedTemplates.map((saved, idx) => (
                  <div
                    key={saved.id || idx}
                    className="p-2.5 bg-black border border-zinc-800 hover:border-zinc-600 rounded-xl transition-all group/st"
                  >
                    {editingTemplateId === (saved.id || idx) ? (
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="text"
                          value={editingTemplateName}
                          onChange={(e) => setEditingTemplateName(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-xs text-white outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (onRenameSavedTemplate) onRenameSavedTemplate(saved.id || idx, editingTemplateName);
                            setEditingTemplateId(null);
                          }}
                          className="p-1 bg-white text-black rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white truncate max-w-[170px]">{saved.name || `Template ${idx + 1}`}</span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover/st:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTemplateId(saved.id || idx);
                              setEditingTemplateName(saved.name || '');
                            }}
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDuplicateSavedTemplate && onDuplicateSavedTemplate(saved.id || idx)}
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteSavedTemplate && onDeleteSavedTemplate(saved.id || idx)}
                            className="p-1 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-zinc-500 flex justify-between items-center mt-1">
                      <span>Saved {new Date(saved.savedAt || Date.now()).toLocaleDateString()}</span>
                      <button
                        onClick={() => onSelectTemplate(saved)}
                        className="px-2 py-0.5 bg-zinc-900 hover:bg-white hover:text-black font-bold text-[10px] rounded text-white transition-colors"
                      >
                        Insert Layout →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. BRAND ASSETS SYSTEM */}
        {activeTab === 'brand' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Brand Palette & Styles</h3>
            
            <div className="p-3 bg-black border border-zinc-800 rounded-xl space-y-2.5">
              <div className="text-xs font-semibold text-white">Brand Palette Swatches</div>
              <div className="flex items-center gap-2 flex-wrap">
                {['#007C89', '#050505', '#FFFFFF', '#38BDF8', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                  <button
                    key={color}
                    onClick={() => onApplyBrandAsset && onApplyBrandAsset('bg-color', color)}
                    className="w-6 h-6 rounded-full border border-zinc-700 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={`Apply Brand Color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 bg-black border border-zinc-800 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-white">Default Company Footer</div>
              <div className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Sendaat Outreach Platform &bull; 100 Mission St, San Francisco CA
              </div>
              <button
                onClick={() => onApplyBrandAsset && onApplyBrandAsset('footer-text', 'Sendaat Outreach Platform • 100 Mission St, San Francisco CA • Unsubscribe')}
                className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white rounded-lg border border-zinc-700 transition-colors"
              >
                Apply Brand Footer Block
              </button>
            </div>
          </div>
        )}

        {/* 5. MEDIA LIBRARY & UPLOAD */}
        {activeTab === 'images' && (
          <div className="space-y-3">
            <div className="p-3 bg-black border border-zinc-800 border-dashed rounded-xl text-center">
              <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
              <label className="text-xs font-bold text-white hover:underline cursor-pointer">
                Upload Custom Asset
                <input type="file" accept="image/*" onChange={handleLocalImageUpload} className="hidden" />
              </label>
              <div className="text-[10px] text-zinc-500 mt-0.5">SVG, PNG, JPG, or GIF files</div>
            </div>

            {uploadedMediaList.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase">Uploaded Assets ({uploadedMediaList.length})</div>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedMediaList.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => onApplyBrandAsset && onApplyBrandAsset('image-url', m.url)}
                      className="group relative h-20 bg-black border border-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors"
                    >
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity">
                        Insert Image
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-zinc-300 uppercase">Stock Media Library</div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Search stock photos..."
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {filteredStock.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => onApplyBrandAsset && onApplyBrandAsset('image-url', s.url)}
                    className="group relative h-18 bg-black border border-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors"
                  >
                    <img src={s.url} alt={s.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity text-center p-1">
                      {s.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. AI CONTENT ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-3">
            <div className="p-3 bg-black border border-zinc-800 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Wand2 className="w-4 h-4 text-white" />
                <span>AI Email Generator</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Describe the email section or copy you want to add, select your tone, and AI will generate it live onto your canvas.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400">Tone of Voice</label>
                <div className="grid grid-cols-3 gap-1 bg-[#121212] p-1 border border-zinc-800 rounded-lg text-[10px] font-semibold">
                  {['Professional', 'Urgent', 'Friendly'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiTone(t)}
                      className={`py-1 rounded cursor-pointer ${aiTone === t ? 'bg-white text-black font-extrabold' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAiSubmit} className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Hero header announcing remote roles for graduates with CTA..."
                  rows={3}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl p-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none font-sans"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isGenerating ? (
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Generate Layout Section</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
