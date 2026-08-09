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
  const [teamSize, setTeamSize] = useState('1-10');
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
    <div className="min-h-screen w-full bg-[#F0F4F9] text-[#1F1F1F] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#D3E3FD]">
      {/* Top Header */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B57D0] flex items-center justify-center text-white shadow-xs">
            <Send className="w-4 h-4" />
          </div>
          <span className="font-normal text-xl text-[#1F1F1F] tracking-tight">
            Sendaat Setup
          </span>
        </div>

        <div className="text-xs font-medium text-[#444746] bg-white px-3 py-1.5 rounded-full border border-[#DADCE0]">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="w-full max-w-3xl mx-auto my-auto bg-white rounded-[28px] border border-[#DADCE0] shadow-[0_1px_3px_0_rgba(60,64,67,0.08),0_4px_12px_4px_rgba(60,64,67,0.04)] overflow-hidden font-sans">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-[#E1E3E1]">
          <div 
            className="h-full bg-[#0B57D0] transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8 sm:p-12">
          {/* STEP 1: Workspace */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-[#1F1F1F] tracking-tight">
                  Set up your workspace
                </h1>
                <p className="text-[#444746] text-sm mt-1.5">
                  Configure your organization profile for deliverability optimization.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    Workspace name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Apex Global Talent"
                    className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] focus:ring-2 focus:ring-[#0B57D0]/20 rounded-xl text-[#1F1F1F] text-sm outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    Sending domain
                  </label>
                  <div className="flex items-center">
                    <span className="px-3.5 py-3 bg-[#F8F9FA] border border-r-0 border-[#747775] rounded-l-xl text-[#5F6368] text-sm font-mono">
                      https://
                    </span>
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      placeholder="company.com"
                      className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-r-xl text-[#1F1F1F] text-sm outline-none font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    Team size
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['1-5', '6-25', '26-100', '100+'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          teamSize === size 
                            ? 'bg-[#E8F0FE] text-[#0B57D0] border-[#0B57D0]' 
                            : 'bg-white text-[#444746] border-[#DADCE0] hover:bg-[#F8F9FA]'
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
                <h1 className="text-2xl sm:text-3xl font-normal text-[#1F1F1F] tracking-tight">
                  Select your primary objective
                </h1>
                <p className="text-[#444746] text-sm mt-1.5">
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
                          ? 'border-[#0B57D0] bg-[#F0F4F9]' 
                          : 'border-[#DADCE0] bg-white hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center mb-3">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-[#1F1F1F] text-sm">{item.title}</h4>
                      <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">{item.desc}</p>
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
                <h1 className="text-2xl sm:text-3xl font-normal text-[#1F1F1F] tracking-tight">
                  Connect sending mailbox
                </h1>
                <p className="text-[#444746] text-sm mt-1.5">
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
                        ? 'border-[#0B57D0] bg-[#F0F4F9]' 
                        : 'border-[#DADCE0] bg-white hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] text-sm">{opt.title}</div>
                      <p className="text-xs text-[#5F6368] mt-0.5">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${senderMode === opt.id ? 'border-[#0B57D0] bg-[#0B57D0] text-white' : 'border-[#747775]'}`}>
                      {senderMode === opt.id && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                ))}

                <div className="pt-3">
                  <label className="block text-xs font-medium text-[#444746] mb-1.5">
                    Primary sender email
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#747775] focus:border-[#0B57D0] rounded-xl text-[#1F1F1F] text-sm outline-none font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Leads */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal text-[#1F1F1F] tracking-tight">
                  Import initial contacts
                </h1>
                <p className="text-[#444746] text-sm mt-1.5">
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
                        ? 'border-[#0B57D0] bg-[#F0F4F9]' 
                        : 'border-[#DADCE0] bg-white hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#1F1F1F] text-sm">{opt.title}</div>
                      <p className="text-xs text-[#5F6368] mt-0.5">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${importOption === opt.id ? 'border-[#0B57D0] bg-[#0B57D0] text-white' : 'border-[#747775]'}`}>
                      {importOption === opt.id && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nav Footer */}
          <div className="mt-10 pt-6 border-t border-[#E1E3E1] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isFinishing}
                className="px-5 py-2.5 rounded-full border border-[#747775] text-[#1F1F1F] hover:bg-[#F8F9FA] text-xs font-medium transition-colors"
              >
                Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={isFinishing}
              className="px-7 py-2.5 bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium rounded-full shadow-xs transition-colors flex items-center gap-2"
            >
              {isFinishing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{step === totalSteps ? 'Complete & Launch' : 'Continue'}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#747775] py-2">
        Sendaat Workspace Setup Protocol
      </div>
    </div>
  );
}
