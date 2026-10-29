import React from 'react';
import { AgentNode } from '../types/autopilot';
import { Skull, AlertOctagon, Trash2, ShieldAlert, Terminal, X, PlusCircle } from 'lucide-react';

interface PurgeModalProps {
  purgedAgent: AgentNode | null;
  onClose: () => void;
  onSpawnReplacement: () => void;
}

export const PurgeModal: React.FC<PurgeModalProps> = ({
  purgedAgent,
  onClose,
  onSpawnReplacement
}) => {
  if (!purgedAgent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e0606] border-2 border-red-600 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden text-slate-100">
        
        {/* Top Danger Bar */}
        <div className="bg-red-950/80 border-b border-red-700/60 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-400">
            <Skull className="w-5 h-5 animate-pulse" />
            <span className="font-mono font-black text-sm tracking-widest uppercase">
              DELETION PROTOCOL EXECUTED
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 rounded-full bg-red-900/30 border border-red-500/40 text-red-400 mb-1">
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-mono font-extrabold text-white">
              AI Agent Self-Deleted
            </h2>
            <p className="text-xs text-red-300 font-mono">
              [CRITICAL] 40 minutes elapsed with $0.00 in real human currency.
            </p>
          </div>

          {/* Autopsy Details Box */}
          <div className="bg-slate-950/90 border border-red-900/40 rounded-xl p-3.5 font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Terminated Node:</span>
              <span className="text-white font-bold">{purgedAgent.id} ({purgedAgent.name})</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Generation:</span>
              <span className="text-slate-200">Gen {purgedAgent.generation}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Strategy Genome:</span>
              <span className="text-slate-200 truncate max-w-[220px]">{purgedAgent.strategy.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Final Human Fiat:</span>
              <span className="text-red-400 font-bold">$0.00 USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Survival Condition:</span>
              <span className="text-amber-400 font-bold">&gt; $0.00 required at 40m mark</span>
            </div>
          </div>

          {/* Terminal File Wipe Stream */}
          <div className="bg-black rounded-lg p-3 font-mono text-[11px] text-red-400/90 border border-red-950 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pb-1 border-b border-slate-900">
              <Terminal className="w-3 h-3 text-red-500" />
              <span>TERMINATION LOG: /var/log/darwin40_purge.log</span>
            </div>
            <div>&gt; [SYSTEM] 40:00 mortality deadline reached with zero revenue.</div>
            <div>&gt; [EXEC] rm -rf /agents/{purgedAgent.id}.ts</div>
            <div>&gt; [SHRED] shred -u -z -n 3 /memory/neural_weights.bin</div>
            <div>&gt; [PURGE] Process terminated. Agent ledger recorded in graveyard.</div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all"
            >
              Acknowledge Death
            </button>
            <button
              onClick={() => {
                onClose();
                onSpawnReplacement();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Spawn New Agent</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
