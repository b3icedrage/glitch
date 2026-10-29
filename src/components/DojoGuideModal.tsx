import React from 'react';
import { soundEngine } from '../services/soundEngine';

interface DojoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryBlackFlashAudio: () => void;
}

export const DojoGuideModal: React.FC<DojoGuideModalProps> = ({
  isOpen,
  onClose,
  onTryBlackFlashAudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Cursed Training Dojo · Jujutsu Guide</h3>
            <p className="text-xs text-slate-400">Master the fundamental martial arts, cursed techniques, and Black Flash execution.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Black Flash Spotlight Box */}
          <div className="bg-gradient-to-r from-rose-950/40 to-slate-950 p-5 rounded-xl border border-rose-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-rose-400 font-mono tracking-wider">
                THE PHENOMENON: BLACK FLASH (黒閃 · KOKUSEN)
              </span>
              <button
                onClick={() => {
                  soundEngine.playBlackFlash();
                  onTryBlackFlashAudio();
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shadow transition-all active:scale-95"
              >
                Test Black Flash SFX
              </button>
            </div>
            <p className="leading-relaxed">
              When cursed energy flashes within <span className="font-mono text-amber-400">0.000001 seconds</span> of physical impact, spatial distortion occurs and cursed energy flashes black. Power is multiplied to the power of <span className="font-bold text-white">2.5</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-slate-500 uppercase">Trigger Window</div>
                <div className="text-white font-bold">Counter-hits & Rhythm strikes</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-slate-500 uppercase">Damage Boost</div>
                <div className="text-amber-400 font-bold">2.5x to 3.5x Multiplier</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-slate-500 uppercase">The Zone State</div>
                <div className="text-cyan-400 font-bold">Instantly Restores 35 CE</div>
              </div>
            </div>
          </div>

          {/* Domain Expansion Principles */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-white text-sm flex items-center justify-between">
              <span>Domain Expansion (領域展開 · Ryōiki Tenkai)</span>
              <span className="text-cyan-400 font-mono text-[11px]">100% CE Required</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Constructing an innate domain with cursed energy and manifesting it in the real world. Grants continuous Sure-Hit attacks against opponents inside the barrier. If both sorcerers deploy their domains simultaneously, a barrier clash begins.
            </p>
          </div>

          {/* Controls Reference Table */}
          <div className="space-y-2">
            <div className="font-bold text-white text-sm">Combat Keyboard Controls</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-cyan-400 font-bold">Player 1 (Primary)</div>
                <div className="flex justify-between"><span className="text-slate-400">Move Left / Right</span><span className="text-white">[A] / [D]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Jump / Airborne</span><span className="text-white">[W] or [Space]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Guard / Block</span><span className="text-white">[L] or [S]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Light Attack</span><span className="text-white">[J]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Heavy Attack</span><span className="text-white">[K]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cursed Skills</span><span className="text-white">[Q], [W], [E]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Domain Expansion</span><span className="text-white">[R]</span></div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-rose-400 font-bold">Player 2 (Local Versus)</div>
                <div className="flex justify-between"><span className="text-slate-400">Move Left / Right</span><span className="text-white">[Arrow Left] / [Arrow Right]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Jump</span><span className="text-white">[Arrow Up]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Guard</span><span className="text-white">[Arrow Down]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Light Attack</span><span className="text-white">[1] or [N]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Heavy Attack</span><span className="text-white">[2] or [M]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cursed Skills</span><span className="text-white">[U], [I], [O]</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Domain Expansion</span><span className="text-white">[P]</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Ready for Combat
          </button>
        </div>
      </div>
    </div>
  );
};
