import { useEffect, useRef, useState } from 'react';
import {
  motion, useInView, AnimatePresence,
  useMotionValue, useSpring, useTransform,
  type MotionValue,
} from 'framer-motion';

interface Props { onEnter: () => void; }

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

// ── Hero Background ──────────────────────────────────────────────────────────

const HERO_STARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  x: ((i * 97 + 7)  % 94) + 3,
  y: ((i * 73 + 11) % 88) + 4,
  size: i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  dur:  2.4 + (i % 7) * 0.45,
  del:  (i * 0.28) % 3.5,
  col:  i % 3 === 0
    ? 'rgba(187,134,252,0.85)'
    : i % 3 === 1
    ? 'rgba(255,215,0,0.65)'
    : 'rgba(100,170,255,0.7)',
}));

// ── Pixel grid — lights up on mouse hover ────────────────────────────────────

function PixelGridCanvas({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = heroRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const CELL   = 28;   // matches grid spacing
    const RADIUS = 135;

    let W = 0, H = 0, cols = 0, rows = 0;
    let brightness: Float32Array | null = null;
    let mx = -9999, my = -9999;
    let raf = 0;

    const init = () => {
      W = container.offsetWidth;
      H = container.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
      brightness = new Float32Array(cols * rows);
    };
    init();

    const ro = new ResizeObserver(init);
    ro.observe(container);

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!brightness) return;
      ctx.clearRect(0, 0, W, H);

      // Illuminate cells near cursor
      if (mx > -9000) {
        const c0 = Math.max(0,        Math.floor((mx - RADIUS) / CELL));
        const c1 = Math.min(cols - 1, Math.ceil( (mx + RADIUS) / CELL));
        const r0 = Math.max(0,        Math.floor((my - RADIUS) / CELL));
        const r1 = Math.min(rows - 1, Math.ceil( (my + RADIUS) / CELL));
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const dist = Math.hypot(c * CELL - mx, r * CELL - my);
            if (dist < RADIUS) {
              const t = 1 - dist / RADIUS;
              const target = t * t * 0.58;
              const idx = r * cols + c;
              if (target > brightness[idx]) brightness[idx] = target;
            }
          }
        }
      }

      // Render + decay all cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          let b = brightness[idx];
          if (b < 0.005) { brightness[idx] = 0; continue; }
          brightness[idx] = b * 0.91;
          // Purple → bright violet at peak
          const rr = Math.round(80  + b * 140);
          const gg = Math.round(20  + b * 60);
          ctx.fillStyle = `rgba(${rr},${gg},255,${b})`;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />
  );
}

// ── Quest completion cards — orbit the H1 ────────────────────────────────────

const FLOAT_QUESTS = [
  { title: 'Sport 30 min',     xp: 18,  rank: 'D', col: 'var(--green)'  },
  { title: 'Lire 20 pages',    xp: 10,  rank: 'E', col: '#888'          },
  { title: 'Rapport Q4',       xp: 85,  rank: 'B', col: 'var(--orange)' },
  { title: 'Méditer 10 min',   xp: 22,  rank: 'D', col: 'var(--green)'  },
  { title: 'Code review',      xp: 45,  rank: 'C', col: '#4af'          },
  { title: 'Projet perso',     xp: 120, rank: 'S', col: 'var(--gold)'   },
  { title: 'Apprendre React',  xp: 55,  rank: 'C', col: '#4af'          },
  { title: 'Revoir ses notes', xp: 14,  rank: 'E', col: '#888'          },
  { title: 'Faire du sport',   xp: 30,  rank: 'D', col: 'var(--green)'  },
];

// 4 slots: left + right of QUEST line, left + right of LOG line
// dx is card's left edge relative to title center, dy aligns card center with line center
const H1_SLOTS = [
  { dx: -420, dy: -58 },   // left of QUEST
  { dx:  230, dy: -58 },   // right of QUEST
  { dx: -390, dy:  14 },   // left of LOG
  { dx:  190, dy:  14 },   // right of LOG
];
const CARD_H = 36; // px — used for vertical centering below

