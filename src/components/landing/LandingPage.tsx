import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

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

function BossPreview() {
  const [hp, setHp] = useState(3000);
  const maxHp = 3000;
  const [attacking, setAttacking] = useState(false);

  const attack = () => {
    if (hp <= 0 || attacking) return;
    setAttacking(true);
    const dmg = Math.floor(Math.random() * 150) + 50;
    setTimeout(() => {
      setHp((h) => Math.max(0, h - dmg));
      setAttacking(false);
    }, 200);
  };

  const pct = hp / maxHp;

  return (
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--red)', boxShadow: '4px 4px 0 #000, 0 0 20px rgba(255,68,68,0.1)', padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 10 }}>⚔️ BOSS BATTLE DEMO</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <motion.div animate={attacking ? { x: [0, -8, 0], scale: [1, 0.9, 1] } : {}} style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>
          {hp <= 0 ? '💀' : '🐉'}
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--red)', marginBottom: 4 }}>DRAGON ANCIEN</div>
          <div style={{ height: 12, background: 'var(--bg-deep)', border: '2px solid var(--border)' }}>
            <motion.div animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.3 }} style={{ height: '100%', background: pct > 0.5 ? 'var(--green)' : pct > 0.25 ? 'var(--orange)' : 'var(--red)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)', marginTop: 3, textAlign: 'right' }}>
            {hp > 0 ? `${hp.toLocaleString()} / ${maxHp.toLocaleString()} HP` : 'VAINCU!'}
          </div>
        </div>
      </div>
      {hp > 0 ? (
        <motion.button whileTap={{ scale: 0.95, x: 2, y: 2 }} onClick={attack}
          style={{ width: '100%', padding: '10px 0', fontFamily: 'var(--font-pixel)', fontSize: '8px', background: 'var(--red)', border: '2px solid #000', color: '#000', boxShadow: '3px 3px 0 #000', cursor: 'pointer' }}>
          ⚔ ATTAQUER (compléter une quête)
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: 10, background: 'rgba(255,215,0,0.1)', border: '2px solid var(--gold)', fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--gold)' }}>
          🏆 RÉCOMPENSE: +2000 XP +1200 G 💎
        </motion.div>
      )}
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

type DemoPhase = 'board' | 'add_click' | 'modal' | 'new_card' | 'done_screen' | 'back_board';

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

