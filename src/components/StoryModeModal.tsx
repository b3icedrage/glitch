import React, { useState } from 'react';
import { STORY_STAGES } from '../data/storyStages';
import { CHARACTERS } from '../data/characters';
import { StoryStage, CharacterDef } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface StoryModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStage: (
    playerChar: CharacterDef,
    enemyChar: CharacterDef,
    stageBg: string,
    difficulty: StoryStage['difficulty']
  ) => void;
}

export const StoryModeModal: React.FC<StoryModeModalProps> = ({
  isOpen,
  onClose,
  onStartStage,
}) => {
  const [selectedStage, setSelectedStage] = useState<StoryStage>(STORY_STAGES[0]);

  if (!isOpen) return null;

  const playerChar = CHARACTERS[selectedStage.playerCharId];
  const enemyChar = CHARACTERS[selectedStage.opponentCharId];

  const handleLaunchStage = () => {
    soundEngine.playBlackFlash();
    onClose();
    onStartStage(playerChar, enemyChar, selectedStage.arenaBackground, selectedStage.difficulty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Story Chronicles: Cursed Showdown</h3>
            <p className="text-xs text-slate-400">Experience iconic Jujutsu Kaisen battles with story dialogues and stage conditions.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content: Stage selector + Stage briefing */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Chapter cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STORY_STAGES.map((stage) => {
              const isSelected = stage.id === selectedStage.id;
              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    soundEngine.playHit('light');
                    setSelectedStage(stage);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                    <span>{stage.chapter}</span>
                    <span className="text-slate-400">{stage.difficulty}</span>
                  </div>
                  <div className="font-bold text-white text-sm mb-1">{stage.title}</div>
                  <div className="text-xs text-slate-400 truncate">{stage.locationName}</div>
                </div>
              );
            })}
          </div>

          {/* Detailed Stage Briefing */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
            {/* Versus matchup banners */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={playerChar.portrait}
                  alt={playerChar.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-cyan-400"
                />
                <div>
                  <div className="text-xs text-cyan-400 font-semibold">Protagonist</div>
                  <div className="font-bold text-white text-sm">{playerChar.name}</div>
                </div>
              </div>

              <span className="font-mono font-black text-rose-500 text-sm tracking-widest">VS</span>

              <div className="flex items-center gap-3 flex-row-reverse text-right">
                <img
                  src={enemyChar.portrait}
                  alt={enemyChar.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-rose-500"
                />
                <div>
                  <div className="text-xs text-rose-400 font-semibold">Adversary</div>
                  <div className="font-bold text-white text-sm">{enemyChar.name}</div>
                </div>
              </div>
            </div>

            {/* Dialogues preview */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300">Chapter Opening Dialogue</div>
              {selectedStage.introDialogues.map((dlg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-xs ${
                    dlg.side === 'left' ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-rose-950/30 border border-rose-900/50 text-rose-200'
                  }`}
                >
                  <span className="font-bold text-white mr-1.5">{dlg.speaker}:</span>
                  <span>"{dlg.text}"</span>
                </div>
              ))}
            </div>

            {/* Objective & rules */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-amber-400">Victory Objective:</div>
              <div className="text-slate-300">{selectedStage.winCondition}</div>
              {selectedStage.specialRules && (
                <div className="text-slate-400 pt-1 text-[11px]">
                  Condition: {selectedStage.specialRules}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Selected: <span className="text-white font-medium">{selectedStage.title}</span>
          </div>
          <button
            onClick={handleLaunchStage}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all active:scale-95"
          >
            Enter Chapter Battlefield
          </button>
        </div>
      </div>
    </div>
  );
};
