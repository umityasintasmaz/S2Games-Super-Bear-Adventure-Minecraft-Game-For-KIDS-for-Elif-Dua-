import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../game/types';
import { Trophy, Sparkles, RotateCcw, Compass } from 'lucide-react';

interface WinModalProps {
  state: GameState;
  onContinueExploring: () => void;
  onRestart: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  state,
  onContinueExploring,
  onRestart
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
      return () => clearTimeout(timeout);
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-3 border-amber-400 w-full max-w-md rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Decorative Golden Crown glow */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-3xl flex items-center justify-center text-5xl shadow-xl shadow-amber-500/30 mb-4 border-2 border-amber-200 animate-bounce">
          👑
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1 tracking-wide">
          TEBRİKLER ELİF DUA!
        </h2>
        <p className="text-sm text-amber-100 font-semibold mb-5">
          Efsanevi Kutsal Ayı Tacı'nı Ele Geçirdin!
        </p>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 mb-5 text-left text-xs font-bold">
          <div className="flex items-center gap-2 text-amber-300">
            <span>🍯</span>
            <span>{state.honey} Bal Toplandı</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-300">
            <span>🪙</span>
            <span>{state.coins} Altın Para</span>
          </div>
          <div className="flex items-center gap-2 text-rose-300">
            <span>🐻</span>
            <span>{state.rescuedBears}/3 Ayı Kurtarıldı</span>
          </div>
          <div className="flex items-center gap-2 text-sky-300">
            <span>⛏️</span>
            <span>{state.blocksMined} Blok Kırıldı</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Super Bear artık Minecraft evreninin en güçlü ve tatlı kahramanı! Dünyayı istediğin gibi kazmaya, blok koyup yeni yapılar inşa etmeye devam edebilirsin.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-continue-exploring"
            onClick={onContinueExploring}
            className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold py-3 rounded-xl shadow-lg border-2 border-amber-300 text-sm cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Keşfe Devam Et!</span>
          </button>

          <button
            id="btn-restart-game"
            onClick={onRestart}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold px-4 py-3 rounded-xl border border-slate-700 text-sm cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeniden</span>
          </button>
        </div>
      </div>
    </div>
  );
};
