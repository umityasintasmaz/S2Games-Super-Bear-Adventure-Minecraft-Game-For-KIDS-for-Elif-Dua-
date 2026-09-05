import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface DirectionalControlsProps {
  engine: GameEngine | null;
}

export const DirectionalControls: React.FC<DirectionalControlsProps> = ({ engine }) => {
  const [activeInput, setActiveInput] = useState<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  const [activeActions, setActiveActions] = useState<{
    jump: boolean;
    mine: boolean;
    place: boolean;
  }>({
    jump: false,
    mine: false,
    place: false
  });

  const lastUpTapRef = useRef<number>(0);

  useEffect(() => {
    if (!engine) return;

    engine.onInputStateChange = (input) => {
      setActiveInput({
        forward: input.forward,
        backward: input.backward,
        left: input.left,
        right: input.right
      });
    };

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setActiveActions(prev => ({ ...prev, jump: true }));
      }
      if (e.code === 'KeyF' || e.code === 'Enter') {
        setActiveActions(prev => ({ ...prev, mine: true }));
      }
      if (e.code === 'KeyE') {
        setActiveActions(prev => ({ ...prev, place: true }));
      }
    };

    const handleWindowKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setActiveActions(prev => ({ ...prev, jump: false }));
      }
      if (e.code === 'KeyF' || e.code === 'Enter') {
        setActiveActions(prev => ({ ...prev, mine: false }));
      }
      if (e.code === 'KeyE') {
        setActiveActions(prev => ({ ...prev, place: false }));
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
      window.removeEventListener('keyup', handleWindowKeyUp);
    };
  }, [engine]);

  const handlePointerDown = (action: 'forward' | 'backward' | 'left' | 'right') => {
    if (engine) {
      if (action === 'forward') {
        engine.triggerUpArrow();
      }
      engine.setMovement(action, true);
    }
  };

  const handlePointerUp = (action: 'forward' | 'backward' | 'left' | 'right') => {
    if (engine) {
      engine.setMovement(action, false);
    }
  };

  return (
    <div
      id="bottom-right-directional-controls"
      className="fixed bottom-2 right-2 sm:bottom-3 sm:right-3 z-30 pointer-events-auto select-none flex flex-col items-end"
    >
      {/* Compact Directional Controls Card */}
      <div className="bg-slate-950/85 backdrop-blur-md border border-amber-400/60 rounded-2xl p-2 shadow-xl flex flex-col items-center gap-1.5">
        {/* Subtle Title Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-400/30 rounded-full text-[10px] font-bold text-amber-300">
          <span>🎮</span>
          <span>Yön Kontrolleri</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Action side buttons (Jump, Mine, Place) */}
          <div className="flex flex-col gap-1 justify-center">
            {/* Jump Button */}
            <button
              id="dir-btn-jump"
              onPointerDown={(e) => {
                e.preventDefault();
                engine?.jump();
                setActiveActions(p => ({ ...p, jump: true }));
              }}
              onPointerUp={() => setActiveActions(p => ({ ...p, jump: false }))}
              title="Zıpla veya Çift Zıpla (Boşluk Tuşu veya Çift Yukarı Ok)"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center font-bold shadow transition-all cursor-pointer border ${
                activeActions.jump
                  ? 'bg-amber-400 text-slate-950 border-white scale-95 ring-2 ring-amber-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 active:scale-95'
              }`}
            >
              <span className="text-xs leading-none">🦘</span>
              <span className="text-[8px] font-bold leading-tight">Zıpla</span>
            </button>

            {/* Mine Button */}
            <button
              id="dir-btn-mine"
              onPointerDown={(e) => {
                e.preventDefault();
                engine?.mineBlock();
                setActiveActions(p => ({ ...p, mine: true }));
              }}
              onPointerUp={() => setActiveActions(p => ({ ...p, mine: false }))}
              title="Bloğu Kır (Sağ Tık veya F Tuşu)"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center font-bold shadow transition-all cursor-pointer border ${
                activeActions.mine
                  ? 'bg-rose-400 text-white border-white scale-95 ring-2 ring-rose-400'
                  : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 active:scale-95'
              }`}
            >
              <span className="text-xs leading-none">⛏️</span>
              <span className="text-[8px] font-bold leading-tight">Kır</span>
            </button>

            {/* Place Button */}
            <button
              id="dir-btn-place"
              onPointerDown={(e) => {
                e.preventDefault();
                engine?.placeBlock();
                setActiveActions(p => ({ ...p, place: true }));
              }}
              onPointerUp={() => setActiveActions(p => ({ ...p, place: false }))}
              title="Bloğu Koy (Sol Tık veya E Tuşu)"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center font-bold shadow transition-all cursor-pointer border ${
                activeActions.place
                  ? 'bg-emerald-400 text-white border-white scale-95 ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 active:scale-95'
              }`}
            >
              <span className="text-xs leading-none">🧱</span>
              <span className="text-[8px] font-bold leading-tight">Koy</span>
            </button>
          </div>

          {/* D-Pad Arrow Keys */}
          <div className="flex flex-col items-center gap-1">
            {/* UP ARROW (double-tap to jump) */}
            <button
              id="dir-btn-up"
              onPointerDown={(e) => {
                e.preventDefault();
                handlePointerDown('forward');
              }}
              onPointerUp={() => handlePointerUp('forward')}
              onPointerLeave={() => handlePointerUp('forward')}
              onPointerCancel={() => handlePointerUp('forward')}
              title="İleri Yürü (2 kez basınca zıplar!)"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow border touch-none select-none ${
                activeInput.forward
                  ? 'bg-amber-400 border-white text-slate-950 scale-95 ring-2 ring-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-amber-300 active:scale-95'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[3]" />
              <span className="text-[7px] font-bold uppercase tracking-wider">İleri</span>
            </button>

            <div className="flex items-center gap-1">
              {/* LEFT ARROW */}
              <button
                id="dir-btn-left"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown('left');
                }}
                onPointerUp={() => handlePointerUp('left')}
                onPointerLeave={() => handlePointerUp('left')}
                onPointerCancel={() => handlePointerUp('left')}
                title="Sola Git (Sol Ok Tuşu)"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow border touch-none select-none ${
                  activeInput.left
                    ? 'bg-amber-400 border-white text-slate-950 scale-95 ring-2 ring-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-amber-300 active:scale-95'
                }`}
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span className="text-[7px] font-bold uppercase tracking-wider">Sol</span>
              </button>

              {/* Center bear icon */}
              <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-400/40 flex items-center justify-center text-[11px]">
                🐻
              </div>

              {/* RIGHT ARROW */}
              <button
                id="dir-btn-right"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown('right');
                }}
                onPointerUp={() => handlePointerUp('right')}
                onPointerLeave={() => handlePointerUp('right')}
                onPointerCancel={() => handlePointerUp('right')}
                title="Sağa Git (Sağ Ok Tuşu)"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow border touch-none select-none ${
                  activeInput.right
                    ? 'bg-amber-400 border-white text-slate-950 scale-95 ring-2 ring-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-amber-300 active:scale-95'
                }`}
              >
                <ArrowRight className="w-4 h-4 stroke-[3]" />
                <span className="text-[7px] font-bold uppercase tracking-wider">Sağ</span>
              </button>
            </div>

            {/* DOWN ARROW */}
            <button
              id="dir-btn-down"
              onPointerDown={(e) => {
                e.preventDefault();
                handlePointerDown('backward');
              }}
              onPointerUp={() => handlePointerUp('backward')}
              onPointerLeave={() => handlePointerUp('backward')}
              onPointerCancel={() => handlePointerUp('backward')}
              title="Geri Yürü (Aşağı Ok Tuşu)"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow border touch-none select-none ${
                activeInput.backward
                  ? 'bg-amber-400 border-white text-slate-950 scale-95 ring-2 ring-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-amber-300 active:scale-95'
              }`}
            >
              <ArrowDown className="w-4 h-4 stroke-[3]" />
              <span className="text-[7px] font-bold uppercase tracking-wider">Geri</span>
            </button>
          </div>
        </div>

        {/* Small reminder caption */}
        <div className="text-[8px] text-amber-200/70 font-medium">
          Ok tuşuna 2 kez basınca zıplar 🦘
        </div>
      </div>
    </div>
  );
};
