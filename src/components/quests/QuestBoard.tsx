import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGameStore,
  selectActiveQuests,
  selectCompletedQuests,
  selectTodayCompleted,
} from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { titleFromLevel } from '../../lib/xp';
import QuestCard from './QuestCard';
import AddQuestModal from './AddQuestModal';
import XPBar from '../character/XPBar';

type SortKey = 'date' | 'difficulty' | 'xp';
type FilterKey = 'all' | 'active';

const DIFF_ORDER: Record<string, number> = {
  trivial: 0, easy: 1, medium: 2, hard: 3, boss: 4,
};
const SORT_LABELS: Record<SortKey, string> = {
  date: 'DATE', difficulty: 'RANK', xp: 'XP',
};

export default function QuestBoard() {
  const [showAdd, setShowAdd] = useState(false);
  const [sort, setSort]       = useState<SortKey>('date');
  const [filter, setFilter]   = useState<FilterKey>('all');

  const activeQuests    = useGameStore(useShallow(selectActiveQuests));
  const completedQuests = useGameStore(useShallow(selectCompletedQuests));
  const todayCompleted  = useGameStore(useShallow(selectTodayCompleted));
  const clearCompleted  = useGameStore((s) => s.clearCompleted);
  const character       = useGameStore((s) => s.character);

  const title = titleFromLevel(character.level);

  // Daily progress
  const todayTotal = todayCompleted.length;
  const dailyGoal  = Math.max(activeQuests.length + todayTotal, 1);
  const dailyPct   = Math.min(todayTotal / dailyGoal, 1);

  // Sorted active quests
  const sorted = useMemo(() => {
    const list = [...activeQuests];
    if (sort === 'difficulty') list.sort((a, b) => DIFF_ORDER[b.difficulty] - DIFF_ORDER[a.difficulty]);
    else if (sort === 'xp')    list.sort((a, b) => b.xpReward - a.xpReward);
    return list;
  }, [activeQuests, sort]);

  const cycleSort = () => {
    const keys: SortKey[] = ['date', 'difficulty', 'xp'];
    setSort((s) => keys[(keys.indexOf(s) + 1) % keys.length]);
  };

  return (
    <div className="flex flex-col min-h-full px-3 pt-4 pb-4">

      {/* ── Player status card ── */}
      <div
        className="mb-4 p-3"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--purple)',
          boxShadow: '4px 4px 0 #000',
        }}
      >
        {/* Top row: level + title + streak/gold */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Level badge */}
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'var(--purple)',
              border: '2px solid var(--purple-light)',
              boxShadow: '3px 3px 0 #000',
            }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>LV</span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#fff', lineHeight: 1 }}>{character.level}</span>
            </div>
            {/* Title */}
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginBottom: 3 }}>
                {title.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--purple-light)' }}>
                {character.totalXp.toLocaleString()} XP TOTAL
              </div>
            </div>
          </div>

          {/* Streak + Gold */}
          <div className="flex flex-col items-end gap-1">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)' }}>
              {character.gold.toLocaleString()} G
            </div>
            {character.streak > 0 && (
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: character.streak >= 3 ? 'var(--red)' : 'var(--text-faint)' }}>
                {character.streak >= 3 ? '🔥' : '📅'} {character.streak}d streak
              </div>
            )}
            {character.combo > 100 && (
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)' }}>
                ×{(character.combo / 100).toFixed(2)} combo
              </div>
            )}
          </div>
        </div>

        {/* XP bar */}
        <XPBar
          current={character.xpIntoLevel}
          max={character.xpForLevel}
          color="var(--purple)"
          segments={16}
          showLabel
        />
      </div>

      {/* ── Daily progress ── */}
      {todayTotal > 0 && (
        <div className="mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginBottom: 4 }}>
            <span>TODAY'S PROGRESS</span>
            <span style={{ color: 'var(--purple-light)' }}>{todayTotal} CLEARED</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-surface)', border: '2px solid var(--border)', display: 'flex', overflow: 'hidden' }}>
            <motion.div
              style={{ background: 'var(--purple)', height: '100%' }}
              initial={{ width: 0 }}
              animate={{ width: `${dailyPct * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* ── Toolbar: sort + filter + add ── */}
      <div className="flex gap-2 mb-3">
        {(['all', 'active'] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: 'var(--font-pixel)', fontSize: '8px',
              padding: '5px 8px',
              background: filter === f ? 'var(--purple-dim)' : 'var(--bg-card)',
              border: `2px solid ${filter === f ? 'var(--purple)' : 'var(--border)'}`,
              color: filter === f ? 'var(--purple-light)' : 'var(--text-faint)',
              boxShadow: filter === f ? '2px 2px 0 #000' : 'none',
            }}
          >
            {f === 'all' ? 'ALL' : 'ACTIVE'}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <motion.button
          whileTap={{ x: 1, y: 1 }}
          onClick={cycleSort}
          style={{
            fontFamily: 'var(--font-pixel)', fontSize: '8px',
            padding: '5px 8px',
            background: 'var(--bg-card)',
            border: '2px solid var(--border-light)',
            color: 'var(--text-dim)',
            boxShadow: '2px 2px 0 #000',
          }}
        >
          SORT: {SORT_LABELS[sort]}
        </motion.button>

        <motion.button
          onClick={() => setShowAdd(true)}
          whileTap={{ x: 3, y: 3 }}
          style={{
            background: 'var(--purple)', border: '2px solid var(--purple-light)',
            boxShadow: '3px 3px 0 #000', color: '#fff',
            fontFamily: 'var(--font-pixel)', fontSize: '9px',
            padding: '5px 12px',
          }}
        >
          ＋
        </motion.button>
      </div>

      {/* ── Quest list label ── */}
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-faint)', marginBottom: 8 }}>
        ▸ ACTIVE QUESTS · {activeQuests.length}
      </div>

      {/* ── Active quests ── */}
      <AnimatePresence initial={false}>
        {sorted.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div style={{ fontSize: '32px' }}>⚔️</div>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 2 }}>
              NO ACTIVE QUESTS<br />
              <span style={{ color: 'var(--text-dim)' }}>PRESS ＋ TO BEGIN</span>
            </p>
          </motion.div>
        )}
        {sorted.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </AnimatePresence>

      {/* ── Completed section ── */}
      {filter === 'all' && completedQuests.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)' }}>
              ▸ COMPLETED · {completedQuests.length}
            </span>
            <div style={{ flex: 1, borderTop: '1px dashed var(--border)' }} />
            <motion.button
              whileTap={{ x: 2, y: 2 }}
              onClick={clearCompleted}
              style={{
                fontFamily: 'var(--font-pixel)', fontSize: '8px',
                color: 'var(--red)', background: 'var(--red-dim)',
                border: '1px solid var(--red)', padding: '2px 6px',
                boxShadow: '1px 1px 0 #000',
              }}
            >
              CLEAR ALL
            </motion.button>
          </div>
          <AnimatePresence>
            {completedQuests.slice(0, 5).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </AnimatePresence>
          {completedQuests.length > 5 && (
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', textAlign: 'center', marginTop: 6 }}>
              +{completedQuests.length - 5} more hidden
            </p>
          )}
        </div>
      )}

      {/* ── Add modal ── */}
      <AnimatePresence>
        {showAdd && <AddQuestModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}
