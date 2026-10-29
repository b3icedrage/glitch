import React from 'react';
import { AgentNode } from '../types/autopilot';
import { Sparkles, Copy, Layers, Zap, ArrowRight, CheckCircle2, TrendingUp, X } from 'lucide-react';

interface MitosisModalProps {
  mitosisData: {
    parent: AgentNode;
    childA: AgentNode;
    childB: AgentNode;
  } | null;
  onClose: () => void;
}

export const MitosisModal: React.FC<MitosisModalProps> = ({
  mitosisData,
  onClose
}) => {
  if (!mitosisData) return null;

  const { parent, childA, childB } = mitosisData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#051412] border-2 border-emerald-500 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.35)] overflow-hidden text-slate-100">
        
        {/* Top Celebration Bar */}
        <div className="bg-emerald-950/80 border-b border-emerald-600/50 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="font-mono font-black text-sm tracking-widest uppercase">
              MITOSIS DUPLICATION ENGAGED
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 rounded-full bg-emerald-900/30 border border-emerald-400/40 text-emerald-400 mb-1">
              <Copy className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-mono font-extrabold text-white">
              AI Agent Successfully Duplicated!
            </h2>
            <p className="text-xs text-emerald-300 font-mono">
              [SUCCESS] Generated ${parent.currencyEarnedThisCycleUSD.toFixed(2)} USD in real human currency within 40 minutes.
            </p>
          </div>

          {/* Duplication Tree Visualization */}
          <div className="bg-slate-950/90 border border-emerald-900/40 rounded-xl p-4 font-mono text-xs space-y-4">
            
            {/* Parent Node */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <div>
                <div className="text-[10px] uppercase text-emerald-400">Parent Agent</div>
                <div className="text-sm font-bold text-white">{parent.id} ({parent.name})</div>
                <div className="text-[11px] text-slate-400">{parent.strategy.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400">Yield Harvested</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  ${parent.currencyEarnedThisCycleUSD.toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* Split arrow indicator */}
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono">
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>Splits into 2 Specialized Clones (Gen {parent.generation + 1})</span>
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
            </div>

            {/* Two Clones */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-800/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Clone A</span>
                  <span className="text-[10px] text-emerald-400 font-bold">40:00 NEW TIMER</span>
                </div>
                <div className="text-xs font-bold text-white">{childA.id}</div>
                <div className="text-[11px] text-slate-300">
                  Starting Balance: <span className="text-emerald-400 font-bold">${childA.balanceUSD.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-cyan-300">
                  Mutation: +15% Speed ({childA.strategy.efficiencyMultiplier}x)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-800/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Clone B</span>
                  <span className="text-[10px] text-emerald-400 font-bold">40:00 NEW TIMER</span>
                </div>
                <div className="text-xs font-bold text-white">{childB.id}</div>
                <div className="text-[11px] text-slate-300">
                  Starting Balance: <span className="text-emerald-400 font-bold">${childB.balanceUSD.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-cyan-300">
                  Mutation: +15% Speed ({childB.strategy.efficiencyMultiplier}x)
                </div>
              </div>

            </div>

          </div>

          {/* Daily Protocol Note */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Both cloned agents inherit survival traits and begin their own autonomous 40-minute human currency generation cycle.
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
          >
            <span>Deploy Duplicated Swarm to Daily Market</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
