import React, { useState, useEffect } from 'react';
import { 
  Type, Image as ImageIcon, MousePointerClick, Minus, Share2, Quote, Layout, 
  Trash2, ArrowUp, ArrowDown, Copy, Sparkles, Smartphone, Monitor, Save, FolderOpen, 
  Tag, Eye, Check, RefreshCw, Palette, Layers, AlignLeft, AlignCenter, AlignRight, Zap
} from 'lucide-react';
import { extractFirstNameFromEmail } from '../utils/nameParser';

// Pre-defined Professional Email Templates for Canva/Mailchimp Studio
const STUDIO_PRESET_TEMPLATES = [
  {
    id: 'executive-dark',
    name: 'Executive Dark Mode',
    description: 'Sleek luxury dark theme with gold/emerald CTA button',
    blocks: [
      { id: 'b1', type: 'header', content: 'SKILLBRIDGE OUTREACH', align: 'center', bg: '#000000', color: '#FFFFFF' },
      { id: 'b2', type: 'heading', content: 'Exclusive Student Remote Opportunities', align: 'center', size: '22px', color: '#F9FAFB' },
      { id: 'b3', type: 'paragraph', content: 'Hi {{first_name}},\n\nSkillBridge is accepting applications for flexible remote student roles designed to complement your academic schedule at {{company}}.', align: 'left', color: '#E2E8F0' },
      { id: 'b4', type: 'callout', content: '⚡ Flexible Hours (5-15 hrs/week) • High Compensation • Direct Practical Experience', bg: '#1E1B4B', border: '#6366F1', color: '#E0E7FF' },
      { id: 'b5', type: 'button', text: 'Apply via Telegram', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#4F46E5', color: '#FFFFFF', align: 'center' },
      { id: 'b6', type: 'divider', style: 'solid', color: '#334155' },
      { id: 'b7', type: 'social', links: ['telegram', 'email', 'website'] },
      { id: 'b8', type: 'paragraph', content: 'Best regards,\n{{sender_name}}\nDirector of Student Outreach', align: 'left', color: '#94A3B8' }
    ]
  },
  {
    id: 'academic-blue',
    name: 'Academic Opportunity Spotlight',
    description: 'Clean university white card with royal blue header',
    blocks: [
      { id: 'b1', type: 'header', content: 'UNIVERSITY STUDENT NETWORK', align: 'center', bg: '#1E3A8A', color: '#FFFFFF' },
      { id: 'b2', type: 'heading', content: 'Remote Opportunities for {{role}} Students', align: 'left', size: '20px', color: '#1E293B' },
      { id: 'b3', type: 'paragraph', content: 'Hello {{first_name}},\n\nWe are currently reaching out to students in {{role}} interested in paid remote roles.', align: 'left', color: '#334155' },
      { id: 'b4', type: 'button', text: 'View Role & Apply Now', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#2563EB', color: '#FFFFFF', align: 'left' },
      { id: 'b5', type: 'divider', style: 'gradient', color: '#2563EB' },
      { id: 'b6', type: 'paragraph', content: 'SkillBridge Academic Outreach • {{email}}', align: 'center', color: '#64748B' }
    ]
  },
  {
    id: 'tech-internship',
    name: 'Tech & Code Internship',
    description: 'Modern developer vibe with code callout box',
    blocks: [
      { id: 'b1', type: 'header', content: '// SKILLBRIDGE TECH LABS', align: 'left', bg: '#0F172A', color: '#38BDF8' },
      { id: 'b2', type: 'heading', content: 'Remote Tech Internship Alert', align: 'left', size: '22px', color: '#F8FAFC' },
      { id: 'b3', type: 'paragraph', content: 'Hey {{first_name}},\n\nAre you looking to sharpen your development and problem-solving skills this semester?', align: 'left', color: '#94A3B8' },
      { id: 'b4', type: 'callout', content: 'const opportunity = { role: "{{role}}", location: "Remote", hours: "Flexible" };', bg: '#1E293B', border: '#38BDF8', color: '#38BDF8' },
      { id: 'b5', type: 'button', text: 'Chat on Telegram', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#0EA5E9', color: '#FFFFFF', align: 'left' }
    ]
  }
];

export default function VisualEmailDesigner({ 
  campaignConfig = {}, 
  setCampaignConfig, 
  recipients = [],
  onStartQueue,
  onSendSingleTest
}) {
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const selectedTestRecipient = safeRecipients[0] || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    company: 'SkillBridge Network',
    role: 'Mathematics Tutor'
  };

  // Block Canvas State
  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_designer_blocks');
      return saved ? JSON.parse(saved) : STUDIO_PRESET_TEMPLATES[0].blocks;
    } catch (e) {
      return STUDIO_PRESET_TEMPLATES[0].blocks;
    }
  });

  const [activeBlockId, setActiveBlockId] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPreviewRecipientId, setSelectedPreviewRecipientId] = useState(selectedTestRecipient.id || '');
  
  // Custom Saved Templates State
  const [savedCustomTemplates, setSavedCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_saved_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Save Canvas blocks to LocalStorage & Compile to campaignConfig.bodyText
  useEffect(() => {
    localStorage.setItem('skillbridge_designer_blocks', JSON.stringify(blocks));
    
    // Automatically compile canvas blocks to text format for compatibility
    const compiledText = blocks.map(b => {
      if (b.type === 'heading') return `### ${b.content}`;
      if (b.type === 'paragraph') return b.content;
      if (b.type === 'callout') return `[NOTE: ${b.content}]`;
      if (b.type === 'button') return `[BUTTON: ${b.text} -> ${b.url}]`;
      return '';
    }).filter(Boolean).join('\n\n');

    if (setCampaignConfig && compiledText) {
      setCampaignConfig(prev => ({ ...prev, bodyText: compiledText }));
    }
  }, [blocks]);

  // Save Custom Template to LocalStorage
  const handleSaveCustomTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTmpl = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      date: new Date().toLocaleDateString(),
      blocks: [...blocks]
    };
    const updated = [newTmpl, ...savedCustomTemplates];
    setSavedCustomTemplates(updated);
    localStorage.setItem('skillbridge_saved_custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setIsSavingTemplate(false);
  };

  const handleLoadCustomTemplate = (tmpl) => {
    if (tmpl?.blocks) {
      setBlocks(tmpl.blocks);
    }
  };

  const handleDeleteCustomTemplate = (tmplId) => {
    const updated = savedCustomTemplates.filter(t => t.id !== tmplId);
    setSavedCustomTemplates(updated);
    localStorage.setItem('skillbridge_saved_custom_templates', JSON.stringify(updated));
  };

  // Add Block to Canvas
  const addBlock = (type) => {
    const newId = `b-${Date.now()}`;
    let newBlock = { id: newId, type };

    if (type === 'heading') newBlock = { ...newBlock, content: 'New Section Title', align: 'left', size: '20px', color: '#1E293B' };
    else if (type === 'paragraph') newBlock = { ...newBlock, content: 'Write your message here... You can use {{first_name}} and {{role}} merge tags.', align: 'left', color: '#334155' };
    else if (type === 'callout') newBlock = { ...newBlock, content: '💡 Highlighted announcement or key detail here...', bg: '#F1F5F9', border: '#2563EB', color: '#1E293B' };
    else if (type === 'button') newBlock = { ...newBlock, text: 'Click Here to Apply', url: 'https://t.me/+AB0OloYpE7I1NTVk', bg: '#2563EB', color: '#FFFFFF', align: 'center' };
    else if (type === 'divider') newBlock = { ...newBlock, style: 'solid', color: '#CBD5E1' };
    else if (type === 'header') newBlock = { ...newBlock, content: 'YOUR BRAND LOGO', align: 'center', bg: '#000000', color: '#FFFFFF' };
    else if (type === 'social') newBlock = { ...newBlock, links: ['telegram', 'email', 'website'] };

    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newId);
  };

  // Re-order Blocks
  const moveBlock = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = index + direction;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  // Delete Block
  const deleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  // Duplicate Block
  const duplicateBlock = (block) => {
    const dup = { ...block, id: `b-${Date.now()}` };
    setBlocks(prev => [...prev, dup]);
  };

  // Update Block Attribute
  const updateBlock = (id, key, val) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b));
  };

  // Insert Personalization Tag into Active Block
  const insertMergeTag = (tag) => {
    if (!activeBlockId) {
      // If no block selected, append to last paragraph or first heading
      const pBlock = blocks.find(b => b.type === 'paragraph') || blocks[0];
      if (pBlock) updateBlock(pBlock.id, 'content', (pBlock.content || '') + ' ' + tag + ' ');
      return;
    }

    const block = blocks.find(b => b.id === activeBlockId);
    if (block && (block.type === 'paragraph' || block.type === 'heading' || block.type === 'callout')) {
      updateBlock(activeBlockId, 'content', (block.content || '') + ' ' + tag + ' ');
    }
  };

  // Render Preview Email HTML with Merge Tags
  const renderBlockHtml = (b, targetRecipient) => {
    const firstName = targetRecipient?.firstName && targetRecipient.firstName !== 'Friend'
      ? targetRecipient.firstName
      : extractFirstNameFromEmail(targetRecipient?.email);

    const parseText = (str) => (str || '')
      .replaceAll('{{first_name}}', firstName)
      .replaceAll('{{last_name}}', targetRecipient?.lastName || '')
      .replaceAll('{{email}}', targetRecipient?.email || '')
      .replaceAll('{{company}}', targetRecipient?.company || 'SkillBridge')
      .replaceAll('{{role}}', targetRecipient?.role || 'Student')
      .replaceAll('{{sender_name}}', campaignConfig?.senderName || 'Benedict')
      .replace(/\n/g, '<br/>');

    if (b.type === 'header') {
      return (
        <div style={{ background: b.bg || '#000000', color: b.color || '#FFFFFF', padding: '24px 16px', textAlign: b.align || 'center', fontWeight: 'bold', fontSize: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {parseText(b.content)}
        </div>
      );
    }
    if (b.type === 'heading') {
      return (
        <h2 style={{ color: b.color || '#1E293B', fontSize: b.size || '20px', textAlign: b.align || 'left', fontWeight: '800', margin: '16px 0 8px 0' }}>
          {parseText(b.content)}
        </h2>
      );
    }
    if (b.type === 'paragraph') {
      return (
        <div style={{ color: b.color || '#334155', fontSize: '14px', lineHeight: '1.7', textAlign: b.align || 'left', margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: parseText(b.content) }} />
      );
    }
    if (b.type === 'callout') {
      return (
        <div style={{ background: b.bg || '#F1F5F9', borderLeft: `4px solid ${b.border || '#2563EB'}`, color: b.color || '#1E293B', padding: '14px 18px', borderRadius: '8px', margin: '16px 0', fontSize: '13px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: parseText(b.content) }} />
      );
    }
    if (b.type === 'button') {
      return (
        <div style={{ textAlign: b.align || 'center', margin: '20px 0' }}>
          <a href={b.url || '#'} style={{ background: b.bg || '#2563EB', color: b.color || '#FFFFFF', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold', borderRadius: '8px', fontSize: '14px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {parseText(b.text)}
          </a>
        </div>
      );
    }
    if (b.type === 'divider') {
      return (
        <hr style={{ border: 'none', borderTop: `1px solid ${b.color || '#CBD5E1'}`, margin: '20px 0' }} />
      );
    }
    if (b.type === 'social') {
      return (
        <div style={{ textAlign: 'center', margin: '18px 0', color: '#64748B', fontSize: '12px', fontWeight: 'bold' }}>
          ⚡ Telegram &bull; Email &bull; Website
        </div>
      );
    }
    return null;
  };

  const previewRecipient = safeRecipients.find(r => r.id === selectedPreviewRecipientId) || selectedTestRecipient;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Studio Controls */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Canva & Mailchimp Visual Studio</span>
            </span>
            <span className="text-xs text-gray-500 font-mono font-bold">• {blocks.length} Content Blocks</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Drag & Click Visual Email Designer</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Build high-converting emails visually. Click blocks on the left to add, re-order on canvas, and personalize live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Theme Selector */}
          <select
            onChange={e => {
              const tmpl = STUDIO_PRESET_TEMPLATES.find(t => t.id === e.target.value);
              if (tmpl) setBlocks(tmpl.blocks);
            }}
            className="bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold px-3 py-2 rounded-lg outline-none cursor-pointer"
          >
            <option value="">Load Preset Template...</option>
            {STUDIO_PRESET_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Desktop / Mobile Live Preview Toggle */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid (3 Columns: Palette | Canvas | Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Content Block Palette */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Add Content Blocks</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => addBlock('header')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <Layout className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Header Banner</span>
                  <span className="text-[10px] text-gray-500">Logo or title top banner</span>
                </div>
              </button>

              <button onClick={() => addBlock('heading')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <Type className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Section Title</span>
                  <span className="text-[10px] text-gray-500">Bold H1 or H2 heading text</span>
                </div>
              </button>

              <button onClick={() => addBlock('paragraph')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <AlignLeft className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Body Text</span>
                  <span className="text-[10px] text-gray-500">Paragraph with merge tags</span>
                </div>
              </button>

              <button onClick={() => addBlock('callout')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <Quote className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Callout Box</span>
                  <span className="text-[10px] text-gray-500">Highlighted announcement box</span>
                </div>
              </button>

              <button onClick={() => addBlock('button')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <MousePointerClick className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Action Button</span>
                  <span className="text-[10px] text-gray-500">CTA button (Telegram/Link)</span>
                </div>
              </button>

              <button onClick={() => addBlock('divider')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <Minus className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Divider Line</span>
                  <span className="text-[10px] text-gray-500">Horizontal line or gap</span>
                </div>
              </button>

              <button onClick={() => addBlock('social')} className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left flex items-center gap-3 transition-colors group">
                <Share2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Social Icons</span>
                  <span className="text-[10px] text-gray-500">Telegram, Email, Web links</span>
                </div>
              </button>
            </div>
          </div>

          {/* Saved Templates Manager Box */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                <span>My Saved Templates ({savedCustomTemplates.length})</span>
              </h3>
              <button 
                onClick={() => setIsSavingTemplate(!isSavingTemplate)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                + Save Current
              </button>
            </div>

            {isSavingTemplate && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Template Name (e.g., Fall Outreach)..."
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600"
                />
                <button
                  onClick={handleSaveCustomTemplate}
                  disabled={!newTemplateName.trim()}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-1.5 rounded transition-colors disabled:opacity-50"
                >
                  Save to My Templates
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedCustomTemplates.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic text-center py-2">No saved custom templates yet.</p>
              ) : (
                savedCustomTemplates.map(tmpl => (
                  <div key={tmpl.id} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between border border-gray-200 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{tmpl.name}</span>
                      <span className="text-[10px] text-gray-400">{tmpl.date} • {tmpl.blocks?.length || 0} blocks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleLoadCustomTemplate(tmpl)} className="px-2 py-1 bg-black text-white rounded text-[10px] font-bold">Load</button>
                      <button onClick={() => handleDeleteCustomTemplate(tmpl.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Interactive Canvas Board */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-gray-100 p-6 rounded-2xl border border-gray-300 min-h-[500px] space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Canvas Preview Container (580px Email Width)</span>
              <span className="text-[11px] font-mono text-gray-400">Click any block to edit properties</span>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden max-w-[580px] mx-auto divide-y divide-gray-100">
              {blocks.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs italic">
                  Canvas is empty. Click content blocks on the left to add elements.
                </div>
              ) : (
                blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    onClick={() => setActiveBlockId(block.id)}
                    className={`relative group p-4 transition-all cursor-pointer ${
                      activeBlockId === block.id ? 'ring-2 ring-indigo-500 bg-indigo-50/20' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Hover Controls Bar */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg z-10 text-xs">
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, -1); }} title="Move Up" className="hover:text-indigo-300"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 1); }} title="Move Down" className="hover:text-indigo-300"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block); }} title="Duplicate" className="hover:text-emerald-300"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} title="Delete" className="hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* Canvas Block Render */}
                    {renderBlockHtml(block, selectedTestRecipient)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Block Inspector & Personalization Tags */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Personalization Merge Tag Chips */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Personalization Variables</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Click any chip to insert variable tag into text blocks or subject line.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: '{{first_name}}', label: 'First Name' },
                { tag: '{{last_name}}', label: 'Last Name' },
                { tag: '{{email}}', label: 'Email' },
                { tag: '{{company}}', label: 'Company / School' },
                { tag: '{{role}}', label: 'Target Role' },
                { tag: '{{sender_name}}', label: 'Sender Name' }
              ].map(chip => (
                <button
                  key={chip.tag}
                  onClick={() => insertMergeTag(chip.tag)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>+</span>
                  <span>{chip.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Block Inspector Settings */}
          {activeBlockId ? (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span>Block Inspector ({blocks.find(b => b.id === activeBlockId)?.type})</span>
                </h3>
                <button onClick={() => setActiveBlockId(null)} className="text-[10px] text-gray-400 font-bold hover:text-gray-600">Close</button>
              </div>

              {(() => {
                const b = blocks.find(x => x.id === activeBlockId);
                if (!b) return null;

                return (
                  <div className="space-y-3 text-xs">
                    {(b.type === 'heading' || b.type === 'paragraph' || b.type === 'callout' || b.type === 'header') && (
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Text Content</label>
                        <textarea
                          rows={3}
                          value={b.content || ''}
                          onChange={e => updateBlock(b.id, 'content', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-black"
                        />
                      </div>
                    )}

                    {b.type === 'button' && (
                      <>
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">Button Label Text</label>
                          <input
                            type="text"
                            value={b.text || ''}
                            onChange={e => updateBlock(b.id, 'text', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">Button Action URL</label>
                          <input
                            type="text"
                            value={b.url || ''}
                            onChange={e => updateBlock(b.id, 'url', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-black font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">Button Background Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={b.bg || '#2563EB'}
                              onChange={e => updateBlock(b.id, 'bg', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border"
                            />
                            <span className="font-mono text-xs text-gray-600">{b.bg || '#2563EB'}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Alignment Options */}
                    {(b.type === 'heading' || b.type === 'paragraph' || b.type === 'button' || b.type === 'header') && (
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Text Alignment</label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateBlock(b.id, 'align', 'left')} className={`px-2.5 py-1 rounded text-xs font-bold ${b.align === 'left' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>Left</button>
                          <button onClick={() => updateBlock(b.id, 'align', 'center')} className={`px-2.5 py-1 rounded text-xs font-bold ${b.align === 'center' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>Center</button>
                          <button onClick={() => updateBlock(b.id, 'align', 'right')} className={`px-2.5 py-1 rounded text-xs font-bold ${b.align === 'right' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>Right</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-xs text-gray-400 italic">
              Click any block on the middle canvas to adjust colors, text, and alignment.
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Live Desktop & Mobile Dual Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-gray-200 my-8">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
                  Real-World Output Simulator
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">Live Desktop & Mobile Email Preview</h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Device Selector */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-300">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      previewDevice === 'desktop' ? 'bg-black text-white shadow-xs' : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Desktop (580px)</span>
                  </button>

                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      previewDevice === 'mobile' ? 'bg-black text-white shadow-xs' : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile iPhone (375px)</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Recipient Test Switcher Bar */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-bold text-gray-700">Test Merge Tag Data Output:</span>
              <select
                value={selectedPreviewRecipientId}
                onChange={e => setSelectedPreviewRecipientId(e.target.value)}
                className="bg-white border border-gray-300 font-semibold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
              >
                {safeRecipients.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.firstName || 'Friend'} {r.lastName || ''} ({r.email}) &bull; {r.role || 'Student'}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Frame Output */}
            <div className="bg-gray-200 p-8 rounded-2xl flex justify-center items-center min-h-[450px]">
              {previewDevice === 'desktop' ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-300 w-full max-w-[580px] overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 text-xs font-mono text-gray-500 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                    <span className="ml-2 font-sans font-semibold text-gray-700">To: {previewRecipient.email}</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {blocks.map(b => (
                      <div key={b.id} className="p-4">
                        {renderBlockHtml(b, previewRecipient)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* iPhone 375px Mobile Frame Mockup */
                <div className="bg-gray-900 p-4 rounded-[40px] shadow-2xl border-4 border-gray-800 w-[375px] space-y-2">
                  <div className="w-32 h-4 bg-black rounded-full mx-auto mb-2"></div>
                  <div className="bg-white rounded-[28px] overflow-hidden shadow-inner max-h-[520px] overflow-y-auto divide-y divide-gray-100">
                    <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 text-[10px] font-mono text-gray-600">
                      To: {previewRecipient.email}
                    </div>
                    {blocks.map(b => (
                      <div key={b.id} className="p-3">
                        {renderBlockHtml(b, previewRecipient)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
