export type EquipRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
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

// ── Rarity display ───────────────────────────────────────────────────────────

export const RARITY_CONFIG: Record<EquipRarity, { label: string; color: string; glow: string }> = {
  common:    { label: 'COMMUN',     color: '#888888',             glow: 'rgba(136,136,136,0.25)' },
  rare:      { label: 'RARE',       color: 'var(--green)',        glow: 'rgba(0,230,118,0.35)'   },
  epic:      { label: 'ÉPIQUE',     color: 'var(--purple-light)', glow: 'rgba(187,134,252,0.45)' },
  legendary: { label: 'LÉGENDAIRE', color: 'var(--gold)',         glow: 'rgba(255,215,0,0.55)'   },
  mythic:    { label: 'MYTHIQUE',   color: 'var(--red)',          glow: 'rgba(255,68,68,0.65)'   },
};

// ── Item pool (50 items) ─────────────────────────────────────────────────────

export const EQUIPMENT_POOL: Equipment[] = [
  // ── WEAPONS ─────────────────────────────────────────────────────────────────
  // Common (4)
  { id:'w_stick',         name:'Bâton de Novice',          slot:'weapon',    rarity:'common',    icon:'🪄', xpBonus:5,   goldBonus:0,  comboBonus:0,  streakShield:false, description:'+5% XP' },
  { id:'w_rusty_dagger',  name:'Dague Rouillée',           slot:'weapon',    rarity:'common',    icon:'🗡️', xpBonus:0,   goldBonus:7,  comboBonus:0,  streakShield:false, description:'+7% Gold' },
  { id:'w_wood_spear',    name:'Lance de Bois',            slot:'weapon',    rarity:'common',    icon:'🏹', xpBonus:4,   goldBonus:3,  comboBonus:0,  streakShield:false, description:'+4% XP, +3% Gold' },
  { id:'w_sling',         name:'Fronde du Berger',         slot:'weapon',    rarity:'common',    icon:'🪃', xpBonus:0,   goldBonus:0,  comboBonus:6,  streakShield:false, description:'+6 Combo' },
  // Rare (5)
  { id:'w_iron_sword',    name:'Épée de Fer',              slot:'weapon',    rarity:'rare',      icon:'⚔️', xpBonus:12,  goldBonus:0,  comboBonus:0,  streakShield:false, description:'+12% XP' },
  { id:'w_elven_bow',     name:'Arc Elfique',              slot:'weapon',    rarity:'rare',      icon:'🏹', xpBonus:15,  goldBonus:5,  comboBonus:0,  streakShield:false, description:'+15% XP, +5% Gold' },
  { id:'w_trident',       name:'Trident des Mers',         slot:'weapon',    rarity:'rare',      icon:'🔱', xpBonus:0,   goldBonus:12, comboBonus:8,  streakShield:false, description:'+12% Gold, +8 Combo' },
  { id:'w_scythe',        name:'Faucille des Moissons',    slot:'weapon',    rarity:'rare',      icon:'⚔️', xpBonus:18,  goldBonus:0,  comboBonus:0,  streakShield:false, description:'+18% XP' },
  { id:'w_war_hammer',    name:'Marteau de Guerre',        slot:'weapon',    rarity:'rare',      icon:'🔨', xpBonus:8,   goldBonus:10, comboBonus:6,  streakShield:false, description:'+8% XP, +10% Gold, +6 Combo' },
  // Epic (4)
  { id:'w_runic_axe',     name:'Hache Runique',            slot:'weapon',    rarity:'epic',      icon:'🪓', xpBonus:32,  goldBonus:0,  comboBonus:15, streakShield:false, description:'+32% XP, +15 Combo' },
  { id:'w_storm_staff',   name:'Bâton des Tempêtes',       slot:'weapon',    rarity:'epic',      icon:'⚡', xpBonus:28,  goldBonus:8,  comboBonus:12, streakShield:false, description:'+28% XP, +8% Gold, +12 Combo' },
  { id:'w_void_blade',    name:'Lame du Vide',             slot:'weapon',    rarity:'epic',      icon:'🌑', xpBonus:35,  goldBonus:0,  comboBonus:0,  streakShield:true,  description:'+35% XP, Bouclier Streak' },
  { id:'w_necro_glaive',  name:'Glaive Nécrotique',        slot:'weapon',    rarity:'epic',      icon:'💀', xpBonus:20,  goldBonus:25, comboBonus:0,  streakShield:false, description:'+20% XP, +25% Gold' },
  // Legendary (3)
  { id:'w_excalibur',     name:'Excalibur',                slot:'weapon',    rarity:'legendary', icon:'🗡️', xpBonus:55,  goldBonus:0,  comboBonus:30, streakShield:false, description:'+55% XP, +30 Combo' },
  { id:'w_thunder_spear', name:'Lance de la Foudre',       slot:'weapon',    rarity:'legendary', icon:'⚡', xpBonus:48,  goldBonus:0,  comboBonus:20, streakShield:true,  description:'+48% XP, +20 Combo, Bouclier' },
  { id:'w_mjolnir',       name:'Mjölnir Légendaire',       slot:'weapon',    rarity:'legendary', icon:'🔨', xpBonus:40,  goldBonus:35, comboBonus:0,  streakShield:false, description:'+40% XP, +35% Gold' },
  // Mythic (1)
  { id:'w_dawn_blade',    name:"Lame de l'Aube Éternelle", slot:'weapon',    rarity:'mythic',    icon:'☀️', xpBonus:100, goldBonus:20, comboBonus:50, streakShield:true,  description:'+100% XP, +20% Gold, +50 Combo, Bouclier' },

  // ── ARMORS ──────────────────────────────────────────────────────────────────
  // Common (5)
  { id:'a_rags',          name:'Haillons Usés',            slot:'armor',     rarity:'common',    icon:'👕', xpBonus:0,   goldBonus:6,  comboBonus:0,  streakShield:false, description:'+6% Gold' },
  { id:'a_linen_tunic',   name:'Tunique de Lin',           slot:'armor',     rarity:'common',    icon:'🧥', xpBonus:0,   goldBonus:8,  comboBonus:0,  streakShield:false, description:'+8% Gold' },
  { id:'a_wood_shield',   name:'Bouclier de Bois',         slot:'armor',     rarity:'common',    icon:'🛡️', xpBonus:5,   goldBonus:0,  comboBonus:0,  streakShield:false, description:'+5% XP' },
  { id:'a_travel_cloak',  name:'Cape de Voyage',           slot:'armor',     rarity:'common',    icon:'🧣', xpBonus:3,   goldBonus:4,  comboBonus:3,  streakShield:false, description:'+3% XP, +4% Gold, +3 Combo' },
  { id:'a_peasant_vest',  name:'Vêtement de Paysan',       slot:'armor',     rarity:'common',    icon:'👘', xpBonus:0,   goldBonus:5,  comboBonus:4,  streakShield:false, description:'+5% Gold, +4 Combo' },
  // Rare (5)
  { id:'a_leather',       name:'Armure de Cuir',           slot:'armor',     rarity:'rare',      icon:'🥋', xpBonus:0,   goldBonus:14, comboBonus:0,  streakShield:false, description:'+14% Gold' },
  { id:'a_chainmail',     name:'Cotte de Mailles',         slot:'armor',     rarity:'rare',      icon:'⚙️', xpBonus:6,   goldBonus:22, comboBonus:0,  streakShield:false, description:'+22% Gold, +6% XP' },
  { id:'a_scout_vest',    name:"Veste de l'Éclaireur",     slot:'armor',     rarity:'rare',      icon:'🦺', xpBonus:10,  goldBonus:16, comboBonus:8,  streakShield:false, description:'+10% XP, +16% Gold, +8 Combo' },
  { id:'a_iron_plate',    name:'Plastron de Fer',          slot:'armor',     rarity:'rare',      icon:'🛡️', xpBonus:12,  goldBonus:10, comboBonus:0,  streakShield:false, description:'+12% XP, +10% Gold' },
  { id:'a_wolf_pelt',     name:'Pelisse de Loup',          slot:'armor',     rarity:'rare',      icon:'🐺', xpBonus:8,   goldBonus:18, comboBonus:6,  streakShield:false, description:'+8% XP, +18% Gold, +6 Combo' },
  // Epic (4)
  { id:'a_dragonscale',   name:'Écailles de Dragon',       slot:'armor',     rarity:'epic',      icon:'🐉', xpBonus:12,  goldBonus:38, comboBonus:0,  streakShield:true,  description:'+38% Gold, +12% XP, Bouclier' },
  { id:'a_shadow_cloak',  name:'Cape des Ombres',          slot:'armor',     rarity:'epic',      icon:'🌑', xpBonus:0,   goldBonus:30, comboBonus:20, streakShield:false, description:'+30% Gold, +20 Combo' },
  { id:'a_runic_plate',   name:'Cuirasse Runique',         slot:'armor',     rarity:'epic',      icon:'🔰', xpBonus:25,  goldBonus:18, comboBonus:0,  streakShield:false, description:'+25% XP, +18% Gold' },
  { id:'a_spectral_robe', name:'Robe Spectrale',           slot:'armor',     rarity:'epic',      icon:'👻', xpBonus:18,  goldBonus:12, comboBonus:25, streakShield:false, description:'+18% XP, +12% Gold, +25 Combo' },
  // Legendary (2)
  { id:'a_aegis',         name:'Aegis Éternel',            slot:'armor',     rarity:'legendary', icon:'🌟', xpBonus:18,  goldBonus:55, comboBonus:0,  streakShield:true,  description:'+55% Gold, +18% XP, Bouclier' },
  { id:'a_celestial',     name:'Armure Céleste',           slot:'armor',     rarity:'legendary', icon:'✨', xpBonus:40,  goldBonus:40, comboBonus:0,  streakShield:true,  description:'+40% XP, +40% Gold, Bouclier' },
  // Mythic (1)
  { id:'a_cosmos',        name:'Manteau du Cosmos',        slot:'armor',     rarity:'mythic',    icon:'🌌', xpBonus:40,  goldBonus:80, comboBonus:0,  streakShield:true,  description:'+80% Gold, +40% XP, Bouclier Streak' },

  // ── ACCESSORIES ─────────────────────────────────────────────────────────────
  // Common (4)
  { id:'c_ring_copper',   name:'Anneau de Cuivre',         slot:'accessory', rarity:'common',    icon:'💍', xpBonus:0,   goldBonus:0,  comboBonus:6,  streakShield:false, description:'+6 Combo' },
  { id:'c_feather',       name:'Plume Porte-Bonheur',      slot:'accessory', rarity:'common',    icon:'🪶', xpBonus:5,   goldBonus:0,  comboBonus:0,  streakShield:false, description:'+5% XP' },
  { id:'c_token',         name:'Jeton du Voyageur',        slot:'accessory', rarity:'common',    icon:'🪙', xpBonus:0,   goldBonus:5,  comboBonus:0,  streakShield:false, description:'+5% Gold' },
  { id:'c_bandana',       name:'Bandana du Guerrier',      slot:'accessory', rarity:'common',    icon:'🎀', xpBonus:3,   goldBonus:0,  comboBonus:4,  streakShield:false, description:'+3% XP, +4 Combo' },
  // Rare (5)
  { id:'c_amulet',        name:'Amulette de Focalisation', slot:'accessory', rarity:'rare',      icon:'📿', xpBonus:6,   goldBonus:0,  comboBonus:12, streakShield:false, description:'+12 Combo, +6% XP' },
  { id:'c_orb',           name:'Orbe Mystique',            slot:'accessory', rarity:'rare',      icon:'🔮', xpBonus:10,  goldBonus:10, comboBonus:22, streakShield:false, description:'+22 Combo, +10% XP & Gold' },
  { id:'c_lucky_charm',   name:'Charme de la Chance',      slot:'accessory', rarity:'rare',      icon:'🍀', xpBonus:8,   goldBonus:8,  comboBonus:0,  streakShield:false, description:'+8% XP, +8% Gold' },
  { id:'c_compass',       name:'Boussole des Anciens',     slot:'accessory', rarity:'rare',      icon:'🧭', xpBonus:10,  goldBonus:0,  comboBonus:15, streakShield:false, description:'+15 Combo, +10% XP' },
  { id:'c_hourglass',     name:'Sablier Temporel',         slot:'accessory', rarity:'rare',      icon:'⏳', xpBonus:0,   goldBonus:8,  comboBonus:18, streakShield:false, description:'+18 Combo, +8% Gold' },
  // Epic (5)
  { id:'c_crown',         name:'Couronne du Combo',        slot:'accessory', rarity:'epic',      icon:'👑', xpBonus:15,  goldBonus:15, comboBonus:40, streakShield:false, description:'+40 Combo, +15% XP & Gold' },
  { id:'c_phoenix_tear',  name:'Larme de Phénix',          slot:'accessory', rarity:'epic',      icon:'🔥', xpBonus:0,   goldBonus:0,  comboBonus:35, streakShield:true,  description:'+35 Combo, Bouclier Streak' },
  { id:'c_star_fragment', name:"Fragment d'Étoile",        slot:'accessory', rarity:'epic',      icon:'⭐', xpBonus:28,  goldBonus:0,  comboBonus:20, streakShield:false, description:'+28% XP, +20 Combo' },
  { id:'c_cursed_eye',    name:'Œil Maudit',               slot:'accessory', rarity:'epic',      icon:'👁️', xpBonus:0,   goldBonus:18, comboBonus:32, streakShield:false, description:'+32 Combo, +18% Gold' },
  { id:'c_dragon_eye',    name:'Œil de Dragon',            slot:'accessory', rarity:'epic',      icon:'🐲', xpBonus:22,  goldBonus:10, comboBonus:30, streakShield:false, description:'+22% XP, +10% Gold, +30 Combo' },
  // Legendary (2)
  { id:'c_heartstone',    name:'Pierre de Cœur',           slot:'accessory', rarity:'legendary', icon:'💎', xpBonus:22,  goldBonus:22, comboBonus:55, streakShield:true,  description:'+55 Combo, +22% XP & Gold, Bouclier' },
  { id:'c_infinity_ring', name:"Anneau de l'Infini",        slot:'accessory', rarity:'legendary', icon:'♾️', xpBonus:45,  goldBonus:0,  comboBonus:45, streakShield:false, description:'+45% XP, +45 Combo' },
];

// ── Chest config ─────────────────────────────────────────────────────────────

export const CHEST_CONFIG: Record<ChestTier, {
  label: string; icon: string; cost: number;
  weights: Partial<Record<EquipRarity, number>>;
}> = {
  wood:    { label: 'Coffre en Bois',    icon: '📦', cost: 50,   weights: { common: 85, rare: 15 } },
  iron:    { label: 'Coffre en Fer',     icon: '🗃️', cost: 150,  weights: { common: 35, rare: 50, epic: 15 } },
  gold:    { label: 'Coffre en Or',      icon: '🏆', cost: 400,  weights: { rare: 28, epic: 55, legendary: 16, mythic: 1 } },
  crystal: { label: 'Coffre de Cristal', icon: '💎', cost: 1000, weights: { epic: 30, legendary: 55, mythic: 15 } },
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
