import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { RARITY_CONFIG } from '../../lib/equipment';

type Phase = 'chest' | 'shake' | 'flash' | 'rays' | 'reveal';

// Light ray lines emanating from center
function LightRays({ color }: { color: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0.8], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.7, delay: i * 0.03, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 6,
            height: 160,
            background: `linear-gradient(to top, transparent, ${color}, transparent)`,
            transformOrigin: 'center center',
            rotate: `${i * 45}deg`,
            borderRadius: 3,
          }}
        />
      ))}
      {/* Center burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.5, 0], opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: 80, height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
      />
    </div>
  );
}

export default function LootModal() {
  const pendingLoot = useGameStore((s) => s.pendingLoot);
  const dismissLoot = useGameStore((s) => s.dismissLoot);
  const equipItem   = useGameStore((s) => s.equipItem);

  const [phase, setPhase] = useState<Phase>('chest');

  // Reset phase when new loot appears
  useEffect(() => {
    if (pendingLoot) setPhase('chest');
  }, [pendingLoot?.instanceId]);

  if (!pendingLoot) return null;

  const rar = RARITY_CONFIG[pendingLoot.rarity];

  const openChest = () => {
    if (phase !== 'chest') return;
    setPhase('shake');
    setTimeout(() => setPhase('flash'), 650);
    setTimeout(() => setPhase('rays'),  850);
    setTimeout(() => setPhase('reveal'), 1300);
  };

  const handleEquip = () => { equipItem(pendingLoot.instanceId); dismissLoot(); };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={phase === 'reveal' ? dismissLoot : undefined}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(5,5,16,0.94)' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">

          {/* ── CHEST PHASE ── */}
          {(phase === 'chest' || phase === 'shake') && (
            <motion.div
              key="chest"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)', marginBottom: 20 }}>
                ▸ COFFRE OBTENU
              </div>

              <motion.button
                onClick={openChest}
                animate={phase === 'shake' ? {
                  rotate: [-12, 12, -12, 12, -8, 8, -4, 4, 0],
                  scale:  [1, 1.08, 1, 1.08, 1.05, 1.02, 1],
                } : { rotate: [0, -2, 2, -2, 0] }}
                transition={phase === 'shake'
                  ? { duration: 0.65, ease: 'easeInOut' }
                  : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  fontSize: 88, lineHeight: 1, display: 'block', margin: '0 auto 24px',
                  cursor: phase === 'chest' ? 'pointer' : 'default',
                  background: 'none', border: 'none', padding: 0,
                  filter: 'drop-shadow(0 8px 24px rgba(255,200,50,0.4))',
                }}
              >
                📦
              </motion.button>

              {phase === 'chest' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)' }}
                  className="px-blink"
                >
                  ▶ APPUIE POUR OUVRIR
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── FLASH ── */}
          {phase === 'flash' && (
            <motion.div
              key="flash"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 100 }}
            />
          )}

          {/* ── RAYS + REVEAL ── */}
          {(phase === 'rays' || phase === 'reveal') && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ width: '100%', maxWidth: 320, textAlign: 'center', position: 'relative' }}
            >
              {/* Ray burst */}
              {phase === 'rays' && <LightRays color={rar.color} />}

              {/* Rarity label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  display: 'inline-block', fontFamily: 'var(--font-pixel)', fontSize: '8px',
                  color: '#000', padding: '5px 12px', marginBottom: 20,
                  background: rar.color, border: '2px solid #000', boxShadow: '3px 3px 0 #000',
                }}
              >
                ★ {rar.label}
              </motion.div>

              {/* Item icon */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.05 }}
                style={{
                  fontSize: 72, lineHeight: 1, marginBottom: 16,
                  filter: `drop-shadow(0 0 20px ${rar.glow}) drop-shadow(0 0 40px ${rar.glow})`,
                }}
              >
                {pendingLoot.icon}
              </motion.div>

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${rar.color}`,
                  boxShadow: `6px 6px 0 #000, 0 0 32px ${rar.glow}`,
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: rar.color, marginBottom: 8, textShadow: `0 0 12px ${rar.glow}` }}>
                  {pendingLoot.name}
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', marginBottom: 18, lineHeight: 1.9 }}>
                  {pendingLoot.description}
                </div>

                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleEquip}
                    className="flex-1 py-3"
                    style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', background: rar.color, border: '2px solid #000', color: '#000', boxShadow: '3px 3px 0 #000' }}>
                    ▶ ÉQUIPER
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={dismissLoot}
                    className="flex-1 py-3"
                    style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', background: 'var(--bg-surface)', border: '2px solid var(--border)', color: 'var(--text-dim)' }}>
                    GARDER
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}
