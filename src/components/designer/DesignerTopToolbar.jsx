import React, { useState } from 'react';
import { 
  Undo2, Redo2, Eye, Smartphone, Monitor, Download, Send, Bookmark, 
  Rocket, CheckCircle2, ChevronDown, ZoomIn, ZoomOut, Edit2, Check,
  Code, Sparkles, FileText, Minimize2, Maximize2, X, PanelLeftClose, 
  PanelLeftOpen, Sliders, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function DesignerTopToolbar({
  projectName,
  setProjectName,
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenPreview,
  previewDevice,
  setPreviewDevice,
  zoomLevel,
  setZoomLevel,
  onOpenSendTest,
  onExportHtml,
  onSaveAsTemplate,
  onPublish,
  isFullscreen,
  onToggleFullscreen,
  onCloseStudio,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightPanelOpen,
  onToggleRightPanel,
  editorMode,
  setEditorMode
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) setProjectName(tempName.trim());
    setIsEditingName(false);
  };

  const zoomOptions = [25, 50, 75, 100, 125, 150, 200, 300, 400];

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800/80 px-3 flex items-center justify-between gap-1.5 sm:gap-2 z-40 select-none w-full font-sans overflow-x-auto scrollbar-none">
      
      {/* LEFT REGION: Window Dots, Sidebar Toggle, Title, Mode Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        
        {/* macOS Window Control Dots */}
        <div className="hidden sm:flex items-center gap-1 mr-0.5">
          <button
            onClick={onCloseStudio}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-[8px] text-red-950 font-bold opacity-80 hover:opacity-100 transition-opacity"
            title="Close / Cancel Studio"
          >
            ✕
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-[8px] text-amber-950 font-bold opacity-80 hover:opacity-100 transition-opacity"
            title="Minimize Studio View"
          >
            –
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[8px] text-emerald-950 font-bold opacity-80 hover:opacity-100 transition-opacity"
            title="Maximize Studio Fullscreen"
          >
            +
          </button>
        </div>

        {/* Clean Single Left Sidebar Toggle Icon Button */}
        <button
          onClick={onToggleLeftSidebar}
          className={`p-1.5 rounded-lg border transition-all ${
            isLeftSidebarOpen 
              ? 'bg-slate-800 text-teal-400 border-slate-700 hover:bg-slate-700' 
              : 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
          }`}
          title={isLeftSidebarOpen ? "Collapse Components Drawer" : "Expand Components Drawer"}
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Project Name Input */}
        <div className="flex items-center gap-1">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="bg-slate-950 border border-teal-500 rounded px-2 py-0.5 text-xs font-semibold text-white focus:outline-none max-w-[130px]"
              />
              <button onClick={handleSaveName} className="p-1 text-teal-400 hover:text-white">
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="group flex items-center gap-1 cursor-pointer hover:bg-slate-800 px-1.5 py-1 rounded transition-colors max-w-[130px] md:max-w-[180px]"
            >
              <h1 className="text-xs font-bold text-white tracking-tight truncate">{projectName}</h1>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Interwoven Mode Switcher Segment */}
        {editorMode && setEditorMode && (
          <div className="hidden lg:flex bg-black p-0.5 rounded-lg border border-zinc-800 text-[10px] font-extrabold">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-2.5 py-1 rounded transition-colors ${editorMode === 'visual' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Visual
            </button>
            <button
              onClick={() => setEditorMode('design')}
              className={`px-2.5 py-1 rounded transition-colors ${editorMode === 'design' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Design
            </button>
            <button
              onClick={() => setEditorMode('text')}
              className={`px-2.5 py-1 rounded transition-colors ${editorMode === 'text' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Text
            </button>
          </div>
        )}

        {/* Save Indicator Dot */}
        <div className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'Saving...' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-slate-400 font-medium">{saveStatus}</span>
        </div>
      </div>

      {/* CENTER REGION: Undo, Redo, Device Switch, Zoom Controls */}
      <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 flex-shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-800 my-auto" />

        <div className="flex bg-slate-900 p-0.5 rounded-lg">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1 rounded transition-colors ${previewDevice === 'desktop' ? 'bg-slate-800 text-teal-400' : 'text-slate-400'}`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1 rounded transition-colors ${previewDevice === 'mobile' ? 'bg-slate-800 text-teal-400' : 'text-slate-400'}`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-3.5 bg-slate-800 my-auto" />

        <div className="relative">
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <span>{zoomLevel}%</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showZoomMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 w-28 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Canvas Zoom</div>
              {zoomOptions.map(val => (
                <button
                  key={val}
                  onClick={() => { setZoomLevel(val); setShowZoomMenu(false); }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-800 ${zoomLevel === val ? 'text-teal-400 font-bold' : 'text-slate-300'}`}
                >
                  <span>{val}%</span>
                  {zoomLevel === val && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT REGION: Actions & Always-Visible Publish Button */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">

        <button
          onClick={onOpenPreview}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all flex items-center gap-1"
          title="Preview Email"
        >
          <Eye className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden md:inline">Preview</span>
        </button>

        <button
          onClick={onOpenSendTest}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all flex items-center gap-1"
          title="Send Test Email"
        >
          <Send className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">Send Test</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all flex items-center gap-1"
            title="Export Options"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 w-52 z-50 animate-in fade-in duration-150">
              <button
                onClick={() => { onExportHtml('download'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-medium"
              >
                <Code className="w-4 h-4 text-teal-400" /> Download HTML File
              </button>
              <button
                onClick={() => { onExportHtml('copy'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-medium"
              >
                <FileText className="w-4 h-4 text-blue-400" /> Copy Inline HTML
              </button>
              <button
                onClick={() => { onExportHtml('json'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-medium"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Copy JSON Schema
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onSaveAsTemplate}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all flex items-center gap-1"
          title="Save as My Custom Template"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Save Template</span>
        </button>

        {/* ALWAYS-VISIBLE PRIMARY PUBLISH CTA BUTTON */}
        <button
          onClick={onPublish}
          className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0 flex items-center gap-1.5"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Publish Email</span>
        </button>

        {/* Right Inspector Toggle */}
        <button
          onClick={onToggleRightPanel}
          className={`p-1.5 rounded-lg border transition-colors ${isRightPanelOpen ? 'bg-slate-800 text-teal-400 border-slate-700' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
          title={isRightPanelOpen ? "Collapse Properties Inspector" : "Expand Properties Inspector"}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Window Fullscreen & Close Action Icons */}
        <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1">
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Full Screen Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-teal-400" />}
          </button>
          
          <button
            onClick={onCloseStudio}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Cancel / Close Studio"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
