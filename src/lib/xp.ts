// XP weights per task difficulty
export const XP_WEIGHTS = {
  trivial: 10,
  easy: 25,
  medium: 50,
  hard: 75,
  boss: 100,
} as const;

export type Difficulty = keyof typeof XP_WEIGHTS;

// Gold is 20% of XP earned
export const xpToGold = (xp: number) => Math.floor(xp * 0.2);

/**
 * Logarithmic leveling curve.
 * XP required to reach level N from level N-1:
 *   threshold(n) = floor(100 * n * log2(n + 1))
 *
 * Level 2  ~  200 XP total
 * Level 10 ~  3,500 XP total
 * Level 25 ~  18,000 XP total
 * Level 50 ~  58,000 XP total
 */
export function xpForLevel(level: number): number {
  return Math.floor(100 * level * Math.log2(level + 1));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) total += xpForLevel(i);
  return total;
}

/** Given a cumulative XP amount, return the current level. */
export function levelFromXp(xp: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > xp) break;
    accumulated += needed;
    level++;
    if (level >= 100) break;
  }
  return level;
}

/** XP already collected inside the current level. */
export function xpIntoCurrentLevel(xp: number): number {
  const level = levelFromXp(xp);
  return xp - totalXpForLevel(level - 1);
}

/** Total XP needed to complete the current level. */
export function xpForCurrentLevel(xp: number): number {
  return xpForLevel(levelFromXp(xp));
}

// Title ladder
const TITLES = [
  { minLevel: 1, title: 'Novice Scribe' },
  { minLevel: 5, title: 'Apprentice Quester' },
  { minLevel: 10, title: 'Journeyman Adventurer' },
  { minLevel: 15, title: 'Skilled Ranger' },
  { minLevel: 20, title: 'Veteran Knight' },
  { minLevel: 30, title: 'Master Tactician' },
  { minLevel: 40, title: 'Grand Champion' },
  { minLevel: 50, title: 'Legendary Hero' },
];

export function titleFromLevel(level: number): string {
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (level >= TITLES[i].minLevel) return TITLES[i].title;
  }
  return 'Novice Scribe';
}
