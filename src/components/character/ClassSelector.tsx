import { motion } from 'framer-motion';
import { CLASSES, type HeroClass } from '../../lib/classes';
import { useGameStore } from '../../store/useGameStore';

export default function ClassSelector() {
  const selectClass = useGameStore((s) => s.selectClass);

  const handleSelect = (cls: HeroClass) => {
    selectClass(cls);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: 'var(--bg-deep)', backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-faint)', marginBottom: 10 }}>
          ▸ DÉBUT DE L'AVENTURE
        </div>
        <div style={{
          fontFamily: 'var(--font-pixel)', fontSize: 'clamp(16px, 5vw, 22px)',
          color: '#fff', textShadow: '3px 3px 0 var(--purple)',
          lineHeight: 1.3, marginBottom: 8,
        }}>
          CHOISIS TA CLASSE
        </div>
        <p style={{ fontFamily: 'var(--font-vt)', fontSize: '20px', color: 'var(--text-dim)' }}>
          Chaque classe a des bonus uniques.
        </p>
      </motion.div>

      {/* Class cards */}
      <div className="grid grid-cols-2 gap-3 w-full" style={{ maxWidth: 480 }}>
        {(Object.values(CLASSES) as typeof CLASSES[HeroClass][]).map((cls, i) => (
          <motion.button
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(cls.id)}
            style={{
              background: 'var(--bg-card)',
              border: `2px solid ${cls.color}`,
              boxShadow: `4px 4px 0 #000`,
              padding: 12,
              textAlign: 'left',
              position: 'relative',
            }}
          >
            {/* Icon */}
            <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>{cls.icon}</div>

            {/* Name */}
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: '9px',
              color: cls.colorLight, marginBottom: 4,
            }}>
              {cls.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: '6px',
              color: 'var(--text-faint)', marginBottom: 8,
            }}>
              {cls.tagline}
            </div>

            {/* Description */}
            <p style={{
              fontFamily: 'var(--font-vt)', fontSize: '16px',
              color: 'var(--text-dim)', lineHeight: 1.3, marginBottom: 10,
            }}>
              {cls.description}
            </p>

            {/* Stats */}
            <div className="flex flex-col gap-0.5">
              {cls.stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: s.color, letterSpacing: 1 }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Bonus badge */}
            <div style={{
              marginTop: 10, paddingTop: 8,
              borderTop: `1px dashed ${cls.color}`,
              fontFamily: 'var(--font-pixel)', fontSize: '5px',
              color: cls.colorLight, lineHeight: 1.8,
            }}>
              {cls.xpBonus > 0 && `+${cls.xpBonus}% XP global\n`}
              {cls.goldBonus > 0 && `+${cls.goldBonus}% Gold\n`}
              {cls.hardBossXpBonus > 0 && `+${cls.hardBossXpBonus}% XP Boss\n`}
              {cls.comboGrowthBonus > 0 && `+${cls.comboGrowthBonus} Combo/Streak`}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
