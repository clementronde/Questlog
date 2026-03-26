import { motion } from 'framer-motion';

interface Props {
  current: number;
  max: number;
  color?: string;
  segments?: number;
  showLabel?: boolean;
}

export default function XPBar({
  current,
  max,
  color = 'var(--purple)',
  segments = 20,
  showLabel = false,
}: Props) {
  const pct = max > 0 ? Math.min(current / max, 1) : 0;
  const filled = Math.round(pct * segments);

  return (
    <div>
      {showLabel && (
        <div
          className="flex justify-between mb-1"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)' }}
        >
          <span>EXP</span>
          <span style={{ color }}>
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div
        className="flex gap-px"
        style={{
          border: '2px solid var(--border-light)',
          padding: '2px',
          background: 'var(--bg-deep)',
          boxShadow: 'inset 1px 1px 0 rgba(0,0,0,0.5)',
        }}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: i < filled ? 1 : 1 }}
            style={{
              flex: 1,
              height: 10,
              background: i < filled ? color : 'var(--bg-surface)',
              boxShadow: i < filled
                ? `inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.4)`
                : 'none',
              transition: `background ${i * 30}ms ease`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
