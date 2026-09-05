import React, { useEffect } from 'react';
import { GameState } from '../game/types';
import { CheckCircle2, Circle, X, Sparkles, Compass, Volume2 } from 'lucide-react';
import { voice } from '../game/voice';

interface QuestModalProps {
  state: GameState;
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ state, onClose }) => {
  const quests = [
    {
      id: 'mine',
      title: 'Madencilik Yap ve Blok İnşa Et',
      desc: 'Altın, kum, bakır veya taş blokları kırıp yeni yapılar dene.',
      progress: Math.min(5, state.blocksMined),
      target: 5,
      done: state.blocksMined >= 5,
      icon: '⛏️'
    },
    {
      id: 'rescue',
      title: 'Küçük Ayı Arkadaşlarını Kurtar',
      desc: 'Köşkte ve ormanda bekleyen 4 sevimli ayı arkadaşını bul ve kurtar.',
      progress: state.rescuedBears,
      target: state.totalBearsToRescue,
      done: state.rescuedBears >= state.totalBearsToRescue,
      icon: '🐻'
    },
    {
      id: 'portal',
      title: 'Gizemli Nether Portalı\'ndan Geç',
      desc: 'Kuzey dağındaki mor parlayan portala girerek Ayı Boyutu\'na ışınlan.',
      progress: state.dimension === 'portalWorld' || state.hasFoundCrown ? 1 : 0,
      target: 1,
      done: state.dimension === 'portalWorld' || state.hasFoundCrown,
      icon: '🔮'
    },
    {
      id: 'crown',
      title: 'Kutsal Altın Bal Tacını Bul',
      desc: 'Gizemli boyuttaki uçan adaların zirvesindeki efsanevi Bal Tacını ele geçir!',
      progress: state.hasFoundCrown ? 1 : 0,
      target: 1,
      done: state.hasFoundCrown,
      icon: '👑'
    }
  ];

  // Auto-speak quest overview on open
  useEffect(() => {
    voice.speakActiveNextQuest(
      state.rescuedBears,
      state.totalBearsToRescue,
      state.blocksMined,
      state.dimension,
      state.hasFoundCrown
    );
  }, []);

  const handleSpeakQuest = (questId: string, progress: number, target: number, e: React.MouseEvent) => {
    e.stopPropagation();
    voice.speakQuestGuidance(questId, progress, target);
  };

  const handleSpeakActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    voice.speakActiveNextQuest(
      state.rescuedBears,
      state.totalBearsToRescue,
      state.blocksMined,
      state.dimension,
      state.hasFoundCrown
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-400/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-300">
                Elif Dua'nın Macera Defteri
              </h2>
              <p className="text-xs text-slate-400">
                Super Bear Adventure x Minecraft Görevleri
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakActive}
              title="Görevleri Sesli Dinle"
              className="flex items-center gap-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl border border-amber-400/40 cursor-pointer transition"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Sesli Oku</span>
            </button>
            <button
              id="btn-close-quest-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-2.5 mb-5">
          {quests.map(q => (
            <div
              key={q.id}
              onClick={(e) => handleSpeakQuest(q.id, q.progress, q.target, e)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer hover:border-amber-400/50 ${
                q.done
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-slate-800/60 border-slate-700/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl">{q.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${q.done ? 'text-emerald-300' : 'text-white'}`}>
                      {q.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {q.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-3 shrink-0">
                <button
                  onClick={(e) => handleSpeakQuest(q.id, q.progress, q.target, e)}
                  title="Seslendir"
                  className="text-amber-400 hover:text-amber-300 p-1"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700">
                  {q.progress}/{q.target}
                </span>
                {q.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Helpful Tips for Elif Dua */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">İpucu: </span>
            <span>
              Turuncu <strong>Bal Blokları</strong> üzerine zıpladığında gökyüzüne fırlarsın! Ayrıca havada boşluğa tekrar basarak <strong>Çift Zıplama</strong> yapabilirsin.
            </span>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-5 flex justify-end">
          <button
            id="btn-confirm-quest-modal"
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg border-2 border-amber-300 text-sm cursor-pointer transition"
          >
            Maceraya Devam Et! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
