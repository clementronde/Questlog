export type EquipRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipSlot   = 'weapon' | 'armor' | 'accessory';
export type ChestTier   = 'wood' | 'iron' | 'gold' | 'crystal';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: EquipRarity;
  icon: string;
  xpBonus: number;       // %
  goldBonus: number;     // %
  comboBonus: number;    // flat combo points
  streakShield: boolean;
  description: string;
}

// Instance stored in inventory (one item per drop)
export interface InventoryItem extends Equipment {
  instanceId: string;
}

// ── Rarity display ──────────────────────────────────────────────────────────

export const RARITY_CONFIG: Record<EquipRarity, { label: string; color: string; glow: string }> = {
  common:    { label: 'COMMON',    color: '#888',              glow: 'rgba(136,136,136,0.3)' },
  uncommon:  { label: 'UNCOMMON',  color: 'var(--green)',      glow: 'rgba(0,230,118,0.3)' },
  rare:      { label: 'RARE',      color: 'var(--blue)',       glow: 'rgba(64,156,255,0.3)' },
  epic:      { label: 'EPIC',      color: 'var(--purple-light)', glow: 'rgba(187,134,252,0.3)' },
  legendary: { label: 'LEGENDARY', color: 'var(--gold)',       glow: 'rgba(255,215,0,0.4)' },
};

// ── Item pool ───────────────────────────────────────────────────────────────

export const EQUIPMENT_POOL: Equipment[] = [
  // WEAPONS — XP bonus focus
  { id:'w_stick',      name:'Bâton de Novice',     slot:'weapon',    rarity:'common',    icon:'🪄', xpBonus:5,  goldBonus:0,  comboBonus:0,  streakShield:false, description:'+5% XP' },
  { id:'w_sword',      name:'Épée de Fer',          slot:'weapon',    rarity:'uncommon',  icon:'⚔️', xpBonus:12, goldBonus:0,  comboBonus:0,  streakShield:false, description:'+12% XP' },
  { id:'w_bow',        name:'Arc Elfique',          slot:'weapon',    rarity:'rare',      icon:'🏹', xpBonus:20, goldBonus:5,  comboBonus:0,  streakShield:false, description:'+20% XP, +5% Gold' },
  { id:'w_axe',        name:'Hache Runique',        slot:'weapon',    rarity:'epic',      icon:'🪓', xpBonus:32, goldBonus:0,  comboBonus:15, streakShield:false, description:'+32% XP, +15 Combo' },
  { id:'w_excalibur',  name:'Excalibur',            slot:'weapon',    rarity:'legendary', icon:'🗡️', xpBonus:55, goldBonus:0,  comboBonus:30, streakShield:false, description:'+55% XP, +30 Combo' },

  // ARMOR — Gold bonus focus
  { id:'a_rags',       name:'Haillons Usés',        slot:'armor',     rarity:'common',    icon:'👕', xpBonus:0,  goldBonus:6,  comboBonus:0,  streakShield:false, description:'+6% Gold' },
  { id:'a_leather',    name:'Armure de Cuir',       slot:'armor',     rarity:'uncommon',  icon:'🛡️', xpBonus:0,  goldBonus:14, comboBonus:0,  streakShield:false, description:'+14% Gold' },
  { id:'a_chainmail',  name:'Cotte de Mailles',     slot:'armor',     rarity:'rare',      icon:'⚙️', xpBonus:6,  goldBonus:22, comboBonus:0,  streakShield:false, description:'+22% Gold, +6% XP' },
  { id:'a_dragonscale',name:'Écailles de Dragon',   slot:'armor',     rarity:'epic',      icon:'🐉', xpBonus:12, goldBonus:38, comboBonus:0,  streakShield:true,  description:'+38% Gold, Bouclier Streak' },
  { id:'a_aegis',      name:'Aegis Éternel',        slot:'armor',     rarity:'legendary', icon:'🌟', xpBonus:18, goldBonus:55, comboBonus:0,  streakShield:true,  description:'+55% Gold, Bouclier Streak' },

  // ACCESSORIES — Combo/Streak focus
  { id:'c_ring',       name:'Anneau de Cuivre',     slot:'accessory', rarity:'common',    icon:'💍', xpBonus:0,  goldBonus:0,  comboBonus:6,  streakShield:false, description:'+6 Combo' },
  { id:'c_amulet',     name:'Amulette de Focalisation', slot:'accessory', rarity:'uncommon',  icon:'📿', xpBonus:6,  goldBonus:0,  comboBonus:12, streakShield:false, description:'+12 Combo, +6% XP' },
  { id:'c_orb',        name:'Orbe Mystique',        slot:'accessory', rarity:'rare',      icon:'🔮', xpBonus:10, goldBonus:10, comboBonus:22, streakShield:false, description:'+22 Combo, +10% tout' },
  { id:'c_crown',      name:'Couronne Combo',       slot:'accessory', rarity:'epic',      icon:'👑', xpBonus:15, goldBonus:15, comboBonus:40, streakShield:false, description:'+40 Combo, +15% tout' },
  { id:'c_heartstone', name:'Pierre de Cœur',       slot:'accessory', rarity:'legendary', icon:'💎', xpBonus:22, goldBonus:22, comboBonus:55, streakShield:true,  description:'+55 Combo, Bouclier Streak' },
];

