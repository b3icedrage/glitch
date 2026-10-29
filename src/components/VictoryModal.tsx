import React from 'react';
import { CharacterDef } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface VictoryModalProps {
  winner: 'player1' | 'player2';
  player1Char: CharacterDef;
  player2Char: CharacterDef;
  onRematch: () => void;
  onSelectScreen: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  player1Char,
  player2Char,
  onRematch,
  onSelectScreen,
}) => {
  const victorChar = winner === 'player1' ? player1Char : player2Char;
  const isP1Winner = winner === 'player1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Victory Header */}
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
            {isP1Winner ? 'Exorcism Complete · Victory' : 'Battle Concluded'}
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            {victorChar.name} Triumphs!
          </h2>
          <p className="text-xs text-slate-400">{victorChar.epithet}</p>
        </div>

        {/* Victor Portrait Spotlight */}
        <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-950">
          <img
            src={victorChar.portrait}
            alt={victorChar.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quote */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs italic text-slate-300">
          "{victorChar.domain.chant}"
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              soundEngine.playHit('light');
              onRematch();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            Rematch
          </button>
          <button
            onClick={() => {
              soundEngine.playHit('light');
              onSelectScreen();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg border border-slate-700 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            Character Select
          </button>
        </div>
      </div>
    </div>
  );
};
