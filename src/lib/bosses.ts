import type { ChestTier } from './equipment';

export interface BossDef {
  id: string;
  name: string;
  title: string;
  icon: string;
  rank: string;
  rankColor: string;
  maxHp: number;
  ticketCost: number;  // gold to engage
  reward: { xp: number; gold: number; chest: ChestTier };
  description: string;
}

export interface BossState extends BossDef {
  currentHp: number;
  isEngaged: boolean;   // player bought ticket
  isDefeated: boolean;
  defeatedAt?: string;
}

export const BOSS_POOL: BossDef[] = [
  {
    id: 'slime_king',
    name: 'ROI SLIME',
    title: 'Seigneur des Marécages',
    icon: '🟢',
    rank: 'C',
    rankColor: 'var(--blue)',
    maxHp: 500,
    ticketCost: 50,
    reward: { xp: 200, gold: 150, chest: 'iron' },
    description: 'Un amas de gelée visqueuse. Facile à battre, mais il y en a beaucoup...',
  },
  {
    id: 'shadow_knight',
    name: 'CHEVALIER OMBRE',
    title: 'Gardien des Catacombes',
    icon: '🗡️',
    rank: 'B',
    rankColor: 'var(--orange)',
    maxHp: 1200,
    ticketCost: 150,
    reward: { xp: 600, gold: 400, chest: 'gold' },
    description: 'Un guerrier maudit qui ne peut jamais mourir... jusqu\'à aujourd\'hui.',
  },
  {
    id: 'dragon_elder',
    name: 'DRAGON ANCIEN',
    title: 'Terreur des Cieux',
    icon: '🐉',
    rank: 'A',
    rankColor: 'var(--red)',
    maxHp: 3000,
    ticketCost: 400,
    reward: { xp: 2000, gold: 1200, chest: 'crystal' },
    description: 'Il a vu des millénaires. Seul un héros légendaire peut l\'abattre.',
  },
  {
    id: 'void_emperor',
    name: 'EMPEREUR DU VIDE',
    title: 'Dieu de la Destruction',
    icon: '💀',
    rank: 'S',
    rankColor: 'var(--purple-light)',
    maxHp: 8000,
    ticketCost: 1000,
    reward: { xp: 6000, gold: 3500, chest: 'crystal' },
    description: 'L\'entité primordiale du néant. Peu l\'ont affronté. Aucun n\'a survécu... jusqu\'ici.',
  },
];

export function createInitialBosses(): BossState[] {
  // Start with first 2 bosses available
  return BOSS_POOL.slice(0, 2).map((def) => ({
    ...def,
    currentHp: def.maxHp,
    isEngaged: false,
    isDefeated: false,
  }));
}

/** Returns the next boss to unlock after defeating all current ones */
export function getNextBoss(defeated: string[]): BossDef | null {
  return BOSS_POOL.find((b) => !defeated.includes(b.id)) ?? null;
}
