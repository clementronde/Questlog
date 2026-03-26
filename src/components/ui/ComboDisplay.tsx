import { motion } from 'framer-motion';

interface Props {
  streak: number;
  combo: number; // integer e.g. 125 = 1.25×
}

export default function ComboDisplay({ streak, combo }: Props) {
  if (streak < 1) return null;

  const isHot  = streak >= 3;
  const mult   = (combo / 100).toFixed(2);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center"
      style={{
        background: isHot ? 'var(--gold-dim)' : 'var(--bg-surface)',
        border: `2px solid ${isHot ? 'var(--gold)' : 'var(--border)'}`,
        boxShadow: isHot ? '2px 2px 0 var(--pixel-shadow)' : 'none',
        padding: '4px 8px',
        minWidth: 52,
        textAlign: 'center',
      }}
    >
      {isHot ? (
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
          style={{ fontSize: '14px', lineHeight: 1 }}
        >
          🔥
        </motion.span>
      ) : (
        <span style={{ fontSize: '12px', lineHeight: 1 }}>📅</span>
      )}
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: isHot ? 'var(--gold)' : 'var(--text-dim)', marginTop: 2 }}>
        {streak}D
      </div>
      {isHot && (
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--red)', lineHeight: 1 }}>
          ×{mult}
        </div>
      )}
    </motion.div>
  );
}