function FloatingTasksAround() {
  const [keys,   setKeys]   = useState(() => H1_SLOTS.map((_, i) => i));
  const [quests, setQuests] = useState(() => H1_SLOTS.map((_, i) => FLOAT_QUESTS[i % FLOAT_QUESTS.length]));
  const counter = useRef(H1_SLOTS.length);

  useEffect(() => {
    // Each slot cycles independently, staggered so they don't all flip at once
    const ivs = H1_SLOTS.map((_, slot) =>
      setInterval(() => {
        const id = counter.current++;
        setQuests(prev => { const n = [...prev]; n[slot] = FLOAT_QUESTS[id % FLOAT_QUESTS.length]; return n; });
        setKeys(prev   => { const n = [...prev]; n[slot] = id; return n; });
      }, 2600 + slot * 650)
    );
    return () => ivs.forEach(clearInterval);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Anchor at the title block center */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {H1_SLOTS.map(({ dx, dy }, slot) => (
          // Wrapper positions the slot; inner motion.div animates entry/exit
          <div key={slot} style={{ position: 'absolute', left: dx, top: dy - CARD_H / 2 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={keys[slot]}
                initial={{ opacity: 0, scale: 0.78, y: 10 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.85,  y: -8 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                style={{
                  display: 'flex', alignItems: 'center',
                  width: 185,
                  background: 'rgba(10,7,24,0.93)',
                  border: `1.5px solid ${quests[slot].col}60`,
                  boxShadow: `3px 3px 0 #000, 0 0 18px ${quests[slot].col}22`,
                }}
              >
                {/* Rank badge */}
                <div style={{
                  width: 30, height: CARD_H, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: quests[slot].col, borderRight: '1px solid #000',
                  fontFamily: 'var(--font-pixel)', fontSize: '10px',
                  color: '#000', fontWeight: 900,
                }}>✓</div>
                {/* Text */}
                <div style={{ padding: '5px 9px 5px 7px', minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {quests[slot].title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--purple-light)', marginTop: 3 }}>
                    +{quests[slot].xp} XP ✨
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Parallax background ───────────────────────────────────────────────────────

function HeroBackground({ mouseX, mouseY, heroRef }: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  heroRef: React.RefObject<HTMLElement | null>;
}) {
  // Each layer at a different depth
  const orbX     = useTransform(mouseX, (v) => v * 40);
  const orbY     = useTransform(mouseY, (v) => v * 28);
  const starsX   = useTransform(mouseX, (v) => v * 14);
  const starsY   = useTransform(mouseY, (v) => v *  9);
  const goldX    = useTransform(mouseX, (v) => v * -22);
  const goldY    = useTransform(mouseY, (v) => v * -16);
  const blueX    = useTransform(mouseX, (v) => v * -18);
  const blueY    = useTransform(mouseY, (v) => v * -13);
  return (
    <>
      {/* Deep atmospheric gradient — static, deepest layer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 90% 75% at 50% 38%, rgba(60,18,130,0.42) 0%, rgba(30,8,70,0.28) 45%, transparent 75%)',
      }} />

      {/* Pulsing center orb — parallax depth: far */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ opacity: [0.18, 0.32, 0.18], scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            x: orbX, y: orbY,
            width: 680, height: 480, borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(ellipse, rgba(123,47,255,0.35) 0%, rgba(80,0,200,0.12) 45%, transparent 72%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Gold top-right accent — parallax depth: mid, inverse */}
      <motion.div style={{
        x: goldX, y: goldY,
        position: 'absolute', top: 0, right: 0, width: 380, height: 380,
        background: 'radial-gradient(circle at 90% 10%, rgba(255,200,50,0.09) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Blue bottom-left accent — parallax depth: mid, inverse */}
      <motion.div style={{
        x: blueX, y: blueY,
        position: 'absolute', bottom: 0, left: 0, width: 420, height: 420,
        background: 'radial-gradient(circle at 10% 90%, rgba(60,140,255,0.09) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Pixel grid — static */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'repeating-linear-gradient(0deg,  rgba(123,47,255,0.06) 0px, rgba(123,47,255,0.06) 1px, transparent 1px, transparent 28px)',
          'repeating-linear-gradient(90deg, rgba(123,47,255,0.06) 0px, rgba(123,47,255,0.06) 1px, transparent 1px, transparent 28px)',
        ].join(', '),
      }} />

      {/* Scan lines — static */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 3px)',
      }} />

      {/* Twinkling stars — parallax depth: near */}
      <motion.div style={{ position: 'absolute', inset: 0, x: starsX, y: starsY, pointerEvents: 'none', overflow: 'hidden' }}>
        {HERO_STARS.map((s) => (
          <motion.div
            key={s.id}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: s.dur, delay: s.del, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              background: s.col,
              boxShadow: `0 0 ${Math.round(s.size * 2 + 2)}px ${s.col}`,
            }}
          />
        ))}
      </motion.div>


      {/* Pixel grid hover effect */}
      <PixelGridCanvas heroRef={heroRef} />
    </>
  );
}

// ── Demo Quest List ──────────────────────────────────────────────────────────

const DEMO_QUESTS = [
  { title: 'Terminer le rapport Q4', rank: 'B', color: 'var(--orange)', xp: 85 },
  { title: 'Faire du sport 30 min',  rank: 'D', color: 'var(--green)',  xp: 18 },
  { title: 'Lire 20 pages',          rank: 'E', color: '#888',          xp: 10 },
];

function LiveQuestDemo() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [xpFloats, setXpFloats]   = useState<{ id: number; xp: number; y: number }[]>([]);

  const complete = (i: number, xp: number) => {
    if (completed.includes(i)) return;
    setCompleted((c) => [...c, i]);
    const id = Date.now();
    setXpFloats((f) => [...f, { id, xp, y: i }]);
    setTimeout(() => setXpFloats((f) => f.filter((x) => x.id !== id)), 1200);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* XP floats */}
      <AnimatePresence>
        {xpFloats.map((f) => (
          <motion.div key={f.id}
            initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -50 }} exit={{}}
            transition={{ duration: 1.1 }}
            style={{ position: 'absolute', right: 50, top: f.y * 52 + 10, fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--purple-light)', textShadow: '1px 1px 0 #000', pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap' }}
          >
            +{f.xp} XP ✨
          </motion.div>
        ))}
      </AnimatePresence>

      {DEMO_QUESTS.map((q, i) => {
        const done = completed.includes(i);
        return (
          <motion.div key={i}
            animate={{ opacity: done ? 0.4 : 1, x: done ? 20 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex', alignItems: 'stretch', marginBottom: 8,
              background: done ? 'var(--bg-deep)' : 'var(--bg-card)',
              border: `2px solid ${done ? 'var(--border)' : 'var(--border-light)'}`,
              boxShadow: done ? 'none' : '3px 3px 0 #000',
            }}
          >
            <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--bg-surface)' : q.color, borderRight: '2px solid #000', fontFamily: 'var(--font-pixel)', fontSize: '9px', color: done ? 'var(--text-faint)' : '#000', fontWeight: 900 }}>
              {done ? '✓' : q.rank}
            </div>
            <div style={{ flex: 1, padding: '8px 10px' }}>
              <div style={{ fontFamily: 'var(--font-vt)', fontSize: '18px', color: done ? 'var(--text-faint)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1 }}>{q.title}</div>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--purple-light)' }}>+{q.xp} XP</span>
            </div>
            <button
              onClick={() => complete(i, q.xp)}
              style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'transparent' : 'var(--green)', borderLeft: '2px solid #000', fontSize: 16, color: done ? 'var(--text-faint)' : '#000', fontWeight: 900, flexShrink: 0 }}
            >
              {done ? '✓' : '✓'}
            </button>
          </motion.div>
        );
      })}

      {completed.length === DEMO_QUESTS.length && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '12px 0', fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)' }}>
          🏆 ALL QUESTS CLEARED! +{DEMO_QUESTS.reduce((a, q) => a + q.xp, 0)} XP
        </motion.div>
      )}
    </div>
  );
}

// ── Boss Preview ──────────────────────────────────────────────────────────────

function BossAnimDemo() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>('boss_intro');
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [bossShake, setBossShake] = useState(false);
  const [bossDmg, setBossDmg] = useState<string | null>(null);
  const [bossDmgKey, setBossDmgKey] = useState(0);

  useEffect(() => {
    setPhase('boss_intro');
    setBossHp(BOSS_MAX_HP);
    setBossShake(false);
    setBossDmg(null);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    BOSS_HIT_SEQUENCE.forEach(({ phase: p, hp, dmg }, i) => {
      const t = 1400 + i * 1100;
      at(() => {
        setPhase(p);
        setBossHp(hp);
        setBossShake(true);
        setBossDmg(dmg);
        setBossDmgKey((k) => k + 1);
        setTimeout(() => setBossShake(false), 420);
      }, t);
    });

    const END = 1400 + BOSS_HIT_SEQUENCE.length * 1100;
    at(() => setPhase('boss_defeat'), END + 600);
    at(() => setPhase('boss_reward'), END + 1300);
    at(() => setCycle((c) => c + 1), END + 4000);

    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  return (
    <div style={{ position: 'relative', height: 340, overflow: 'hidden', border: '2px solid var(--border-light)', boxShadow: '4px 4px 0 #000, 0 0 24px rgba(232,48,48,0.12)' }}>
      <DemoBossScene phase={phase} bossHp={bossHp} bossShake={bossShake} bossDmgKey={bossDmgKey} bossDmg={bossDmg} />
    </div>
  );
}

// ── Equipment Showcase ────────────────────────────────────────────────────────

const EQUIP_DEMO = [
  { name: 'Excalibur',        rarity: 'LEGENDARY', color: 'var(--gold)',         glow: 'rgba(255,215,0,0.4)', icon: '🗡️', stat: '+55% XP' },
  { name: 'Orbe Mystique',    rarity: 'RARE',       color: 'var(--blue)',         glow: 'rgba(64,156,255,0.3)', icon: '🔮', stat: '+22 Combo' },
  { name: 'Écailles de Dragon', rarity: 'EPIC',     color: 'var(--purple-light)', glow: 'rgba(187,134,252,0.3)', icon: '🐉', stat: '+38% Gold' },
];

// ── Classes Showcase ────────────────────────────────────────────────────────

const CLASS_DEMO = [
  { name: 'WARRIOR', icon: '⚔️', color: 'var(--red)',          bonus: '+25% XP Boss',      desc: 'Maître du combat' },
  { name: 'MAGE',    icon: '🧙', color: 'var(--purple-light)', bonus: '+20% XP Global',    desc: 'Archimage de l\'XP' },
  { name: 'ROGUE',   icon: '🗡️', color: 'var(--green)',        bonus: '+30% Gold',          desc: 'Fantôme des richesses' },
  { name: 'PALADIN', icon: '🛡️', color: 'var(--gold)',         bonus: '+10% XP & Gold',    desc: 'Chevalier équilibré' },
];

// ── App Demo ──────────────────────────────────────────────────────────────────

const DEMO_TASK_NAME = 'Finir le rapport Q4';
const DEMO_EXISTING_QUESTS = [
  { title: 'Faire du sport 30 min', rank: 'D', color: 'var(--green)', xp: 18 },
  { title: 'Lire 20 pages',         rank: 'E', color: '#888',         xp: 10 },
];
const DEMO_NEW_QUEST = { title: DEMO_TASK_NAME, rank: 'B', color: 'var(--orange)', xp: 85 };

type DemoPhase =
  | 'opening' | 'opening_cta'
  | 'board' | 'add_click' | 'modal' | 'new_card' | 'done_screen' | 'back_board'
  | 'boss_intro' | 'boss_hit1' | 'boss_hit2' | 'boss_hit3' | 'boss_defeat' | 'boss_reward';

function DemoQuestRow({ title, rank, color, xp, done = false, pulse = false }: {
  title: string; rank: string; color: string; xp: number; done?: boolean; pulse?: boolean;
}) {
  return (
    <motion.div animate={{ opacity: done ? 0.38 : 1 }}
      style={{ display: 'flex', alignItems: 'stretch', marginBottom: 6, background: done ? 'var(--bg-deep)' : 'var(--bg-card)', border: `2px solid ${done ? 'var(--border)' : 'var(--border-light)'}`, boxShadow: done ? 'none' : '2px 2px 0 #000' }}>
      <div style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--bg-surface)' : color, borderRight: '2px solid #000', fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#000', fontWeight: 900 }}>
        {done ? '✓' : rank}
      </div>
      <div style={{ flex: 1, padding: '5px 8px' }}>
        <div style={{ fontFamily: 'var(--font-vt)', fontSize: '15px', color: done ? 'var(--text-faint)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1 }}>{title}</div>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--purple-light)' }}>+{xp} XP</span>
      </div>
      <motion.div
        animate={pulse ? { scale: [1, 1.25, 1] } : {}}
        transition={pulse ? { duration: 0.6, repeat: Infinity } : {}}
        style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'transparent' : pulse ? 'var(--green)' : 'var(--green)', borderLeft: '2px solid #000', flexShrink: 0, fontFamily: 'var(--font-pixel)', fontSize: '11px', color: done ? 'var(--text-faint)' : '#000', boxShadow: pulse ? '0 0 8px var(--green)' : 'none' }}>
        ✓
      </motion.div>
    </motion.div>
  );
}

