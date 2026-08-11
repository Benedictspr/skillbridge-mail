import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, Target, Mail, Users, ArrowRight, ArrowLeft, 
  CheckCircle2, Sparkles, Check, Layers, UserCheck, Rocket, Send
} from 'lucide-react';

export default function OnboardingWizard({ currentUser, onCompleteOnboarding }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [workspaceName, setWorkspaceName] = useState(currentUser?.company || 'My Workspace');
  const [domainName, setDomainName] = useState('sendaat.io');
  const [teamSize, setTeamSize] = useState('1-5');
  const [useCase, setUseCase] = useState('talent');
  const [senderMode, setSenderMode] = useState('gmail');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || 'outreach@company.com');
  const [importOption, setImportOption] = useState('sample');
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsFinishing(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setTimeout(() => {
        setIsFinishing(false);
        onCompleteOnboarding({
          workspaceName,
          domainName,
          teamSize,
          useCase,
          senderMode,
          senderEmail,
          importOption
        });
      }, 1000);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between p-4 sm:p-8 font-sans select-none">
      
      {/* Top Header Bar - Original Google Sans Normal Typography */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-xs">
            <Send className="w-4 h-4 text-black" />
          </div>
          <span className="font-normal text-xl text-white tracking-tight font-sans">
            Sendaat Setup
          </span>
        </div>

        <div className="text-xs font-medium text-zinc-300 bg-[#121212] px-3.5 py-1.5 rounded-full border border-zinc-800">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Main Wizard Card - Vantablack Monochromatic Surface */}
      <div className="w-full max-w-3xl mx-auto my-auto bg-[#121212] rounded-[28px] border border-zinc-800 shadow-2xl overflow-hidden font-sans">
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-black">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8 sm:p-12">
          
          {/* STEP 1: Workspace */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Set up your workspace
                </h1>
                <p className="text-zinc-400 text-sm mt-1.5 font-normal leading-relaxed">
                  Configure your organization profile for deliverability optimization and domain authentication.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Workspace name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Apex Global Talent"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-sm outline-none font-sans font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Sending domain
                  </label>
                  <div className="flex items-center">
                    <span className="px-3.5 py-3 bg-zinc-900 border border-r-0 border-zinc-800 rounded-l-xl text-zinc-400 text-sm font-mono font-normal">
                      https://
                    </span>
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      placeholder="company.com"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-r-xl text-white text-sm outline-none font-sans font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Team size
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['1-5', '6-25', '26-100', '100+'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          teamSize === size 
                            ? 'bg-white text-black border-white shadow-xs font-medium' 
                            : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700 font-normal'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goal */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Select your primary objective
                </h1>
                <p className="text-zinc-400 text-sm mt-1.5 font-normal leading-relaxed">
                  We'll optimize your campaign throttle limits and spam shields based on your choice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    id: 'talent',
                    title: 'Talent & Student Sourcing',
                    desc: 'Outreach to top university tutors, candidates, and scholars.',
                    icon: UserCheck
                  },
                  {
                    id: 'sales',
                    title: 'B2B Sales Prospecting',
                    desc: 'Cold email sequences for executives and B2B buyers.',
                    icon: Rocket
                  },
                  {
                    id: 'recruitment',
                    title: 'Agency & Recruiting',
                    desc: 'Manage multiple client rosters with domain isolation.',
                    icon: Layers
                  },
                  {
                    id: 'marketing',
                    title: 'Newsletters & E-commerce',
                    desc: 'Broadcast promotional templates to subscribers.',
                    icon: Sparkles
                  }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = useCase === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setUseCase(item.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-white bg-zinc-900 text-white shadow-md' 
                          : 'border-zinc-800 bg-black text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center mb-3">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h4 className="font-medium text-white text-sm font-sans">{item.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 font-normal leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Mailbox */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Connect sending mailbox
                </h1>
                <p className="text-zinc-400 text-sm mt-1.5 font-normal leading-relaxed">
                  Select your dispatch option. Sendaat manages DKIM keys and rate limits automatically.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { id: 'gmail', title: 'Google Workspace / Gmail API', desc: 'Direct OAuth connection to Google Inboxes for max deliverability.' },
                  { id: 'smtp', title: 'Custom SMTP Server', desc: 'Use SendGrid, AWS SES, or private corporate mail servers.' },
                  { id: 'demo', title: 'Sendaat Sandbox (Demo Mode)', desc: 'Test campaigns immediately with simulated dispatch.' }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSenderMode(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      senderMode === opt.id 
                        ? 'border-white bg-zinc-900 text-white shadow-md' 
                        : 'border-zinc-800 bg-black text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white text-sm font-sans">{opt.title}</div>
                      <p className="text-xs text-zinc-400 mt-0.5 font-normal">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${senderMode === opt.id ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                      {senderMode === opt.id && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                ))}

                <div className="pt-3">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Primary sender email
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-zinc-500 rounded-xl text-white text-sm outline-none font-sans font-normal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Leads */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Import initial contacts
                </h1>
                <p className="text-zinc-400 text-sm mt-1.5 font-normal leading-relaxed">
                  Populate your initial roster to test dispatching.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { id: 'sample', title: 'Pre-populate 10 Sample Verified Student Tutors', desc: 'Load active candidate records with 100% verified status.' },
                  { id: 'csv', title: 'Upload CSV Spreadsheet', desc: 'Import contacts directly with field mapping.' },
                  { id: 'scratch', title: 'Start with Blank Console', desc: 'Add contacts manually from the workspace later.' }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setImportOption(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      importOption === opt.id 
                        ? 'border-white bg-zinc-900 text-white shadow-md' 
                        : 'border-zinc-800 bg-black text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white text-sm font-sans">{opt.title}</div>
                      <p className="text-xs text-zinc-400 mt-0.5 font-normal">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${importOption === opt.id ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                      {importOption === opt.id && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nav Footer */}
          <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isFinishing}
                className="px-5 py-2.5 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={isFinishing}
              className="px-7 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isFinishing ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <span>{step === totalSteps ? 'Complete & Launch' : 'Continue'}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs font-normal text-zinc-500 py-2">
        Sendaat Workspace Setup Protocol
      </div>
    </div>
  );
}
