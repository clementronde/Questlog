import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { fetchLeaderboard, isConfigured, supabase, type LeaderboardRow } from '../../lib/supabase';
import { THEMES } from '../../lib/themes';
import UsernameModal from './UsernameModal';

const RANK_BADGE: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function themeAccent(themeId: string): string {
  return THEMES.find((t) => t.id === themeId)?.accent ?? 'var(--purple)';
}

export default function Leaderboard() {
  const username        = useGameStore((s) => s.username);
  const playerId        = useGameStore((s) => s.playerId);
  const character       = useGameStore((s) => s.character);
  const syncLeaderboard = useGameStore((s) => s.syncLeaderboard);

  const [rows, setRows]             = useState<LeaderboardRow[]>([]);
  const [loading, setLoading]       = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [lastSync, setLastSync]     = useState<Date | null>(null);
  const subscriptionRef             = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  // Load leaderboard on mount and subscribe to real-time changes
  useEffect(() => {
    load();

    if (!supabase) return;

    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' },
        () => load()   // refetch on any change
      )
      .subscribe();

    subscriptionRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetchLeaderboard(100);
    setRows(data);
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    await syncLeaderboard();
    await load();
    setLastSync(new Date());
    setSyncing(false);
  }

  // Find own rank
  const myRank = rows.findIndex((r) => r.player_id === playerId) + 1;
  const myRow  = rows.find((r) => r.player_id === playerId);

  return (
    <div className="px-3 pt-4 pb-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--text-dim)', marginBottom: 6 }}>
            ▸ GLOBAL LEAGUE
          </div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '20px', color: 'var(--text)', lineHeight: 1 }}>
            {rows.length} adventurers
          </div>
        </div>

        {/* Sync button */}
        {username && (
          <motion.button
            whileTap={{ x: 2, y: 2 }}
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: 'var(--purple-dim)',
              border: '2px solid var(--purple)',
              boxShadow: '2px 2px 0 var(--pixel-shadow)',
              color: 'var(--purple-light)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              padding: '6px 10px',
            }}
          >
            {syncing ? '...' : '↑ SYNC'}
          </motion.button>
        )}
      </div>

      {/* ── Not configured warning ── */}
      {!isConfigured && (
        <div
          className="mb-4 p-3"
          style={{
            background: 'rgba(255,143,0,0.08)',
            border: '2px solid var(--orange)',
            boxShadow: '3px 3px 0 var(--pixel-shadow)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--orange)', marginBottom: 6 }}>
            ⚠ SETUP REQUIRED
          </div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '15px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Add your Supabase URL and anon key to{' '}
            <span style={{ color: 'var(--orange)' }}>.env.local</span>, then run the SQL in{' '}
            <span style={{ color: 'var(--orange)' }}>supabase/migration.sql</span>.
          </div>
        </div>
      )}

      {/* ── No username → CTA ── */}
      {!username && isConfigured && (
        <motion.button
          whileTap={{ x: 3, y: 3 }}
          onClick={() => setShowModal(true)}
          className="w-full py-4 mb-4 flex flex-col items-center gap-2"
          style={{
            background: 'var(--purple-dim)',
            border: '2px dashed var(--purple)',
            color: 'var(--purple-light)',
          }}
        >
          <span style={{ fontSize: '24px' }}>🏆</span>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>JOIN THE LEADERBOARD</span>
          <span style={{ fontFamily: 'var(--font-vt)', fontSize: '15px', color: 'var(--text-dim)' }}>
            Pick a username and compete globally
          </span>
        </motion.button>
      )}

      {/* ── My rank banner (if registered & in top 100) ── */}
      {username && myRow && (
        <div
          className="mb-3 px-3 py-2 flex items-center gap-3"
          style={{
            background: 'var(--purple-dim)',
            border: '2px solid var(--purple)',
            boxShadow: '3px 3px 0 var(--pixel-shadow)',
          }}
        >
          <div
            style={{
              width: 6,
              alignSelf: 'stretch',
              background: themeAccent(myRow.theme_id),
              flexShrink: 0,
            }}
          />
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: '20px', color: 'var(--gold)', minWidth: 32 }}>
            #{myRank}
          </div>
          <div className="flex-1">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text)' }}>{myRow.username}</div>
            <div style={{ fontFamily: 'var(--font-vt)', fontSize: '15px', color: 'var(--text-dim)' }}>
              LV.{myRow.level} · {myRow.total_xp.toLocaleString()} XP · {myRow.quests_done}Q
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', textAlign: 'right' }}>
            YOUR<br />RANK
          </div>
        </div>
      )}

      {/* ── Last sync ── */}
      {lastSync && (
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', marginBottom: 8, textAlign: 'right' }}>
          SYNCED {lastSync.toLocaleTimeString()}
        </div>
      )}

      {/* ── Table header ── */}
      <div
        className="flex items-center gap-2 px-2 py-1 mb-1"
        style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: 'var(--text-faint)',
        }}
      >
        <div style={{ width: 28, textAlign: 'center' }}>#</div>
        <div style={{ flex: 1 }}>HERO</div>
        <div style={{ width: 48, textAlign: 'right' }}>LV</div>
        <div style={{ width: 72, textAlign: 'right' }}>XP</div>
        <div style={{ width: 36, textAlign: 'right' }}>Q</div>
      </div>

      {/* ── Rows ── */}
      {loading && rows.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '24px' }}
          >
            ⚙️
          </motion.div>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)' }}>
            LOADING...
          </p>
        </div>
      )}

      {!loading && rows.length === 0 && isConfigured && (
        <div className="flex flex-col items-center py-12 gap-3">
          <span style={{ fontSize: '32px' }}>🏆</span>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 2 }}>
            NO PLAYERS YET<br />BE THE FIRST!
          </p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {rows.map((row, i) => {
          const rank   = i + 1;
          const isMe   = row.player_id === playerId;
          const accent = themeAccent(row.theme_id);

          return (
            <motion.div
              key={row.player_id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.015 }}
              className="flex items-center gap-2 px-2 py-2 mb-1"
              style={{
                background: isMe ? 'var(--purple-dim)' : rank <= 3 ? 'rgba(255,204,0,0.04)' : 'var(--bg-card)',
                border: `2px solid ${isMe ? 'var(--purple)' : rank <= 3 ? 'rgba(255,204,0,0.25)' : 'var(--border)'}`,
                boxShadow: rank <= 3 ? '2px 2px 0 var(--pixel-shadow)' : 'none',
              }}
            >
              {/* Theme color bar */}
              <div
                style={{
                  width: 3,
                  alignSelf: 'stretch',
                  background: accent,
                  flexShrink: 0,
                }}
              />

              {/* Rank */}
              <div
                style={{
                  width: 24,
                  textAlign: 'center',
                  fontFamily: rank <= 3 ? 'var(--font-pixel)' : 'var(--font-vt)',
                  fontSize: rank <= 3 ? '14px' : '18px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {RANK_BADGE[rank] ?? rank}
              </div>

              {/* Username */}
              <div className="flex-1 min-w-0">
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: isMe ? '8px' : '7px',
                  color: isMe ? 'var(--purple-light)' : rank <= 3 ? 'var(--gold)' : 'var(--text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {row.username}{isMe && ' ◀'}
                </div>
                <div style={{ fontFamily: 'var(--font-vt)', fontSize: '13px', color: 'var(--text-faint)' }}>
                  🔥{row.streak}d
                </div>
              </div>

              {/* Level */}
              <div style={{ width: 40, textAlign: 'right', fontFamily: 'var(--font-vt)', fontSize: '18px', color: accent, flexShrink: 0 }}>
                {row.level}
              </div>

              {/* XP */}
              <div style={{ width: 68, textAlign: 'right', fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-dim)', flexShrink: 0 }}>
                {row.total_xp.toLocaleString()}
              </div>

              {/* Quests */}
              <div style={{ width: 32, textAlign: 'right', fontFamily: 'var(--font-vt)', fontSize: '16px', color: 'var(--text-faint)', flexShrink: 0 }}>
                {row.quests_done}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Username setup modal ── */}
      <AnimatePresence>
        {showModal && <UsernameModal onClose={() => { setShowModal(false); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
