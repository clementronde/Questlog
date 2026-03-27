export type QuestCategory =
  | 'work' | 'sport' | 'learning' | 'home'
  | 'wellness' | 'creative' | 'social' | 'other';

export const CATEGORIES: Record<QuestCategory, { label: string; icon: string; color: string }> = {
  work:     { label: 'TRAVAIL',    icon: '💼', color: 'var(--blue)'         },
  sport:    { label: 'SPORT',      icon: '💪', color: 'var(--green)'        },
  learning: { label: 'SAVOIR',     icon: '📚', color: 'var(--purple-light)' },
  home:     { label: 'MAISON',     icon: '🏠', color: 'var(--orange)'       },
  wellness: { label: 'BIEN-ÊTRE',  icon: '🧘', color: '#06b6d4'             },
  creative: { label: 'CRÉATIVITÉ', icon: '🎨', color: '#ec4899'             },
  social:   { label: 'SOCIAL',     icon: '💬', color: 'var(--gold)'         },
  other:    { label: 'AUTRE',      icon: '⭐', color: 'var(--text-dim)'     },
};

export const CATEGORY_LIST = Object.keys(CATEGORIES) as QuestCategory[];
