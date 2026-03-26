import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { RARITY_CONFIG, CHEST_CONFIG, type EquipSlot, type ChestTier } from '../../lib/equipment';

const SLOT_LABELS: Record<EquipSlot, { label: string; icon: string }> = {
  weapon:    { label: 'ARME',      icon: '⚔️' },
  armor:     { label: 'ARMURE',    icon: '🛡️' },
  accessory: { label: 'ACCESSOIRE',icon: '💍' },
};

export default function EquipmentPanel() {
  const inventory   = useGameStore((s) => s.inventory);
  const equipped    = useGameStore((s) => s.equipped);
  const chests      = useGameStore((s) => s.chests);
  const character   = useGameStore((s) => s.character);
  const equipItem   = useGameStore((s) => s.equipItem);
  const unequipItem = useGameStore((s) => s.unequipItem);
  const buyChest    = useGameStore((s) => s.buyChest);
  const openChest   = useGameStore((s) => s.openChest);

  const [tab, setTab] = useState<'equipped' | 'inventory' | 'chests'>('equipped');

  const equippedItems = (Object.entries(equipped) as [EquipSlot, string][]).map(([slot, iid]) => ({
    slot,
    item: inventory.find((i) => i.instanceId === iid),
  }));

  return (
    <div
      className="mb-4 p-3"
      style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-light)',
        boxShadow: '3px 3px 0 #000',
      }}
    >
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 10 }}>
        ▸ ÉQUIPEMENT
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(['equipped', 'inventory', 'chests'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              fontFamily: 'var(--font-pixel)', fontSize: '5px',
              padding: '5px 0',
              background: tab === t ? 'var(--purple-dim)' : 'var(--bg-deep)',
              border: `2px solid ${tab === t ? 'var(--purple)' : 'var(--border)'}`,
              color: tab === t ? 'var(--purple-light)' : 'var(--text-faint)',
            }}
          >
            {t === 'equipped' ? `ÉQUIPÉ` : t === 'inventory' ? `INVENTAIRE (${inventory.length})` : `COFFRES (${chests.length})`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── EQUIPPED ── */}
        {tab === 'equipped' && (
          <motion.div key="equipped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col gap-2">
              {(Object.keys(SLOT_LABELS) as EquipSlot[]).map((slot) => {
                const cfg  = SLOT_LABELS[slot];
                const iid  = equipped[slot];
                const item = inventory.find((i) => i.instanceId === iid);
                const rar  = item ? RARITY_CONFIG[item.rarity] : null;
                return (
                  <div
                    key={slot}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px',
                      background: 'var(--bg-deep)',
                      border: `2px solid ${rar ? rar.color : 'var(--border)'}`,
                      boxShadow: rar ? `2px 2px 0 #000, 0 0 8px ${rar.glow}` : '2px 2px 0 #000',
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{cfg.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginBottom: 3 }}>
                        {cfg.label}
                      </div>
                      {item ? (
                        <>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: rar!.color }}>{item.name}</div>
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-dim)', marginTop: 2 }}>{item.description}</div>
                        </>
                      ) : (
                        <div style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-faint)', fontStyle: 'italic' }}>— Vide —</div>
                      )}
                    </div>
                    {item && (
                      <button
                        onClick={() => unequipItem(slot)}
                        style={{
                          fontFamily: 'var(--font-pixel)', fontSize: '5px',
                          color: 'var(--text-faint)', padding: '3px 5px',
                          background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── INVENTORY ── */}
        {tab === 'inventory' && (
          <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {inventory.length === 0 ? (
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', textAlign: 'center', padding: '16px 0' }}>
                INVENTAIRE VIDE<br />
                <span style={{ color: 'var(--text-dim)' }}>Ouvre des coffres pour obtenir de l'équipement</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {inventory.map((item) => {
                  const rar = RARITY_CONFIG[item.rarity];
                  const isEquipped = Object.values(equipped).includes(item.instanceId);
                  return (
                    <div
                      key={item.instanceId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px',
                        background: isEquipped ? 'rgba(123,47,255,0.08)' : 'var(--bg-deep)',
                        border: `2px solid ${isEquipped ? 'var(--purple)' : rar.color}`,
                        boxShadow: `0 0 6px ${rar.glow}`,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: rar.color }}>{item.name}</span>
                          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: rar.color, opacity: 0.7 }}>{rar.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-dim)' }}>{item.description}</div>
                      </div>
                      {!isEquipped ? (
                        <button
                          onClick={() => equipItem(item.instanceId)}
                          style={{
                            fontFamily: 'var(--font-pixel)', fontSize: '5px',
                            color: '#000', padding: '4px 8px',
                            background: rar.color, border: '2px solid #000',
                            boxShadow: '2px 2px 0 #000', flexShrink: 0,
                          }}
                        >
                          ÉQUIPER
                        </button>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--purple-light)' }}>ÉQUIPÉ</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── CHESTS ── */}
        {tab === 'chests' && (
          <motion.div key="chests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Buy section */}
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', marginBottom: 8 }}>
              ▸ ACHETER UN COFFRE
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.entries(CHEST_CONFIG) as [ChestTier, typeof CHEST_CONFIG[ChestTier]][]).map(([tier, cfg]) => {
                const canAfford = character.gold >= cfg.cost;
                return (
                  <motion.button
                    key={tier}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    onClick={() => canAfford && buyChest(tier)}
                    style={{
                      padding: '8px 6px',
                      background: canAfford ? 'var(--bg-deep)' : 'var(--bg-surface)',
                      border: `2px solid ${canAfford ? 'var(--border-light)' : 'var(--border)'}`,
                      boxShadow: canAfford ? '2px 2px 0 #000' : 'none',
                      opacity: canAfford ? 1 : 0.5,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{cfg.icon}</div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-dim)', marginBottom: 3 }}>{cfg.label}</div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--gold)' }}>{cfg.cost} G</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Inventory chests */}
            {chests.length === 0 ? (
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>
                AUCUN COFFRE<br />
                <span style={{ color: 'var(--text-dim)' }}>Complète des quêtes ou achètes-en un</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', marginBottom: 4 }}>
                  ▸ COFFRES À OUVRIR ({chests.length})
                </div>
                {chests.map((chest) => {
                  const cfg = CHEST_CONFIG[chest.tier];
                  return (
                    <motion.button
                      key={chest.instanceId}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openChest(chest.instanceId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px',
                        background: 'var(--bg-deep)',
                        border: '2px solid var(--gold)',
                        boxShadow: '3px 3px 0 #000, 0 0 10px rgba(255,215,0,0.2)',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--gold)' }}>{cfg.label}</div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)', marginTop: 3 }}>APPUYER POUR OUVRIR</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--gold)' }}>▶</div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
