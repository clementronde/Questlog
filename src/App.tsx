import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from './components/layout/AppShell';
import LevelUpModal from './components/ui/LevelUpModal';
import AchievementToast from './components/ui/AchievementToast';
import FloatingXP from './components/ui/FloatingXP';
import LootModal from './components/ui/LootModal';
import LandingPage from './components/landing/LandingPage';
import ClassSelector from './components/character/ClassSelector';
import { useGameStore } from './store/useGameStore';
import { useTheme } from './hooks/useTheme';

export default function App() {
  useTheme();

  const pendingLevelUp = useGameStore((s) => s.pendingLevelUp);
  const dismissLevelUp = useGameStore((s) => s.dismissLevelUp);
  const heroClass      = useGameStore((s) => s.character.heroClass);
  const pendingLoot    = useGameStore((s) => s.pendingLoot);

  const [started, setStarted] = useState(() => localStorage.getItem('ql:started') === '1');

  const handleEnter = () => {
    localStorage.setItem('ql:started', '1');
    setStarted(true);
  };

  // Landing page
  if (!started) return <LandingPage onEnter={handleEnter} />;

  // Class selection (first time)
  if (!heroClass) return <ClassSelector />;

  return (
    <>
      <AppShell />
      <FloatingXP />
      <AchievementToast />
      <AnimatePresence>
        {pendingLoot && <LootModal />}
      </AnimatePresence>
      {pendingLevelUp !== null && (
        <LevelUpModal level={pendingLevelUp} onClose={dismissLevelUp} />
      )}
    </>
  );
}
