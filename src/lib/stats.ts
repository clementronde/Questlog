import type { HeroClass } from './classes';
import type { InventoryItem, EquipSlot } from './equipment';

export interface HeroStats {
  atk:       number;   // attack damage
  hp:        number;   // max health
  def:       number;   // damage reduction (flat)
  acc:       number;   // accuracy % (0-100)
  crit:      number;   // crit rate % (0-100)
  critDmg:   number;   // crit damage multiplier (e.g. 1.5)
  manaMax:   number;
  manaRegen: number;   // per second
  power:     number;   // overall power rating
}

// ── Base stats per level ────────────────────────────────────────────────────

function base(level: number): Omit<HeroStats, 'power'> {
  return {
    atk:       Math.round(10 + level * 5.5),
    hp:        Math.round(100 + level * 16),
    def:       Math.round(5 + level * 2),
    acc:       Math.min(95, 70 + level * 0.5),
    crit:      Math.min(40, 4 + level * 0.3),
    critDmg:   Math.min(2.5, 1.5 + level * 0.015),
    manaMax:   Math.round(80 + level * 4),
    manaRegen: Math.round((3 + level * 0.15) * 10) / 10,
  };
}

// ── Class multipliers ────────────────────────────────────────────────────────

const CLASS_MULTS: Record<HeroClass, (s: Omit<HeroStats, 'power'>) => Omit<HeroStats, 'power'>> = {
  warrior: (s) => ({ ...s, atk: Math.round(s.atk * 1.35), hp: Math.round(s.hp * 1.20), def: Math.round(s.def * 1.20) }),
  mage:    (s) => ({ ...s, atk: Math.round(s.atk * 1.10), manaMax: Math.round(s.manaMax * 1.5), manaRegen: Math.round(s.manaRegen * 1.8 * 10) / 10, crit: Math.min(40, s.crit * 1.25) }),
  rogue:   (s) => ({ ...s, atk: Math.round(s.atk * 1.25), acc: Math.min(95, s.acc + 12), crit: Math.min(40, s.crit * 1.40), critDmg: Math.min(2.8, s.critDmg * 1.3) }),
  paladin: (s) => ({ ...s, hp: Math.round(s.hp * 1.30), def: Math.round(s.def * 1.30), acc: Math.min(95, s.acc + 8), atk: Math.round(s.atk * 1.10) }),
};

// ── Equipment contribution ────────────────────────────────────────────────────

function applyEquipment(
  s: Omit<HeroStats, 'power'>,
  inventory: InventoryItem[],
  equipped: Partial<Record<EquipSlot, string>>,
): Omit<HeroStats, 'power'> {
  let atkBonus = 0, defBonus = 0, critBonus = 0, hpBonus = 0;
  for (const slot of Object.keys(equipped) as EquipSlot[]) {
    const item = inventory.find((i) => i.instanceId === equipped[slot]);
    if (!item) continue;
    atkBonus  += Math.round(item.xpBonus    * 0.4);
    defBonus  += Math.round(item.goldBonus  * 0.3);
    critBonus += item.comboBonus * 0.15;
    if (item.streakShield) hpBonus += 60;
  }
  return {
    ...s,
    atk:  s.atk  + atkBonus,
    def:  s.def  + defBonus,
    crit: Math.min(40, s.crit + critBonus),
    hp:   s.hp   + hpBonus,
  };
}

// ── Power rating ────────────────────────────────────────────────────────────

function calcPower(s: Omit<HeroStats, 'power'>): number {
  return Math.floor(s.atk * 3 + s.hp * 0.2 + s.def * 4 + s.acc + s.crit * 2 + s.critDmg * 20);
}

// ── Public API ──────────────────────────────────────────────────────────────

export function computeHeroStats(
  level: number,
  heroClass: HeroClass | null,
  inventory: InventoryItem[],
  equipped: Partial<Record<EquipSlot, string>>,
): HeroStats {
  let s = base(level);
  if (heroClass) s = CLASS_MULTS[heroClass](s);
  s = applyEquipment(s, inventory, equipped);
  return { ...s, power: calcPower(s) };
}

// Boss recommended power
export const BOSS_POWER_REQ: Record<string, number> = {
  slime_king:   80,
  shadow_knight: 200,
  dragon_elder:  500,
  void_emperor:  1200,
};
