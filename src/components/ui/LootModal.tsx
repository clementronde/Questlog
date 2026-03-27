import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { RARITY_CONFIG, type EquipRarity } from '../../lib/equipment';

type Phase = 'chest' | 'shake' | 'flash' | 'rays' | 'reveal';

// ── Opening timings per rarity (ms from click) ───────────────────────────────

const TIMING: Record<EquipRarity, { shake?: number; flash?: number; rays?: number; reveal: number }> = {
  common:    {                                              reveal: 300  },
  rare:      { shake: 650,  flash: 1000, rays: 1450,      reveal: 1950 },
  epic:      { shake: 800,  flash: 1300, rays: 1950,      reveal: 2700 },
  legendary: { shake: 1000, flash: 1600, rays: 2500,      reveal: 3400 },
  mythic:    { shake: 1250, flash: 2050, rays: 3200,      reveal: 4400 },
};

// ── Ray count + length per rarity ────────────────────────────────────────────

const RAY_CFG: Record<EquipRarity, { count: number; len: number }> = {
  common:    { count: 0,  len: 0   },
  rare:      { count: 8,  len: 165 },
  epic:      { count: 16, len: 215 },
  legendary: { count: 24, len: 275 },
  mythic:    { count: 40, len: 360 },
};

// ── Light rays ───────────────────────────────────────────────────────────────

function LightRays({ color, count, len }: { color: string; count: number; len: number }) {
  if (count === 0) return null;
  const w = count > 24 ? 9 : count > 14 ? 7 : 6;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0.7], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.85, delay: i * (0.018 + (count > 24 ? 0.005 : 0)), ease: 'easeOut' }}
          style={{
            position: 'absolute', width: w, height: len,
            background: `linear-gradient(to top, transparent, ${color}, transparent)`,
            transformOrigin: 'center center',
            rotate: `${i * (360 / count)}deg`,
            borderRadius: 4,
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, count > 24 ? 5 : count > 14 ? 3.5 : 2.5, 0], opacity: [0, 0.75, 0] }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
    </div>
  );
}

// ── Epic: orbiting color sparks ───────────────────────────────────────────────

