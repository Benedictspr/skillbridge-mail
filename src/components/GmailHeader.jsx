import React from 'react';
import { Search, Menu, SlidersHorizontal, Settings, Grid, Mail, RefreshCw, ShieldCheck, X } from 'lucide-react';

export default function GmailHeader({ 
  searchTerm, 
  setSearchTerm, 
  campaignStatus, 
  onRefresh, 
  onToggleSidebar, 
  onOpenSettings,
  onNavigateHome 
}) {
  return (
    <header className="bg-[#F6F8FC] border-b border-[#E0E3E7] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Menu */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-200/70 rounded-full text-gray-600 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div onClick={onNavigateHome} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-1.5 font-sans">
              Sendaat <span className="text-blue-600">Mail</span>
            </span>
          </div>
        </div>
      </div>

      {/* Gmail Search Input */}
      <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
        <div className="gmail-search-bar px-4 py-2 flex items-center gap-3 text-gray-600">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search recipients, email body, roles, templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-gray-800 placeholder-gray-500 font-sans"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          <SlidersHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-2">
        <div 
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{campaignStatus === 'SENDING' ? 'Engine Sending (1-by-1)' : 'Gateway Ready'}</span>
        </div>

        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-gray-200/70 rounded-full text-gray-600 transition-colors"
          title="Refresh Workspace"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-200/70 rounded-full text-gray-600 transition-colors"
          title="App Gateway Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div 
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs shadow-sm ml-1 cursor-pointer hover:bg-gray-800 transition-colors"
          title="Account & Gateway Setup"
        >
          B
        </div>
      </div>
    </header>
  );
}
