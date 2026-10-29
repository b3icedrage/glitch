import React from 'react';
import { AgentNode } from '../types/autopilot';
import { soundEngine } from '../services/soundEngine';
import {
  Clock,
  DollarSign,
  AlertTriangle,
  Zap,
  Code2,
  Copy,
  TrendingUp,
  CreditCard,
  Sparkles,
  FastForward,
  Cpu,
  Flame,
  CheckCircle2,
  Terminal,
  Activity
} from 'lucide-react';

interface AgentCardProps {
  agent: AgentNode;
  onInjectFiat: (agent: AgentNode) => void;
  onDispatchGig: (agent: AgentNode) => void;
  onViewCode: (agent: AgentNode) => void;
  onForceEvaluate: (agent: AgentNode) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onInjectFiat,
  onDispatchGig,
  onViewCode,
  onForceEvaluate
}) => {
  // Format seconds into MM:SS
  const minutes = Math.floor(agent.timeRemainingSeconds / 60);
  const seconds = agent.timeRemainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isProfitable = agent.currencyEarnedThisCycleUSD > 0;
  const isCritical = !isProfitable && agent.timeRemainingSeconds <= 600; // < 10 mins left and $0

  // Circular gauge calculation (2400 total seconds = 40 minutes)
  const totalSeconds = agent.initialDurationSeconds || 2400;
  const progressRatio = Math.max(0, Math.min(1, agent.timeRemainingSeconds / totalSeconds));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 ${
        isProfitable
          ? 'bg-[#061816]/90 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-400'
          : isCritical
          ? 'bg-[#1a0808]/90 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse'
          : 'bg-[#0a0f1d]/90 border-slate-800 shadow-lg hover:border-cyan-500/40'
      }`}
    >
      {/* Top Banner Status Ribbon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase bg-slate-900 border border-slate-800 text-slate-300">
            GEN-{agent.generation}
          </span>
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            {agent.id}
          </span>
        </div>

        {/* Protocol Evaluation Badge */}
        {isProfitable ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>REPLICATING AT 40m</span>
          </div>
        ) : isCritical ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-500/60 text-red-200 text-[11px] font-mono font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>DELETION IMMINENT</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>AUTOPILOT SEEKING FIAT</span>
          </div>
        )}
      </div>

      {/* Main Grid: Circular 40m Clock + Financial Ledger */}
      <div className="grid grid-cols-2 gap-4 items-center my-2">
        
        {/* Circular Countdown Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-800/80"
            />
            {/* Animated countdown ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                isProfitable
                  ? 'text-emerald-400'
                  : isCritical
                  ? 'text-red-500'
                  : 'text-cyan-400'
              }`}
            />
          </svg>

          {/* Central Time Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className={`text-lg font-mono font-black tracking-tight ${
                isProfitable
                  ? 'text-emerald-300'
                  : isCritical
                  ? 'text-red-400'
                  : 'text-white'
              }`}
            >
              {timeFormatted}
            </span>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
              40m DEADLINE
            </span>
          </div>
        </div>

        {/* Real Human Currency Vault */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
            Human Fiat Balance
          </div>
          <div
            className={`text-2xl font-mono font-extrabold tracking-tight ${
              isProfitable ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            ${agent.currencyEarnedThisCycleUSD.toFixed(2)}
            <span className="text-xs text-slate-400 font-normal ml-1">USD</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Survive target: <span className="text-amber-400 font-bold">&gt; $0.00</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Gigs: {agent.gigsCompleted} · Speed: {agent.strategy.efficiencyMultiplier}x
          </div>
        </div>

      </div>

      {/* Strategy & Traits */}
      <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold truncate max-w-[190px]">
            {agent.strategy.name}
          </span>
          <span className="text-[10px] text-cyan-400 px-1 rounded bg-cyan-950 border border-cyan-800">
            {agent.strategy.category.toUpperCase()}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-1 italic">
          "{agent.currentActivity}"
        </p>
      </div>

      {/* Action Buttons Hub */}
      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
        
        {/* Primary Action 1: Inject Real Human Fiat (Averts Death!) */}
        <button
          onClick={() => {
            soundEngine.playCoinDrop();
            onInjectFiat(agent);
          }}
          className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md ${
            isProfitable
              ? 'bg-emerald-600 hover:bg-emerald-500 text-black'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          }`}
          title="Directly pay real human currency via PesaPal / Visa rail to secure this agent's survival and guarantee replication"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{isProfitable ? 'Add More Human Fiat' : 'Pay Real Currency (Save Node)'}</span>
        </button>

        {/* Primary Action 2: Trigger Gemini Autopilot Gig */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onDispatchGig(agent);
          }}
          disabled={agent.isWorking}
          className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          title="Agent executes an autonomous gig using Gemini 3.8 Flash to write copy/code and earn real client currency"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{agent.isWorking ? 'Generating Deliverable...' : 'Execute Autopilot Gig (Earn Fiat)'}</span>
        </button>

        {/* Secondary Utility Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              onViewCode(agent);
            }}
            className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 rounded-lg flex items-center justify-center gap-1 transition-all"
            title="Inspect the virtual TypeScript source code file and self-destruct check"
          >
            <Code2 className="w-3 h-3 text-cyan-400" />
            <span>Code File</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onForceEvaluate(agent);
            }}
            className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/40 text-[11px] font-mono text-slate-400 hover:text-red-300 rounded-lg flex items-center justify-center gap-1 transition-all"
            title="Evaluate 40-minute outcome immediately: self-deletes if $0, duplicates if >$0"
          >
            <FastForward className="w-3 h-3 text-red-400" />
            <span>Test 40m Now</span>
          </button>
        </div>

      </div>

    </div>
  );
};
