import { motion } from 'framer-motion';
import { RotateCcw, Zap } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import ThemePicker from '../character/ThemePicker';

export default function Settings() {
  const character = useGameStore((s) => s.character);

  const handleClearData = () => {
    if (window.confirm('Reset all quest data? This cannot be undone.')) {
      localStorage.removeItem('questlog-storage');
      window.location.reload();
    }
  };

  return (
    <div className="px-3 pt-4 pb-4">

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--text-dim)', marginBottom: 16 }}>
        ▸ THÈMES
      </div>

      {/* Theme picker */}
      <div className="mb-4">
        <ThemePicker />
      </div>

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--text-dim)', marginBottom: 16, marginTop: 24 }}>
        ▸ SETTINGS
      </div>

      {/* Save data */}
      <div
        className="mb-4 p-3"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-light)',
          boxShadow: '3px 3px 0 var(--pixel-shadow)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-faint)', marginBottom: 10 }}>
          ▸ SAVE FILE
        </div>
        <div className="flex flex-col gap-2">
          <SaveRow label="LEVEL"    value={`LV. ${character.level}`}                 color="var(--purple-light)" />
          <SaveRow label="TOTAL XP" value={`${character.totalXp.toLocaleString()} XP`} color="var(--purple-light)" />
          <SaveRow label="GOLD"     value={`${character.gold.toLocaleString()} G`}   color="var(--gold)" />
          <SaveRow label="STREAK"   value={`${character.streak} DAYS`}              color="var(--red)" />
        </div>
        <div style={{ fontFamily: 'var(--font-vt)', fontSize: '14px', color: 'var(--text-faint)', marginTop: 10, borderTop: '1px dashed var(--border)', paddingTop: 8 }}>
          Stored locally · LocalStorage
        </div>
      </div>

      {/* App info */}
      <div
        className="mb-4 p-3 flex items-center justify-between"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-light)',
          boxShadow: '3px 3px 0 var(--pixel-shadow)',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text)', marginBottom: 4 }}>
            QUESTLOG v0.2
          </div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-dim)' }}>
            PWA · Pixel Art RPG Edition
          </div>
        </div>
        <Zap size={20} style={{ color: 'var(--purple-light)' }} />
      </div>

      {/* View landing page */}
      <div className="mb-4">
        <motion.button
          whileTap={{ x: 3, y: 3 }}
          onClick={() => { localStorage.removeItem('ql:started'); window.location.reload(); }}
          className="w-full flex items-center justify-center gap-2 py-3"
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border-light)',
            boxShadow: '3px 3px 0 var(--pixel-shadow)',
            color: 'var(--purple-light)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
          }}
        >
          🏰 VOIR LA LANDING PAGE
        </motion.button>
      </div>

      {/* Danger zone */}
      <div
        className="p-3"
        style={{
          background: 'var(--red-dim)',
          border: '2px solid var(--red)',
          boxShadow: '3px 3px 0 var(--pixel-shadow)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--red)', marginBottom: 10 }}>
          ⚠ DANGER ZONE
        </div>
        <motion.button
          whileTap={{ x: 3, y: 3 }}
          onClick={handleClearData}
          className="w-full flex items-center justify-center gap-2 py-3"
          style={{
            background: 'var(--red-dim)',
            border: '2px solid var(--red)',
            boxShadow: '3px 3px 0 var(--pixel-shadow)',
            color: 'var(--red)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
          }}
        >
          <RotateCcw size={14} />
          RESET ALL DATA
        </motion.button>
      </div>
    </div>
  );
}

function SaveRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)' }}>
        ▸ {label}
      </span>
      <span style={{ fontFamily: 'var(--font-vt)', fontSize: '18px', color, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}
