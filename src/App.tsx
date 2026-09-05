import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { GameState } from './game/types';
import { sound } from './game/sound';
import { voice } from './game/voice';
import { HUD } from './components/HUD';
import { Hotbar } from './components/Hotbar';
import { DirectionalControls } from './components/DirectionalControls';
import { QuestModal } from './components/QuestModal';
import { WinModal } from './components/WinModal';
import { ToastMessage, ToastData } from './components/ToastMessage';
import { WelcomeModal } from './components/WelcomeModal';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [engineInstance, setEngineInstance] = useState<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    dimension: 'overworld',
    coins: 0,
    honey: 0,
    rescuedBears: 0,
    totalBearsToRescue: 4,
    blocksMined: 0,
    hasFoundCrown: false,
    currentDimensionName: '🌲 Orman Dünyası',
    selectedSlot: 0,
    inventory: [
      { type: 'gold', name: 'Altın Blok', count: 999, iconColor: '#eab308', emoji: '👑' },
      { type: 'sand', name: 'Kum Bloğu', count: 999, iconColor: '#fde047', emoji: '🏖️' },
      { type: 'copper', name: 'Bakır Bloğu', count: 999, iconColor: '#b45309', emoji: '🟫' },
      { type: 'diamond', name: 'Elmas Bloğu', count: 999, iconColor: '#0ea5e9', emoji: '💎' },
      { type: 'honey', name: 'Zıplayan Bal', count: 999, iconColor: '#f59e0b', emoji: '🍯' },
      { type: 'grass', name: 'Çimen Bloğu', count: 999, iconColor: '#4da824', emoji: '🌱' },
      { type: 'brick', name: 'Tuğla Bloğu', count: 999, iconColor: '#9b3824', emoji: '🧱' },
      { type: 'wood', name: 'Meşe Odunu', count: 999, iconColor: '#78350f', emoji: '🪵' },
      { type: 'crystal', name: 'Mor Kristal', count: 999, iconColor: '#d946ef', emoji: '🔮' },
    ],
    hp: 5,
    maxHp: 5
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<'third' | 'first' | 'close'>('third');
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showWin, setShowWin] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Initialize GameEngine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current);
    engineRef.current = engine;
    setEngineInstance(engine);

    engine.onStateChange = (newState) => {
      setGameState({ ...newState });
    };

    engine.onMessage = (msg) => {
      setToast(msg);
      setTimeout(() => {
        setToast((current) => (current === msg ? null : current));
      }, 2600);
    };

    engine.onWin = () => {
      setShowWin(true);
    };

    return () => {
      engine.destroy();
      engineRef.current = null;
      setEngineInstance(null);
    };
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    voice.enabled = next;
  };

  const handleToggleCamera = () => {
    if (engineRef.current) {
      engineRef.current.toggleCamera();
      setCameraMode(engineRef.current.cameraMode);
    }
  };

  const handleSelectSlot = (idx: number) => {
    if (engineRef.current) {
      engineRef.current.selectSlot(idx);
    }
  };

  const handleCycleSlot = (idx: number) => {
    if (engineRef.current) {
      engineRef.current.cycleSlotBlock(idx);
    }
  };

  const handleRestart = () => {
    setShowWin(false);
    if (engineRef.current && containerRef.current) {
      engineRef.current.destroy();
      const engine = new GameEngine(containerRef.current);
      engineRef.current = engine;
      setEngineInstance(engine);

      engine.onStateChange = (newState) => {
        setGameState({ ...newState });
      };
      engine.onMessage = (msg) => {
        setToast(msg);
        setTimeout(() => {
          setToast((current) => (current === msg ? null : current));
        }, 2600);
      };
      engine.onWin = () => {
        setShowWin(true);
      };
      setGameState({ ...engine.state });
    }
  };

  return (
    <div id="game-app-container" className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Fredoka',sans-serif]">
      {/* 3D WebGL Canvas container */}
      <div
        id="three-canvas-root"
        ref={containerRef}
        onClick={() => {
          containerRef.current?.focus();
          window.focus();
        }}
        className="w-full h-full cursor-default outline-none"
        tabIndex={0}
      />

      {/* Heads-up Display */}
      <HUD
        state={gameState}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onToggleCamera={handleToggleCamera}
        onOpenQuests={() => setShowQuests(true)}
        cameraMode={cameraMode}
      />

      {/* Minecraft Inventory Hotbar with Infinite Blocks & Cycling */}
      <Hotbar
        inventory={gameState.inventory}
        selectedSlot={gameState.selectedSlot}
        onSelectSlot={handleSelectSlot}
        onCycleSlot={handleCycleSlot}
      />

      {/* Directional Controls in Bottom Right Corner (Ok Tuşları & Butonlar) */}
      <DirectionalControls engine={engineInstance} />

      {/* Floating Toast Notification */}
      <ToastMessage toast={toast} />

      {/* Welcome / Story Modal */}
      {showWelcome && (
        <WelcomeModal
          onStart={() => {
            setShowWelcome(false);
            window.focus();
            containerRef.current?.focus();
          }}
        />
      )}

      {/* Quest Book Modal */}
      {showQuests && (
        <QuestModal state={gameState} onClose={() => setShowQuests(false)} />
      )}

      {/* Victory Celebration Modal */}
      {showWin && (
        <WinModal
          state={gameState}
          onContinueExploring={() => setShowWin(false)}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
