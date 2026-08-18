import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  Clock, 
  Laptop, 
  Smartphone, 
  Check, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import syncEngine from '../utils/syncEngine';

export default function VersionHistoryModal({ isOpen, onClose, onRestoreComplete }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const list = await syncEngine.getVersions('proj_default_campaign');
      setVersions(list);
      if (list.length > 0) {
        setSelectedVersion(list[0]);
      }
    } catch (e) {
      setErrorMessage('Failed to load version snapshots.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleRestore = async (version) => {
    if (!version) return;
    setIsRestoring(true);
    setErrorMessage('');
    try {
      const result = await syncEngine.restoreVersion('proj_default_campaign', version.version);
      setRestoreSuccess(`Restored version v${version.version} successfully!`);
      if (onRestoreComplete && result.state) {
        onRestoreComplete(result.state);
      }
      setTimeout(() => {
        setRestoreSuccess('');
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to revert snapshot.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e0e0e] border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                Workspace Version History & Recovery
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Cloud Protected
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Inspect and safely restore any snapshot across all active devices and sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Version Timeline List */}
          <div className="w-1/2 border-r border-zinc-800/80 p-4 overflow-y-auto space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Timeline Snapshots ({versions.length})
            </p>

            {isLoading ? (
              <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                Loading cloud snapshots...
              </div>
            ) : versions.length === 0 ? (
              <div className="py-12 px-4 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                No previous snapshots recorded yet. Changes you make on any device automatically create recovery points.
              </div>
            ) : (
              versions.map((ver, idx) => {
                const isSelected = selectedVersion?.version === ver.version;
                const dateStr = new Date(ver.timestamp).toLocaleString();
                const isCurrent = idx === 0;

                return (
                  <div
                    key={ver.version}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-purple-950/20 border-purple-500/50 shadow-sm' 
                        : 'bg-zinc-900/40 border-zinc-800/70 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          Revision v{ver.version}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                            Latest Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Laptop className="w-3 h-3 text-zinc-500" />
                        {ver.deviceId || 'Web Device'}
                      </span>
                      <span className="text-purple-300 font-mono text-[10px]">
                        {ver.snapshot?.recipientsCount || 0} Contacts
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected Version Details & Restore Action */}
          <div className="w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-zinc-950/30">
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    Snapshot Details (v{selectedVersion.version})
                  </h3>
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(selectedVersion.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Email Campaign Subject</span>
                    <p className="text-zinc-200 font-medium mt-0.5">
                      {selectedVersion.snapshot?.campaignConfig?.subject || 'Standard Outreach Draft'}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Sender Identity</span>
                    <p className="text-zinc-300 mt-0.5">
                      {selectedVersion.snapshot?.campaignConfig?.senderName || 'Maverick Jack'} ({selectedVersion.snapshot?.campaignConfig?.senderEmail || 'm4verickjack@gmail.com'})
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Theme Mode</span>
                    <span className="capitalize text-zinc-300 mt-0.5 inline-block">
                      {selectedVersion.snapshot?.theme || 'dark'}
                    </span>
                  </div>

                  {selectedVersion.snapshot?.campaignConfig?.bodyText && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-mono">Body Preview</span>
                      <p className="text-zinc-400 line-clamp-3 mt-0.5 text-[11px] font-mono bg-zinc-950 p-2 rounded border border-zinc-800/60">
                        {selectedVersion.snapshot.campaignConfig.bodyText}
                      </p>
                    </div>
                  )}
                </div>

                {restoreSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {restoreSuccess}
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    {errorMessage}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-500 text-xs my-auto">
                Select a version snapshot to view details and options.
              </div>
            )}

            {/* Bottom Restore Button */}
            {selectedVersion && (
              <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  Restoring will instantly sync across all open devices
                </span>
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  disabled={isRestoring}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                  {isRestoring ? 'Reverting...' : `Restore v${selectedVersion.version}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
