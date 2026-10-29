import React, { useState } from 'react';
import { AgentNode } from '../types/autopilot';
import { soundEngine } from '../services/soundEngine';
import { Code2, Copy, Check, X, FileCode, ShieldAlert, Cpu } from 'lucide-react';

interface AgentCodeModalProps {
  agent: AgentNode | null;
  onClose: () => void;
}

export const AgentCodeModal: React.FC<AgentCodeModalProps> = ({ agent, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(agent.virtualCodeFile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#090d16] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Top Header */}
        <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                <span>autopilot_node_{agent.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ts</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  GEN {agent.generation}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Self-destruct and mitosis execution daemon source
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-all border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content Viewport */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-[#06080e] text-cyan-100 leading-relaxed space-y-1">
          <pre className="whitespace-pre font-mono">
            {agent.virtualCodeFile}
          </pre>
        </div>

        {/* Footer Notice */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Failsafe active: zero human currency at 40m triggers file deletion and memory shred.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