// ── Opening splash scene ──────────────────────────────────────────────────────

function OpeningScene({ showCta }: { showCta: boolean }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 10,
      overflow: 'hidden',
    }}>
      {/* Scanline overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)', pointerEvents: 'none' }} />

      {/* Logo icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'backOut' }}
        style={{ fontSize: 40, lineHeight: 1 }}
      >
        ⚔️
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '26px', color: '#fff', letterSpacing: 4, textShadow: '3px 3px 0 var(--purple), 6px 6px 0 #000', lineHeight: 1 }}
      >
        QUESTLOG
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.35 }}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', letterSpacing: 3, textAlign: 'center' }}
      >
        PRODUCTIVITY RPG
      </motion.div>

      {/* Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.3 }}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--purple-light)', opacity: 0.6 }}
      >
        v0.2 · PWA
      </motion.div>

      {/* CTA */}
      {showCta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 0.9, times: [0, 0.3, 0.6, 1] }}
          style={{
            marginTop: 12,
            fontFamily: 'var(--font-pixel)', fontSize: '7px',
            color: 'var(--purple-light)',
            padding: '7px 14px',
            border: '2px solid var(--purple)',
            boxShadow: '0 0 14px rgba(123,47,255,0.5), 3px 3px 0 #000',
          }}
        >
          ▶ PRESS START
        </motion.div>
      )}
    </div>
  );
}

// ── Boss battle scene ─────────────────────────────────────────────────────────

