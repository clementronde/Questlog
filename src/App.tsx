import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from './components/layout/AppShell';
import LevelUpModal from './components/ui/LevelUpModal';
import AchievementToast from './components/ui/AchievementToast';
import FloatingXP from './components/ui/FloatingXP';
import LootModal from './components/ui/LootModal';
import LandingPage from './components/landing/LandingPage';
import ClassSelector from './components/character/ClassSelector';
import AuthScreen from './components/auth/AuthScreen';
import { useGameStore } from './store/useGameStore';
import { useTheme } from './hooks/useTheme';
import { authGetSession, authOnChange, authSignOut, isConfigured } from './lib/supabase';

export default function App() {
  useTheme();

  const pendingLevelUp  = useGameStore((s) => s.pendingLevelUp);
  const dismissLevelUp  = useGameStore((s) => s.dismissLevelUp);
  const heroClass       = useGameStore((s) => s.character.heroClass);
  const pendingLoot     = useGameStore((s) => s.pendingLoot);
  const syncLeaderboard = useGameStore((s) => s.syncLeaderboard);
  const initPlayer      = useGameStore((s) => s.initPlayer);

  const [authReady,   setAuthReady]  = useState(false);
  const [authed,      setAuthed]     = useState(false);
  const [showAuth,    setShowAuth]   = useState(false);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      // Supabase not set up — run in local mode
      setAuthReady(true);
      setAuthed(true);
      return;
    }

    // Restore existing session
    authGetSession().then((session) => {
      if (session?.user) {
        initPlayer(session.user.id);
        setAuthed(true);
        syncLeaderboard();
      }
      setAuthReady(true);
    });

    // Listen for future auth changes (login / logout)
    return authOnChange((userId) => {
      if (userId) {
        initPlayer(userId);
        setAuthed(true);
        syncLeaderboard();
      } else {
        setAuthed(false);
      }
    });
  }, []);

  const handleAuthSuccess = (userId: string) => {
    initPlayer(userId);
    setAuthed(true);
    setShowAuth(false);
    syncLeaderboard();
  };

  // Splash while checking session
  if (!authReady) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--purple-light)' }}>...</span>
    </div>
  );

  // Not authenticated
  if (!authed) {
    if (showAuth) return <AuthScreen onSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)} />;
    return <LandingPage onEnter={() => setShowAuth(true)} />;
  }

  const handleLogout = async () => {
    await authSignOut();
    setAuthed(false);
    setShowLanding(false);
  };

  // Show landing on explicit request (regardless of auth)
  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;

  // Class selection (first time)
  if (!heroClass) return <ClassSelector />;

  return (
    <>
      <AppShell onLogout={handleLogout} />
      <FloatingXP />
      <AchievementToast />
      <AnimatePresence>
        {pendingLoot && <LootModal />}
      </AnimatePresence>
      {pendingLevelUp !== null && (
        <LevelUpModal level={pendingLevelUp} onClose={dismissLevelUp} />
      )}
    </>
  );
}
