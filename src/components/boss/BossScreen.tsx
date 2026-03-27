import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { computeHeroStats, BOSS_POWER_REQ } from '../../lib/stats';
import { CLASS_POWERS, type Power } from '../../lib/powers';
import { CLASSES } from '../../lib/classes';
import { CHEST_CONFIG } from '../../lib/equipment';
import type { BossState } from '../../lib/bosses';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FloatNumber { id: number; text: string; color: string; side: 'hero' | 'boss'; }

interface CombatState {
  playerHp: number;
  mana: number;
  bossHp: number;
  powerCooldowns: Record<string, number>;
  atkBuff: number; atkBuffEnds: number;
  shieldHits: number; invulEnds: number;
  bossDoTs: { dps: number; ends: number }[];
  heroAnim: 'idle' | 'attack' | 'hit';
  bossAnim: 'idle' | 'attack' | 'hit' | 'dead';
  result: 'win' | 'lose' | null;
}

// ── Shared arena background ───────────────────────────────────────────────────

export function ArenaBackground() {
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '40%', background: 'linear-gradient(180deg, #5a7fc0 0%, #7baad0 55%, #8abf78 100%)' }} />
      <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #5a9248 0%, #3f7232 60%, #2d5824 100%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '18%', background: 'linear-gradient(180deg, #8abf78 0%, #5a9248 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px)' }} />
    </>
  );
}

function Platform({ width = 100, dark = false }: { width?: number; dark?: boolean }) {
  return (
    <div style={{
      width, height: Math.round(width * 0.17),
      background: dark ? 'rgba(20,60,10,0.55)' : 'rgba(40,25,5,0.45)',
      borderRadius: '50%',
      border: `2px solid ${dark ? 'rgba(10,50,0,0.5)' : 'rgba(25,10,0,0.4)'}`,
    }} />
  );
}

// ── Pokémon-style info boxes ──────────────────────────────────────────────────

const INFO_BOX_BASE: React.CSSProperties = {
  background: '#f0f0e8',
  border: '3px solid #111',
  boxShadow: '4px 4px 0 rgba(0,0,0,0.7)',
  position: 'relative',
  padding: '7px 10px 9px',
};

function HpBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 7, background: '#888', border: '1px solid #333', borderRadius: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 1, left: 1, bottom: 1, width: `calc(${Math.max(0, pct) * 100}% - 2px)`, background: color, transition: 'width 0.3s ease, background 0.3s' }} />
    </div>
  );
}

/** Enemy info box — top-left of arena, no HP number (Pokémon style) */
function BossInfoBox({ name, hpVal, hpMax, rankColor, rank }: {
  name: string; hpVal: number; hpMax: number; rankColor?: string; rank?: string;
}) {
  const pct = Math.max(0, hpVal / hpMax);
  const color = pct > 0.5 ? '#38c040' : pct > 0.25 ? '#f8c038' : '#e83030';
  return (
    <div style={{ ...INFO_BOX_BASE, width: 152 }}>
      <div style={{ position: 'absolute', inset: 3, border: '1px solid #ccc', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: rankColor ?? '#222', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 110 }}>
          {name.toUpperCase()}
        </span>
        {rank && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: rankColor ?? '#555', flexShrink: 0 }}>:{rank}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444', fontWeight: 700, flexShrink: 0 }}>HP</span>
        <div style={{ flex: 1 }}><HpBar pct={pct} color={color} /></div>
      </div>
    </div>
  );
}