const BOSS_MAX_HP = 3000;
const BOSS_HIT_SEQUENCE = [
  { phase: 'boss_hit1' as DemoPhase, hp: 2520, dmg: '-480 DMG' },
  { phase: 'boss_hit2' as DemoPhase, hp: 1780, dmg: '-740 CRIT ⚡' },
  { phase: 'boss_hit3' as DemoPhase, hp: 0,    dmg: '-1780 FATAL! 💥' },
];

const DEMO_POWERS = [
  { icon: '⚔️', name: 'FRAPPE',    color: '#e83030', mp: 0  },
  { icon: '⚡', name: 'TONNERRE',  color: '#f8c038', mp: 20 },
  { icon: '💥', name: 'RUINE',     color: '#9040f0', mp: 50 },
  { icon: '🛡️', name: 'GARDE',    color: '#4070d0', mp: 10 },
];

const DEMO_DIALOG: Partial<Record<DemoPhase, string>> = {
  boss_intro:   'Que doit faire\nHÉROS?',
  boss_hit1:    'HÉROS utilise\nFRAPPE!',
  boss_hit2:    'HÉROS utilise\nTONNERRE!',
  boss_hit3:    'HÉROS utilise\nRUINE!',
  boss_defeat:  'DRAGON ANCIEN\nest mis à terre!',
};

