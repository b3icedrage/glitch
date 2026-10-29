import React from 'react';
import { GraveyardRecord } from '../types/autopilot';
import { soundEngine } from '../services/soundEngine';
import { Skull, AlertTriangle, X, ShieldAlert, Clock, RefreshCw, Trash2 } from 'lucide-react';

interface GraveyardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  graveyard: GraveyardRecord[];
  onClearGraveyard: () => void;
}

export const GraveyardDrawer: React.FC<GraveyardDrawerProps> = ({
  isOpen,
  onClose,
  graveyard,
  onClearGraveyard
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0606] border-l border-red-900/50 h-full flex flex-col text-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-red-950/60 border-b border-red-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <Skull className="w-5 h-5" />
            <div>
              <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-white">
                PURGED AGENTS GRAVEYARD
              </h3>
              <p className="text-[11px] text-red-300">
                Nodes self-deleted for zero human currency at 40m
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Purged Agents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {graveyard.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <Skull className="w-10 h-10 text-slate-700" />
              <p>No agents have self-deleted yet.</p>
              <p className="text-[11px] text-slate-600">
                Nodes that hit the 40-minute mark with $0.00 will appear here.
              </p>
            </div>
          ) : (
            graveyard.map((record, index) => (
              <div
                key={`${record.id}-${index}`}
                className="p-3.5 rounded-xl bg-slate-950/90 border border-red-900/40 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">{record.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    PURGED
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Genome: <span className="text-slate-300">{record.strategy}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                  <span className="text-slate-500">Balance at 40m:</span>
                  <span className="text-red-400 font-bold">{record.finalBalance}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Purged at: {record.terminatedAt}</span>
                  <span>Gen {record.generation}</span>
                </div>

                <div className="p-1.5 rounded bg-red-950/30 border border-red-900/30 text-[10px] text-red-300">
                  Cause: {record.reason}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-900 bg-black/80 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Total Purged: <span className="text-red-400 font-bold">{graveyard.length}</span>
          </span>
          {graveyard.length > 0 && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClearGraveyard();
              }}
              className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1 border border-red-900/40 rounded hover:bg-red-950/40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
