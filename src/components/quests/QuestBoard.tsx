import { useState, useMemo, useEffect } from 'react';
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

  const activeQuests           = useGameStore(useShallow(selectActiveQuests));
  const completedQuests        = useGameStore(useShallow(selectCompletedQuests));
  const todayCompleted         = useGameStore(useShallow(selectTodayCompleted));
  const clearCompleted         = useGameStore((s) => s.clearCompleted);
  const resetRecurringQuests   = useGameStore((s) => s.resetRecurringQuests);
  const character              = useGameStore((s) => s.character);

  // Auto-reset recurring quests on mount and when tab becomes visible
  useEffect(() => {
    resetRecurringQuests();
    const onVisible = () => { if (document.visibilityState === 'visible') resetRecurringQuests(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const title = titleFromLevel(character.level);

  // Daily progress
  const todayTotal = todayCompleted.length;
  const dailyGoal  = Math.max(activeQuests.length + todayTotal, 1);
  const dailyPct   = Math.min(todayTotal / dailyGoal, 1);

  // Sorted active quests — split recurring vs one-time
  const { sorted, recurringActive } = useMemo(() => {
    const oneTime   = activeQuests.filter((q) => q.recurrence === 'none');
    const recurring = activeQuests.filter((q) => q.recurrence !== 'none');
    const sortFn = (list: typeof activeQuests) => {
      const l = [...list];
      if (sort === 'difficulty') l.sort((a, b) => DIFF_ORDER[b.difficulty] - DIFF_ORDER[a.difficulty]);
      else if (sort === 'xp')    l.sort((a, b) => b.xpReward - a.xpReward);
      return l;
    };
    return { sorted: sortFn(oneTime), recurringActive: sortFn(recurring) };
  }, [activeQuests, sort]);


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

        {(['date', 'difficulty', 'xp'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            style={{
              fontFamily: 'var(--font-pixel)', fontSize: '7px',
              padding: '5px 7px',
              background: sort === key ? 'var(--purple-dim)' : 'var(--bg-card)',
              border: `2px solid ${sort === key ? 'var(--purple)' : 'var(--border)'}`,
              color: sort === key ? 'var(--purple-light)' : 'var(--text-faint)',
              boxShadow: sort === key ? '2px 2px 0 #000' : 'none',
            }}
          >
            {SORT_LABELS[key]}
          </button>
        ))}

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

      {/* ── Habitudes (recurring) section ── */}
      {recurringActive.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--blue)' }}>
              ▸ HABITUDES · {recurringActive.length}
            </span>
            <div style={{ flex: 1, borderTop: '1px dashed var(--blue)', opacity: 0.35 }} />
          </div>
          <AnimatePresence initial={false}>
            {recurringActive.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </AnimatePresence>
          <div style={{ marginBottom: 12 }} />
        </>
      )}

      {/* ── Quest list label ── */}
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-faint)', marginBottom: 8 }}>
        ▸ ACTIVE QUESTS · {sorted.length}
      </div>

      {/* ── Active quests ── */}
      <AnimatePresence initial={false}>
        {sorted.length === 0 && recurringActive.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-3"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '36px' }}
            >⚔️</motion.div>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 2.2 }}>
              BOARD VIDE<br />
              <span style={{ color: 'var(--purple-light)' }}>CRÉE TA PREMIÈRE QUÊTE ＋</span>
            </p>
            <p style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.6, maxWidth: 220 }}>
              Chaque tâche complétée = XP + Gold. Lance-toi.
            </p>
          </motion.div>
        )}
        {sorted.length === 0 && recurringActive.length > 0 && (
          <motion.div key="empty-one-time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', textAlign: 'center', padding: '8px 0 4px' }}>
            — aucune quête ponctuelle —
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
