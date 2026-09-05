import React, { useState } from 'react';
import { GameState } from '../game/types';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Award, Volume2, Sparkles } from 'lucide-react';
import { voice } from '../game/voice';

interface ChildQuestWidgetProps {
  state: GameState;
  onOpenFullModal: () => void;
}

export const ChildQuestWidget: React.FC<ChildQuestWidgetProps> = ({ state, onOpenFullModal }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 4 clear, child-friendly missions
  const quests = [
    {
      id: 'bears',
      title: 'Yavru Ayıları Kurtar',
      icon: '🐻',
      done: state.rescuedBears >= state.totalBearsToRescue,
      current: state.rescuedBears,
      target: state.totalBearsToRescue,
      hint: state.rescuedBears >= state.totalBearsToRescue
        ? 'Harika! Bütün küçük ayıcıkları kurtardın! 🎉'
        : 'Köşkteki ve ormandaki minik ayıları bul!'
    },
    {
      id: 'mine',
      title: 'Blokları Kır ve Dene',
      icon: '⛏️',
      done: state.blocksMined >= 5,
      current: Math.min(5, state.blocksMined),
      target: 5,
      hint: state.blocksMined >= 5
        ? 'Süper! Sınırsız bloklarınla inşa et! 🧱'
        : 'Herhangi 5 bloğa vurup kır!'
    },
    {
      id: 'portal',
      title: 'Mor Portaldan İçeri Gir',
      icon: '🔮',
      done: state.dimension === 'portalWorld' || state.hasFoundCrown,
      current: state.dimension === 'portalWorld' || state.hasFoundCrown ? 1 : 0,
      target: 1,
      hint: state.dimension === 'portalWorld' || state.hasFoundCrown
        ? 'Sihirli boyuta ulaştın! ✨'
        : 'Dağın zirvesindeki mor kapıya yürü!'
    },
    {
      id: 'crown',
      title: 'Altın Bal Tacını Başına Tak',
      icon: '👑',
      done: state.hasFoundCrown,
      current: state.hasFoundCrown ? 1 : 0,
      target: 1,
      hint: state.hasFoundCrown
        ? 'KAZANDIN! Kutsal Ayı Tacı senin! 🏆'
        : 'Uçan adaların en tepesindeki Tacı bul!'
    }
  ];

  const completedCount = quests.filter(q => q.done).length;

  const handleSpeakAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    voice.speakActiveNextQuest(
      state.rescuedBears,
      state.totalBearsToRescue,
      state.blocksMined,
      state.dimension,
      state.hasFoundCrown
    );
  };

  const handleSpeakQuest = (questId: string, current: number, target: number, e: React.MouseEvent) => {
    e.stopPropagation();
    voice.speakQuestGuidance(questId, current, target);
  };

  const handleSpeakElements = (e: React.MouseEvent) => {
    e.stopPropagation();
    voice.speak('Elif Dua, aşağıdaki çubukta Altın, Kum ve Bakır blokların hazır! İstediğin bloğu seçerek ayıcığın köşkünü genişletebilirsin!', true);
  };

  return (
    <div
      id="child-friendly-quest-widget"
      className="pointer-events-auto w-full max-w-[280px] sm:max-w-[320px] transition-all"
    >
      <div className="bg-slate-950/90 backdrop-blur-md border-2 border-amber-400/80 rounded-3xl p-3 shadow-2xl text-white select-none">
        {/* Header with toggle */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm shadow-inner">
              🎯
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-amber-300 leading-tight">
                Elif Dua'nın Görevleri
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-100/80 font-medium">
                <span>{completedCount}/4 Tamamlandı</span>
                {completedCount === 4 && <span className="text-emerald-400 font-bold">🎉 Şampiyon!</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct voice button for Elif Dua */}
            <button
              onClick={handleSpeakAll}
              title="Görevi Sesli Oku"
              className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 cursor-pointer transition active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <div className="text-slate-400 group-hover:text-amber-300 transition">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden my-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 4) * 100}%` }}
          ></div>
        </div>

        {/* Expanded Quests list */}
        {isExpanded && (
          <div className="space-y-1.5 pt-0.5 animate-in fade-in duration-200">
            {quests.map((q) => (
              <div
                key={q.id}
                onClick={(e) => handleSpeakQuest(q.id, q.current, q.target, e)}
                className={`p-2 rounded-2xl border transition-all cursor-pointer hover:border-amber-400/60 ${
                  q.done
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none">{q.icon}</span>
                    <span className={`text-xs font-bold truncate ${q.done ? 'text-emerald-300 line-through opacity-80' : 'text-white'}`}>
                      {q.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-700">
                      {q.current}/{q.target}
                    </span>
                    <button
                      onClick={(e) => handleSpeakQuest(q.id, q.current, q.target, e)}
                      title="Seslendir"
                      className="text-amber-400 hover:text-amber-300 p-0.5"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    {q.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Subtitle Hint */}
                <p className="text-[10px] text-slate-300 mt-1 pl-6 leading-tight">
                  {q.hint}
                </p>
              </div>
            ))}

            {/* Element guidance quick button */}
            <button
              onClick={handleSpeakElements}
              className="w-full py-1 text-[10px] font-medium text-amber-200/90 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>👑 Altın, 🏖️ Kum, 🟫 Bakır Sesli Rehber</span>
            </button>

            {/* Quick Action to open detailed book */}
            <button
              onClick={onOpenFullModal}
              className="w-full mt-1 py-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Detaylı Macera Defteri</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
