import React, { useState } from 'react';
import { 
  Type, Image as ImageIcon, MousePointerClick, Minus, Share2, Layout, 
  Sparkles, FolderOpen, Tag, Palette, Layers, Columns, Video, Clock, 
  HelpCircle, Box, Search, Plus, Bookmark, Wand2, RefreshCw, Check, Upload,
  Grid, Move, AlignLeft, ShieldCheck, Heart, Film, PanelLeftClose
} from 'lucide-react';
import { TEMPLATES_LIST, TEMPLATE_CATEGORIES } from './templatesData';

export default function DesignerLeftSidebar({
  isOpen = true,
  onToggleOpen,
  onDragStartComponent,
  onSelectTemplate,
  mySavedTemplates = [],
  savedSections = [],
  onApplyBrandAsset,
  onGenerateAiSection
}) {
  const [activeTab, setActiveTab] = useState('components'); // 'components' | 'templates' | 'my-templates' | 'brand' | 'images' | 'ai'
  const [templateSearch, setTemplateSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [stockSearch, setStockSearch] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedMediaList, setUploadedMediaList] = useState([]);

  if (!isOpen) {
    return null;
  }

  // Component Drag catalog items
  const componentCatalog = [
    { type: 'heading', name: 'Heading Title', icon: Type, desc: 'H1 / H2 Title banner' },
    { type: 'text', name: 'Text Paragraph', icon: AlignLeft, desc: 'Rich body text block' },
    { type: 'button', name: 'Button CTA', icon: MousePointerClick, desc: 'Interactive CTA button' },
    { type: 'image', name: 'Image Media', icon: ImageIcon, desc: 'SVG, GIF, PNG, JPG image' },
    { type: 'badge', name: 'Badge Pill', icon: Tag, desc: 'Category or tag highlight' },
    { type: 'hero', name: 'Hero Header', icon: Box, desc: 'Hero section with background' },
    { type: 'columns', name: 'Multi Column', icon: Columns, desc: '2-column or 3-column split' },
    { type: 'callout', name: 'Callout Box', icon: ShieldCheck, desc: 'Highlighted alert box' },
    { type: 'countdown', name: 'Live Countdown', icon: Clock, desc: 'Real-time ticking timer' },
    { type: 'video', name: 'Video Player', icon: Video, desc: 'Video player with modal preview' },
    { type: 'divider', name: 'Divider', icon: Minus, desc: 'Horizontal rule line' },
    { type: 'spacer', name: 'Spacer', icon: Move, desc: 'Vertical spacing block' },
    { type: 'social', name: 'Social Icons', icon: Share2, desc: 'Equal-sized social links' },
    { type: 'footer', name: 'Email Footer', icon: Layout, desc: 'Unsubscribe & copyright' }
  ];

  // Stock photography collection
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

  const handleLocalImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setUploadedMediaList(prev => [{ url: dataUrl, name: file.name }, ...prev]);
        onApplyBrandAsset('image-url', dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateAiSection(aiPrompt);
      setIsGenerating(false);
      setAiPrompt('');
    }, 1000);
  };

  return (
    <div className="w-72 sm:w-80 bg-slate-900 border-r border-slate-800/80 flex flex-col h-[calc(100vh-3.5rem)] z-30 select-none transition-all duration-300 relative flex-shrink-0">
      
      {/* Clean Drawer Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Components & Library</span>
        <button
          onClick={onToggleOpen}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Collapse Left Sidebar"
        >
          <PanelLeftClose className="w-4 h-4 text-teal-400" />
        </button>
      </div>

      {/* Sidebar Navigation Tabs */}
      <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950 p-1 text-[11px] font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('components')}
          className={`py-2 flex flex-col items-center gap-1 rounded-md transition-colors ${activeTab === 'components' ? 'bg-slate-800 text-teal-400 font-bold' : 'hover:text-slate-200'}`}
          title="Components Catalog"
        >
          <Box className="w-4 h-4" />
          <span className="text-[9px]">Add</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2 flex flex-col items-center gap-1 rounded-md transition-colors ${activeTab === 'templates' ? 'bg-slate-800 text-teal-400 font-bold' : 'hover:text-slate-200'}`}
          title="Templates Catalog"
        >
          <Grid className="w-4 h-4" />
          <span className="text-[9px]">Layouts</span>
        </button>
        <button
          onClick={() => setActiveTab('my-templates')}
          className={`py-2 flex flex-col items-center gap-1 rounded-md transition-colors ${activeTab === 'my-templates' ? 'bg-slate-800 text-teal-400 font-bold' : 'hover:text-slate-200'}`}
          title="My Saved Templates"
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[9px]">Saved</span>
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`py-2 flex flex-col items-center gap-1 rounded-md transition-colors ${activeTab === 'brand' ? 'bg-slate-800 text-teal-400 font-bold' : 'hover:text-slate-200'}`}
          title="Brand Assets"
        >
          <Palette className="w-4 h-4" />
          <span className="text-[9px]">Brand</span>
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`py-2 flex flex-col items-center gap-1 rounded-md transition-colors ${activeTab === 'images' ? 'bg-slate-800 text-teal-400 font-bold' : 'hover:text-slate-200'}`}
          title="Stock & Media Upload"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[9px]">Media</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2 flex flex-col items-center gap-1 rounded-md transition-colors ${activeTab === 'ai' ? 'bg-indigo-900/60 text-indigo-400 font-bold' : 'hover:text-slate-200'}`}
          title="AI Assistant"
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-[9px]">AI</span>
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 1. COMPONENTS DRAWER */}
        {activeTab === 'components' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Drag Components</h3>
              <span className="text-[10px] text-slate-500 font-medium">14 elements</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {componentCatalog.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStartComponent(e, item.type)}
                    className="group bg-slate-950 border border-slate-800/90 hover:border-teal-500/60 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 group-hover:bg-teal-500/10 text-slate-400 group-hover:text-teal-400 flex items-center justify-center mb-2 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TEMPLATES DRAWER */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search 50+ templates..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TEMPLATE_CATEGORIES.slice(0, 10).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap transition-colors ${activeCat === cat ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredTemplates.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => onSelectTemplate(tmpl)}
                  className="group bg-slate-950 border border-slate-800 hover:border-teal-500/60 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="h-28 relative bg-slate-900">
                    <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[9px] font-bold text-teal-400 uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-teal-300">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{tmpl.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MY SAVED TEMPLATES */}
        {activeTab === 'my-templates' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">My Custom Templates</h3>
            {mySavedTemplates.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-950 border border-slate-800 rounded-xl">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-400">No saved templates yet</div>
                <div className="text-[10px] text-slate-500 mt-1">Click "Save Template" in the toolbar to save your custom designs.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {mySavedTemplates.map((tmpl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectTemplate(tmpl)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-teal-500/60 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="text-xs font-bold text-slate-200">{tmpl.name || `Custom Template #${idx + 1}`}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Saved {new Date(tmpl.savedAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. BRAND ASSETS */}
        {activeTab === 'brand' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Brand Palette & Styles</h3>
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
              <div className="text-xs font-semibold text-slate-400">SkillBridge Primary Colors</div>
              <div className="flex gap-2">
                {['#007C89', '#0F172A', '#4F46E5', '#0D9488', '#EF4444', '#F59E0B'].map(hex => (
                  <button
                    key={hex}
                    onClick={() => onApplyBrandAsset('color', hex)}
                    className="w-8 h-8 rounded-lg border border-slate-700/80 shadow-inner flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: hex }}
                    title={`Apply ${hex}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MEDIA & LOCAL IMAGE UPLOAD (SVG, GIF, PNG, JPG) */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upload Media Files</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-teal-500 rounded-xl p-4 cursor-pointer bg-slate-950 transition-colors group">
                <Upload className="w-6 h-6 text-teal-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">Click to Upload Image</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Supports SVG, GIF, PNG, JPG, WebP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.svg,.gif,.png,.jpg,.jpeg,.webp"
                  onChange={handleLocalImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedMediaList.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">My Uploaded Media</div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {uploadedMediaList.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => onApplyBrandAsset('image-url', item.url)}
                      className="group relative h-20 rounded-lg overflow-hidden border border-slate-800 cursor-pointer hover:border-teal-500"
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[9px] font-bold text-white bg-teal-600 px-2 py-0.5 rounded">Insert</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Custom Image Web URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => customImageUrl && onApplyBrandAsset('image-url', customImageUrl)}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold"
                >
                  Insert
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Unsplash Library</div>
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Search photos..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2 mt-2">
                {filteredStock.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => onApplyBrandAsset('image-url', img.url)}
                    className="group relative h-24 rounded-lg overflow-hidden border border-slate-800 cursor-pointer hover:border-teal-500"
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[10px] font-bold text-white bg-teal-600 px-2 py-1 rounded">Insert</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> AI Email Copilot
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Enter a topic or objective to automatically construct responsive email sections with optimized copywriting.
              </p>

              <form onSubmit={handleAiSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Add a customer testimonial section with 5 stars and student quotes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" /> Generate Content Block
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
