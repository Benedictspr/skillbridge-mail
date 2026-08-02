import React from 'react';
import { Calendar, Lightbulb, CheckSquare, User, Plus, ChevronRight } from 'lucide-react';

export default function GmailMintRightPanel() {
  return (
    <aside className="w-14 bg-[#D4F1E8] border-l border-black/10 py-3 flex flex-col items-center justify-between shrink-0 hidden lg:flex">
      <div className="space-y-4">
        {/* Calendar 31 */}
        <button className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-blue-600 transition-colors" title="Calendar">
          <div className="relative font-bold text-xs">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="absolute top-1 left-1.5 text-[9px] font-extrabold text-blue-900">31</span>
          </div>
        </button>

        {/* Keep Lightbulb */}
        <button className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-amber-500 transition-colors" title="Keep">
          <Lightbulb className="w-5 h-5 text-amber-500" />
        </button>

        {/* Tasks Checkmark */}
        <button className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-blue-500 transition-colors" title="Tasks">
          <CheckSquare className="w-5 h-5 text-blue-500" />
        </button>

        {/* Contacts User */}
        <button className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-indigo-500 transition-colors" title="Contacts">
          <User className="w-5 h-5 text-indigo-500" />
        </button>

        <div className="w-6 border-b border-black/10 my-2" />

        {/* Add Addon */}
        <button className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-700 transition-colors" title="Get add-ons">
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <button className="w-9 h-9 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-600 transition-colors" title="Hide side panel">
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </aside>
  );
}