function AppDemo() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>('board');
  const [typed, setTyped] = useState(0);
  const [diffSel, setDiffSel] = useState(false);
  const [acceptAnim, setAcceptAnim] = useState(false);
  const [newCardIn, setNewCardIn] = useState(false);
  const [checkPulse, setCheckPulse] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);

  useEffect(() => {
    setPhase('board');
    setTyped(0);
    setDiffSel(false);
    setAcceptAnim(false);
    setNewCardIn(false);
    setCheckPulse(false);
    setTaskDone(false);
    setShowXpFloat(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    at(() => setPhase('add_click'), 1500);
    at(() => setPhase('modal'), 2000);

    const TYPING_START = 2400;
    const TYPING_PER_CHAR = 105;
    DEMO_TASK_NAME.split('').forEach((_, i) => {
      at(() => setTyped(i + 1), TYPING_START + i * TYPING_PER_CHAR);
    });

    const typingEnd = TYPING_START + DEMO_TASK_NAME.length * TYPING_PER_CHAR;
    at(() => setDiffSel(true),                                          typingEnd + 250);
    at(() => setAcceptAnim(true),                                       typingEnd + 800);
    at(() => { setPhase('new_card'); setNewCardIn(true); },             typingEnd + 1200);
    at(() => setCheckPulse(true),                                       typingEnd + 2200);
    at(() => { setCheckPulse(false); setTaskDone(true); setShowXpFloat(true); }, typingEnd + 3100);
    at(() => setPhase('done_screen'),                                   typingEnd + 3350);
    at(() => setPhase('back_board'),                                    typingEnd + 5800);
    at(() => setCycle((c) => c + 1),                                    typingEnd + 8400);

    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  const showModal = phase === 'modal' || phase === 'new_card';
  const modalVisible = phase === 'modal';
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

          {/* App nav */}
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

          {/* Quest list */}
          <div style={{ padding: '10px 10px 0', position: 'relative' }}>
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
          </div>

          {/* Add-quest modal overlay */}
          <AnimatePresence>
            {modalVisible && (
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

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text)',
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(123,47,255,0.02) 0px, rgba(123,47,255,0.02) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(0deg, rgba(123,47,255,0.02) 0px, rgba(123,47,255,0.02) 1px, transparent 1px, transparent 32px)`,
    }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(8px)', borderBottom: '2px solid rgba(123,47,255,0.25)', boxShadow: '0 2px 0 rgba(0,0,0,0.5)' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--purple-light)' }}>⚔ QUESTLOG</div>
        <motion.button whileTap={{ x: 2, y: 2 }} onClick={onEnter} style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', padding: '8px 14px', background: 'var(--purple-dim)', border: '2px solid var(--purple)', color: 'var(--purple-light)', boxShadow: '2px 2px 0 #000' }}>
          ▶ JOUER
        </motion.button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', padding: '6px 14px', marginBottom: 28, background: 'var(--purple-dim)', border: '2px solid var(--purple)', color: 'var(--purple-light)', boxShadow: '3px 3px 0 #000' }}>
          ★ PRODUCTIVITY RPG · GRATUIT
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(32px, 9vw, 56px)', color: '#fff', lineHeight: 1.2, textShadow: '4px 4px 0 var(--purple), 8px 8px 0 #000' }}>QUEST</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(32px, 9vw, 56px)', color: 'var(--purple-light)', lineHeight: 1.2, textShadow: '4px 4px 0 rgba(123,47,255,0.4), 8px 8px 0 #000' }}>LOG</div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ fontFamily: 'var(--font-vt)', fontSize: 'clamp(20px, 5vw, 28px)', color: 'var(--text-dim)', textAlign: 'center', maxWidth: 480, lineHeight: 1.4, marginBottom: 40 }}>
          Ta liste de tâches devient un RPG. Gagne de l'XP, affronte des boss, collecte de l'équipement rare.
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
            { label: '4 CLASSES', color: 'var(--gold)' },
            { label: 'BOSS BATTLES', color: 'var(--red)' },
            { label: '15 ÉQUIPEMENTS', color: 'var(--purple-light)' },
            { label: '5 RARETÉS', color: 'var(--green)' },
          ].map((b) => (
            <div key={b.label} style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: b.color, padding: '4px 8px', border: `1px solid ${b.color}`, background: 'rgba(0,0,0,0.3)' }}>
              {b.label}
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          style={{ position: 'absolute', bottom: 24, fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>▼</motion.div>
          DÉCOUVRIR
        </motion.div>
      </section>

      {/* DEMO REEL */}
      <section style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px solid rgba(123,47,255,0.15)' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ APERÇU</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', textShadow: '2px 2px 0 #000' }}>
              VOIS L'APP EN ACTION
            </div>
          </div>
          <DemoReel />
        </FadeIn>
      </section>

      {/* INTERACTIVE QUEST DEMO */}
      <section style={{ padding: '60px 24px', maxWidth: 520, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ ESSAIE MAINTENANT</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 24, textShadow: '2px 2px 0 #000' }}>
            CLIQUE POUR VALIDER DES QUÊTES
          </div>
          <LiveQuestDemo />
        </FadeIn>
      </section>

      {/* BOSS BATTLE */}
      <section style={{ padding: '0 24px 60px', maxWidth: 520, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ BOSS BATTLES</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 24, textShadow: '2px 2px 0 #000' }}>
            AFFRONTE DES ENNEMIS LÉGENDAIRES
          </div>
          <BossPreview />
        </FadeIn>
      </section>

      {/* HERO CLASSES */}
      <section style={{ padding: '60px 24px', background: 'rgba(123,47,255,0.04)', borderTop: '2px solid rgba(123,47,255,0.1)', borderBottom: '2px solid rgba(123,47,255,0.1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ CLASSES DE HÉROS</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(13px, 4vw, 18px)', color: 'var(--text)', marginBottom: 24, textShadow: '2px 2px 0 #000' }}>
              4 CLASSES AUX BONUS UNIQUES
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {CLASS_DEMO.map((cls, i) => (
              <FadeIn key={cls.name} delay={i * 0.07}>
                <div style={{ background: 'var(--bg-card)', border: `2px solid ${cls.color}`, boxShadow: '4px 4px 0 #000', padding: '14px 12px' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cls.icon}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: cls.color, marginBottom: 4 }}>{cls.name}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 8 }}>{cls.desc}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: cls.color, background: `rgba(0,0,0,0.3)`, border: `1px solid ${cls.color}`, padding: '4px 8px', display: 'inline-block' }}>
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
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 8 }}>▸ ÉQUIPEMENT & RARETÉS</div>
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
              <div key={r.label} style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: r.color, padding: '5px 10px', border: `2px solid ${r.color}`, background: 'var(--bg-card)', boxShadow: '2px 2px 0 #000' }}>
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
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: item.color }}>{item.name}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginTop: 2 }}>{item.rarity}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: item.color, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', border: `1px solid ${item.color}` }}>
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
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: c.color, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--gold)' }}>{c.cost}</div>
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
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 16 }}>▸ PRÊT À COMMENCER ?</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(16px, 5vw, 24px)', color: '#fff', marginBottom: 12, textShadow: '3px 3px 0 #000' }}>TON AVENTURE T'ATTEND</div>
            <p style={{ fontFamily: 'var(--font-vt)', fontSize: '22px', color: 'var(--text-dim)', marginBottom: 32, maxWidth: 400 }}>
              Gratuit, sans inscription, installable sur mobile.
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
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)' }}>⚔ QUESTLOG · 2025</div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)' }}>BUILT WITH ♥ & PIXEL ART</div>
      </footer>
    </div>
  );
}
