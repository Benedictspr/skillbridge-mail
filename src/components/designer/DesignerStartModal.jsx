import React, { useState } from 'react';
import { Sparkles, FileCode, LayoutGrid, Search, Check, ArrowRight, Wand2, Plus, Zap } from 'lucide-react';
import { TEMPLATES_LIST, TEMPLATE_CATEGORIES } from './templatesData';

export default function DesignerStartModal({ isOpen, onClose, onSelectBlank, onSelectTemplate, onGenerateAi }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('templates'); // 'blank' | 'templates' | 'ai'

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES_LIST.filter(t => {
    const matchesCat = activeCategory === 'All' || t.category === activeCategory || t.tags.includes(activeCategory);
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateAi(aiPrompt);
      setIsGenerating(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" /> SkillBridge Mail Studio
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Your Email Campaign</h2>
            <p className="text-slate-400 text-sm mt-0.5">Start from scratch, pick an agency-grade template, or let AI structure it for you.</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setSelectedTab('templates')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${selectedTab === 'templates' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 50+ Templates
            </button>
            <button
              onClick={() => setSelectedTab('blank')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${selectedTab === 'blank' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Plus className="w-3.5 h-3.5" /> Blank Canvas
            </button>
            <button
              onClick={() => setSelectedTab('ai')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${selectedTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Wand2 className="w-3.5 h-3.5" /> Generate with AI
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* TAB 1: BLANK EMAIL */}
          {selectedTab === 'blank' && (
            <div className="max-w-2xl mx-auto py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-4">
                <FileCode className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Start with a Completely Blank Canvas</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Zero preset blocks or placeholders. Build your email from scratch with total creative freedom using our drag-and-drop studio.
              </p>
              <button
                onClick={() => { onSelectBlank(); onClose(); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Blank Canvas <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 2: 50+ TEMPLATES BROWSER */}
          {selectedTab === 'templates' && (
            <div className="space-y-6">
              
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 50+ templates across 30 categories..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Showing <span className="text-teal-400 font-bold">{filteredTemplates.length}</span> templates
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-slate-800 text-teal-400 border border-teal-500/40' : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map(tmpl => (
                  <div
                    key={tmpl.id}
                    className="group bg-slate-950 border border-slate-800 hover:border-teal-500/60 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="h-40 relative bg-slate-900 overflow-hidden">
                      <img
                        src={tmpl.thumbnail}
                        alt={tmpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        {tmpl.category}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-teal-300 transition-colors">{tmpl.name}</h4>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{tmpl.description}</p>
                      </div>

                      <button
                        onClick={() => { onSelectTemplate(tmpl); onClose(); }}
                        className="mt-4 w-full py-2 bg-slate-900 hover:bg-teal-600 text-slate-200 hover:text-white font-semibold text-xs rounded-lg border border-slate-800 hover:border-teal-500 transition-all flex items-center justify-center gap-1.5"
                      >
                        Use Template <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GENERATE WITH AI */}
          {selectedTab === 'ai' && (
            <div className="max-w-2xl mx-auto py-8">
              <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-indigo-500/10">
                  <Sparkles className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
                  <Zap className="w-4 h-4" /> AI Email Architect
                </div>

                <h3 className="text-xl font-extrabold text-white mb-2">Describe the Email You Want to Build</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Specify target audience, offer, tone, or key information. Our AI engine will structure sections, draft persuasive copy, and select color palettes.
                </p>

                <form onSubmit={handleAiSubmit} className="space-y-4">
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A high-converting outreach email to university mathematics students offering flexible remote tutoring roles with high pay..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Structuring Campaign...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" /> Generate Layout with AI
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