function DemoBossScene({ phase, bossHp, bossShake, bossDmgKey, bossDmg }: {
  phase: DemoPhase;
  bossHp: number;
  bossShake: boolean;
  bossDmgKey: number;
  bossDmg: string | null;
}) {
  const bossPct    = bossHp / BOSS_MAX_HP;
  const bossHpCol  = bossPct > 0.5 ? '#38c040' : bossPct > 0.25 ? '#f8c038' : '#e83030';
  const isDefeated = phase === 'boss_defeat' || phase === 'boss_reward';
  const activePow  = phase === 'boss_hit1' ? 0 : phase === 'boss_hit2' ? 1 : phase === 'boss_hit3' ? 2 : -1;
  const dialog     = DEMO_DIALOG[phase] ?? 'Que doit faire\nHÉROS?';

  if (phase === 'boss_reward') {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}
      >
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
          <div style={{ fontSize: 52 }}>🏆</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--gold)', textShadow: '2px 2px 0 #000', letterSpacing: 2 }}>
          BOSS VAINCU!
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          style={{ display: 'flex', gap: 20 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--purple-light)', textShadow: '1px 1px 0 #000' }}>+2000 XP ✨</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--gold)', textShadow: '1px 1px 0 #000' }}>+1200 G 💰</div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginTop: 4 }}>
          CRISTAL CHEST REÇU 💎
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

      {/* ── Arena (top 65%) ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '35%', overflow: 'hidden' }}>
        {/* Sky */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '40%', background: 'linear-gradient(180deg, #5a7fc0 0%, #7baad0 55%, #8abf78 100%)' }} />
        {/* Ground */}
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #5a9248 0%, #3f7232 60%, #2d5824 100%)' }} />
        {/* Midline blend */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '18%', background: 'linear-gradient(180deg, #8abf78 0%, #5a9248 100%)' }} />
        {/* Pixel scanline */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px)' }} />

        {/* Boss sprite — upper right */}
        <motion.div
          animate={bossShake ? { x: [-8, 8, -6, 6, -3, 3, 0], scale: [0.88, 1.07, 0.94, 1] } : {}}
          transition={{ duration: 0.38 }}
          style={{ position: 'absolute', right: '10%', top: '8%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}
        >
          <motion.div
            animate={isDefeated ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 52, lineHeight: 1, marginBottom: 3, filter: isDefeated ? 'grayscale(1) brightness(0.5)' : 'drop-shadow(3px 5px 0 rgba(0,0,0,0.55))' }}
          >{isDefeated ? '💀' : '🐉'}</motion.div>
          <div style={{ width: 76, height: 13, background: 'rgba(20,60,10,0.55)', borderRadius: '50%', border: '2px solid rgba(10,50,0,0.5)' }} />
        </motion.div>

        {/* Hero sprite — lower left */}
        <motion.div
          animate={bossShake ? { x: [0, 20, 0] } : {}}
          transition={{ duration: 0.22 }}
          style={{ position: 'absolute', left: '8%', bottom: '4%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}
        >
          <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 3, filter: 'drop-shadow(2px 4px 0 rgba(0,0,0,0.45))' }}>🧙</div>
          <div style={{ width: 86, height: 15, background: 'rgba(40,25,5,0.45)', borderRadius: '50%', border: '2px solid rgba(25,10,0,0.4)' }} />
        </motion.div>

        {/* Boss info box — top left */}
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 5, background: '#f0f0e8', border: '3px solid #111', boxShadow: '4px 4px 0 rgba(0,0,0,0.6)', padding: '6px 10px 8px', width: 138 }}>
          <div style={{ position: 'absolute', inset: 3, border: '1px solid #ccc', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#c03020', overflow: 'hidden', whiteSpace: 'nowrap' }}>DRAGON ANCIEN</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#888', flexShrink: 0 }}>:S</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#444', fontWeight: 700, flexShrink: 0 }}>HP</span>
            <div style={{ flex: 1, height: 6, background: '#888', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                animate={{ width: `${Math.max(0, bossPct) * 100}%` }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: '1px 0', background: bossHpCol }}
              />
            </div>
          </div>
        </div>

        {/* Hero info box — bottom right */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 5, background: '#f0f0e8', border: '3px solid #111', boxShadow: '4px 4px 0 rgba(0,0,0,0.6)', padding: '6px 10px 8px', width: 150 }}>
          <div style={{ position: 'absolute', inset: 3, border: '1px solid #ccc', pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#222', marginBottom: 5 }}>HÉROS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#444', fontWeight: 700, flexShrink: 0 }}>HP</span>
            <div style={{ flex: 1, height: 6, background: '#888', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '1px 0', width: '100%', background: '#38c040' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#222', flexShrink: 0 }}>450/450</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#444', fontWeight: 700, flexShrink: 0 }}>MP</span>
            <div style={{ flex: 1, height: 6, background: '#888', border: '1px solid #333', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '1px 0', width: '80%', background: '#5040c8' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#222', flexShrink: 0 }}>80/100</span>
          </div>
        </div>

        {/* Floating damage */}
        <AnimatePresence>
          {bossDmg && (
            <motion.div
              key={bossDmgKey}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -54, scale: 1.3 }}
              exit={{}}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: '14%', right: '18%',
                fontFamily: 'var(--font-pixel)',
                fontSize: bossDmg.includes('FATAL') ? '11px' : '9px',
                color: bossDmg.includes('FATAL') ? 'var(--gold)' : bossDmg.includes('CRIT') ? 'var(--orange)' : 'var(--red)',
                textShadow: '2px 2px 0 #000',
                pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10,
              }}
            >
              {bossDmg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Action panel — Pokémon cream style (bottom 35%) ── */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%', background: '#f0f0e8', borderTop: '4px solid #111', display: 'flex', overflow: 'hidden' }}>
        {/* Left: dialog */}
        <div style={{ flex: 1, padding: '8px 10px', borderRight: '3px solid #111', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#222', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
            {dialog}
          </span>
        </div>

        {/* Right: 2×2 power grid */}
        <div style={{ width: '52%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {DEMO_POWERS.map((p, i) => {
            const isActive = i === activePow;
            return (
              <motion.div
                key={p.name}
                animate={isActive ? { backgroundColor: ['#f0f0e8', '#d8d8c8', '#f0f0e8'] } : { backgroundColor: '#f0f0e8' }}
                transition={{ duration: 0.28 }}
                style={{
                  padding: '5px 7px',
                  borderRight: i % 2 === 0 ? '2px solid #ccc' : 'none',
                  borderBottom: i < 2 ? '2px solid #ccc' : 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: p.color }} />}
                <span style={{ fontSize: 11, flexShrink: 0, marginLeft: isActive ? 4 : 0 }}>{p.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: isActive ? p.color : '#444', fontWeight: isActive ? 700 : 400, whiteSpace: 'nowrap' }}>
                    {isActive && '▶ '}{p.name}
                  </div>
                  {p.mp > 0 && <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#5040c8' }}>MP {p.mp}</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── App Demo ──────────────────────────────────────────────────────────────────

function AppDemo() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>('opening');

  // Quest creation state
  const [typed, setTyped] = useState(0);
  const [diffSel, setDiffSel] = useState(false);
  const [acceptAnim, setAcceptAnim] = useState(false);
  const [newCardIn, setNewCardIn] = useState(false);
  const [checkPulse, setCheckPulse] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);

  // Boss state
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [bossShake, setBossShake] = useState(false);
  const [bossDmg, setBossDmg] = useState<string | null>(null);
  const [bossDmgKey, setBossDmgKey] = useState(0);

  useEffect(() => {
    // Reset
    setPhase('opening');
    setTyped(0); setDiffSel(false); setAcceptAnim(false);
    setNewCardIn(false); setCheckPulse(false); setTaskDone(false); setShowXpFloat(false);
    setBossHp(BOSS_MAX_HP); setBossShake(false); setBossDmg(null);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    // ── ACT 1 : Opening ──────────────────────────────────────────────
    at(() => setPhase('opening_cta'), 1900);
    at(() => setPhase('board'),       3400);

    // ── ACT 2 : Quest creation ──────────────────────────────────────
    at(() => setPhase('add_click'), 4300);
    at(() => setPhase('modal'),     4800);

    const TYPING_START = 5200;
    const TYPING_PER_CHAR = 100;
    DEMO_TASK_NAME.split('').forEach((_, i) =>
      at(() => setTyped(i + 1), TYPING_START + i * TYPING_PER_CHAR),
    );
    const typingEnd = TYPING_START + DEMO_TASK_NAME.length * TYPING_PER_CHAR;

    at(() => setDiffSel(true),  typingEnd + 250);
    at(() => setAcceptAnim(true), typingEnd + 750);
    at(() => { setPhase('new_card'); setNewCardIn(true); }, typingEnd + 1150);
    at(() => setCheckPulse(true), typingEnd + 2100);
    at(() => { setCheckPulse(false); setTaskDone(true); setShowXpFloat(true); }, typingEnd + 2950);
    at(() => setPhase('done_screen'), typingEnd + 3200);
    at(() => setPhase('back_board'),  typingEnd + 5400);

    // ── ACT 3 : Boss battle ─────────────────────────────────────────
    const BOSS_START = typingEnd + 6400;
    at(() => { setPhase('boss_intro'); setBossHp(BOSS_MAX_HP); }, BOSS_START);

    BOSS_HIT_SEQUENCE.forEach(({ phase: p, hp, dmg }, i) => {
      const t = BOSS_START + 900 + i * 850;
      at(() => {
        setPhase(p);
        setBossHp(hp);
        setBossShake(true);
        setBossDmg(dmg);
        setBossDmgKey((k) => k + 1);
        setTimeout(() => setBossShake(false), 420);
      }, t);
    });

    const BOSS_END = BOSS_START + 900 + BOSS_HIT_SEQUENCE.length * 850;
    at(() => setPhase('boss_defeat'), BOSS_END + 500);
    at(() => setPhase('boss_reward'), BOSS_END + 1100);
    at(() => setCycle((c) => c + 1), BOSS_END + 3800);

    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  const isOpeningPhase = phase === 'opening' || phase === 'opening_cta';
  const isQuestPhase   = ['board', 'add_click', 'modal', 'new_card', 'done_screen', 'back_board'].includes(phase);
  const isBossPhase    = ['boss_intro', 'boss_hit1', 'boss_hit2', 'boss_hit3', 'boss_defeat', 'boss_reward'].includes(phase);

  const showModal     = phase === 'modal' || phase === 'new_card';
  const modalVisible  = phase === 'modal';
  const showDoneScreen = phase === 'done_screen';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Desktop browser mockup */}
      <div style={{
        width: '100%', maxWidth: 560,
        border: '2px solid var(--border-light)',
        boxShadow: '6px 6px 0 #000, 0 0 48px rgba(123,47,255,0.28)',
        overflow: 'hidden',
      }}>
        {/* Browser chrome bar */}
        <div style={{ height: 34, background: '#131320', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderBottom: '1px solid #2a2a3a' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28ca41' }} />
          </div>
          <div style={{ flex: 1, height: 20, background: '#0d0d1a', border: '1px solid #2a2a3a', borderRadius: 3, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555' }}>questlog.app/quests</span>
          </div>
        </div>

        {/* App content */}
        <div style={{ height: 320, background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>

          {/* ── Opening scene ── */}
          <AnimatePresence>
            {isOpeningPhase && (
              <motion.div key="opening" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
                <OpeningScene showCta={phase === 'opening_cta'} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Boss scene ── */}
          <AnimatePresence>
            {isBossPhase && (
              <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ position: 'absolute', inset: 0, zIndex: 35 }}>
                <DemoBossScene phase={phase} bossHp={bossHp} bossShake={bossShake} bossDmgKey={bossDmgKey} bossDmg={bossDmg} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* App nav — hidden during opening/boss */}
          {isQuestPhase && (
          <div style={{ height: 38, background: 'var(--bg-card)', borderBottom: '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--purple-light)' }}>⚔ QUESTLOG</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--gold)' }}>LV.12</span>
              <div style={{ width: 60, height: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
                <motion.div
                  animate={{ width: phase === 'back_board' ? '61%' : '42%' }}
                  transition={{ duration: 0.9 }}
                  style={{ height: '100%', background: 'var(--purple)' }}
                />
              </div>
            </div>
          </div>
          )}

          {/* Quest list — only during quest phases */}
          {isQuestPhase && <div style={{ padding: '10px 10px 0', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)' }}>▸ MES QUÊTES</div>
              <motion.div
                animate={phase === 'add_click' ? { scale: [1, 0.86, 1.06, 1] } : {}}
                transition={{ duration: 0.4 }}
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#fff', background: 'var(--purple)', border: '2px solid var(--purple-light)', padding: '4px 8px', boxShadow: '2px 2px 0 #000' }}
              >
                + AJOUTER
              </motion.div>
            </div>

            {DEMO_EXISTING_QUESTS.map((q, i) => (
              <DemoQuestRow key={i} {...q} />
            ))}

            <AnimatePresence>
              {newCardIn && (
                <motion.div key="new-quest"
                  initial={{ opacity: 0, y: -16, scaleY: 0.6 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}>
                  <DemoQuestRow {...DEMO_NEW_QUEST} done={taskDone} pulse={checkPulse} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* XP float */}
            <AnimatePresence>
              {showXpFloat && (
                <motion.div key="xp-float"
                  initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -52 }} exit={{}}
                  transition={{ duration: 1.3, ease: 'easeOut' }}
                  style={{ position: 'absolute', right: 48, bottom: -100, fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--purple-light)', textShadow: '1px 1px 0 #000', pointerEvents: 'none', zIndex: 20, whiteSpace: 'nowrap' }}>
                  +85 XP ✨
                </motion.div>
              )}
            </AnimatePresence>
          </div>}

          {/* Add-quest modal overlay */}
          <AnimatePresence>
            {modalVisible && isQuestPhase && (
              <motion.div key="modal-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,16,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <motion.div
                  initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  style={{ width: 284, background: 'var(--bg-card)', border: '2px solid var(--purple)', boxShadow: '4px 4px 0 #000, 0 0 24px rgba(123,47,255,0.2)', padding: 14 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--purple-light)', marginBottom: 12 }}>▸ NOUVELLE QUÊTE</div>

                  {/* Task name input */}
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 4 }}>NOM DE LA TÂCHE</div>
                  <div style={{ background: 'var(--bg-deep)', border: '2px solid var(--border-light)', padding: '5px 8px', marginBottom: 10, minHeight: 28, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-vt)', fontSize: '15px', color: 'var(--text)' }}>
                      {DEMO_TASK_NAME.slice(0, typed)}
                    </span>
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.65, repeat: Infinity }}
                      style={{ display: 'inline-block', width: 2, height: 14, background: 'var(--purple-light)', marginLeft: 2, verticalAlign: 'middle' }} />
                  </div>

                  {/* Difficulty */}
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 4 }}>DIFFICULTÉ</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {(['E', 'D', 'C', 'B', 'A', 'S'] as const).map((d) => {
                      const DIFF_COLORS: Record<string, string> = { E: '#888', D: 'var(--green)', C: '#4af', B: 'var(--orange)', A: 'var(--red)', S: 'var(--gold)' };
                      const sel = diffSel && d === 'B';
                      return (
                        <div key={d} style={{ flex: 1, textAlign: 'center', padding: '4px 2px', fontFamily: 'var(--font-pixel)', fontSize: '7px', border: `2px solid ${sel ? DIFF_COLORS[d] : 'var(--border)'}`, color: sel ? DIFF_COLORS[d] : 'var(--text-faint)', background: sel ? 'rgba(0,0,0,0.35)' : 'transparent', boxShadow: sel ? '2px 2px 0 #000' : 'none' }}>
                          {d}
                        </div>
                      );
                    })}
                  </div>

                  {/* Accept button */}
                  <motion.div
                    animate={acceptAnim ? { scale: [1, 0.91, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    style={{ textAlign: 'center', padding: '9px 0', fontFamily: 'var(--font-pixel)', fontSize: '8px', background: 'var(--purple)', border: '2px solid var(--purple-light)', color: '#fff', boxShadow: '3px 3px 0 #000' }}>
                    ▶ ACCEPTER LA QUÊTE
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task done black screen */}
          <AnimatePresence>
            {showDoneScreen && (
              <motion.div key="done-screen"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}
                  style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '40px', color: 'var(--green)', textShadow: '3px 3px 0 #000, 0 0 28px rgba(74,222,128,0.6)', marginBottom: 10, lineHeight: 1 }}>✓</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '22px', color: '#fff', textShadow: '3px 3px 0 #000', letterSpacing: 3, marginBottom: 8 }}>TÂCHE FINIE</div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--purple-light)', textShadow: '1px 1px 0 #000' }}>
                    +85 XP ✨
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function LandingPage({ onEnter }: Props) {
  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.getElementById('root')!.style.overflow = 'auto';
    document.getElementById('root')!.style.height = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.getElementById('root')!.style.overflow = '';
      document.getElementById('root')!.style.height = '';
    };
  }, []);

  // Mouse parallax for hero section
  const heroRef  = useRef<HTMLElement>(null);
  const rawX     = useMotionValue(0);
  const rawY     = useMotionValue(0);
  const heroMouseX = useSpring(rawX, { stiffness: 55, damping: 24 });
  const heroMouseY = useSpring(rawY, { stiffness: 55, damping: 24 });

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text)',
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(123,47,255,0.02) 0px, rgba(123,47,255,0.02) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(0deg, rgba(123,47,255,0.02) 0px, rgba(123,47,255,0.02) 1px, transparent 1px, transparent 32px)`,
    }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(8px)', borderBottom: '2px solid rgba(123,47,255,0.25)', boxShadow: '0 2px 0 rgba(0,0,0,0.5)' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px', color: 'var(--purple-light)' }}>⚔ QUESTLOG</div>
        <motion.button whileTap={{ x: 2, y: 2 }} onClick={onEnter} style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', padding: '8px 14px', background: 'var(--purple-dim)', border: '2px solid var(--purple)', color: 'var(--purple-light)', boxShadow: '2px 2px 0 #000' }}>
          ▶ JOUER
        </motion.button>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        onMouseMove={(e) => {
          const rect = heroRef.current?.getBoundingClientRect();
          if (!rect) return;
          rawX.set((e.clientX - rect.left) / rect.width  - 0.5);
          rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
        }}
        onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
        style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 40px', position: 'relative', overflow: 'hidden' }}
      >
        <HeroBackground mouseX={heroMouseX} mouseY={heroMouseY} heroRef={heroRef} />
        <FloatingTasksAround />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', padding: '6px 14px', marginBottom: 28, background: 'rgba(232,48,48,0.12)', border: '2px solid var(--red)', color: 'var(--red)', boxShadow: '3px 3px 0 #000' }}>
          ⚠ 59% DES TÂCHES NE SONT JAMAIS TERMINÉES
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(32px, 9vw, 56px)', color: '#fff', lineHeight: 1.2, textShadow: '4px 4px 0 var(--purple), 8px 8px 0 #000' }}>QUEST</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(32px, 9vw, 56px)', color: 'var(--purple-light)', lineHeight: 1.2, textShadow: '4px 4px 0 rgba(123,47,255,0.4), 8px 8px 0 #000' }}>LOG</div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ fontFamily: 'var(--font-vt)', fontSize: 'clamp(20px, 5vw, 28px)', color: 'var(--text-dim)', textAlign: 'center', maxWidth: 520, lineHeight: 1.4, marginBottom: 40 }}>
          Tu en as marre de te fixer des objectifs que tu n'atteins jamais ? Ton cerveau n'est pas flemmard — ta to-do list est juste ennuyeuse.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.button whileTap={{ x: 4, y: 4 }} onClick={onEnter}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', padding: '16px 32px', background: 'var(--purple)', border: '2px solid var(--purple-light)', color: '#fff', boxShadow: '5px 5px 0 #000', cursor: 'pointer' }}>
            ▶ COMMENCER L'AVENTURE
          </motion.button>
        </motion.div>

        {/* Animated stat badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: '+48% COMPLÉTION', color: 'var(--green)' },
            { label: 'STREAKS MOTIVANTS', color: 'var(--gold)' },
            { label: 'RÉCOMPENSES RÉELLES', color: 'var(--purple-light)' },
            { label: '0 TÂCHE OUBLIÉE', color: 'var(--blue)' },
          ].map((b) => (
            <div key={b.label} style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: b.color, padding: '5px 10px', border: `1px solid ${b.color}`, background: 'rgba(0,0,0,0.3)' }}>
              {b.label}
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          style={{ position: 'absolute', bottom: 24, fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>▼</motion.div>
          DÉCOUVRIR
        </motion.div>
      </section>

      {/* PAIN POINTS */}
      <section style={{ padding: '80px 24px', background: 'rgba(232,48,48,0.03)', borderTop: '2px solid rgba(232,48,48,0.12)', borderBottom: '2px solid rgba(232,48,48,0.08)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--red)', marginBottom: 8 }}>▸ LE PROBLÈME</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', textShadow: '2px 2px 0 #000', marginBottom: 16 }}>
                POURQUOI TU ABANDONNES TES TO-DO LISTS
              </div>
              <p style={{ fontFamily: 'var(--font-vt)', fontSize: '21px', color: 'var(--text-dim)', maxWidth: 500, margin: '0 auto', lineHeight: 1.5 }}>
                Ce n'est pas un problème de discipline. Les apps de productivité classiques ignorent complètement la psychologie humaine.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 56 }}>
            {[
              {
                icon: '😵',
                title: 'LA LISTE QUI ÉCRASE',
                stat: '59%',
                statLabel: 'des tâches jamais faites',
                desc: 'Sans progression visible, la liste grandit. Tu vois ce que tu n\'as PAS fait — jamais ce que tu as accompli. C\'est démotivant par design.',
                color: 'var(--red)',
              },
              {
                icon: '😴',
                title: 'ZÉRO MOTIVATION',
                stat: '96%',
                statLabel: 'des apps abandonnées en 1 mois',
                desc: 'Cocher une case devrait être satisfaisant. Mais ton cerveau a besoin de dopamine concrète — pas d\'une simple coche grise.',
                color: 'var(--orange)',
              },
              {
                icon: '😰',
                title: 'CIMETIÈRE DE TÂCHES',
                stat: '∞',
                statLabel: 'stress généré par les échéances',
                desc: 'Les apps n\'oublient jamais. Chaque tâche expirée s\'accumule et transforme ta to-do list en source d\'anxiété chronique.',
                color: '#f8c038',
              },
            ].map((pain, i) => (
              <FadeIn key={pain.title} delay={i * 0.1}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${pain.color}33`,
                  borderTop: `3px solid ${pain.color}`,
                  boxShadow: '4px 4px 0 #000',
                  padding: '22px 18px',
                  height: '100%',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{pain.icon}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: pain.color, marginBottom: 14 }}>{pain.title}</div>
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: `${pain.color}11`, border: `1px solid ${pain.color}33` }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: pain.color, lineHeight: 1 }}>{pain.stat}</div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginTop: 4 }}>{pain.statLabel}</div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-vt)', fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>{pain.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Before → After */}
          <FadeIn delay={0.3}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginBottom: 20 }}>QUESTLOG CHANGE TOUT ÇA</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { from: '41%', to: '89%',       label: 'TÂCHES COMPLÉTÉES',    color: 'var(--green)' },
                  { from: 'Anxiété', to: 'Dopamine', label: 'CE QUE TU RESSENS', color: 'var(--purple-light)' },
                  { from: 'Corvée',  to: 'Quête',    label: 'COMMENT ÇA SE PASSE', color: 'var(--gold)' },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--text-faint)', textDecoration: 'line-through', opacity: 0.6 }}>{s.from}</span>
                      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)' }}>→</span>
                      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: s.color, textShadow: '1px 1px 0 #000' }}>{s.to}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* DEMO REEL */}
      <section style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px solid rgba(123,47,255,0.15)' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--green)', marginBottom: 8 }}>▸ LA SOLUTION</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', textShadow: '2px 2px 0 #000', marginBottom: 10 }}>
              CHAQUE TÂCHE DEVIENT UNE VICTOIRE
            </div>
            <p style={{ fontFamily: 'var(--font-vt)', fontSize: '20px', color: 'var(--text-dim)', maxWidth: 420, margin: '0 auto' }}>
              La gamification booste la complétion de tâches de +48%. Ton cerveau est câblé pour les jeux — on a câblé ta to-do list pareil.
            </p>
          </div>
          <AppDemo />
        </FadeIn>
      </section>

      {/* INTERACTIVE QUEST DEMO */}
      <section style={{ padding: '60px 24px', maxWidth: 520, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--purple-light)', marginBottom: 8 }}>▸ RESSENS LA DIFFÉRENCE</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 8, textShadow: '2px 2px 0 #000' }}>
            VALIDE UNE QUÊTE — POUR DE VRAI
          </div>
          <p style={{ fontFamily: 'var(--font-vt)', fontSize: '19px', color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            Ça prend 5 secondes. Et c'est exactement là que tu comprends pourquoi c'est différent.
          </p>
          <LiveQuestDemo />
        </FadeIn>
      </section>

      {/* BOSS BATTLE */}
      <section style={{ padding: '0 24px 60px', maxWidth: 520, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--red)', marginBottom: 8 }}>▸ OBJECTIFS LONG TERME</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 8, textShadow: '2px 2px 0 #000' }}>
            TES GRANDS PROJETS DEVIENNENT DES BOSS
          </div>
          <p style={{ fontFamily: 'var(--font-vt)', fontSize: '19px', color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.5 }}>
            Finir une certification, lancer un projet, tenir une discipline — chaque grande quête aboutit à un combat de boss épique. La motivation devient narrative.
          </p>
          <BossAnimDemo />
        </FadeIn>
      </section>

      {/* HERO CLASSES */}
      <section style={{ padding: '60px 24px', background: 'rgba(123,47,255,0.04)', borderTop: '2px solid rgba(123,47,255,0.1)', borderBottom: '2px solid rgba(123,47,255,0.1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ CLASSES DE HÉROS</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 24, textShadow: '2px 2px 0 #000' }}>
              4 CLASSES AUX BONUS UNIQUES
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {CLASS_DEMO.map((cls, i) => (
              <FadeIn key={cls.name} delay={i * 0.07}>
                <div style={{ background: 'var(--bg-card)', border: `2px solid ${cls.color}`, boxShadow: '4px 4px 0 #000', padding: '14px 12px' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cls.icon}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: cls.color, marginBottom: 6 }}>{cls.name}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginBottom: 10 }}>{cls.desc}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: cls.color, background: `rgba(0,0,0,0.3)`, border: `1px solid ${cls.color}`, padding: '4px 8px', display: 'inline-block' }}>
                    {cls.bonus}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPMENT RARITIES */}
      <section style={{ padding: '60px 24px', maxWidth: 700, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ ÉQUIPEMENT & RARETÉS</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 24, textShadow: '2px 2px 0 #000' }}>
            COFFRES, DROPS & LÉGENDAIRES
          </div>
        </FadeIn>

        {/* Rarity display */}
        <FadeIn delay={0.1}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { label: 'COMMON',    color: '#888' },
              { label: 'UNCOMMON',  color: 'var(--green)' },
              { label: 'RARE',      color: 'var(--blue)' },
              { label: 'EPIC',      color: 'var(--purple-light)' },
              { label: 'LEGENDARY', color: 'var(--gold)' },
            ].map((r) => (
              <div key={r.label} style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: r.color, padding: '6px 12px', border: `2px solid ${r.color}`, background: 'var(--bg-card)', boxShadow: '2px 2px 0 #000' }}>
                {r.label}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Equipment cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EQUIP_DEMO.map((item, i) => (
            <FadeIn key={item.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ x: 4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', border: `2px solid ${item.color}`, boxShadow: `3px 3px 0 #000, 0 0 12px ${item.glow}` }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: item.color }}>{item.name}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginTop: 4 }}>{item.rarity}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: item.color, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', border: `1px solid ${item.color}` }}>
                  {item.stat}
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Chest types */}
        <FadeIn delay={0.3}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 20 }}>
            {[
              { icon: '📦', label: 'BOIS',    cost: '50G',   color: '#c8a56d' },
              { icon: '🗃️', label: 'FER',     cost: '150G',  color: '#aab0bb' },
              { icon: '🏆', label: 'OR',      cost: '400G',  color: 'var(--gold)' },
              { icon: '💎', label: 'CRISTAL', cost: '1000G', color: 'var(--purple-light)' },
            ].map((c) => (
              <div key={c.label} style={{ background: 'var(--bg-card)', border: `2px solid ${c.color}`, boxShadow: '3px 3px 0 #000', padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: c.color, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)' }}>{c.cost}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '60px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px solid rgba(123,47,255,0.2)', background: 'rgba(123,47,255,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(123,47,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <FadeIn>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--purple-light)', marginBottom: 16 }}>▸ ASSEZ PROCRASTINÉ ?</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(16px, 5vw, 24px)', color: '#fff', marginBottom: 12, textShadow: '3px 3px 0 #000' }}>COMMENCE LA VRAIE AVENTURE</div>
            <p style={{ fontFamily: 'var(--font-vt)', fontSize: '20px', color: 'var(--text-dim)', marginBottom: 12, maxWidth: 420 }}>
              Rejoins les joueurs qui finissent leurs tâches — parce que c'est enfin fun de le faire.
            </p>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginBottom: 32 }}>
              GRATUIT · PWA · INSTALLABLE SUR MOBILE
            </p>
            <motion.button whileTap={{ x: 5, y: 5 }} onClick={onEnter}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', padding: '18px 40px', background: 'var(--purple)', border: '2px solid var(--purple-light)', color: '#fff', boxShadow: '6px 6px 0 #000', cursor: 'pointer' }}>
              ▶ JOUER MAINTENANT
            </motion.button>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '20px 24px', borderTop: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-faint)' }}>⚔ QUESTLOG · 2026</div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)' }}>BUILT WITH ♥ & PIXEL ART</div>
      </footer>
    </div>
  );
}
