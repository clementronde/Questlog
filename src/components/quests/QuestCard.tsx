import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import { useGameStore, type Quest } from '../../store/useGameStore';
import { haptic, playComplete, spawnXPFloat } from '../../lib/feedback';

const DIFF_CONFIG: Record<string, { label: string; color: string; rank: string }> = {
  trivial: { label: 'Trivial', color: 'var(--text-dim)',  rank: 'E' },
  easy:    { label: 'Easy',    color: 'var(--green)',     rank: 'D' },
  medium:  { label: 'Medium',  color: 'var(--blue)',      rank: 'C' },
  hard:    { label: 'Hard',    color: 'var(--orange)',    rank: 'B' },
  boss:    { label: 'BOSS',    color: 'var(--red)',       rank: 'S' },
};

export default function QuestCard({ quest }: { quest: Quest }) {
  const completeQuest = useGameStore((s) => s.completeQuest);
  const deleteQuest   = useGameStore((s) => s.deleteQuest);
  const combo         = useGameStore((s) => s.character.combo) / 100;
  const cardRef       = useRef<HTMLDivElement>(null);

  const isCompleted = quest.status === 'completed';
  const diff        = DIFF_CONFIG[quest.difficulty];
  const effectiveXp = Math.round(quest.xpReward * (isCompleted ? 1 : combo));

  const handleComplete = () => {
    haptic([10, 5, 30]);
    playComplete();
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      spawnXPFloat(effectiveXp, r.left + r.width / 2, r.top + r.height / 2);
    }
    completeQuest(quest.id);
  };

  const handleDelete = () => {
    haptic([20, 10, 20]);
    deleteQuest(quest.id);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isCompleted ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative mb-2"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: isCompleted ? 'var(--bg-deep)' : 'var(--bg-card)',
        border: `2px solid ${isCompleted ? 'var(--border)' : 'var(--border-light)'}`,
        boxShadow: isCompleted ? 'none' : '3px 3px 0 #000',
      }}
    >
      {/* Rank badge */}
      <div style={{
        width: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isCompleted ? 'var(--bg-surface)' : diff.color,
        borderRight: '2px solid #000',
        fontFamily: 'var(--font-pixel)', fontSize: '9px',
        color: isCompleted ? 'var(--text-faint)' : '#000', fontWeight: 900,
      }}>
        {isCompleted ? '✓' : diff.rank}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: '10px 12px' }}>
        <p style={{
          fontFamily: 'var(--font-vt)', fontSize: '20px', lineHeight: 1,
          color: isCompleted ? 'var(--text-faint)' : 'var(--text)',
          textDecoration: isCompleted ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {quest.title}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
          <span style={{ color: diff.color }}>{diff.label}</span>
          <span style={{ color: 'var(--purple-light)' }}>+{effectiveXp} XP</span>
          <span style={{ color: 'var(--gold)' }}>+{quest.goldReward}G</span>
        </div>
      </div>

      {/* Actions */}
      {!isCompleted ? (
        <div style={{ display: 'flex', flexShrink: 0, borderLeft: '2px solid #000' }}>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleComplete}
            style={{
              width: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--green)',
              borderRight: '1px solid #000',
            }}
          >
            <Check size={18} color="#000" strokeWidth={3} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleDelete}
            style={{
              width: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-surface)',
            }}
          >
            <Trash2 size={14} color="var(--red)" />
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleDelete}
          style={{
            width: 40, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <Trash2 size={13} color="var(--text-faint)" />
        </motion.button>
      )}
    </motion.div>
  );
}