// ── Chest config ────────────────────────────────────────────────────────────

export const CHEST_CONFIG: Record<ChestTier, {
  label: string; icon: string; cost: number;
  weights: Partial<Record<EquipRarity, number>>;
}> = {
  wood:    { label: 'Coffre en Bois',    icon: '📦', cost: 50,   weights: { common: 70, uncommon: 30 } },
  iron:    { label: 'Coffre en Fer',     icon: '🗃️', cost: 150,  weights: { common: 30, uncommon: 50, rare: 20 } },
  gold:    { label: 'Coffre en Or',      icon: '🏆', cost: 400,  weights: { uncommon: 20, rare: 55, epic: 25 } },
  crystal: { label: 'Coffre de Cristal', icon: '💎', cost: 1000, weights: { rare: 25, epic: 55, legendary: 20 } },
};

export function rollLoot(tier: ChestTier): InventoryItem {
  const { weights } = CHEST_CONFIG[tier];
  const total = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);
  let rand = Math.random() * total;
  let chosen: EquipRarity = 'common';
  for (const [r, w] of Object.entries(weights) as [EquipRarity, number][]) {
    rand -= w;
    if (rand <= 0) { chosen = r; break; }
  }
  const pool = EQUIPMENT_POOL.filter((e) => e.rarity === chosen);
  const base = pool[Math.floor(Math.random() * pool.length)];
  return { ...base, instanceId: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
}

export function getEquipBonuses(inventory: InventoryItem[], equipped: Partial<Record<EquipSlot, string>>) {
  let xpBonus = 0, goldBonus = 0, comboBonus = 0, streakShield = false;
  for (const slot of Object.keys(equipped) as EquipSlot[]) {
    const instanceId = equipped[slot];
    const item = inventory.find((i) => i.instanceId === instanceId);
    if (!item) continue;
    xpBonus    += item.xpBonus;
    goldBonus  += item.goldBonus;
    comboBonus += item.comboBonus;
    if (item.streakShield) streakShield = true;
  }
  return { xpBonus, goldBonus, comboBonus, streakShield };
}

// Quest drop chances
export const QUEST_DROP: Record<string, { chance: number; tier: ChestTier }[]> = {
  trivial: [{ chance: 0.02, tier: 'wood' }],
  easy:    [{ chance: 0.05, tier: 'wood' }],
  medium:  [{ chance: 0.08, tier: 'wood' }, { chance: 0.02, tier: 'iron' }],
  hard:    [{ chance: 0.10, tier: 'iron' }, { chance: 0.02, tier: 'gold' }],
  boss:    [{ chance: 0.15, tier: 'iron' }, { chance: 0.06, tier: 'gold' }, { chance: 0.01, tier: 'crystal' }],
};
