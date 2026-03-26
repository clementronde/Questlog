import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getTheme, applyTheme } from '../lib/themes';

/**
 * Reads themeId from the store and applies CSS variable overrides to :root.
 * Call once at the top of App.
 */
export function useTheme() {
  const themeId = useGameStore((s) => s.themeId);

  useEffect(() => {
    applyTheme(getTheme(themeId));
  }, [themeId]);
}
