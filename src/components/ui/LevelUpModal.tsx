import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { titleFromLevel } from '../../lib/xp';

interface Props {
  level: number;
  onClose: () => void;
}

// Simple pixel "star" burst using absolutely-positioned spans
const BURST = ['★', '✦', '✧', '◆', '◇', '▲', '▸', '♦'];

function Particle({ i }: { i: number }) {
  const angle = (i / 10) * 360;
  const rad   = (angle * Math.PI) / 180;
  const dist  = 70 + (i % 3) * 25;
  const tx    = Math.cos(rad) * dist;
  const ty    = Math.sin(rad) * dist;
  const color = i % 3 === 0 ? 'var(--gold)' : i % 3 === 1 ? 'var(--purple-light)' : 'var(--cyan)';

  return (
    <motion.span
      className="absolute pointer-events-none select-none"
      style={{
        top: '50%', left: '50%',
        fontFamily: 'var(--font-pixel)',
        fontSize: i % 2 === 0 ? '10px' : '7px',
        color,
        lineHeight: 1,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{ x: tx, y: ty, opacity: 0, scale: [0, 1.5, 0] }}
      transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
    >
      {BURST[i % BURST.length]}
    </motion.span>
  );
}

export default function LevelUpModal({ level, onClose }: Props) {
  const title = titleFromLevel(level);

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(5,5,16,0.9)' }}
    >
      {/* Scanline extra overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(123,47,255,0.04) 0px, rgba(123,47,255,0.04) 1px, transparent 1px, transparent 4px)',
        }}
      />

      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative text-center p-6 mx-4"
        style={{
          background: 'var(--bg-card)',
          border: '3px solid var(--purple-light)',
          boxShadow: `
            6px 6px 0 var(--pixel-shadow),
            0 0 0 6px var(--bg-deep),
            0 0 0 8px var(--purple),
            14px 14px 0 var(--pixel-shadow)
          `,
          maxWidth: 300,
          width: '100%',
        }}
      >
        {/* Window title bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center"
          style={{
            height: 20,
            background: 'var(--purple)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#fff',
            letterSpacing: '0.1em',
          }}
        >
          ★  LEVEL UP  ★
        </div>

        {/* Particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <Particle key={i} i={i} />
        ))}

        <div className="mt-5">
          {/* Sprite */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.4, repeat: 4, ease: 'easeInOut' }}
            style={{ fontSize: '40px', lineHeight: 1, marginBottom: 12 }}
          >
            🏆
          </motion.div>

          {/* New level */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '36px',
              color: 'var(--gold)',
              lineHeight: 1,
              textShadow: `3px 3px 0 #7a4000, 0 0 20px rgba(255,204,0,0.4)`,
              marginBottom: 8,
            }}
          >
            {level}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--purple-light)', marginBottom: 4 }}
          >
            {title.toUpperCase()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-dim)', marginBottom: 16 }}
          >
            Your legend grows, adventurer.
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileTap={{ x: 3, y: 3 }}
            onClick={onClose}
            className="px-btn"
            style={{
              background: 'var(--purple)',
              border: '2px solid var(--purple-light)',
              boxShadow: '3px 3px 0 var(--pixel-shadow)',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              padding: '8px 20px',
              letterSpacing: '0.1em',
            }}
          >
            ▶ CONTINUE
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
