import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = Boolean(url && key);

// Safe client — operations on this will fail silently if not configured
export const supabase = isConfigured
  ? createClient(url!, key!)
  : null;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardRow {
  player_id:   string;
  username:    string;
  level:       number;
  total_xp:    number;
  quests_done: number;
  streak:      number;
  theme_id:    string;
  updated_at:  string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

/** Upsert the local player's stats (call after quest completion). */
export async function syncPlayer(row: LeaderboardRow): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('leaderboard')
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'player_id' });
}

/** Fetch the top N players sorted by XP descending. */
export async function fetchLeaderboard(limit = 100): Promise<LeaderboardRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(limit);
  if (error) { console.warn('[leaderboard]', error.message); return []; }
  return data ?? [];
}

/** Check if a username is already taken. */
export async function isUsernameTaken(username: string): Promise<boolean> {
  if (!supabase) return false;
  const { count } = await supabase
    .from('leaderboard')
    .select('player_id', { count: 'exact', head: true })
    .eq('username', username.trim());
  return (count ?? 0) > 0;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function authSignUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function authSignIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function authGetSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function authOnChange(cb: (userId: string | null) => void): () => void {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
    cb(session?.user.id ?? null);
  });
  return () => subscription.unsubscribe();
}
