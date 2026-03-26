import type { GameState } from '../store/useGameStore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'quests' | 'streaks' | 'levels' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number; // XP awarded on unlock
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Quests ──────────────────────────────────────────────────────────────────
  {
    id: 'first_quest',
    title: 'First Blood',
    description: 'Complete your very first quest.',
    icon: '⚔️',
    category: 'quests',
    rarity: 'common',
    xpBonus: 20,
  },
  {
    id: 'quests_5',
    title: 'Getting Started',
    description: 'Complete 5 quests.',
    icon: '📜',
    category: 'quests',
    rarity: 'common',
    xpBonus: 50,
  },
  {
    id: 'quests_25',
    title: 'Quest Hunter',
    description: 'Complete 25 quests.',
    icon: '🏹',
    category: 'quests',
    rarity: 'rare',
    xpBonus: 150,
  },
  {
    id: 'quests_100',
    title: 'Century Mark',
    description: 'Complete 100 quests.',
    icon: '💯',
    category: 'quests',
    rarity: 'epic',
    xpBonus: 500,
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Complete a Boss-tier quest.',
    icon: '🐉',
    category: 'quests',
    rarity: 'rare',
    xpBonus: 100,
  },
  // ── Streaks ─────────────────────────────────────────────────────────────────
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Maintain a 3-day streak.',
    icon: '🔥',
    category: 'streaks',
    rarity: 'common',
    xpBonus: 75,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak.',
    icon: '🗓️',
    category: 'streaks',
    rarity: 'rare',
    xpBonus: 200,
  },
  {
    id: 'streak_14',
    title: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak.',
    icon: '⚡',
    category: 'streaks',
    rarity: 'epic',
    xpBonus: 500,
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak.',
    icon: '🌟',
    category: 'streaks',
    rarity: 'legendary',
    xpBonus: 1000,
  },
  // ── Levels ──────────────────────────────────────────────────────────────────
  {
    id: 'level_5',
    title: 'Apprentice',
    description: 'Reach Level 5.',
    icon: '🎓',
    category: 'levels',
    rarity: 'common',
    xpBonus: 100,
  },
  {
    id: 'level_10',
    title: 'Adventurer',
    description: 'Reach Level 10.',
    icon: '🗺️',
    category: 'levels',
    rarity: 'rare',
    xpBonus: 300,
  },
  {
    id: 'level_25',
    title: 'Champion',
    description: 'Reach Level 25.',
    icon: '🏆',
    category: 'levels',
    rarity: 'epic',
    xpBonus: 750,
  },
  // ── Special ─────────────────────────────────────────────────────────────────
  {
    id: 'first_reward',
    title: 'Treat Yourself',
    description: 'Redeem a reward from the shop.',
    icon: '🎁',
    category: 'special',
    rarity: 'common',
    xpBonus: 50,
  },
  {
    id: 'gold_100',
    title: 'Treasure Hoarder',
    description: 'Accumulate 100 gold.',
    icon: '💰',
    category: 'special',
    rarity: 'rare',
    xpBonus: 200,
  },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

/** Returns IDs of newly unlocked achievements given current state. */
export function checkNewAchievements(
  state: Pick<GameState, 'quests' | 'character' | 'unlockedAchievements' | 'rewards'>
): Achievement[] {
  const { quests, character, unlockedAchievements, rewards } = state;
  const completed = quests.filter((q) => q.status === 'completed');
  const totalRedeemed = rewards.reduce((s, r) => s + r.timesRedeemed, 0);
  const newlyUnlocked: Achievement[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !unlockedAchievements.includes(id)) {
      const a = ACHIEVEMENT_MAP[id];
      if (a) newlyUnlocked.push(a);
    }
  };

  check('first_quest', completed.length >= 1);
  check('quests_5', completed.length >= 5);
  check('quests_25', completed.length >= 25);
  check('quests_100', completed.length >= 100);
  check('boss_slayer', completed.some((q) => q.difficulty === 'boss'));
  check('streak_3', character.streak >= 3);
  check('streak_7', character.streak >= 7);
  check('streak_14', character.streak >= 14);
  check('streak_30', character.streak >= 30);
  check('level_5', character.level >= 5);
  check('level_10', character.level >= 10);
  check('level_25', character.level >= 25);
  check('first_reward', totalRedeemed >= 1);
  check('gold_100', character.gold >= 100);

  return newlyUnlocked;
}

export const RARITY_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  common:    { text: '#9d8ec4', border: 'rgba(157,142,196,0.3)', bg: 'rgba(157,142,196,0.08)' },
  rare:      { text: '#3b82f6', border: 'rgba(59,130,246,0.35)', bg: 'rgba(59,130,246,0.08)' },
  epic:      { text: '#a855f7', border: 'rgba(168,85,247,0.4)',  bg: 'rgba(168,85,247,0.1)' },
  legendary: { text: '#f59e0b', border: 'rgba(245,158,11,0.5)',  bg: 'rgba(245,158,11,0.1)' },
};
