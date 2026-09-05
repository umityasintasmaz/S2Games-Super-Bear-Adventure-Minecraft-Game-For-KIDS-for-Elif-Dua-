import React from 'react';
import { InventorySlot } from '../game/types';

interface HotbarProps {
  inventory: InventorySlot[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
  onCycleSlot?: (index: number) => void;
}

export const Hotbar: React.FC<HotbarProps> = ({
  inventory,
  selectedSlot,
  onSelectSlot
}) => {
  const currentSlot = inventory[selectedSlot];

  return (
    <div
      id="minecraft-hotbar"
      className="fixed bottom-2.5 left-3 sm:left-1/2 sm:-translate-x-1/2 pointer-events-auto z-20 flex flex-col items-start sm:items-center gap-1.5 max-w-[calc(100vw-170px)] sm:max-w-none"
    >
      {/* Selected Block Info Pill with Mouse Controls Guide */}
      {currentSlot && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 bg-slate-950/95 backdrop-blur-md rounded-full border border-amber-400/80 text-xs text-amber-300 shadow-xl font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{currentSlot.emoji || '🧱'}</span>
            <span className="text-amber-200">{currentSlot.name}</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-400/40">
              Sınırsız ∞
            </span>
          </div>

          <span className="hidden sm:inline text-slate-500">•</span>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
            <span className="bg-emerald-900/70 border border-emerald-400/60 text-emerald-200 px-2 py-0.5 rounded-lg">
              🖱️ Sol Tık: <strong>Koy 🧱</strong>
            </span>
            <span className="bg-rose-900/70 border border-rose-400/60 text-rose-200 px-2 py-0.5 rounded-lg">
              🖱️ Sağ Tık: <strong>Kır ⛏️</strong>
            </span>
          </div>
        </div>
      )}

      {/* Slots Container - Exactly 1 unique slot per item */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border-2 border-slate-700/90 shadow-2xl overflow-x-auto max-w-full">
        {inventory.map((slot, idx) => {
          const isSelected = idx === selectedSlot;
          return (
            <button
              key={slot.type}
              id={`hotbar-slot-${idx}`}
              onClick={() => onSelectSlot(idx)}
              title={`${idx + 1}. Tuş: ${slot.name} (Sınırsız)`}
              className={`relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all cursor-pointer select-none shrink-0 ${
                isSelected
                  ? 'bg-slate-700/95 border-2 border-amber-400 scale-105 shadow-xl -translate-y-1 ring-2 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 hover:border-slate-500'
              }`}
            >
              {/* Slot key number badge */}
              <span className="absolute top-0.5 left-1 text-[9px] font-bold text-slate-400">
                {idx + 1}
              </span>

              {/* Block Icon representation */}
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg border border-black/40 shadow-inner flex items-center justify-center text-xs sm:text-sm"
                style={{ backgroundColor: slot.iconColor }}
              >
                {slot.emoji ? (
                  <span>{slot.emoji}</span>
                ) : (
                  <span>🧱</span>
                )}
              </div>

              {/* Infinite Badge: ∞ */}
              <span className="absolute bottom-0.5 right-1 text-[10px] font-black text-amber-300 drop-shadow">
                ∞
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
