import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { RARITY_COLORS } from '../../lib/achievements';

const DISPLAY_MS = 3500;

export default function AchievementToast() {
  const achievementQueue    = useGameStore(useShallow((s) => s.achievementQueue));
  const shiftAchievementQueue = useGameStore((s) => s.shiftAchievementQueue);

  const current = achievementQueue[0] ?? null;

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(shiftAchievementQueue, DISPLAY_MS);
    return () => clearTimeout(t);
  }, [current?.id, shiftAchievementQueue]);

  const colors = current ? RARITY_COLORS[current.rarity] : null;

  return (
    <AnimatePresence mode="wait">
      {current && colors && (
        <motion.div
          key={current.id}
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={shiftAchievementQueue}
          className="fixed top-3 left-3 right-3 z-[200] flex items-center gap-3 p-3 cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: `2px solid ${colors.border}`,
            boxShadow: `4px 4px 0 var(--pixel-shadow)`,
            maxWidth: 400,
            margin: '0 auto',
          }}
        >
          {/* Window bar */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 3,
              background: colors.text,
            }}
          />

          {/* Icon */}
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}
          >
            {current.icon}
          </motion.span>

          {/* Text */}
          <div className="flex-1 min-w-0 mt-0.5">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: colors.text, marginBottom: 3 }}>
              ACHIEVEMENT UNLOCKED · {current.rarity.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text)', marginBottom: 2 }}>
              {current.title}
            </div>
            <div style={{ fontFamily: 'var(--font-vt)', fontSize: '14px', color: 'var(--text-dim)' }}>
              {current.description}
            </div>
          </div>

          {/* XP bonus */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--purple-light)',
              background: 'var(--purple-dim)',
              border: '2px solid var(--purple)',
              padding: '4px 6px',
              flexShrink: 0,
              boxShadow: '2px 2px 0 var(--pixel-shadow)',
            }}
          >
            +{current.xpBonus}
            <br />XP
          </div>

          {/* Auto-dismiss progress */}
          <motion.div
            className="absolute bottom-0 left-0"
            style={{ height: 2, background: colors.text }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: DISPLAY_MS / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
