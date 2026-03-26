import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatItem {
  id: string;
  xp: number;
  x: number;
  y: number;
}

export default function FloatingXP() {
  const [floats, setFloats] = useState<FloatItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { xp, x, y } = (e as CustomEvent<{ xp: number; x: number; y: number }>).detail;
      const id = Math.random().toString(36).slice(2);
      setFloats((prev) => [...prev, { id, xp, x, y }]);
      setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1200);
    };
    window.addEventListener('ql:xpfloat', handler);
    return () => window.removeEventListener('ql:xpfloat', handler);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[300]">
      <AnimatePresence>
        {floats.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -64, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: f.x,
              top: f.y,
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '11px',
              color: 'var(--purple-light)',
              textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            +{f.xp} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
