import React from 'react';
import { Menu, Search, SlidersHorizontal, HelpCircle, Settings, Grid, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';

export default function GmailMintHeader({ 
  searchTerm, 
  setSearchTerm, 
  campaignStatus, 
  onRefresh, 
  onToggleSidebar, 
  onOpenSettings,
  onNavigateHome 
}) {
  return (
    <header className="px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 bg-[#D4F1E8]">
      {/* Brand Logo & Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
          title="Main Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Gmail Official Style Logo */}
        <div onClick={onNavigateHome} className="flex items-center gap-2.5 cursor-pointer">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 19V6.5L12 13.5L22.5 6.5V19C22.5 19.8284 21.8284 20.5 21 20.5H3C2.17157 20.5 1.5 19.8284 1.5 19Z" fill="#EA4335" />
            <path d="M22.5 6.5L12 13.5L1.5 6.5V5.5C1.5 4.67157 2.17157 4 3 4H21C21.8284 4 22.5 4.67157 22.5 5.5V6.5Z" fill="#4285F4" />
            <path d="M1.5 6.5L12 13.5L22.5 6.5" stroke="#34A853" strokeWidth="1.5" />
          </svg>
          <span className="font-bold text-xl text-gray-800 tracking-tight font-sans">
            Gmail <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full ml-1 border border-blue-200">Sendaat</span>
          </span>
        </div>
      </div>

      {/* Center Search Mail Bar */}
      <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
        <div className="gmail-mint-search px-4 py-2 flex items-center gap-3 text-gray-600">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search mail, recipients, roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500 font-sans"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          <SlidersHorizontal className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-900" />
        </div>
      </div>

      {/* Right Toolbar Controls (Help, Settings, Sparkle, Upgrade, Grid, Avatar) */}
      <div className="flex items-center gap-2">
        <div 
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-blue-800 text-xs font-bold border border-blue-200 cursor-pointer hover:bg-white shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{campaignStatus === 'SENDING' ? 'Engine Sending (1-by-1)' : 'Gmail SMTP Backend Ready'}</span>
        </div>

        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
          title="Refresh Mail"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Support">
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"
          title="Gmail Gateway Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Upgrade Pill Button */}
        <button 
          onClick={onOpenSettings}
          className="bg-[#D3E3FD] hover:bg-blue-200 text-[#041E49] font-bold text-xs px-3.5 py-1.5 rounded-full border border-blue-300 shadow-xs hidden lg:flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Upgrade</span>
        </button>

        <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors">
          <Grid className="w-4.5 h-4.5" />
        </button>

        {/* Avatar Icon */}
        <div 
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-sm ml-1 cursor-pointer hover:opacity-90"
        >
          A
        </div>
      </div>
    </header>
  );
}
