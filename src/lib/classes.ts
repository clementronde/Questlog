export type HeroClass = 'warrior' | 'mage' | 'rogue' | 'paladin';

export interface ClassDef {
  id: HeroClass;
  name: string;
  icon: string;
  color: string;
  colorLight: string;
  tagline: string;
  description: string;
  stats: {
    label: string;
    value: string;
    color: string;
  }[];
  // Gameplay bonuses
  xpBonus: number;          // % bonus on all XP
  goldBonus: number;        // % bonus on all gold
  hardBossXpBonus: number;  // % extra XP on hard/boss quests
  comboGrowthBonus: number; // extra combo pts per streak day
  startingChest: 'wood' | 'iron'; // chest at class selection
}

export const CLASSES: Record<HeroClass, ClassDef> = {
  warrior: {
    id: 'warrior',
    name: 'WARRIOR',
    icon: '⚔️',
    color: 'var(--red)',
    colorLight: '#ff7070',
    tagline: 'Maître du Combat',
    description: 'Taille dans le vif. Bonus massif sur les quêtes difficiles et les boss.',
    stats: [
      { label: 'FORCE',      value: '★★★★★', color: 'var(--red)' },
      { label: 'MAGIE',      value: '★★☆☆☆', color: 'var(--blue)' },
      { label: 'AGILITÉ',    value: '★★★☆☆', color: 'var(--green)' },
      { label: 'CHANCE',     value: '★★☆☆☆', color: 'var(--gold)' },
    ],
    xpBonus: 0,
    goldBonus: 5,
    hardBossXpBonus: 25,
    comboGrowthBonus: 0,
    startingChest: 'iron',
  },
  mage: {
    id: 'mage',
    name: 'MAGE',
    icon: '🧙',
    color: 'var(--purple-light)',
    colorLight: '#d4b4fe',
    tagline: 'Archimage de l\'XP',
    description: 'Chaque quête t\'enseigne quelque chose. Bonus XP global et combo qui monte vite.',
    stats: [
      { label: 'FORCE',      value: '★★☆☆☆', color: 'var(--red)' },
      { label: 'MAGIE',      value: '★★★★★', color: 'var(--blue)' },
      { label: 'AGILITÉ',    value: '★★☆☆☆', color: 'var(--green)' },
      { label: 'CHANCE',     value: '★★★☆☆', color: 'var(--gold)' },
    ],
    xpBonus: 20,
    goldBonus: 0,
    hardBossXpBonus: 0,
    comboGrowthBonus: 10,
    startingChest: 'wood',
  },
  rogue: {
    id: 'rogue',
    name: 'ROGUE',
    icon: '🗡️',
    color: 'var(--green)',
    colorLight: '#66ffaa',
    tagline: 'Fantôme des Richesses',
    description: 'L\'or coule à flots. Bonus gold massif et un bouclier de streak pour ne jamais tout perdre.',
    stats: [
      { label: 'FORCE',      value: '★★★☆☆', color: 'var(--red)' },
      { label: 'MAGIE',      value: '★★☆☆☆', color: 'var(--blue)' },
      { label: 'AGILITÉ',    value: '★★★★★', color: 'var(--green)' },
      { label: 'CHANCE',     value: '★★★★☆', color: 'var(--gold)' },
    ],
    xpBonus: 0,
    goldBonus: 30,
    hardBossXpBonus: 0,
    comboGrowthBonus: 0,
    startingChest: 'wood',
  },
  paladin: {
    id: 'paladin',
    name: 'PALADIN',
    icon: '🛡️',
    color: 'var(--gold)',
    colorLight: '#ffe066',
    tagline: 'Chevalier Équilibré',
    description: 'Aucun point faible. Bonus modérés sur tout : XP, gold et combo.',
    stats: [
      { label: 'FORCE',      value: '★★★★☆', color: 'var(--red)' },
      { label: 'MAGIE',      value: '★★★☆☆', color: 'var(--blue)' },
      { label: 'AGILITÉ',    value: '★★★☆☆', color: 'var(--green)' },
      { label: 'CHANCE',     value: '★★★★☆', color: 'var(--gold)' },
    ],
    xpBonus: 10,
    goldBonus: 10,
    hardBossXpBonus: 10,
    comboGrowthBonus: 5,
    startingChest: 'iron',
  },
};
