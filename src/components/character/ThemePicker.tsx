import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { THEMES } from '../../lib/themes';

export default function ThemePicker() {
  const themeId  = useGameStore((s) => s.themeId);
  const setTheme = useGameStore((s) => s.setTheme);

  return (
    <div
      className="mb-4 p-3"
      style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-light)',
        boxShadow: '3px 3px 0 var(--pixel-shadow)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', marginBottom: 10 }}>
        ▸ COLOR THEME
      </div>

      <div className="grid grid-cols-4 gap-2">
        {THEMES.map((theme) => {
          const active = theme.id === themeId;
          return (
            <motion.button
              key={theme.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme.id)}
              className="flex flex-col items-center gap-1 py-2"
              style={{
                background: active ? theme.accentDim : 'var(--bg-deep)',
                border: `2px solid ${active ? theme.accent : 'var(--border)'}`,
                boxShadow: active ? `2px 2px 0 var(--pixel-shadow)` : 'none',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: theme.accent,
                  border: '2px solid var(--pixel-shadow)',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2, left: 2,
                  width: 5, height: 5,
                  background: theme.accentLight,
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: active ? theme.accent : 'var(--text-faint)',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {theme.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
