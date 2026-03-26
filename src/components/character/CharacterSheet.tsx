import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectCompletedQuests } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { titleFromLevel } from '../../lib/xp';
import { CLASSES } from '../../lib/classes';
import { RARITY_CONFIG, CHEST_CONFIG, type EquipSlot, type ChestTier } from '../../lib/equipment';
import { computeHeroStats, BOSS_POWER_REQ } from '../../lib/stats';
import XPBar from './XPBar';
import AchievementsGrid from './AchievementsGrid';

const SLOT_LABELS: Record<EquipSlot, { label: string; empty: string }> = {
  weapon:    { label: 'ARME',       empty: '—' },
  armor:     { label: 'ARMURE',     empty: '—' },
  accessory: { label: 'ACCESSOIRE', empty: '—' },
};

export default function CharacterSheet() {
  const character       = useGameStore((s) => s.character);
  const inventory       = useGameStore((s) => s.inventory);
  const equipped        = useGameStore((s) => s.equipped);
  const chests          = useGameStore((s) => s.chests);
  const completedQuests = useGameStore(useShallow(selectCompletedQuests));
  const equipItem       = useGameStore((s) => s.equipItem);
  const unequipItem     = useGameStore((s) => s.unequipItem);
  const buyChest        = useGameStore((s) => s.buyChest);
  const openChest       = useGameStore((s) => s.openChest);

  const [invTab, setInvTab] = useState<'equipped' | 'bag' | 'chests'>('equipped');

  const cls   = character.heroClass ? CLASSES[character.heroClass] : null;
  const title = titleFromLevel(character.level);
  const stats = computeHeroStats(character.level, character.heroClass, inventory, equipped);

  const minBoss = Object.entries(BOSS_POWER_REQ).find(([, req]) => stats.power < req);

  return (
    <div className="px-3 pt-4 pb-4">

      {/* ── HERO CARD ── */}
      <div
        className="mb-4"
        style={{
          background: 'var(--bg-card)',
          border: `2px solid ${cls ? cls.color : 'var(--purple)'}`,
          boxShadow: '4px 4px 0 #000',
        }}
      >
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderBottom: '2px solid var(--border)',
          fontFamily: 'var(--font-pixel)', fontSize: '7px',
        }}>
          <span style={{ color: cls ? cls.colorLight : 'var(--purple-light)' }}>
            {cls ? `${cls.name} · ${cls.tagline}` : '▸ HÉROS'}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>LV.{String(character.level).padStart(2, '0')}</span>
        </div>

        {/* Hero visual + power rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '16px 12px 12px' }}>
          {/* Big sprite */}
          <div style={{
            width: 72, height: 72, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: cls ? `${cls.color}22` : 'var(--bg-surface)',
            border: `2px solid ${cls ? cls.color : 'var(--border-light)'}`,
            boxShadow: `4px 4px 0 #000`,
            fontSize: 40, lineHeight: 1, marginRight: 12,
          }}>
            {cls ? cls.icon : '🧙'}
          </div>

          {/* Name + XP */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', marginBottom: 3 }}>
              {title.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: 'var(--gold)', lineHeight: 1, marginBottom: 8 }}>
              LV <span style={{ color: '#fff' }}>{character.level}</span>
            </div>
            <XPBar current={character.xpIntoLevel} max={character.xpForLevel} color="var(--purple)" segments={14} showLabel />
          </div>

          {/* Power badge */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginLeft: 10, flexShrink: 0,
            padding: '8px 10px',
            background: 'var(--bg-deep)',
            border: `2px solid ${stats.power >= 1000 ? 'var(--gold)' : stats.power >= 400 ? 'var(--purple-light)' : stats.power >= 150 ? 'var(--blue)' : 'var(--border-light)'}`,
            boxShadow: '2px 2px 0 #000',
          }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 4 }}>PUISSANCE</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: stats.power >= 400 ? 'var(--gold)' : 'var(--purple-light)', lineHeight: 1 }}>
              {stats.power}
            </span>
            {minBoss && (
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--text-faint)', marginTop: 3, textAlign: 'center', lineHeight: 1.5 }}>
                requis:<br />{minBoss[1]} pour<br />{minBoss[0].replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Combat stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0, borderTop: '2px solid var(--border)',
        }}>
          {[
            { label: 'ATK',  value: stats.atk,                   color: 'var(--red)' },
            { label: 'PV',   value: stats.hp,                    color: 'var(--green)' },
            { label: 'DEF',  value: stats.def,                   color: 'var(--blue)' },
            { label: 'CRIT', value: `${stats.crit.toFixed(1)}%`, color: 'var(--gold)' },
            { label: 'PREC', value: `${stats.acc.toFixed(0)}%`,  color: 'var(--cyan)' },
            { label: 'MANA', value: stats.manaMax,                color: 'var(--purple-light)' },
            { label: 'REGEN',value: `${stats.manaRegen}/s`,       color: 'var(--purple-light)' },
            { label: 'GOLD', value: `${character.gold}G`,         color: 'var(--gold)' },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '8px 6px', textAlign: 'center',
                borderRight: i % 4 !== 3 ? '1px solid var(--border)' : 'none',
                borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVENTORY ── */}
      <div
        className="mb-4"
        style={{ background: 'var(--bg-card)', border: '2px solid var(--border-light)', boxShadow: '3px 3px 0 #000' }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
          {([['equipped', 'ÉQUIPÉ'], ['bag', `SAC (${inventory.length})`], ['chests', `COFFRES (${chests.length})`]] as const).map(([t, l]) => (
            <button key={t} onClick={() => setInvTab(t)} style={{
              flex: 1, padding: '8px 0',
              fontFamily: 'var(--font-pixel)', fontSize: '5px',
              background: invTab === t ? 'var(--purple-dim)' : 'transparent',
              borderRight: '1px solid var(--border)',
              color: invTab === t ? 'var(--purple-light)' : 'var(--text-faint)',
            }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: '10px 10px' }}>
          <AnimatePresence mode="wait">

            {/* EQUIPPED */}
            {invTab === 'equipped' && (
              <motion.div key="eq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(Object.keys(SLOT_LABELS) as EquipSlot[]).map((slot) => {
                    const cfg  = SLOT_LABELS[slot];
                    const iid  = equipped[slot];
                    const item = inventory.find((i) => i.instanceId === iid);
                    const rar  = item ? RARITY_CONFIG[item.rarity] : null;
                    return (
                      <div key={slot} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                        background: 'var(--bg-deep)',
                        border: `2px solid ${rar ? rar.color : 'var(--border)'}`,
                        boxShadow: rar ? `0 0 8px ${rar.glow}` : 'none',
                      }}>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', width: 52, flexShrink: 0 }}>{cfg.label}</div>
                        {item ? (
                          <>
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: rar!.color }}>{item.name}</div>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-dim)', marginTop: 2 }}>{item.description}</div>
                            </div>
                            <button onClick={() => unequipItem(slot)} style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', padding: '3px 6px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>✕</button>
                          </>
                        ) : (
                          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-faint)', fontStyle: 'italic' }}>— Vide —</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* BAG */}
            {invTab === 'bag' && (
              <motion.div key="bag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {inventory.length === 0 ? (
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', textAlign: 'center', padding: '16px 0', lineHeight: 2 }}>
                    SAC VIDE<br />
                    <span style={{ color: 'var(--text-dim)' }}>Ouvre des coffres pour obtenir de l'équipement</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {inventory.map((item) => {
                      const rar = RARITY_CONFIG[item.rarity];
                      const isEq = Object.values(equipped).includes(item.instanceId);
                      return (
                        <div key={item.instanceId} style={{
                          padding: '8px', background: isEq ? 'rgba(123,47,255,0.08)' : 'var(--bg-deep)',
                          border: `2px solid ${isEq ? 'var(--purple)' : rar.color}`,
                          boxShadow: `0 0 6px ${rar.glow}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <div>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: rar.color }}>{item.name}</div>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: rar.color, opacity: 0.7 }}>{rar.label}</div>
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-dim)', marginBottom: 6 }}>{item.description}</div>
                          {!isEq ? (
                            <button onClick={() => equipItem(item.instanceId)} style={{
                              width: '100%', fontFamily: 'var(--font-pixel)', fontSize: '5px',
                              padding: '4px 0', background: rar.color, border: '2px solid #000',
                              color: '#000', boxShadow: '2px 2px 0 #000',
                            }}>ÉQUIPER</button>
                          ) : (
                            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--purple-light)', textAlign: 'center' }}>ÉQUIPÉ ✓</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* CHESTS */}
            {invTab === 'chests' && (
              <motion.div key="chests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Buy */}
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 6 }}>▸ ACHETER</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
                  {(Object.entries(CHEST_CONFIG) as [ChestTier, typeof CHEST_CONFIG[ChestTier]][]).map(([tier, cfg]) => {
                    const can = character.gold >= cfg.cost;
                    return (
                      <motion.button key={tier} whileTap={can ? { scale: 0.93 } : {}} onClick={() => can && buyChest(tier)} style={{
                        padding: '8px 4px', textAlign: 'center',
                        background: can ? 'var(--bg-deep)' : 'var(--bg-surface)',
                        border: `2px solid ${can ? 'var(--border-light)' : 'var(--border)'}`,
                        boxShadow: can ? '2px 2px 0 #000' : 'none', opacity: can ? 1 : 0.5,
                      }}>
                        <div style={{ fontSize: 18, marginBottom: 2 }}>{cfg.icon}</div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--text-faint)', marginBottom: 2 }}>{cfg.label.replace('Coffre en ', '').replace('Coffre de ', '')}</div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--gold)' }}>{cfg.cost}G</div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Owned */}
                {chests.length === 0 ? (
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', textAlign: 'center', padding: '10px 0' }}>AUCUN COFFRE</div>
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 6 }}>▸ À OUVRIR ({chests.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {chests.map((c) => {
                        const cfg = CHEST_CONFIG[c.tier];
                        return (
                          <motion.button key={c.instanceId} whileTap={{ scale: 0.97 }} onClick={() => openChest(c.instanceId)} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                            background: 'var(--bg-deep)', border: '2px solid var(--gold)',
                            boxShadow: '3px 3px 0 #000, 0 0 10px rgba(255,215,0,0.2)', textAlign: 'left',
                          }}>
                            <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--gold)' }}>{cfg.label}</div>
                              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginTop: 2 }}>APPUYER POUR OUVRIR</div>
                            </div>
                            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'var(--gold)' }}>▶</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── ACHIEVEMENTS ── */}
      <AchievementsGrid />
    </div>
  );
}
