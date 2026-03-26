import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { isUsernameTaken, isConfigured } from '../../lib/supabase';

interface Props { onClose: () => void }

const VALID = /^[a-zA-Z0-9_]{3,16}$/;

export default function UsernameModal({ onClose }: Props) {
  const setUsername     = useGameStore((s) => s.setUsername);
  const syncLeaderboard = useGameStore((s) => s.syncLeaderboard);

  const [value, setValue]   = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'taken' | 'error' | 'ok'>('idle');

  const isValid = VALID.test(value);

  const handleSubmit = async () => {
    if (!isValid) return;
    setStatus('checking');
    try {
      const taken = await isUsernameTaken(value);
      if (taken) { setStatus('taken'); return; }
      setUsername(value);
      setStatus('ok');
      // Sync immediately
      await syncLeaderboard();
      onClose();
    } catch {
      setStatus('error');
    }
  };

  const statusMsg: Record<string, { text: string; color: string }> = {
    taken:    { text: '✗ USERNAME TAKEN', color: 'var(--red)' },
    error:    { text: '✗ CONNECTION ERROR', color: 'var(--red)' },
    checking: { text: '... CHECKING', color: 'var(--text-dim)' },
    ok:       { text: '✓ REGISTERED!', color: 'var(--green)' },
    idle:     { text: isValid ? '✓ AVAILABLE FORMAT' : value.length > 0 ? '3-16 chars, letters/numbers/_' : '', color: 'var(--text-faint)' },
  };
  const msg = statusMsg[status];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40" style={{ background: 'rgba(5,5,16,0.92)' }}
      />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        <div
          className="w-full max-w-xs p-5"
          style={{
            background: 'var(--bg-card)',
            border: '3px solid var(--purple)',
            boxShadow: '6px 6px 0 var(--pixel-shadow)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-center mb-4 -mx-5 -mt-5 py-2"
            style={{ background: 'var(--purple)', fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#fff' }}
          >
            ★ JOIN THE LEADERBOARD ★
          </div>

          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', marginBottom: 6, lineHeight: 2 }}>
            CHOOSE YOUR HERO NAME
          </div>

          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setStatus('idle'); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={16}
              placeholder="YourName..."
              className="w-full px-3 py-2 outline-none"
              style={{
                background: 'var(--bg-deep)',
                border: '2px solid var(--border-light)',
                boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.5)',
                color: 'var(--text)',
                fontFamily: 'var(--font-vt)',
                fontSize: '22px',
                caretColor: 'var(--purple-light)',
              }}
            />
          </div>

          {/* Status line */}
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: msg.color, marginBottom: 12, minHeight: 10 }}>
            {msg.text}
          </div>

          {!isConfigured && (
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--orange)', marginBottom: 12, lineHeight: 2 }}>
              ⚠ SUPABASE NOT CONFIGURED<br />
              <span style={{ color: 'var(--text-faint)' }}>See .env.local to set up</span>
            </div>
          )}

          <motion.button
            whileTap={{ x: 3, y: 3 }}
            onClick={handleSubmit}
            disabled={!isValid || status === 'checking'}
            className="w-full py-3"
            style={{
              background: isValid ? 'var(--purple)' : 'var(--bg-surface)',
              border: `2px solid ${isValid ? 'var(--purple-light)' : 'var(--border)'}`,
              boxShadow: isValid ? '3px 3px 0 var(--pixel-shadow)' : 'none',
              color: isValid ? '#fff' : 'var(--text-faint)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
            }}
          >
            {status === 'checking' ? '...' : '▶ ENTER ARENA'}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
