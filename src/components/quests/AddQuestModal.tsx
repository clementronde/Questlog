import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { type Difficulty, XP_WEIGHTS } from '../../lib/xp';

const DIFFICULTIES: Difficulty[] = ['trivial', 'easy', 'medium', 'hard', 'boss'];

const DIFF_CONFIG: Record<Difficulty, { label: string; rank: string; color: string }> = {
  trivial: { label: 'TRIVIAL', rank: 'E', color: 'var(--text-dim)' },
  easy:    { label: 'EASY',    rank: 'D', color: 'var(--green)' },
  medium:  { label: 'MEDIUM',  rank: 'C', color: 'var(--blue)' },
  hard:    { label: 'HARD',    rank: 'B', color: 'var(--orange)' },
  boss:    { label: 'BOSS',    rank: 'S', color: 'var(--red)' },
};

interface Props { onClose: () => void }

export default function AddQuestModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const addQuest = useGameStore((s) => s.addQuest);
  const combo    = useGameStore((s) => s.character.combo) / 100;

  const previewXp = Math.round(XP_WEIGHTS[difficulty] * combo);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addQuest(title.trim(), difficulty);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(5,5,16,0.88)' }}
      />

      {/* Centered popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'var(--bg-card)',
            border: '2px solid var(--purple)',
            boxShadow: '6px 6px 0 #000',
            padding: '1rem',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-between mb-4 pb-2"
            style={{ borderBottom: '2px solid var(--border)' }}
          >
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--purple-light)' }}>
              ▸ NEW QUEST
            </span>
            <button
              onClick={onClose}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}
            >
              ✕
            </button>
          </div>

          {/* Title input */}
          <div className="mb-4">
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              QUEST NAME
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Describe your quest..."
              className="w-full px-3 py-2 outline-none"
              style={{
                background: 'var(--bg-deep)',
                border: '2px solid var(--border-light)',
                boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.5)',
                color: 'var(--text)',
                fontFamily: 'var(--font-vt)',
                fontSize: '20px',
                caretColor: 'var(--purple-light)',
              }}
            />
          </div>

          {/* Difficulty picker */}
          <div className="mb-4">
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              RANK / DIFFICULTY
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => {
                const cfg = DIFF_CONFIG[d];
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="flex-1 py-2 flex flex-col items-center gap-1"
                    style={{
                      background: active ? cfg.color : 'var(--bg-deep)',
                      border: `2px solid ${active ? cfg.color : 'var(--border)'}`,
                      boxShadow: active ? '3px 3px 0 #000' : 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: active ? '#000' : cfg.color, fontWeight: 900 }}>
                      {cfg.rank}
                    </span>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: active ? '#000' : 'var(--text-faint)' }}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* XP preview */}
          <div
            className="text-center py-2 mb-4"
            style={{
              background: 'var(--purple-dim)',
              border: '1px dashed var(--purple)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
            }}
          >
            <span style={{ color: 'var(--text-dim)' }}>REWARD: </span>
            <span style={{ color: 'var(--purple-light)' }}>+{previewXp} XP</span>
            {combo > 1 && (
              <span style={{ color: 'var(--gold)' }}> ×{combo.toFixed(2)} COMBO!</span>
            )}
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            whileTap={{ x: 3, y: 3 }}
            disabled={!title.trim()}
            className="w-full py-3"
            style={{
              background: title.trim() ? 'var(--purple)' : 'var(--bg-surface)',
              border: `2px solid ${title.trim() ? 'var(--purple-light)' : 'var(--border)'}`,
              boxShadow: title.trim() ? '4px 4px 0 #000' : 'none',
              color: title.trim() ? '#fff' : 'var(--text-faint)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              letterSpacing: '0.1em',
            }}
          >
            ▶ ACCEPT QUEST
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
