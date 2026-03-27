import { motion } from 'framer-motion';
import { Sword, User, Skull, Trophy, Settings } from 'lucide-react';
import type { TabId } from './AppShell';

const TABS: {
  id: TabId;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: 'quests',      label: 'QUÊTES',  Icon: Sword },
  { id: 'character',   label: 'HÉROS',   Icon: User },
  { id: 'dungeon',     label: 'DONJON',  Icon: Skull },
  { id: 'leaderboard', label: 'TOP',     Icon: Trophy },
  { id: 'settings',    label: 'OPTIONS', Icon: Settings },
];

interface Props {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-stretch"
      style={{
        height: '4rem',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--bg-card)',
        borderTop: '2px solid var(--border-light)',
        boxShadow: '0 -3px 0 var(--pixel-shadow)',
        zIndex: 50,
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 relative"
            style={{
              background: active ? 'var(--purple-dim)' : 'transparent',
              borderRight: '1px solid var(--border)',
              color: active ? 'var(--purple-light)' : 'var(--text-faint)',
            }}
          >
            {active && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--purple-light)' }} />
            )}
            {active && (
              <span
                className="px-blink absolute left-0.5"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--purple-light)', lineHeight: 1 }}
              >
                ▶
              </span>
            )}
            <motion.div animate={{ scale: active ? 1.1 : 1 }} transition={{ duration: 0.1 }}>
              <Icon size={16} strokeWidth={active ? 2.5 : 1.5} />
            </motion.div>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', lineHeight: 1 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
