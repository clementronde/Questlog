import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { ACHIEVEMENTS, RARITY_COLORS, type Achievement } from '../../lib/achievements';

const CATEGORIES = [
  { id: 'all',     label: 'ALL' },
  { id: 'quests',  label: 'QUEST' },
  { id: 'streaks', label: 'STREAK' },
  { id: 'levels',  label: 'LEVEL' },
  { id: 'special', label: 'SPECIAL' },
] as const;

type CategoryFilter = typeof CATEGORIES[number]['id'];

export default function AchievementsGrid() {
  const unlockedAchievements = useGameStore(useShallow((s) => s.unlockedAchievements));
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filtered = ACHIEVEMENTS.filter(
    (a) => filter === 'all' || a.category === filter
  );
  const unlockedCount = unlockedAchievements.length;
  const totalCount    = ACHIEVEMENTS.length;

  return (
    <div
      className="p-3"
      style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-light)',
        boxShadow: '3px 3px 0 var(--pixel-shadow)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)' }}>
          ▸ ACHIEVEMENTS
        </span>
        <span style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--purple-light)' }}>
          {unlockedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="mb-3"
        style={{
          height: 8,
          background: 'var(--bg-deep)',
          border: '2px solid var(--border)',
        }}
      >
        <motion.div
          style={{ height: '100%', background: 'var(--purple)', maxWidth: '100%' }}
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="shrink-0 px-2 py-1"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              background: filter === id ? 'var(--purple)' : 'var(--bg-deep)',
              border: `2px solid ${filter === id ? 'var(--purple-light)' : 'var(--border)'}`,
              color: filter === id ? '#fff' : 'var(--text-faint)',
              boxShadow: filter === id ? '2px 2px 0 var(--pixel-shadow)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((a, i) => (
          <AchievementBadge
            key={a.id}
            achievement={a}
            unlocked={unlockedAchievements.includes(a.id)}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

function AchievementBadge({
  achievement,
  unlocked,
  index,
}: {
  achievement: Achievement;
  unlocked: boolean;
  index: number;
}) {
  const colors = RARITY_COLORS[achievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="p-2 flex flex-col items-center text-center gap-1"
      style={{
        background: unlocked ? 'var(--bg-surface)' : 'var(--bg-deep)',
        border: `2px solid ${unlocked ? colors.border : 'var(--border)'}`,
        boxShadow: unlocked ? `2px 2px 0 var(--pixel-shadow)` : 'none',
        opacity: unlocked ? 1 : 0.4,
        filter: unlocked ? 'none' : 'grayscale(1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Legendary shimmer */}
      {unlocked && achievement.rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ['-120%', '220%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: 'linear' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,204,0,0.2), transparent)',
            width: '40%',
          }}
        />
      )}

      <span style={{ fontSize: '20px', lineHeight: 1 }}>
        {unlocked ? achievement.icon : '🔒'}
      </span>

      <span
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: unlocked ? 'var(--text)' : 'var(--text-faint)',
          lineHeight: 1.5,
        }}
      >
        {unlocked ? achievement.title : '???'}
      </span>

      {unlocked && (
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '5px',
            color: colors.text,
            textTransform: 'uppercase',
          }}
        >
          {achievement.rarity}
        </span>
      )}

      {!unlocked && (
        <span
          style={{
            fontFamily: 'var(--font-vt)',
            fontSize: '12px',
            color: 'var(--text-faint)',
            lineHeight: 1.3,
          }}
        >
          {achievement.description}
        </span>
      )}
    </motion.div>
  );
}