/** Hero info box — bottom-right of arena, with HP/MP numbers */
function HeroInfoBox({ name, hpVal, hpMax, manaVal, manaMax }: {
  name: string; hpVal: number; hpMax: number; manaVal?: number; manaMax?: number;
}) {
  const hpPct = Math.max(0, hpVal / hpMax);
  const mpPct = manaVal != null && manaMax ? Math.max(0, manaVal / manaMax) : null;
  const hpColor = hpPct > 0.5 ? '#38c040' : hpPct > 0.25 ? '#f8c038' : '#e83030';
  return (
    <div style={{ ...INFO_BOX_BASE, width: 164 }}>
      <div style={{ position: 'absolute', inset: 3, border: '1px solid #ccc', pointerEvents: 'none' }} />
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#222', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name.toUpperCase()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: mpPct != null ? 4 : 0 }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444', fontWeight: 700, flexShrink: 0 }}>HP</span>
        <div style={{ flex: 1 }}><HpBar pct={hpPct} color={hpColor} /></div>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#222', flexShrink: 0, minWidth: 32, textAlign: 'right' }}>{hpVal}/{hpMax}</span>
      </div>
      {mpPct != null && manaMax && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444', fontWeight: 700, flexShrink: 0 }}>MP</span>
          <div style={{ flex: 1 }}><HpBar pct={mpPct} color='#5040c8' /></div>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#222', flexShrink: 0, minWidth: 32, textAlign: 'right' }}>{Math.floor(manaVal ?? 0)}/{manaMax}</span>
        </div>
      )}
    </div>
  );
}

// ── Pokémon-style battle intro ─────────────────────────────────────────────────

