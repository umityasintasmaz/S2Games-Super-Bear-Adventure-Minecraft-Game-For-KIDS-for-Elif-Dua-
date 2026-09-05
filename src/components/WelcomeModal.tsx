import React from 'react';
import { Play, Sparkles, Compass, Shield, Volume2 } from 'lucide-react';
import { voice } from '../game/voice';

interface WelcomeModalProps {
  onStart: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart }) => {
  const handleStart = () => {
    voice.speak('Hoş geldin Elif Dua! Altın, kum ve bakır elementlerini seçebilir, köşkünü büyütebilir ve küçük ayıları kurtarabilirsin!', true);
    onStart();
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-3 border-amber-400 w-full max-w-lg rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Character Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-amber-300">
            🐻
          </div>
          <span className="text-2xl font-bold text-amber-400">✖️</span>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-emerald-400">
            ⛏️
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-center text-amber-300 mb-1">
          Super Bear Craft: Elif Dua'nın Macerası
        </h2>
        <p className="text-xs text-center text-slate-300 font-medium mb-5">
          Super Bear Adventure ile Minecraft'ın Birleştiği Sihirli Dünya!
        </p>

        {/* Story & Instructions */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-5 text-xs sm:text-sm text-slate-200 space-y-2.5">
          <p className="leading-relaxed">
            👋 <strong>Merhaba Elif Dua!</strong> Minecraft dünyasındaki Steve'in yerine sevimli <strong>Super Bear</strong> geçti!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 flex items-start gap-2">
              <span className="text-base">🏹</span>
              <span><strong>Ok Tuşları:</strong> [ ⬆️ ⬇️ ⬅️ ➡️ ] ile kolayca yürü! Veya sağ alttaki tuşlara bas.</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 flex items-start gap-2">
              <span className="text-base">🧱</span>
              <span><strong>Sınırsız Blok:</strong> Blokların hiç bitmez! Alttaki bloğa tıklayınca farklı blok gelir.</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 flex items-start gap-2">
              <span className="text-base">🍯</span>
              <span><strong>Zıplayan Bal:</strong> Bal bloklarına basarak göğe zıpla! [Boşluk] ile çift zıpla!</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 flex items-start gap-2">
              <span className="text-base">🎯</span>
              <span><strong>Kolay Görevler:</strong> Ekrandaki görevleri sırayla yapıp Altın Tacı kazan!</span>
            </div>
          </div>
        </div>

        {/* Controls Quick Reference */}
        <div className="text-[11px] text-amber-200/90 mb-6 bg-slate-950/80 p-3 rounded-xl border border-amber-400/40 flex flex-col sm:flex-row justify-between gap-1.5">
          <span>🎮 <strong>Ok Tuşları:</strong> [ ⬆️ ⬇️ ⬅️ ➡️ ] • <strong>Zıpla:</strong> [ Boşluk ] • 🖱️ <strong>Sol Tık:</strong> Koy 🧱 • <strong>Sağ Tık:</strong> Kır ⛏️</span>
          <span>👉 <strong>Sağ alt köşeden</strong> de yönetebilirsin!</span>
        </div>

        {/* Start Button */}
        <button
          id="btn-start-game"
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-98 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl border-2 border-amber-200 text-base cursor-pointer transition flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Hemen Maceraya Başla!</span>
        </button>
      </div>
    </div>
  );
};
