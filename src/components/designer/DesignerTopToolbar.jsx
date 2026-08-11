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
  const [tempName, setTempName] = useState(projectName || 'Sendaat Email Studio');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) setProjectName(tempName.trim());
    setIsEditingName(false);
  };

  const zoomOptions = [25, 50, 75, 100, 125, 150, 200, 300, 400];

  return (
    <div className="h-14 bg-[#09090B] border-b border-zinc-800 px-4 flex items-center justify-between gap-2 z-40 select-none w-full font-sans overflow-x-auto text-white">
      
      {/* LEFT REGION: Window Dots, Sidebar Toggle, Title, Mode Switcher */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* macOS Window Control Dots */}
        <div className="hidden sm:flex items-center gap-1 mr-1">
          <button
            onClick={onCloseStudio}
            className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-[8px] text-black font-bold opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            title="Close / Cancel Studio"
          >
            ✕
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-[8px] text-black font-bold opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            title="Minimize Studio View"
          >
            –
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[8px] text-black font-bold opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            title="Maximize Studio Fullscreen"
          >
            +
          </button>
        </div>

        {/* Sidebar Toggle Icon Button */}
        <button
          onClick={onToggleLeftSidebar}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isLeftSidebarOpen 
              ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800' 
              : 'bg-white text-black border-white shadow-xs font-bold'
          }`}
          title={isLeftSidebarOpen ? "Collapse Components Drawer" : "Expand Components Drawer"}
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Project Name Input */}
        <div className="flex items-center gap-1.5">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="bg-black border border-zinc-700 px-2 py-0.5 rounded-lg text-xs font-bold text-white outline-none w-48 font-sans"
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded-md bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer group"
              title="Click to rename design project"
            >
              <span className="font-extrabold text-xs text-white max-w-[160px] sm:max-w-[200px] truncate tracking-tight font-sans">
                {projectName || 'Sendaat Email Studio'}
              </span>
              <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* Save Status Badge */}
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black border border-zinc-800 text-[10px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {saveStatus}
          </span>
        </div>

        {/* Editor Mode Tabs (Visual / Design / Text) */}
        <div className="flex items-center p-0.5 bg-black border border-zinc-800 rounded-xl ml-1">
          <button
            onClick={() => setEditorMode('visual')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              editorMode === 'visual'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Visual
          </button>
          <button
            onClick={() => setEditorMode('design')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              editorMode === 'design'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setEditorMode('text')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              editorMode === 'text'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Text
          </button>
        </div>
      </div>

      {/* CENTER REGION: Undo / Redo & Zoom Controls */}
      <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            canUndo 
              ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
              : 'bg-black border-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed'
          }`}
          title="Undo Action (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            canRedo 
              ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
              : 'bg-black border-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed'
          }`}
          title="Redo Action (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* Device Preview Switcher */}
        <div className="flex items-center p-0.5 bg-black border border-zinc-800 rounded-xl">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              previewDevice === 'desktop' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-white'
            }`}
            title="Desktop Canvas View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              previewDevice === 'mobile' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-white'
            }`}
            title="Mobile Canvas View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Selector */}
        <div className="relative">
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="flex items-center gap-1 px-2.5 py-1 bg-black border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-mono text-white transition-colors cursor-pointer"
          >
            <span>{zoomLevel}%</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showZoomMenu && (
            <div className="absolute top-full left-0 mt-1 w-24 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 animate-fade-in">
              {zoomOptions.map(z => (
                <button
                  key={z}
                  onClick={() => {
                    setZoomLevel(z);
                    setShowZoomMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                    zoomLevel === z ? 'bg-white text-black font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {z}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT REGION: Actions & CTA Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Preview Button */}
        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Send Test Button */}
        <button
          onClick={onOpenSendTest}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send Test</span>
        </button>

        {/* Export Code Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 animate-fade-in font-sans">
              <button
                onClick={() => {
                  onExportHtml('download');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Download HTML</span>
              </button>
              <button
                onClick={() => {
                  onExportHtml('copy');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Raw HTML</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Template Button */}
        <button
          onClick={onSaveAsTemplate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Save Template</span>
        </button>

        {/* Primary Action: Publish Email */}
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Rocket className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          <span>Publish Email</span>
        </button>
      </div>

    </div>
  );
}
