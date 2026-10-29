import React from 'react';
import { DailyEpochStats } from '../types/autopilot';
import { soundEngine } from '../services/soundEngine';
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';

interface DailyCycleBannerProps {
  dailyStats: DailyEpochStats;
  activeAgentsCount: number;
  onAdvanceDay: () => void;
  onSweepToBeneficiary: () => void;
}

export const DailyCycleBanner: React.FC<DailyCycleBannerProps> = ({
  dailyStats,
  activeAgentsCount,
  onAdvanceDay,
  onSweepToBeneficiary
}) => {
  const goalPercentage = Math.min(100, Math.round((dailyStats.dailyEarnedUSD / dailyStats.dailyGoalUSD) * 100));

  return (
    <div className="bg-gradient-to-r from-[#0b1325] via-[#091522] to-[#070e1b] border border-cyan-900/50 rounded-xl p-4 shadow-lg text-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Daily Epoch Identity */}
        <div className="flex items-start gap-3 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-bold">
                Daily Cycle Protocol
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                DAY {dailyStats.currentDay}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              Autonomous Recurring Epoch
            </p>
            <p className="text-[11px] text-slate-400">
              36 cycles of 40m evaluation windows / 24h
            </p>
          </div>
        </div>

        {/* Daily Human Currency Harvest */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Daily Fiat Harvested:
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ${dailyStats.dailyEarnedUSD.toFixed(2)} USD
            </span>
          </div>

          {/* Progress bar towards daily goal */}
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Target: ${dailyStats.dailyGoalUSD.toFixed(2)}</span>
            <span className={goalPercentage >= 100 ? 'text-emerald-400 font-bold' : ''}>
              {goalPercentage}% Complete
            </span>
          </div>
        </div>

        {/* Daily Swarm Vital Statistics */}
        <div className="flex items-center justify-around border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4 text-center font-mono">
          <div>
            <div className="text-base font-extrabold text-cyan-300">
              {activeAgentsCount}
            </div>
            <div className="text-[10px] uppercase text-slate-400">Active Swarm</div>
          </div>
          <div>
            <div className="text-base font-extrabold text-emerald-400">
              +{dailyStats.nodesDuplicatedToday}
            </div>
            <div className="text-[10px] uppercase text-slate-400">Mitosis Clones</div>
          </div>
          <div>
            <div className="text-base font-extrabold text-red-400">
              -{dailyStats.nodesPurgedToday}
            </div>
            <div className="text-[10px] uppercase text-slate-400">Purged ($0)</div>
          </div>
        </div>

        {/* Beneficiary Settlement & Advance Day Action */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Settlement Rail:</span>
            </div>
            <span className="text-emerald-300 font-semibold text-[11px]">
              Visa •••• 9035
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                soundEngine.playCoinDrop();
                onSweepToBeneficiary();
              }}
              className="flex-1 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              title="Sweep all surplus daily profits directly into Beneficiary Card 4987 0500 5177 9035"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sweep Profits</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onAdvanceDay();
              }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              title="Advance to next 24-hour daily cycle (Day N+1)"
            >
              <span>Next Day</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
