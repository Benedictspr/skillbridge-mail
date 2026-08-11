import React, { useState } from 'react';
import { 
  Undo2, Redo2, Eye, Smartphone, Monitor, Download, Send, Bookmark, 
  Rocket, CheckCircle2, ChevronDown, ZoomIn, ZoomOut, Edit2, Check,
  Code, Sparkles, FileText, Minimize2, Maximize2, X, PanelLeftClose, 
  PanelLeftOpen, Sliders, ChevronLeft, ChevronRight, FileJson, Maximize, LayoutTemplate, Palette
} from 'lucide-react';

export default function DesignerTopToolbar({
  projectName,
  setProjectName,
  saveStatus = 'Saved',
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenPreview,
  previewDevice = 'desktop',
  setPreviewDevice,
  zoomLevel = 100,
  setZoomLevel,
  onOpenSendTest,
  onExportHtml,
  onSaveAsTemplate,
  onPublish,
  isFullscreen = false,
  onToggleFullscreen,
  onCloseStudio,
  isLeftSidebarOpen = true,
  onToggleLeftSidebar,
  isRightPanelOpen = true,
  onToggleRightPanel,
  editorMode = 'visual',
  setEditorMode
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName || 'Sendaat Email Studio');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) setProjectName(tempName.trim());
    setIsEditingName(false);
  };

  const zoomOptions = [25, 50, 75, 100, 125, 150, 200, 300];

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(300, prev + 25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(25, prev - 25));
  };

  const handleFitScreen = () => {
    setZoomLevel(100);
  };

  return (
    <div className="h-12 bg-[#09090B] border-b border-zinc-800/80 px-3 flex items-center justify-between gap-2 z-40 select-none w-full font-sans overflow-x-auto text-white">
      
      {/* LEFT REGION: Close X Button, Title, Save Status, Workspace Mode Switcher */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Close Button Changed to 'X' */}
        <button
          onClick={onCloseStudio}
          className="p-1.5 rounded-lg transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800/80"
          title="Exit / Close Email Studio"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Studio Title - Onboarding Typography (Google Sans, font-normal, text-sm) */}
        <div className="flex items-center gap-1.5">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                onBlur={handleSaveName}
                autoFocus
                className="bg-black border border-zinc-700 px-2 py-0.5 rounded-md text-sm font-normal text-white outline-none w-48 font-sans"
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                title="Save Project Title"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-zinc-900 transition-all cursor-pointer group"
              title="Click to rename design project"
            >
              <span className="font-normal text-sm text-white max-w-[160px] sm:max-w-[200px] truncate tracking-tight font-sans">
                {projectName || 'Sendaat Email Studio'}
              </span>
              <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Real Save Status Badge - Onboarding Style */}
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-normal transition-all font-sans ${
              saveStatus === 'Saving...'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : saveStatus === 'Save failed'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
            title={`Auto-Save Status: ${saveStatus}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'Saving...'
                ? 'bg-amber-400 animate-ping'
                : saveStatus === 'Save failed'
                ? 'bg-rose-400'
                : 'bg-emerald-400 animate-pulse'
            }`} />
            <span>{saveStatus}</span>
          </span>
        </div>

        {/* Workspace Mode Switcher (Visual / Design / Text) */}
        <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg ml-1 font-sans shadow-inner" title="Switch Editor Workspaces">
          <button
            onClick={() => setEditorMode('visual')}
            className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              editorMode === 'visual'
                ? 'bg-white text-black shadow-md font-extrabold scale-105'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            title="Visual Drag & Drop Email Studio (Visual)"
          >
            <LayoutTemplate className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditorMode('design')}
            className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              editorMode === 'design'
                ? 'bg-white text-black shadow-md font-extrabold scale-105'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            title="Vector Design Studio Canvas (Design)"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditorMode('text')}
            className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              editorMode === 'text'
                ? 'bg-white text-black shadow-md font-extrabold scale-105'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            title="Plain Text & Form Editor Mode (Text)"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CENTER REGION: Undo / Redo & Device View & Zoom Engine */}
      <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
        
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            canUndo 
              ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' 
              : 'text-zinc-600 opacity-40 cursor-not-allowed'
          }`}
          title="Undo Action (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo Button */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            canRedo 
              ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' 
              : 'text-zinc-600 opacity-40 cursor-not-allowed'
          }`}
          title="Redo Action (Ctrl+Y or Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Device View Switcher */}
        <div className="flex items-center p-0.5 bg-black border border-zinc-800 rounded-lg" title="Responsive Device Canvas View">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              previewDevice === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
            }`}
            title="Desktop Canvas View (640px)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              previewDevice === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
            }`}
            title="Mobile Responsive View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Zoom Engine */}
        <div className="flex items-center gap-1 bg-black p-0.5 border border-zinc-800 rounded-lg">
          <button
            onClick={handleZoomOut}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            title="Zoom Out (Ctrl -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className="flex items-center gap-1 px-1 py-0.5 hover:bg-zinc-800 rounded text-xs font-mono text-white transition-colors cursor-pointer"
              title="Zoom Options"
            >
              <span>{zoomLevel}%</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showZoomMenu && (
              <div className="absolute top-full left-0 mt-1 w-28 bg-[#121212] border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 animate-fade-in font-sans">
                <button
                  onClick={() => {
                    handleFitScreen();
                    setShowZoomMenu(false);
                  }}
                  className="w-full text-left px-3 py-1 text-xs font-normal text-zinc-300 hover:bg-zinc-800 border-b border-zinc-800/80 flex items-center justify-between cursor-pointer"
                >
                  <span>Fit 100%</span>
                  <Maximize className="w-3 h-3 text-zinc-400" />
                </button>
                {zoomOptions.map(z => (
                  <button
                    key={z}
                    onClick={() => {
                      setZoomLevel(z);
                      setShowZoomMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                      zoomLevel === z ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleZoomIn}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            title="Zoom In (Ctrl +)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RIGHT REGION: Icon-Only Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0 font-sans">
        
        {/* Preview Button */}
        <button
          onClick={onOpenPreview}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
          title="Live Email Preview Studio (Preview)"
        >
          <Eye className="w-4 h-4 text-zinc-300" />
        </button>

        {/* Send Test Button */}
        <button
          onClick={onOpenSendTest}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
          title="Send Inbox Test Email (Send Test)"
        >
          <Send className="w-4 h-4 text-zinc-300" />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-white transition-all cursor-pointer flex items-center gap-0.5 shadow-xs"
            title="Export Options (HTML / JSON)"
          >
            <Download className="w-4 h-4 text-zinc-300" />
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-[#121212] border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 animate-fade-in font-sans">
              <button
                onClick={() => {
                  onExportHtml('download');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 text-xs font-normal text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download HTML File</span>
              </button>
              <button
                onClick={() => {
                  onExportHtml('copy');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 text-xs font-normal text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-sky-400" />
                <span>Copy Inline HTML</span>
              </button>
              <button
                onClick={() => {
                  onExportHtml('json');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3.5 py-1.5 text-xs font-normal text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer border-t border-zinc-800/80"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-400" />
                <span>Export JSON Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Template Button */}
        <button
          onClick={onSaveAsTemplate}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
          title="Save as Template"
        >
          <Bookmark className="w-4 h-4 text-zinc-300" />
        </button>

        {/* Primary Action: Publish Email */}
        <button
          onClick={onPublish}
          className="p-1.5 sm:px-3 sm:py-1 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          title="Publish Email to Live Campaign"
        >
          <Rocket className="w-4 h-4 text-black stroke-[2.5]" />
          <span className="hidden sm:inline">Publish</span>
        </button>
      </div>

    </div>
  );
}
