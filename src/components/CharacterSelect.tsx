import React, { useState } from 'react';
import { CharacterDef, GameMode } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { soundEngine } from '../services/soundEngine';

interface CharacterSelectProps {
  onStartBattle: (
    p1Char: CharacterDef,
    p2Char: CharacterDef,
    mode: GameMode,
    arenaBg: string,
    difficulty: 'Grade 2' | 'Semi-Grade 1' | 'Grade 1' | 'Special Grade'
  ) => void;
  onOpenStory: () => void;
  onOpenDojo: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onStartBattle,
  onOpenStory,
  onOpenDojo,
}) => {
  const charList = Object.values(CHARACTERS);
  const [selectedP1, setSelectedP1] = useState<CharacterDef>(charList[0]);
  const [selectedP2, setSelectedP2] = useState<CharacterDef>(charList[1]);
  const [mode, setMode] = useState<GameMode>('versus_ai');
  const [difficulty, setDifficulty] = useState<'Grade 2' | 'Semi-Grade 1' | 'Grade 1' | 'Special Grade'>('Grade 1');
  const [selectedArena, setSelectedArena] = useState<string>('/src/assets/images/arena_shibuya_station_1793208294305.jpg');

  const handleSelectP1 = (c: CharacterDef) => {
    soundEngine.playHit('light');
    setSelectedP1(c);
  };

  const handleSelectP2 = (c: CharacterDef) => {
    soundEngine.playHit('light');
    setSelectedP2(c);
  };

  const handleStart = () => {
    soundEngine.playBlackFlash();
    onStartBattle(selectedP1, selectedP2, mode, selectedArena, difficulty);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-4">
      {/* Top Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Select Your Jujutsu Sorcerer</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Choose your combatant and unleash authentic cursed techniques, Black Flash strikes, and Domain Expansions.
          </p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => { soundEngine.playHit('light'); setMode('versus_ai'); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'versus_ai' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Versus AI
          </button>
          <button
            onClick={() => { soundEngine.playHit('light'); setMode('versus_local'); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'versus_local' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Local 2-Player
          </button>
          <button
            onClick={onOpenStory}
            className="px-3 py-1.5 text-xs font-semibold rounded-md text-amber-400 hover:bg-slate-800 transition-colors"
          >
            Story Campaign
          </button>
          <button
            onClick={onOpenDojo}
            className="px-3 py-1.5 text-xs font-semibold rounded-md text-emerald-400 hover:bg-slate-800 transition-colors"
          >
            Cursed Dojo
          </button>
        </div>
      </div>

      {/* Roster Character Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {charList.map((c) => {
          const isP1 = selectedP1.id === c.id;
          const isP2 = selectedP2.id === c.id;

          return (
            <div
              key={c.id}
              onClick={() => handleSelectP1(c)}
              className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer bg-slate-900/90 flex flex-col ${
                isP1
                  ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : isP2
                  ? 'border-rose-500 shadow-md shadow-rose-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Image banner with overlay */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={c.portrait}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                {/* Player Selection Indicators */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  {isP1 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500 text-slate-950 uppercase tracking-wider">
                      Player 1
                    </span>
                  )}
                  {isP2 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                      {mode === 'versus_local' ? 'Player 2' : 'CPU'}
                    </span>
                  )}
                </div>

                {/* Quick P2 / CPU toggle button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectP2(c);
                  }}
                  className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  Set as P2
                </button>

                {/* Name & Epithet */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="text-lg font-bold text-white tracking-tight">{c.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-cyan-400">{c.japaneseName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{c.epithet}</span>
                  </div>
                </div>
              </div>

              {/* Character Details & Techniques */}
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">HP</div>
                    <div className="font-bold text-slate-200 tabular-nums">{c.stats.maxHp}</div>
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">Black Flash Crit</div>
                    <div className="font-bold text-amber-400 tabular-nums">{(c.stats.critRate * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">Attack</div>
                    <div className="font-bold text-slate-200 tabular-nums">{c.stats.attack}</div>
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase">Speed</div>
                    <div className="font-bold text-slate-200 tabular-nums">{c.stats.speed}</div>
                  </div>
                </div>

                {/* Signature Domain */}
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Domain Expansion</div>
                  <div className="text-white font-semibold flex items-center justify-between">
                    <span>{c.domain.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{c.domain.cost} CE</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Setup Footer: Arena, Difficulty & Launch */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-6">
        {/* Arena Stage Chooser */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300">Combat Battlefield Arena</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playHit('light');
                setSelectedArena('/src/assets/images/arena_shibuya_station_1793208294305.jpg');
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                selectedArena.includes('shibuya')
                  ? 'bg-slate-800 border-cyan-400 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Shibuya Crossing (Night)
            </button>
            <button
              onClick={() => {
                soundEngine.playHit('light');
                setSelectedArena('/src/assets/images/arena_shinjuku_ruins_1793208306557.jpg');
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                selectedArena.includes('shinjuku')
                  ? 'bg-slate-800 border-cyan-400 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Shinjuku Ground Zero (Dusk)
            </button>
          </div>
        </div>

        {/* AI Difficulty (if versus AI) */}
        {mode === 'versus_ai' && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">Sorcerer Grade (CPU AI)</div>
            <div className="flex items-center gap-1.5">
              {(['Grade 2', 'Semi-Grade 1', 'Grade 1', 'Special Grade'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    soundEngine.playHit('light');
                    setDifficulty(diff);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                    difficulty === diff
                      ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Match CTA */}
        <button
          onClick={handleStart}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide rounded-lg shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          Commence Battle
        </button>
      </div>
    </div>
  );
};
