export type SkillPath = 'xp' | 'gold' | 'combo';

export interface SkillDef {
  id: string;
  path: SkillPath;
  tier: 1 | 2 | 3 | 4;
  name: string;
  icon: string;
  cost: number;          // skill points required
  requires?: string;     // id of prerequisite skill
  xpBonus: number;       // %
  goldBonus: number;     // %
  comboBonus: number;    // flat pts
  streakShield: boolean;
  description: string;
}

export const SKILL_TREE: SkillDef[] = [
  // ── XP PATH ─────────────────────────────────────────────────────────────────
  {
    id: 'xp1', path: 'xp', tier: 1, cost: 1, requires: undefined,
    name: 'Apprentissage', icon: '📖',
    xpBonus: 8,  goldBonus: 0, comboBonus: 0, streakShield: false,
    description: '+8% XP sur toutes les quêtes',
  },
  {
    id: 'xp2', path: 'xp', tier: 2, cost: 2, requires: 'xp1',
    name: 'Sagesse', icon: '🧠',
    xpBonus: 18, goldBonus: 0, comboBonus: 0, streakShield: false,
    description: '+18% XP (cumulable)',
  },
  {
    id: 'xp3', path: 'xp', tier: 3, cost: 3, requires: 'xp2',
    name: 'Illumination', icon: '✨',
    xpBonus: 32, goldBonus: 0, comboBonus: 0, streakShield: false,
    description: '+32% XP (cumulable)',
  },
  {
    id: 'xp4', path: 'xp', tier: 4, cost: 5, requires: 'xp3',
    name: 'Omniscience', icon: '🌟',
    xpBonus: 55, goldBonus: 0, comboBonus: 0, streakShield: false,
    description: '+55% XP — ULTIME',
  },

  // ── GOLD PATH ────────────────────────────────────────────────────────────────
  {
    id: 'gold1', path: 'gold', tier: 1, cost: 1, requires: undefined,
    name: 'Commerce', icon: '🪙',
    xpBonus: 0, goldBonus: 8, comboBonus: 0, streakShield: false,
    description: '+8% Gold sur toutes les quêtes',
  },
  {
    id: 'gold2', path: 'gold', tier: 2, cost: 2, requires: 'gold1',
    name: 'Négoce', icon: '💰',
    xpBonus: 0, goldBonus: 18, comboBonus: 0, streakShield: false,
    description: '+18% Gold (cumulable)',
  },
  {
    id: 'gold3', path: 'gold', tier: 3, cost: 3, requires: 'gold2',
    name: 'Fortune', icon: '🏆',
    xpBonus: 0, goldBonus: 32, comboBonus: 0, streakShield: false,
    description: '+32% Gold (cumulable)',
  },
  {
    id: 'gold4', path: 'gold', tier: 4, cost: 5, requires: 'gold3',
    name: 'Richesse Infinie', icon: '👑',
    xpBonus: 0, goldBonus: 55, comboBonus: 0, streakShield: false,
    description: '+55% Gold — ULTIME',
  },

  // ── COMBO PATH ───────────────────────────────────────────────────────────────
  {
    id: 'combo1', path: 'combo', tier: 1, cost: 1, requires: undefined,
    name: 'Focus', icon: '⚡',
    xpBonus: 0, goldBonus: 0, comboBonus: 8, streakShield: false,
    description: '+8 points de Combo',
  },
  {
    id: 'combo2', path: 'combo', tier: 2, cost: 2, requires: 'combo1',
    name: 'Maîtrise', icon: '🌀',
    xpBonus: 0, goldBonus: 0, comboBonus: 20, streakShield: false,
    description: '+20 points de Combo (cumulable)',
  },
  {
    id: 'combo3', path: 'combo', tier: 3, cost: 3, requires: 'combo2',
    name: 'Transcendance', icon: '💫',
    xpBonus: 0, goldBonus: 0, comboBonus: 35, streakShield: false,
    description: '+35 Combo + résistance streak',
  },
  {
    id: 'combo4', path: 'combo', tier: 4, cost: 5, requires: 'combo3',
    name: 'Légende', icon: '🔥',
    xpBonus: 0, goldBonus: 0, comboBonus: 55, streakShield: true,
    description: '+55 Combo + Bouclier Streak permanent — ULTIME',
  },
];

export const SKILL_MAP = Object.fromEntries(SKILL_TREE.map((s) => [s.id, s]));

export const PATH_CONFIG: Record<SkillPath, { label: string; color: string }> = {
  xp:    { label: 'SAGESSE',  color: 'var(--purple-light)' },
  gold:  { label: 'FORTUNE',  color: 'var(--gold)'         },
  combo: { label: 'MAÎTRISE', color: 'var(--blue)'         },
};

export interface SkillBonuses {
  xpBonus: number;
  goldBonus: number;
  comboBonus: number;
  streakShield: boolean;
}

export function getSkillBonuses(unlockedSkills: string[]): SkillBonuses {
  let xpBonus = 0, goldBonus = 0, comboBonus = 0, streakShield = false;
  for (const id of unlockedSkills) {
    const s = SKILL_MAP[id];
    if (!s) continue;
    xpBonus    += s.xpBonus;
    goldBonus  += s.goldBonus;
    comboBonus += s.comboBonus;
    if (s.streakShield) streakShield = true;
  }
  return { xpBonus, goldBonus, comboBonus, streakShield };
}
