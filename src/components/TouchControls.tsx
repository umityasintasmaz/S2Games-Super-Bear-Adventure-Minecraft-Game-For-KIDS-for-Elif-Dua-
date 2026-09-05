import React from 'react';
import { GameEngine } from '../game/engine';

interface TouchControlsProps {
  engine: GameEngine | null;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  if (!engine) return null;

  const handleTouchStart = (action: 'forward' | 'backward' | 'left' | 'right') => {
    if (engine) engine.input[action] = true;
  };

  const handleTouchEnd = (action: 'forward' | 'backward' | 'left' | 'right') => {
    if (engine) engine.input[action] = false;
  };

  return (
    <div id="touch-controls-container" className="md:hidden pointer-events-none absolute inset-0 z-20 flex justify-between items-end p-4 pb-20">
      {/* Left D-pad Movement */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <button
          id="touch-btn-up"
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('forward'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('forward'); }}
          className="w-12 h-12 bg-slate-900/80 active:bg-amber-500 border border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow"
        >
          ▲
        </button>
        <div className="flex items-center gap-2">
          <button
            id="touch-btn-left"
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
            className="w-12 h-12 bg-slate-900/80 active:bg-amber-500 border border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow"
          >
            ◀
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-800/60 border border-slate-700"></div>
          <button
            id="touch-btn-right"
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
            className="w-12 h-12 bg-slate-900/80 active:bg-amber-500 border border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow"
          >
            ▶
          </button>
        </div>
        <button
          id="touch-btn-down"
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('backward'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('backward'); }}
          className="w-12 h-12 bg-slate-900/80 active:bg-amber-500 border border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow"
        >
          ▼
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        <div className="flex items-center gap-2">
          {/* Place Block */}
          <button
            id="touch-btn-place"
            onClick={() => engine.placeBlock()}
            className="w-14 h-14 bg-emerald-600 active:bg-emerald-500 text-white rounded-2xl border-2 border-emerald-400 shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
          >
            <span className="text-base">🧱</span>
            <span className="text-[10px] font-bold">Koy</span>
          </button>

          {/* Mine Block */}
          <button
            id="touch-btn-mine"
            onClick={() => engine.mineBlock()}
            className="w-14 h-14 bg-rose-600 active:bg-rose-500 text-white rounded-2xl border-2 border-rose-400 shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
          >
            <span className="text-base">⛏️</span>
            <span className="text-[10px] font-bold">Kır</span>
          </button>
        </div>

        {/* Jump Button */}
        <button
          id="touch-btn-jump"
          onClick={() => engine.jump()}
          className="w-28 h-14 bg-amber-500 active:bg-amber-400 text-slate-950 rounded-2xl border-2 border-amber-300 shadow-xl flex items-center justify-center gap-1 font-bold text-sm active:scale-95 transition"
        >
          <span className="text-lg">🦘</span>
          <span>Zıpla!</span>
        </button>
      </div>
    </div>
  );
};
