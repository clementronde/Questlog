import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authSignIn, authSignUp, isConfigured } from '../../lib/supabase';

type Mode = 'signup' | 'signin';

const ERR: Record<string, string> = {
  'User already registered':                             'Cet email est déjà utilisé.',
  'Invalid login credentials':                           'Email ou mot de passe incorrect.',
  'Password should be at least 6 characters':            'Mot de passe trop court (min. 6 caractères).',
  'Unable to validate email address: invalid format':    'Format d\'email invalide.',
  'Email not confirmed':                                 'Vérifie ta boîte mail pour confirmer ton compte.',
  'Supabase non configuré':                              'Service indisponible. Réessaie plus tard.',
};

function translateError(msg: string): string {
  for (const [key, val] of Object.entries(ERR)) {
    if (msg.includes(key)) return val;
  }
  return msg;
}

interface Props {
  onSuccess: (userId: string) => void;
  onBack: () => void;
}

export default function AuthScreen({ onSuccess, onBack }: Props) {
  const [mode, setMode]         = useState<Mode>('signup');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const data = mode === 'signup'
        ? await authSignUp(email.trim(), password)
        : await authSignIn(email.trim(), password);

      if (data.user) {
        onSuccess(data.user.id);
      } else {
        // Email confirmation required
        setInfo('Un email de confirmation a été envoyé. Vérifie ta boîte mail puis reconnecte-toi.');
        setMode('signin');
      }
    } catch (err: unknown) {
      setError(translateError((err as Error).message));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-deep)',
    border: '2px solid var(--border-light)',
    color: 'var(--text)',
    fontFamily: 'var(--font-vt)',
    fontSize: '18px',
    padding: '10px 12px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-deep)',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: '100%', maxWidth: 360,
          background: 'var(--bg-card)',
          border: '2px solid var(--purple)',
          boxShadow: '6px 6px 0 #000, 0 0 40px rgba(123,47,255,0.2)',
          padding: '28px 24px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px', color: '#fff', textShadow: '3px 3px 0 var(--purple)' }}>
            QUESTLOG
          </div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-dim)', marginTop: 6 }}>
            {mode === 'signup' ? 'Rejoins l\'aventure' : 'Content de te revoir'}
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', marginBottom: 24, border: '2px solid var(--border)', overflow: 'hidden' }}>
          {(['signup', 'signin'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setInfo(null); }}
              style={{
                flex: 1, padding: '8px 0',
                fontFamily: 'var(--font-pixel)', fontSize: '7px',
                background: mode === m ? 'var(--purple)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-faint)',
                border: 'none',
                borderRight: m === 'signup' ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}
            >
              {m === 'signup' ? 'CRÉER UN COMPTE' : 'CONNEXION'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', marginBottom: 6 }}>
              EMAIL
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', marginBottom: 6 }}>
              MOT DE PASSE
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'min. 6 caractères' : '••••••••'}
              style={inputStyle}
            />
          </div>

          {/* Error / Info */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--red)', background: 'rgba(232,48,48,0.1)', border: '1px solid var(--red)', padding: '8px 10px' }}
              >
                ⚠ {error}
              </motion.div>
            )}
            {info && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--green)', background: 'rgba(74,222,128,0.1)', border: '1px solid var(--green)', padding: '8px 10px', lineHeight: 1.8 }}
              >
                ✓ {info}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={loading ? {} : { x: 3, y: 3 }}
            style={{
              padding: '14px 0',
              fontFamily: 'var(--font-pixel)', fontSize: '9px',
              background: loading ? 'var(--purple-dim)' : 'var(--purple)',
              border: '2px solid var(--purple-light)',
              color: '#fff',
              boxShadow: loading ? 'none' : '4px 4px 0 #000',
              cursor: loading ? 'default' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading
              ? '...'
              : mode === 'signup'
              ? '▶ COMMENCER L\'AVENTURE'
              : '▶ CONNEXION'}
          </motion.button>
        </form>

        {/* Back */}
        <button
          onClick={onBack}
          style={{
            marginTop: 20, width: '100%',
            fontFamily: 'var(--font-pixel)', fontSize: '6px',
            color: 'var(--text-faint)', background: 'transparent', border: 'none',
            cursor: 'pointer',
          }}
        >
          ← RETOUR À L'ACCUEIL
        </button>
      </motion.div>
    </div>
  );
}
