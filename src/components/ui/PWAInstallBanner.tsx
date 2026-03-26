import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useGameStore } from '../../store/useGameStore';

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, triggerInstall } = usePWAInstall();
  const installDismissed = useGameStore((s) => s.installDismissed);
  const dismissInstall   = useGameStore((s) => s.dismissInstall);

  const show = canInstall && !isInstalled && !installDismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex items-center gap-2 px-3 py-2 mx-3 mt-2"
          style={{
            background: 'var(--purple-dim)',
            border: '2px solid var(--purple)',
            boxShadow: '3px 3px 0 var(--pixel-shadow)',
          }}
        >
          <span style={{ fontSize: '16px', flexShrink: 0 }}>📲</span>
          <p style={{ flex: 1, fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text)', lineHeight: 1.8 }}>
            INSTALL FOR FULL RPG EXPERIENCE
          </p>
          <motion.button
            whileTap={{ x: 2, y: 2 }}
            onClick={triggerInstall}
            style={{
              background: 'var(--purple)',
              border: '2px solid var(--purple-light)',
              boxShadow: '2px 2px 0 var(--pixel-shadow)',
              color: '#fff',
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              padding: '4px 8px',
              flexShrink: 0,
            }}
          >
            INSTALL
          </motion.button>
          <button
            onClick={dismissInstall}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-dim)', flexShrink: 0 }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