function EpicOrbs({ color }: { color: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 2.8 + i * 0.3, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', width: 110 + i * 22, height: 110 + i * 22 }}>
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.9 + i * 0.25, repeat: Infinity }}
            style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -4, width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}, 0 0 20px ${color}` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Legendary: halo rings + star crown ───────────────────────────────────────

function LegendaryHalo({ color, glow }: { color: string; glow: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
      {[150, 200, 250].map((sz, i) => (
        <motion.div key={sz}
          animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `2px solid ${color}`, boxShadow: `0 0 16px ${glow}` }}
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', width: 175, height: 175, rotate: `${i * 36}deg` }}>
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.13 }}
            style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -5, width: 10, height: 10, background: color, boxShadow: `0 0 12px ${glow}, 0 0 24px ${glow}`, borderRadius: '50%' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Mythic: inferno aura + fire particles + edge vignette ────────────────────

function MythicInferno({ color, glow }: { color: string; glow: string }) {
  // Pre-generate stable random values to avoid hydration mismatches
  const particles = Array.from({ length: 16 }, (_, i) => ({
    y:    -(70 + (i * 37) % 80),
    x:    ((i * 53) % 140) - 70,
    x2:   ((i * 71) % 180) - 90,
    size: 8 + (i * 13) % 10,
    dur:  1.0 + (i * 7) % 6 / 10,
    del:  i * 0.1,
    isOrange: i % 3 === 0,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
      {/* Expanding rings */}
      {[90, 150, 210, 280].map((sz, i) => (
        <motion.div key={sz}
          animate={{ scale: [0.4, 1.35, 0.4], opacity: [0, 0.85, 0] }}
          transition={{ duration: 1.15 + i * 0.2, repeat: Infinity, delay: i * 0.22 }}
          style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 24px ${glow}, inset 0 0 24px ${glow}` }}
        />
      ))}
      {/* Fire particles */}
      {particles.map((p, i) => (
        <motion.div key={i}
          animate={{ y: [0, p.y], x: [0, p.x, p.x2], opacity: [0, 0.95, 0], scale: [0.4, 1.3, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: 'easeOut' }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: p.isOrange ? '#ff8800' : color, boxShadow: `0 0 14px ${glow}` }}
        />
      ))}
      {/* Screen edge vignette */}
      <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at center, transparent 25%, ${glow} 100%)`, opacity: 0.65, pointerEvents: 'none' }} />
    </div>
  );
}

// ── Flash layer ───────────────────────────────────────────────────────────────

function FlashLayer({ rarity }: { rarity: EquipRarity }) {
  if (rarity === 'mythic') {
    return (
      <motion.div key="flash"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0, 0.85, 0, 0.7, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, times: [0, 0.12, 0.28, 0.45, 0.62, 0.8, 1], ease: 'easeOut' }}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'radial-gradient(circle, #ff4444 0%, #cc0000 50%, #440000 100%)', pointerEvents: 'none' }}
      />
    );
  }
  const bg: Record<EquipRarity, string> = {
    common:    '#fff',
    rare:      '#fff',
    epic:      'rgba(220,180,255,1)',
    legendary: 'rgba(255,230,100,1)',
    mythic:    '#ff0000',
  };
  const dur: Record<EquipRarity, number> = { common: 0.18, rare: 0.22, epic: 0.45, legendary: 0.55, mythic: 0.8 };
  return (
    <motion.div key="flash"
      initial={{ opacity: 1 }}
      animate={{ opacity: rarity === 'epic' || rarity === 'legendary' ? [1, 0, 0.55, 0] : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dur[rarity] }}
      style={{ position: 'fixed', inset: 0, background: bg[rarity], zIndex: 100, pointerEvents: 'none' }}
    />
  );
}

// ── Chest glow per rarity ─────────────────────────────────────────────────────

const CHEST_GLOW: Record<EquipRarity, string> = {
  common:    'drop-shadow(0 4px 10px rgba(136,136,136,0.3))',
  rare:      'drop-shadow(0 6px 20px rgba(0,230,118,0.45))',
  epic:      'drop-shadow(0 8px 28px rgba(187,134,252,0.6))',
  legendary: 'drop-shadow(0 8px 32px rgba(255,215,0,0.7)) drop-shadow(0 0 20px rgba(255,200,50,0.4))',
  mythic:    'drop-shadow(0 8px 40px rgba(255,68,68,0.9)) drop-shadow(0 0 70px rgba(255,0,0,0.5))',
};

// ── Shake animation per rarity ────────────────────────────────────────────────

const SHAKE: Record<EquipRarity, Record<string, number[]>> = {
  common:    { rotate: [0, -2, 2, 0] },
  rare:      { rotate: [-12, 12, -12, 12, -8, 8, -4, 4, 0], scale: [1, 1.08, 1, 1.08, 1.05, 1.02, 1] },
  epic:      { rotate: [-16, 16, -16, 16, -12, 12, -8, 8, -4, 4, 0], scale: [1, 1.13, 0.97, 1.12, 1.07, 1.03, 1] },
  legendary: { rotate: [-20, 20, -20, 20, -15, 15, -10, 10, -5, 5, 0], scale: [1, 1.18, 0.94, 1.16, 1.1, 1.05, 1.02, 1], y: [0, -8, 2, -6, 0] },
  mythic:    { rotate: [-28, 28, -26, 26, -22, 22, -18, 18, -12, 12, -6, 6, -2, 2, 0], scale: [1, 1.22, 0.9, 1.2, 1.14, 0.96, 1.1, 1.05, 1.01, 1], y: [0, -14, 4, -10, 2, -6, 0] },
};

// ── Main modal ────────────────────────────────────────────────────────────────

export default function LootModal() {
  const pendingLoot = useGameStore((s) => s.pendingLoot);
  const dismissLoot = useGameStore((s) => s.dismissLoot);
  const equipItem   = useGameStore((s) => s.equipItem);

  const [phase, setPhase] = useState<Phase>('chest');

  useEffect(() => {
    if (pendingLoot) setPhase('chest');
  }, [pendingLoot?.instanceId]);

  if (!pendingLoot) return null;

  const rar     = RARITY_CONFIG[pendingLoot.rarity];
  const timing  = TIMING[pendingLoot.rarity];
  const rays    = RAY_CFG[pendingLoot.rarity];
  const isBig   = pendingLoot.rarity === 'legendary' || pendingLoot.rarity === 'mythic';

  const openChest = () => {
    if (phase !== 'chest') return;
    if (pendingLoot.rarity === 'common') { setPhase('reveal'); return; }
    setPhase('shake');
    setTimeout(() => setPhase('flash'),  timing.shake!);
    setTimeout(() => setPhase('rays'),   timing.flash!);
    setTimeout(() => setPhase('reveal'), timing.rays!);
  };

  const handleEquip = () => { equipItem(pendingLoot.instanceId); dismissLoot(); };

  // Screen shake wrapper for legendary/mythic during shake phase
  const screenShake = phase === 'shake' && isBig
    ? { x: [0, -6, 6, -5, 5, -3, 3, -1, 1, 0], y: [0, 3, -3, 2, -2, 1, -1, 0] }
    : {};

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={phase === 'reveal' ? dismissLoot : undefined}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(5,5,16,0.95)' }}
      />

      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        animate={screenShake}
        transition={{ duration: (timing.shake ?? 650) / 1000, ease: 'easeInOut' }}>

        <AnimatePresence mode="wait">

          {/* ── CHEST ── */}
          {(phase === 'chest' || phase === 'shake') && (
            <motion.div key="chest"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ textAlign: 'center' }}>

              {/* Mythic: ominous label */}
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: pendingLoot.rarity === 'mythic' ? rar.color : 'var(--text-dim)', marginBottom: 20, textShadow: pendingLoot.rarity === 'mythic' ? `0 0 10px ${rar.glow}` : 'none' }}>
                ▸ COFFRE OBTENU
              </div>

              <motion.button
                onClick={openChest}
                animate={phase === 'shake' ? SHAKE[pendingLoot.rarity] : { rotate: [0, -2, 2, -2, 0] }}
                transition={phase === 'shake'
                  ? { duration: (timing.shake ?? 650) / 1000, ease: 'easeInOut' }
                  : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  fontSize: 88, lineHeight: 1, display: 'block', margin: '0 auto 24px',
                  cursor: phase === 'chest' ? 'pointer' : 'default',
                  background: 'none', border: 'none', padding: 0,
                  filter: CHEST_GLOW[pendingLoot.rarity],
                }}>
                📦
              </motion.button>

              {phase === 'chest' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)' }}
                  className="px-blink">
                  ▶ APPUIE POUR OUVRIR
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── FLASH ── */}
          {phase === 'flash' && <FlashLayer rarity={pendingLoot.rarity} />}

          {/* ── RAYS + REVEAL ── */}
          {(phase === 'rays' || phase === 'reveal') && (
            <motion.div key="reveal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ width: '100%', maxWidth: 320, textAlign: 'center', position: 'relative' }}>

              {/* Rays (only during rays phase) */}
              {phase === 'rays' && <LightRays color={rar.color} count={rays.count} len={rays.len} />}

              {/* Reveal effects per rarity */}
              {phase === 'reveal' && pendingLoot.rarity === 'epic'      && <EpicOrbs color={rar.color} />}
              {phase === 'reveal' && pendingLoot.rarity === 'legendary' && <LegendaryHalo color={rar.color} glow={rar.glow} />}
              {phase === 'reveal' && pendingLoot.rarity === 'mythic'    && <MythicInferno color={rar.color} glow={rar.glow} />}

              {/* Rarity badge */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 22 }}
                style={{
                  display: 'inline-block', fontFamily: 'var(--font-pixel)', fontSize: '9px',
                  color: pendingLoot.rarity === 'common' ? '#fff' : '#000',
                  padding: '5px 14px', marginBottom: 20,
                  background: rar.color,
                  border: '2px solid #000',
                  boxShadow: `3px 3px 0 #000, 0 0 ${isBig ? '24px' : '12px'} ${rar.glow}`,
                  position: 'relative', zIndex: 3,
                  textShadow: pendingLoot.rarity === 'mythic' ? '0 0 8px rgba(0,0,0,0.8)' : 'none',
                }}>
                ★ {rar.label}
              </motion.div>

              {/* Item icon */}
              <motion.div
                initial={
                  pendingLoot.rarity === 'mythic'
                    ? { scale: 0, y: -50, opacity: 0, rotate: 0 }
                    : { scale: 0, rotate: -18, opacity: 1 }
                }
                animate={
                  pendingLoot.rarity === 'mythic'
                    ? { scale: 1, y: 0, opacity: 1, rotate: 0 }
                    : { scale: 1, rotate: 0 }
                }
                transition={
                  pendingLoot.rarity === 'mythic'
                    ? { type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }
                    : pendingLoot.rarity === 'legendary'
                    ? { type: 'spring', stiffness: 260, damping: 17, delay: 0.08 }
                    : { type: 'spring', stiffness: 360, damping: 20, delay: 0.05 }
                }
                style={{
                  fontSize: pendingLoot.rarity === 'mythic' ? 92 : isBig ? 82 : 72,
                  lineHeight: 1, marginBottom: 16, position: 'relative', zIndex: 3,
                  filter: [
                    `drop-shadow(0 0 20px ${rar.glow})`,
                    `drop-shadow(0 0 40px ${rar.glow})`,
                    isBig ? `drop-shadow(0 0 80px ${rar.glow})` : '',
                    pendingLoot.rarity === 'mythic' ? `drop-shadow(0 0 120px ${rar.glow})` : '',
                  ].join(' '),
                }}>

                {/* Pulsing aura for legendary + mythic */}
                {isBig && (
                  <motion.div
                    animate={{ scale: [0.7, 1.4, 0.7], opacity: [0.25, 0.65, 0.25] }}
                    transition={{ duration: pendingLoot.rarity === 'mythic' ? 1.1 : 1.6, repeat: Infinity }}
                    style={{
                      position: 'absolute', inset: '-24px', borderRadius: '50%',
                      background: `radial-gradient(circle, ${rar.glow} 0%, transparent 70%)`,
                      zIndex: -1,
                    }}
                  />
                )}
                {pendingLoot.icon}
              </motion.div>

              {/* Info card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pendingLoot.rarity === 'mythic' ? 0.25 : 0.15 }}
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${rar.color}`,
                  boxShadow: `6px 6px 0 #000, 0 0 ${pendingLoot.rarity === 'mythic' ? '60px' : isBig ? '40px' : '28px'} ${rar.glow}`,
                  padding: '1.25rem', position: 'relative', zIndex: 3,
                }}>
                {/* Mythic: pulsing top border */}
                {pendingLoot.rarity === 'mythic' && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${rar.color}, transparent)` }}
                  />
                )}

                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: rar.color, marginBottom: 8, textShadow: `0 0 12px ${rar.glow}` }}>
                  {pendingLoot.name}
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', marginBottom: 18, lineHeight: 1.9 }}>
                  {pendingLoot.description}
                </div>

                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleEquip}
                    className="flex-1 py-3"
                    style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', background: rar.color, border: '2px solid #000', color: pendingLoot.rarity === 'common' ? '#fff' : '#000', boxShadow: '3px 3px 0 #000' }}>
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
      </motion.div>
    </>
  );
}
