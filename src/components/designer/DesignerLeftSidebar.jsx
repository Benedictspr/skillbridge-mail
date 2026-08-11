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
    <div className="w-72 sm:w-80 bg-[#121212] border-r border-zinc-800 flex flex-col h-[calc(100vh-3.5rem)] z-30 select-none transition-all duration-300 relative flex-shrink-0 text-white font-sans">
      
      {/* Clean Drawer Header */}
      <div className="p-3 border-b border-zinc-800 bg-[#09090B] flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Components & Library</span>
        <button
          onClick={onToggleOpen}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Collapse Left Sidebar"
        >
          <PanelLeftClose className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Sidebar Navigation Tabs */}
      <div className="grid grid-cols-6 border-b border-zinc-800 bg-[#09090B] p-1 text-[11px] font-semibold text-zinc-400">
        <button
          onClick={() => setActiveTab('components')}
          className={`py-2 flex flex-col items-center gap-1 rounded-lg transition-all cursor-pointer ${activeTab === 'components' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'}`}
          title="Components Catalog"
        >
          <Box className="w-4 h-4" />
          <span className="text-[9px]">Add</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2 flex flex-col items-center gap-1 rounded-lg transition-all cursor-pointer ${activeTab === 'templates' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'}`}
          title="Templates Catalog"
        >
          <Grid className="w-4 h-4" />
          <span className="text-[9px]">Layouts</span>
        </button>
        <button
          onClick={() => setActiveTab('my-templates')}
          className={`py-2 flex flex-col items-center gap-1 rounded-lg transition-all cursor-pointer ${activeTab === 'my-templates' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'}`}
          title="My Saved Templates"
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[9px]">Saved</span>
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`py-2 flex flex-col items-center gap-1 rounded-lg transition-all cursor-pointer ${activeTab === 'brand' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'}`}
          title="Brand Assets"
        >
          <Palette className="w-4 h-4" />
          <span className="text-[9px]">Brand</span>
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`py-2 flex flex-col items-center gap-1 rounded-lg transition-all cursor-pointer ${activeTab === 'images' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'}`}
          title="Stock & Media Upload"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[9px]">Media</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2 flex flex-col items-center gap-1 rounded-lg transition-all cursor-pointer ${activeTab === 'ai' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'}`}
          title="AI Assistant"
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-[9px]">AI</span>
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">

        {/* 1. COMPONENTS DRAWER */}
        {activeTab === 'components' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Drag Components</h3>
              <span className="text-[10px] text-zinc-500 font-medium">14 elements</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {componentCatalog.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStartComponent(e, item.type)}
                    className="group bg-black border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg"
                  >
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-2 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">{item.desc}</div>
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
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TEMPLATE_CATEGORIES.slice(0, 10).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${activeCat === cat ? 'bg-white text-black font-extrabold' : 'bg-black text-zinc-400 hover:text-white border border-zinc-800'}`}
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
                  className="group bg-black border border-zinc-800 hover:border-zinc-500 rounded-xl overflow-hidden cursor-pointer transition-all"
                >
                  <div className="h-28 relative bg-zinc-900">
                    <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                  <div className="p-3">
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
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">My Custom Templates</h3>
            {mySavedTemplates.length === 0 ? (
              <div className="text-center py-8 px-4 bg-black border border-zinc-800 rounded-xl">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-zinc-400">No saved templates yet</div>
                <div className="text-[10px] text-zinc-500 mt-1">Click "Save Template" in the toolbar to save your custom designs.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {mySavedTemplates.map((saved, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectTemplate(saved.data)}
                    className="p-3 bg-black border border-zinc-800 hover:border-zinc-500 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="font-bold text-xs text-white">{saved.name || `Template ${idx + 1}`}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Saved on {new Date(saved.savedAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. BRAND ASSETS */}
        {activeTab === 'brand' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Brand Palette & Assets</h3>
            <div className="p-3 bg-black border border-zinc-800 rounded-xl space-y-3">
              <div className="text-xs font-medium text-zinc-400">Quick Palette Color Applier</div>
              <div className="flex items-center gap-2">
                {['#050505', '#FFFFFF', '#09090B', '#121212', '#27272A', '#3F3F46'].map(color => (
                  <button
                    key={color}
                    onClick={() => onApplyBrandAsset('bg-color', color)}
                    className="w-6 h-6 rounded-full border border-zinc-700 shadow-xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={`Apply ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MEDIA UPLOAD */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="p-4 bg-black border border-zinc-800 border-dashed rounded-xl text-center">
              <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
              <label className="text-xs font-bold text-white hover:underline cursor-pointer">
                Upload Custom Image
                <input type="file" accept="image/*" onChange={handleLocalImageUpload} className="hidden" />
              </label>
              <div className="text-[10px] text-zinc-500 mt-1">PNG, JPG, SVG or GIF</div>
            </div>

            {uploadedMediaList.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300 uppercase">Uploaded Assets</div>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedMediaList.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => onApplyBrandAsset('image-url', m.url)}
                      className="group relative h-20 bg-black border border-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:border-zinc-500"
                    >
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 bg-black border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Wand2 className="w-4 h-4 text-white" />
                <span>AI Layout Generator</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Describe the email section or layout you want to add, and AI will generate it automatically.
              </p>
              <form onSubmit={handleAiSubmit} className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A 2-column feature highlight with icon badges and CTA button..."
                  rows={3}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none font-sans"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isGenerating ? (
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Generate Layout</span>
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
