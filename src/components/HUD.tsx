import React from 'react';
import { GameState } from '../game/types';
import { Volume2, VolumeX, Eye, Award } from 'lucide-react';
import { ChildQuestWidget } from './ChildQuestWidget';

interface HUDProps {
  state: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleCamera: () => void;
  onOpenQuests: () => void;
  cameraMode: 'third' | 'first' | 'close';
}

export const HUD: React.FC<HUDProps> = ({
  state,
  soundEnabled,
  onToggleSound,
  onToggleCamera,
  onOpenQuests,
  cameraMode
}) => {
  return (
    <div id="game-hud-overlay" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-10">
      {/* Top Header & Content Area */}
      <div className="flex flex-col gap-2.5">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Title Badge & Dimension */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/85 backdrop-blur-md border-2 border-amber-400/60 rounded-2xl px-3.5 py-1.5 shadow-lg flex items-center gap-2">
              <span className="text-xl">🐻</span>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-amber-300 leading-tight tracking-wide drop-shadow">
                  Super Bear Craft
                </h1>
                <p className="text-[11px] text-amber-100/90 font-medium">
                  Elif Dua'nın Özel Modu
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-950/80 backdrop-blur-md border border-indigo-400/40 rounded-xl px-3 py-1 text-xs text-indigo-200 font-semibold shadow">
              <span>{state.dimension === 'portalWorld' ? '🔮' : '🌲'}</span>
              <span>{state.currentDimensionName}</span>
            </div>
          </div>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-quests"
              onClick={onOpenQuests}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow-md border-2 border-amber-300 text-xs sm:text-sm cursor-pointer transition"
            >
              <Award className="w-4 h-4" />
              <span>Görevler</span>
              {state.hasFoundCrown && <span className="text-xs bg-red-600 text-white px-1.5 rounded-full">Tamam!</span>}
            </button>

            <button
              id="btn-camera-toggle"
              onClick={onToggleCamera}
              title="Kamera Açısını Değiştir (C Tuşu)"
              className="bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-white p-2 rounded-xl border border-slate-700 shadow cursor-pointer transition text-xs flex items-center gap-1"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline capitalize">{cameraMode}</span>
            </button>

            <button
              id="btn-sound-toggle"
              onClick={onToggleSound}
              title="Ses Aç/Kapat"
              className="bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-white p-2 rounded-xl border border-slate-700 shadow cursor-pointer transition"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
            </button>
          </div>
        </div>

        {/* Top Left Stack: Hearts + Collectibles + Child Quests (Zero Overlap!) */}
        <div className="flex flex-col gap-2 max-w-fit pointer-events-auto">
          {/* Hearts row */}
          <div className="flex items-center gap-1 bg-slate-950/75 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 w-fit">
            {[...Array(state.maxHp)].map((_, i) => (
              <span key={i} className="text-red-500 text-base filter drop-shadow">
                ❤️
              </span>
            ))}
          </div>

          {/* Super Bear & Minecraft Collectibles Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-bold">
            {/* Honey Jars */}
            <div className="flex items-center gap-1.5 bg-amber-950/80 backdrop-blur-md border border-amber-500/50 text-amber-300 px-2.5 py-1 rounded-xl shadow">
              <span>🍯</span>
              <span>{state.honey} Bal</span>
            </div>

            {/* Gold Coins */}
            <div className="flex items-center gap-1.5 bg-yellow-950/80 backdrop-blur-md border border-yellow-500/50 text-yellow-300 px-2.5 py-1 rounded-xl shadow">
              <span>🪙</span>
              <span>{state.coins} Altın</span>
            </div>

            {/* Rescued Bear Friends */}
            <div className="flex items-center gap-1.5 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 text-rose-300 px-2.5 py-1 rounded-xl shadow">
              <span>🐻</span>
              <span>Kurtarılan: {state.rescuedBears}/{state.totalBearsToRescue}</span>
            </div>

            {/* Mined Blocks */}
            <div className="flex items-center gap-1.5 bg-sky-950/80 backdrop-blur-md border border-sky-500/50 text-sky-300 px-2.5 py-1 rounded-xl shadow">
              <span>⛏️</span>
              <span>{state.blocksMined} Blok</span>
            </div>
          </div>

          {/* Child Quest Widget nested here with clean flex layout */}
          <ChildQuestWidget state={state} onOpenFullModal={onOpenQuests} />
        </div>
      </div>
    </div>
  );
};
