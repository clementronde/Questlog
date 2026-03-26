export interface ColorTheme {
  id: string;
  name: string;
  emoji: string;
  lore: string; // RPG flavour text
  // CSS variable overrides
  accent: string;
  accentLight: string;
  accentDim: string;
  borderAccent: string;
}

export const THEMES: ColorTheme[] = [
  {
    id: 'arcane',
    name: 'ARCANE',
    emoji: '🔮',
    lore: 'The classic mage path.',
    accent:       '#7b2fff',
    accentLight:  '#b060ff',
    accentDim:    'rgba(123,47,255,0.18)',
    borderAccent: '#3a2a6a',
  },
  {
    id: 'inferno',
    name: 'INFERNO',
    emoji: '🔥',
    lore: 'Forged in eternal flame.',
    accent:       '#ff3c22',
    accentLight:  '#ff7055',
    accentDim:    'rgba(255,60,34,0.18)',
    borderAccent: '#5a2a1a',
  },
  {
    id: 'emerald',
    name: 'EMERALD',
    emoji: '🌿',
    lore: 'One with the ancient forest.',
    accent:       '#00c853',
    accentLight:  '#69f0ae',
    accentDim:    'rgba(0,200,83,0.15)',
    borderAccent: '#1a3a2a',
  },
  {
    id: 'ocean',
    name: 'OCEAN',
    emoji: '🌊',
    lore: 'Depths beyond reckoning.',
    accent:       '#0288d1',
    accentLight:  '#40c4ff',
    accentDim:    'rgba(2,136,209,0.18)',
    borderAccent: '#1a2a4a',
  },
  {
    id: 'rose',
    name: 'ROSE',
    emoji: '🌸',
    lore: 'Beauty that cuts like a blade.',
    accent:       '#e91e8c',
    accentLight:  '#ff6ec7',
    accentDim:    'rgba(233,30,140,0.18)',
    borderAccent: '#4a1a3a',
  },
  {
    id: 'amber',
    name: 'AMBER',
    emoji: '⚡',
    lore: 'Speed and golden glory.',
    accent:       '#ff8f00',
    accentLight:  '#ffca28',
    accentDim:    'rgba(255,143,0,0.18)',
    borderAccent: '#4a3000',
  },
  {
    id: 'void',
    name: 'VOID',
    emoji: '🌌',
    lore: 'Power from the abyss.',
    accent:       '#cc00ff',
    accentLight:  '#ea80ff',
    accentDim:    'rgba(204,0,255,0.18)',
    borderAccent: '#3a0050',
  },
  {
    id: 'ice',
    name: 'ICE',
    emoji: '❄️',
    lore: 'Cold clarity. Absolute focus.',
    accent:       '#00b8d4',
    accentLight:  '#84ffff',
    accentDim:    'rgba(0,184,212,0.18)',
    borderAccent: '#0a2a3a',
  },
];

export const DEFAULT_THEME_ID = 'arcane';

export function getTheme(id: string): ColorTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Apply a theme by mutating :root CSS variables. */
export function applyTheme(theme: ColorTheme) {
  const root = document.documentElement;
  root.style.setProperty('--purple',       theme.accent);
  root.style.setProperty('--purple-light', theme.accentLight);
  root.style.setProperty('--purple-dim',   theme.accentDim);
  root.style.setProperty('--border-light', theme.borderAccent);
}
