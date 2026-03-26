import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import QuestBoard from '../quests/QuestBoard';
import CharacterSheet from '../character/CharacterSheet';
import BossScreen from '../boss/BossScreen';
import RewardShop from '../shop/RewardShop';
import Settings from '../settings/Settings';
import PWAInstallBanner from '../ui/PWAInstallBanner';

export type TabId = 'quests' | 'character' | 'dungeon' | 'shop' | 'settings';

const TAB_ORDER: TabId[] = ['quests', 'character', 'dungeon', 'shop', 'settings'];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-40%' : '40%', opacity: 0 }),
};

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('quests');
  const prevIndexRef = useRef(0);

  const handleChange = (tab: TabId) => {
    prevIndexRef.current = TAB_ORDER.indexOf(activeTab);
    setActiveTab(tab);
  };

  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const direction    = currentIndex - prevIndexRef.current;

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-deep)',
        overflow: 'hidden',
      }}
    >
      <PWAInstallBanner />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'absolute',
              inset: 0,
              overflowY: 'auto',
              paddingBottom: '4.5rem',
            }}
          >
            {activeTab === 'quests'    && <QuestBoard />}
            {activeTab === 'character' && <CharacterSheet />}
            {activeTab === 'dungeon'   && <BossScreen />}
            {activeTab === 'shop'      && <RewardShop />}
            {activeTab === 'settings'  && <Settings />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onChange={handleChange} />
    </div>
  );
}
