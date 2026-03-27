import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { SKILL_TREE, PATH_CONFIG, type SkillPath } from '../../lib/skills';

const PATHS: SkillPath[] = ['xp', 'gold', 'combo'];

export default function SkillTree() {
  const skillPoints    = useGameStore((s) => s.skillPoints);
  const unlockedSkills = useGameStore((s) => s.unlockedSkills);
  const unlockSkill    = useGameStore((s) => s.unlockSkill);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>
          ▸ ARBRE DE COMPÉTENCES
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 8px',
          background: 'var(--purple-dim)',
          border: '2px solid var(--purple)',
          boxShadow: '2px 2px 0 #000',
        }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)' }}>POINTS</span>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--purple-light)', lineHeight: 1 }}>
            {skillPoints}
          </span>
        </div>
      </div>

      {/* Grid: 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {PATHS.map((path) => {
          const pathCfg  = PATH_CONFIG[path];
          const pathSkills = SKILL_TREE.filter((s) => s.path === path).sort((a, b) => a.tier - b.tier);

          return (
            <div key={path}>
              {/* Path label */}
              <div style={{
                textAlign: 'center', padding: '4px 0', marginBottom: 6,
                fontFamily: 'var(--font-pixel)', fontSize: '6px',
                color: pathCfg.color,
                borderBottom: `2px solid ${pathCfg.color}`,
              }}>
                {pathCfg.label}
              </div>

              {/* Skill nodes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {pathSkills.map((skill, idx) => {
                  const unlocked  = unlockedSkills.includes(skill.id);
                  const prereqOk  = !skill.requires || unlockedSkills.includes(skill.requires);
                  const canAfford = skillPoints >= skill.cost;
                  const canUnlock = !unlocked && prereqOk && canAfford;
                  const available = !unlocked && prereqOk;

                  return (
                    <div key={skill.id}>
                      {/* Connector line between nodes */}
                      {idx > 0 && (
                        <div style={{
                          width: 2, height: 8, margin: '0 auto',
                          background: unlocked ? pathCfg.color : 'var(--border)',
                          opacity: 0.6,
                        }} />
                      )}
                      <motion.button
                        whileTap={canUnlock ? { scale: 0.95 } : {}}
                        onClick={() => canUnlock && unlockSkill(skill.id)}
                        style={{
                          width: '100%',
                          padding: '7px 5px',
                          background: unlocked
                            ? `color-mix(in srgb, ${pathCfg.color} 22%, transparent)`
                            : available
                              ? 'var(--bg-deep)'
                              : 'var(--bg-surface)',
                          border: `2px solid ${unlocked ? pathCfg.color : available ? 'var(--border-light)' : 'var(--border)'}`,
                          boxShadow: unlocked ? `0 0 8px color-mix(in srgb, ${pathCfg.color} 35%, transparent), 2px 2px 0 #000` : available ? '2px 2px 0 #000' : 'none',
                          opacity: !unlocked && !prereqOk ? 0.35 : 1,
                          cursor: canUnlock ? 'pointer' : 'default',
                          textAlign: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* Tier indicator */}
                        <div style={{
                          position: 'absolute', top: 2, right: 3,
                          fontFamily: 'var(--font-pixel)', fontSize: '4px',
                          color: unlocked ? pathCfg.color : 'var(--text-faint)',
                        }}>
                          T{skill.tier}
                        </div>

                        {/* Icon */}
                        <div style={{ fontSize: 16, lineHeight: 1, marginBottom: 3 }}>{skill.icon}</div>

                        {/* Name */}
                        <div style={{
                          fontFamily: 'var(--font-pixel)', fontSize: '5px',
                          color: unlocked ? pathCfg.color : available ? 'var(--text-dim)' : 'var(--text-faint)',
                          lineHeight: 1.4, marginBottom: 3,
                        }}>
                          {skill.name.toUpperCase()}
                        </div>

                        {/* Description */}
                        <div style={{
                          fontFamily: 'var(--font-pixel)', fontSize: '4px',
                          color: unlocked ? 'var(--text-dim)' : 'var(--text-faint)',
                          lineHeight: 1.5,
                        }}>
                          {skill.description}
                        </div>

                        {/* Cost or unlocked badge */}
                        {unlocked ? (
                          <div style={{
                            marginTop: 4,
                            fontFamily: 'var(--font-pixel)', fontSize: '4px',
                            color: pathCfg.color,
                          }}>✓ ACQUIS</div>
                        ) : (
                          <div style={{
                            marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 2,
                            padding: '2px 4px',
                            background: canUnlock ? pathCfg.color : 'transparent',
                            border: `1px solid ${canUnlock ? pathCfg.color : canAfford ? 'var(--border-light)' : 'var(--border)'}`,
                            fontFamily: 'var(--font-pixel)', fontSize: '5px',
                            color: canUnlock ? '#000' : canAfford ? 'var(--text-dim)' : 'var(--text-faint)',
                          }}>
                            {skill.cost} PT{skill.cost > 1 ? 'S' : ''}
                          </div>
                        )}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {skillPoints === 0 && unlockedSkills.length === 0 && (
        <p style={{
          fontFamily: 'var(--font-pixel)', fontSize: '7px',
          color: 'var(--text-faint)', textAlign: 'center',
          marginTop: 12, lineHeight: 2,
        }}>
          Monte de niveau pour gagner<br />des points de compétence
        </p>
      )}
    </div>
  );
}