function BattleIntro({ boss, heroIcon, heroName, cs, stats, onDone }: {
  boss: BossState; heroIcon: string; heroName: string;
  cs: CombatState; stats: ReturnType<typeof computeHeroStats>;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<'flash' | 'scene' | 'text1' | 'text2'>('flash');
  const doneRef = useRef(false);
  const skip = () => { if (!doneRef.current) { doneRef.current = true; onDone(); } };

  useEffect(() => {
    const T = [
      setTimeout(() => setPhase('scene'),  480),
      setTimeout(() => setPhase('text1'), 1350),
      setTimeout(() => setPhase('text2'), 2650),
      setTimeout(() => { if (!doneRef.current) { doneRef.current = true; onDone(); } }, 3950),
    ];
    return () => T.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }}
      onClick={skip}
      style={{ position: 'absolute', inset: 0, zIndex: 50, cursor: 'pointer', overflow: 'hidden' }}
    >
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: [1, 0, 1, 0, 1, 0, 0] }}
            transition={{ duration: 0.46, times: [0, 0.14, 0.28, 0.44, 0.58, 0.74, 1] }}
            style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 10, pointerEvents: 'none' }} />
        )}
      </AnimatePresence>

      <ArenaBackground />

      {/* Boss sprite — right area, slides from right */}
      <motion.div
        initial={{ x: 260 }} animate={{ x: phase !== 'flash' ? 0 : 260 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        style={{ position: 'absolute', right: '8%', bottom: '12%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}
      >
        <motion.div
          animate={phase === 'scene' || phase === 'text1' || phase === 'text2' ? { y: [0, -7, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 72, lineHeight: 1, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.55))', marginBottom: 2 }}
        >{boss.icon}</motion.div>
        <Platform width={100} />
      </motion.div>

      {/* Boss info box — top left, slides from left */}
      <motion.div
        initial={{ x: -200 }} animate={{ x: phase === 'text1' || phase === 'text2' ? 0 : -200 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 5 }}
      >
        <BossInfoBox name={boss.name} hpVal={boss.currentHp} hpMax={boss.maxHp} rankColor={boss.rankColor} rank={boss.rank} />
      </motion.div>

      {/* Hero sprite — left area, slides from left */}
      <motion.div
        initial={{ x: -260 }} animate={{ x: phase !== 'flash' ? 0 : -260 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        style={{ position: 'absolute', left: '8%', bottom: '2%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}
      >
        <motion.div className="px-walk" style={{ fontSize: 60, lineHeight: 1, filter: 'drop-shadow(2px 4px 0 rgba(0,0,0,0.45))', marginBottom: 2 }}>
          {heroIcon}
        </motion.div>
        <Platform width={110} dark />
      </motion.div>

      {/* Hero info box — bottom right, slides from right */}
      <motion.div
        initial={{ x: 200 }} animate={{ x: phase === 'text2' ? 0 : 200 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', bottom: 90, right: 10, zIndex: 5 }}
      >
        <HeroInfoBox name={heroName} hpVal={cs.playerHp} hpMax={stats.hp} manaVal={cs.mana} manaMax={stats.manaMax} />
      </motion.div>

      {/* Dialog box */}
      <AnimatePresence>
        {(phase === 'text1' || phase === 'text2') && (
          <motion.div
            initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f0f0e8', border: '4px solid #222', borderBottom: 'none', padding: '16px 22px 20px', minHeight: 84 }}
          >
            <div style={{ position: 'absolute', inset: 6, bottom: 0, border: '2px solid #999', pointerEvents: 'none' }} />
            <motion.p key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#111', lineHeight: 2, margin: 0, position: 'relative' }}
            >
              {phase === 'text1' ? `Un ${boss.name.toUpperCase()} sauvage apparaît !` : `Que doit faire ${heroName} ?`}
            </motion.p>
            <span className="px-blink" style={{ position: 'absolute', bottom: 12, right: 16, fontFamily: 'var(--font-pixel)', fontSize: '13px', color: '#333' }}>▼</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: 'absolute', top: 8, right: 12, fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>
        Appuie pour passer
      </div>
    </motion.div>
  );
}

// ── Boss selection card ───────────────────────────────────────────────────────

function BossCard({ boss, power, onEngage }: { boss: BossState; power: number; onEngage: (b: BossState) => void }) {
  const character = useGameStore((s) => s.character);
  const engageBoss = useGameStore((s) => s.engageBoss);
  const req = BOSS_POWER_REQ[boss.id] ?? 0;
  const canAfford = character.gold >= boss.ticketCost;
  const hpPct = boss.currentHp / boss.maxHp;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: boss.isDefeated ? 'var(--bg-deep)' : 'var(--bg-card)', border: `2px solid ${boss.isDefeated ? 'var(--border)' : boss.isEngaged ? boss.rankColor : 'var(--border-light)'}`, boxShadow: boss.isDefeated ? 'none' : '3px 3px 0 #000', opacity: boss.isDefeated ? 0.5 : 1, padding: 14, marginBottom: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ fontSize: boss.isDefeated ? 32 : 40, lineHeight: 1, filter: boss.isDefeated ? 'grayscale(1)' : 'none' }}>{boss.isDefeated ? '💀' : boss.icon}</div>
          <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, background: boss.rankColor, border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#000', fontWeight: 900 }}>{boss.rank}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: boss.isDefeated ? 'var(--text-faint)' : boss.rankColor }}>{boss.name}</span>
            {boss.isDefeated && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)' }}>VAINCU</span>}
            {boss.isEngaged && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--red)', border: '1px solid var(--red)', padding: '1px 4px' }}>EN COMBAT</span>}
          </div>
          <p style={{ fontFamily: 'var(--font-vt)', fontSize: '18px', color: 'var(--text-dim)', marginBottom: 8 }}>{boss.description}</p>
          {!boss.isDefeated && boss.currentHp < boss.maxHp && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ height: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ width: `${hpPct * 100}%`, height: '100%', background: hpPct > 0.5 ? 'var(--green)' : 'var(--red)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginTop: 3 }}>
                {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP restants
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)' }}>FORCE REQ:</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: power >= req ? 'var(--green)' : 'var(--red)' }}>{req}</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--purple-light)' }}>+{boss.reward.xp} XP</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--gold)' }}>+{boss.reward.gold} G</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)' }}>{CHEST_CONFIG[boss.reward.chest].icon}</span>
          </div>
          {!boss.isDefeated && (
            boss.isEngaged ? (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => onEngage(boss)}
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', padding: '9px 16px', background: boss.rankColor, border: '2px solid #000', color: '#000', boxShadow: '3px 3px 0 #000' }}>
                ⚔ CONTINUER LE COMBAT
              </motion.button>
            ) : (
              <motion.button whileTap={canAfford ? { scale: 0.95 } : {}} onClick={() => { if (canAfford) { engageBoss(boss.id); setTimeout(() => onEngage(boss), 50); } }}
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', padding: '9px 16px', background: canAfford ? boss.rankColor : 'var(--bg-surface)', border: `2px solid ${canAfford ? '#000' : 'var(--border)'}`, color: canAfford ? '#000' : 'var(--text-faint)', boxShadow: canAfford ? '3px 3px 0 #000' : 'none', opacity: canAfford ? 1 : 0.6 }}>
                {canAfford ? `⚔ DÉFIER · ${boss.ticketCost} G` : `${boss.ticketCost} G REQUIS`}
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Combat screen ─────────────────────────────────────────────────────────────

const BOSS_ATK_INTERVAL = 2600;
const HERO_ATK_INTERVAL = 1700;
const MANA_TICK          = 100;

function CombatScreen({ boss, stats, powers, heroIcon, heroName, onExit }: {
  boss: BossState; stats: ReturnType<typeof computeHeroStats>;
  powers: Power[]; heroIcon: string; heroName: string; onExit: () => void;
}) {
  const saveBossHp = useGameStore((s) => s.saveBossHp);
  const defeatBoss = useGameStore((s) => s.defeatBoss);

  const [showIntro, setShowIntro] = useState(true);
  const [floats, setFloats] = useState<FloatNumber[]>([]);

  const [cs, setCs] = useState<CombatState>({
    playerHp: stats.hp, mana: stats.manaMax, bossHp: boss.currentHp,
    powerCooldowns: {}, atkBuff: 1, atkBuffEnds: 0,
    shieldHits: 0, invulEnds: 0, bossDoTs: [],
    heroAnim: 'idle', bossAnim: 'idle', result: null,
  });

  const csRef = useRef(cs);
  csRef.current = cs;

  // Stable float spawner via ref
  const addFloatRef = useRef((text: string, color: string, side: 'hero' | 'boss') => {
    const id = Date.now() + Math.random();
    setFloats((p) => [...p.slice(-5), { id, text, color, side }]);
    setTimeout(() => setFloats((p) => p.filter((f) => f.id !== id)), 1300);
  });

  // ── Hero auto-attack ──────────────────────────────────────────────────────
  useEffect(() => {
    if (showIntro || cs.result) return;
    const interval = setInterval(() => {
      const s = csRef.current;
      if (s.result || s.bossHp <= 0) return;
      const now = Date.now();
      const atkMult = now < s.atkBuffEnds ? s.atkBuff : 1;
      if (Math.random() * 100 > stats.acc) {
        addFloatRef.current('MISS!', 'rgba(180,180,180,0.9)', 'boss');
        setCs((p) => ({ ...p, heroAnim: 'attack' }));
        setTimeout(() => setCs((p) => ({ ...p, heroAnim: 'idle' })), 300);
        return;
      }
      const isCrit = Math.random() * 100 < stats.crit;
      const dmg = Math.max(1, Math.round(stats.atk * atkMult * (isCrit ? stats.critDmg : 1)));
      const newBossHp = Math.max(0, s.bossHp - dmg);
      addFloatRef.current(isCrit ? `💥 ${dmg}!` : `-${dmg}`, isCrit ? 'var(--gold)' : '#ff8888', 'boss');
      setCs((p) => ({
        ...p, bossHp: newBossHp, heroAnim: 'attack',
        bossAnim: newBossHp <= 0 ? 'dead' : 'hit',
        result: newBossHp <= 0 ? 'win' : null,
      }));
      setTimeout(() => setCs((p) => ({ ...p, heroAnim: 'idle', bossAnim: p.bossAnim === 'dead' ? 'dead' : 'idle' })), 300);
    }, HERO_ATK_INTERVAL);
    return () => clearInterval(interval);
  }, [showIntro, cs.result, stats]);

  // ── Boss auto-attack ──────────────────────────────────────────────────────
  useEffect(() => {
    if (showIntro || cs.result) return;
    const bossAtk = Math.round(boss.maxHp / 80);
    const interval = setInterval(() => {
      const s = csRef.current;
      if (s.result || s.bossHp <= 0) return;
      const now = Date.now();
      if (now < s.invulEnds) {
        addFloatRef.current('INVUL!', 'var(--gold)', 'hero');
        return;
      }
      if (s.shieldHits > 0) {
        addFloatRef.current('🛡 BLOQUÉ', 'var(--blue)', 'hero');
        setCs((p) => ({ ...p, shieldHits: p.shieldHits - 1, bossAnim: 'attack' }));
        setTimeout(() => setCs((p) => ({ ...p, bossAnim: 'idle' })), 300);
        return;
      }
      const dmg = Math.max(1, bossAtk - Math.round(stats.def * 0.5));
      const newHp = Math.max(0, s.playerHp - dmg);
      addFloatRef.current(`-${dmg}`, '#ff4444', 'hero');
      setCs((p) => ({
        ...p, playerHp: newHp, bossAnim: 'attack', heroAnim: 'hit',
        result: newHp <= 0 ? 'lose' : null,
      }));
      setTimeout(() => setCs((p) => ({ ...p, bossAnim: p.bossHp <= 0 ? 'dead' : 'idle', heroAnim: 'idle' })), 300);
    }, BOSS_ATK_INTERVAL);
    return () => clearInterval(interval);
  }, [showIntro, cs.result, boss.maxHp, stats.def]);

  // ── Mana regen + DoT ─────────────────────────────────────────────────────
  useEffect(() => {
    if (showIntro || cs.result) return;
    const interval = setInterval(() => {
      const s = csRef.current;
      if (s.result) return;
      const now = Date.now();
      const newMana = Math.min(stats.manaMax, s.mana + stats.manaRegen * (MANA_TICK / 1000));
      const activeDots = s.bossDoTs.filter((d) => d.ends > now);
      let dotDmg = 0;
      if (activeDots.length > 0 && Math.random() < MANA_TICK / 1000) {
        dotDmg = activeDots.reduce((sum, d) => sum + d.dps, 0);
        if (dotDmg > 0) addFloatRef.current(`☠ ${dotDmg}`, 'var(--green)', 'boss');
      }
      setCs((p) => ({
        ...p, mana: newMana,
        bossHp: dotDmg > 0 ? Math.max(0, p.bossHp - dotDmg) : p.bossHp,
        bossDoTs: activeDots,
        result: dotDmg > 0 && p.bossHp - dotDmg <= 0 ? 'win' : p.result,
      }));
    }, MANA_TICK);
    return () => clearInterval(interval);
  }, [showIntro, cs.result, stats.manaMax, stats.manaRegen]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const s = csRef.current;
      if (s.result === 'win') defeatBoss(boss.id);
      else saveBossHp(boss.id, s.bossHp);
    };
  }, []);

  // ── Win/lose float ────────────────────────────────────────────────────────
  useEffect(() => {
    if (cs.result === 'win') addFloatRef.current('🏆 VICTOIRE!', 'var(--gold)', 'boss');
    else if (cs.result === 'lose') addFloatRef.current('💀 DÉFAITE', 'var(--red)', 'hero');
  }, [cs.result]);

  // ── Use power ─────────────────────────────────────────────────────────────
  const usePower = useCallback((power: Power) => {
    const s = csRef.current;
    if (s.result || s.mana < power.manaCost) return;
    const now = Date.now();
    if ((s.powerCooldowns[power.id] ?? 0) > now) return;

    const newCd = { ...s.powerCooldowns, [power.id]: now + power.cooldown * 1000 };
    let updates: Partial<CombatState> = { mana: s.mana - power.manaCost, powerCooldowns: newCd };
    let floatText = `✨ ${power.name}`, floatSide: 'hero' | 'boss' = 'boss';

    if (power.dmgMult) {
      const atkMult = now < s.atkBuffEnds ? s.atkBuff : 1;
      const isCrit  = power.guaranteedCrit || Math.random() * 100 < stats.crit;
      const dmg     = Math.round(stats.atk * atkMult * power.dmgMult * (isCrit ? stats.critDmg : 1));
      const nb      = Math.max(0, s.bossHp - dmg);
      updates = { ...updates, bossHp: nb, heroAnim: 'attack', bossAnim: nb <= 0 ? 'dead' : 'hit', result: nb <= 0 ? 'win' : null };
      floatText = isCrit ? `💥 CRIT ${dmg}!` : `✨ ${dmg}`;
      setTimeout(() => setCs((p) => ({ ...p, heroAnim: 'idle', bossAnim: p.bossHp <= 0 ? 'dead' : 'idle' })), 300);
    }
    if (power.healPct) {
      const heal = Math.round(stats.hp * power.healPct);
      updates = { ...updates, playerHp: Math.min(stats.hp, s.playerHp + heal) };
      addFloatRef.current(`+${heal} PV`, 'var(--green)', 'hero');
      floatSide = 'boss';
    }
    if (power.atkBuffMult && power.buffDuration) {
      updates = { ...updates, atkBuff: power.atkBuffMult, atkBuffEnds: now + power.buffDuration * 1000 };
    }
    if (power.shieldHits) {
      updates = { ...updates, shieldHits: s.shieldHits + power.shieldHits };
      addFloatRef.current('🛡 BOUCLIER', 'var(--blue)', 'hero');
    }
    if (power.invulDuration) { updates = { ...updates, invulEnds: now + power.invulDuration * 1000 }; }
    if (power.manaRestore) { updates = { ...updates, mana: Math.min(stats.manaMax, (updates.mana ?? s.mana) + power.manaRestore) }; }
    if (power.dotMult && power.dotDuration) {
      updates = { ...updates, bossDoTs: [...s.bossDoTs, { dps: Math.round(stats.atk * power.dotMult), ends: now + power.dotDuration * 1000 }] };
    }

    addFloatRef.current(floatText, power.color, floatSide);
    setCs((p) => ({ ...p, ...updates }));
  }, [stats]);

  const now    = Date.now();
  const bHpPct = cs.bossHp / boss.maxHp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <BattleIntro boss={boss} heroIcon={heroIcon} heroName={heroName}
            cs={cs} stats={stats} onDone={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* ── ARENA ── */}
      <div style={{ flex: '0 0 55%', position: 'relative', overflow: 'hidden' }}>
        <ArenaBackground />

        {/* Exit */}
        <button onClick={onExit} style={{ position: 'absolute', top: 8, left: 10, zIndex: 6, fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.25)', padding: '4px 8px' }}>
          ◀ QUITTER
        </button>

        {/* ── Boss info box — TOP LEFT corner ── */}
        <motion.div
          initial={{ x: -200 }} animate={{ x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 5 }}
        >
          <BossInfoBox name={boss.name} hpVal={cs.bossHp} hpMax={boss.maxHp} rankColor={boss.rankColor} rank={boss.rank} />
        </motion.div>

        {/* ── Boss sprite — upper RIGHT ── */}
        <motion.div
          animate={
            cs.bossAnim === 'attack' ? { x: [0, -18, 0] } :
            cs.bossAnim === 'hit'    ? { x: [14, 0], opacity: [0.35, 1] } :
            cs.bossAnim === 'dead'   ? { rotate: 20, opacity: 0.25, y: 12 } :
            { x: 0 }
          }
          style={{ position: 'absolute', right: '10%', bottom: '16%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}
        >
          <div style={{ fontSize: 74, lineHeight: 1, filter: 'drop-shadow(3px 5px 0 rgba(0,0,0,0.55))', marginBottom: 2 }}>
            {cs.bossAnim === 'dead' ? '💀' : boss.icon}
          </div>
          <Platform width={96} />
        </motion.div>

        {/* ── Hero sprite — lower LEFT ── */}
        <motion.div
          animate={
            cs.heroAnim === 'attack' ? { x: [0, 18, 0] } :
            cs.heroAnim === 'hit'    ? { x: [-10, 0], opacity: [0.35, 1] } :
            { x: 0 }
          }
          style={{
            position: 'absolute', left: '8%', bottom: '3%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3,
            filter: cs.result === 'lose' ? 'grayscale(1) opacity(0.5)' : undefined,
          }}
        >
          <div style={{ fontSize: 62, lineHeight: 1, filter: 'drop-shadow(2px 4px 0 rgba(0,0,0,0.45))', marginBottom: 2 }}>
            {heroIcon}
          </div>
          <Platform width={110} dark />
        </motion.div>

        {/* ── Hero info box — BOTTOM RIGHT corner ── */}
        <motion.div
          initial={{ x: 200 }} animate={{ x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 5 }}
        >
          <HeroInfoBox name={heroName} hpVal={cs.playerHp} hpMax={stats.hp} manaVal={cs.mana} manaMax={stats.manaMax} />
        </motion.div>

        {/* Floating damage numbers */}
        <AnimatePresence>
          {floats.map((f) => (
            <motion.div key={f.id}
              initial={{ opacity: 1, y: 0, scale: 0.85 }}
              animate={{ opacity: 0, y: -60, scale: 1.15 }}
              exit={{}}
              transition={{ duration: 1.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: f.side === 'boss' ? '55%' : '16%',
                bottom: '48%',
                fontFamily: 'var(--font-pixel)',
                fontSize: f.text.includes('CRIT') || f.text.includes('VICTOIRE') ? '13px' : '10px',
                color: f.color,
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
              }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Buff badges (center bottom of arena) */}
        <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 4 }}>
          {now < cs.atkBuffEnds && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--orange)', background: 'rgba(0,0,0,0.55)', border: '1px solid var(--orange)', padding: '2px 5px' }}>ATK ×{cs.atkBuff}</span>}
          {cs.shieldHits > 0 && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--blue)', background: 'rgba(0,0,0,0.55)', border: '1px solid var(--blue)', padding: '2px 5px' }}>🛡 ×{cs.shieldHits}</span>}
          {now < cs.invulEnds && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--gold)', background: 'rgba(0,0,0,0.55)', border: '1px solid var(--gold)', padding: '2px 5px' }}>INVUL</span>}
        </div>
      </div>

      {/* ── BOTTOM PANEL — Pokémon dialog / action menu ── */}
      <div style={{ flex: 1, background: '#f0f0e8', border: '4px solid #111', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Inner inset border */}
        <div style={{ position: 'absolute', inset: 6, border: '2px solid #aaa', pointerEvents: 'none', zIndex: 0 }} />

        <AnimatePresence mode="wait">
          {cs.result ? (
            /* ── Result screen ── */
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 20px', position: 'relative', zIndex: 1 }}
            >
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: cs.result === 'win' ? '#b07800' : '#cc2222', textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
                {cs.result === 'win' ? '🏆 VICTOIRE!' : '💀 DÉFAITE'}
              </div>
              {cs.result === 'win' && (
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#555', textAlign: 'center', lineHeight: 2 }}>
                  +{boss.reward.xp} XP · +{boss.reward.gold} G · {CHEST_CONFIG[boss.reward.chest].icon} REÇU
                </div>
              )}
              <button onClick={onExit} style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', padding: '8px 18px', background: '#222', border: '2px solid #111', color: '#f0f0e8', boxShadow: '3px 3px 0 #888' }}>
                ◀ RETOUR
              </button>
            </motion.div>
          ) : (
            /* ── Action menu ── */
            <div key="actions" style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 1 }}>
              {/* Left: dialog prompt */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '14px 18px' }}>
                <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#111', lineHeight: 2, margin: 0 }}>
                  Que doit faire<br />{heroName.toUpperCase()} ?
                </p>
              </div>

              {/* Divider */}
              <div style={{ width: 3, background: '#111', alignSelf: 'stretch' }} />

              {/* Right: 2×2 power grid */}
              <div style={{ width: 188, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                {powers.slice(0, 4).map((p, i) => {
                  const cd    = cs.powerCooldowns[p.id] ?? 0;
                  const onCd  = now < cd;
                  const noMp  = cs.mana < p.manaCost;
                  const off   = onCd || noMp;
                  const cdSec = Math.ceil((cd - now) / 1000);
                  const isRight = i % 2 === 1;
                  const isBottom = i >= 2;
                  return (
                    <motion.button key={p.id}
                      whileTap={!off ? { scale: 0.93 } : {}}
                      onClick={() => usePower(p)}
                      style={{
                        padding: '6px 8px',
                        background: off ? 'transparent' : 'transparent',
                        borderTop: 'none', borderBottom: 'none',
                        borderLeft: isRight ? '2px solid #111' : 'none',
                        borderRight: 'none',
                        borderTopWidth: isBottom ? 2 : 0,
                        borderTopStyle: isBottom ? 'solid' : undefined,
                        borderTopColor: isBottom ? '#111' : undefined,
                        opacity: off ? 0.45 : 1,
                        position: 'relative',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
                        gap: 2,
                        cursor: off ? 'default' : 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{p.icon}</span>
                        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: off ? '#888' : '#111', lineHeight: 1.3 }}>
                          {p.name.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: onCd ? '#c44' : noMp ? '#aaa' : '#5040a0', paddingLeft: 2 }}>
                        {onCd ? `⏱ ${cdSec}s` : `${p.manaCost} MP`}
                      </span>
                      {/* Active type color strip on left */}
                      <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, background: off ? 'transparent' : p.color }} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Blinking arrow (only in action menu) */}
        {!cs.result && (
          <span className="px-blink" style={{ position: 'absolute', bottom: 10, left: 20, fontFamily: 'var(--font-pixel)', fontSize: '11px', color: '#333', zIndex: 2 }}>▶</span>
        )}
      </div>
    </div>
  );
}

// ── Main BossScreen ───────────────────────────────────────────────────────────

export default function BossScreen() {
  const bosses    = useGameStore((s) => s.bosses);
  const character = useGameStore((s) => s.character);
  const inventory = useGameStore((s) => s.inventory);
  const equipped  = useGameStore((s) => s.equipped);
  const [fightingBoss, setFightingBoss] = useState<BossState | null>(null);

  const stats    = computeHeroStats(character.level, character.heroClass, inventory, equipped);
  const cls      = character.heroClass ? CLASSES[character.heroClass] : null;
  const powers   = character.heroClass ? CLASS_POWERS[character.heroClass] : [];
  const heroIcon = cls?.icon ?? '🧙';
  const heroName = cls?.name ?? 'Héros';

  if (fightingBoss) {
    const freshBoss = bosses.find((b) => b.id === fightingBoss.id) ?? fightingBoss;
    return <CombatScreen boss={freshBoss} stats={stats} powers={powers} heroIcon={heroIcon} heroName={heroName} onExit={() => setFightingBoss(null)} />;
  }

  return (
    <div className="flex flex-col min-h-full px-3 pt-4 pb-4">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: 6 }}>▸ DONJON</div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '28px', color: 'var(--text)', lineHeight: 1 }}>
            Boss Battles<span style={{ color: 'var(--text-faint)' }}> · {bosses.filter((b) => b.isDefeated).length} vaincus</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 12px', background: 'var(--bg-card)', border: '2px solid var(--border-light)', boxShadow: '2px 2px 0 #000' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 4 }}>PUISSANCE</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--purple-light)' }}>{stats.power}</div>
        </div>
      </div>
      {bosses.map((boss) => (
        <BossCard key={boss.id} boss={boss} power={stats.power}
          onEngage={(b) => setFightingBoss(bosses.find((x) => x.id === b.id) ?? b)} />
      ))}
    </div>
  );
}
