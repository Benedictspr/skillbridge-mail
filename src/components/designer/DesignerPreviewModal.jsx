import React, { useState } from 'react';
import { 
  X, Smartphone, Monitor, Tablet, Sun, Moon, Mail, Check, 
  Send, ExternalLink, RefreshCw, ShieldAlert
} from 'lucide-react';
import { exportToHtml } from './htmlExporter';

export default function DesignerPreviewModal({ isOpen, onClose, emailData, recipient }) {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clientSim, setClientSim] = useState('gmail'); // 'gmail' | 'outlook' | 'apple' | 'yahoo'

  if (!isOpen) return null;

  const htmlContent = exportToHtml(emailData);

  const sampleRecipient = recipient || {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@company.com',
    company: 'Sendaat Network',
    role: 'Product Lead'
  };

  // Process text merge tags for live simulation
  const renderedHtml = htmlContent
    .replaceAll('{{first_name}}', sampleRecipient.firstName)
    .replaceAll('{{last_name}}', sampleRecipient.lastName)
    .replaceAll('{{email}}', sampleRecipient.email)
    .replaceAll('{{company}}', sampleRecipient.company)
    .replaceAll('{{role}}', sampleRecipient.role);

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200 font-sans">
      
      {/* Top Preview Controls Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10 text-white">
        
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Live Email Preview Studio</h2>
            <p className="text-[11px] text-slate-400">Simulating recipient experience for {sampleRecipient.email}</p>
          </div>
        </div>

        {/* Center Device & Client Controls */}
        <div className="flex items-center gap-3">
          
          {/* Device Frame Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800" title="Switch Device Frame">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${device === 'desktop' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Desktop View (960px container)"
            >
              <Monitor className="w-4 h-4" /> Desktop
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${device === 'tablet' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Tablet View (768px container)"
            >
              <Tablet className="w-4 h-4" /> Tablet
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${device === 'mobile' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Mobile View (375px container)"
            >
              <Smartphone className="w-4 h-4" /> Mobile
            </button>
          </div>

          {/* Client Simulator Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold" title="Simulate Target Email Client Header">
            {['gmail', 'outlook', 'apple', 'yahoo'].map(sim => (
              <button
                key={sim}
                onClick={() => setClientSim(sim)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${clientSim === sim ? 'bg-emerald-600 text-white shadow font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {sim}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${isDarkMode ? 'bg-indigo-950 text-indigo-400 border-indigo-500/40' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}
            title="Toggle Client Dark Mode Simulation"
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

      </div>

      {/* Main Preview Container Viewport */}
      <div className={`flex-1 overflow-auto p-6 flex flex-col items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-900/60'}`}>
        
        {/* SIMULATED CLIENT FRAME */}
        <div
          className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
          style={{
            width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '960px',
            maxHeight: '85vh'
          }}
        >

          {/* SIMULATED CLIENT HEADER BAR */}
          <div className={`p-4 border-b flex items-center justify-between text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                SD
              </div>
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>Sendaat Studio Outreach</span>
                  <span className="text-[10px] font-normal text-slate-400">&lt;outreach@sendaat.io&gt;</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">To: {sampleRecipient.email}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Today at 10:42 AM ({clientSim.toUpperCase()} Client)
            </div>
          </div>

          {/* SIMULATED EMAIL CONTENT IFRAME */}
          <div className="flex-1 overflow-y-auto bg-slate-100 min-h-[520px]">
            <iframe
              srcDoc={renderedHtml}
              title="Email Render Preview"
              className="w-full min-h-[520px] border-none"
              style={{
                filter: isDarkMode ? 'invert(0.9) hue-rotate(180deg)' : 'none'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
