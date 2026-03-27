import { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CATEGORIES, CATEGORY_LIST, type QuestCategory } from '../../lib/categories';

function dateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function shortDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3).toUpperCase();
}

const DIFF_COLORS: Record<string, string> = {
  trivial: 'var(--text-dim)',
  easy:    'var(--green)',
  medium:  'var(--blue)',
  hard:    'var(--orange)',
  boss:    'var(--red)',
};

export default function StatsJournal() {
  const quests    = useGameStore((s) => s.quests);
  const character = useGameStore((s) => s.character);

  const completed = useMemo(
    () => quests.filter((q) => q.status === 'completed' && q.completedAt).sort(
      (a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''),
    ),
    [quests],
  );

  // ── Weekly XP chart ──────────────────────────────────────────────────────
  const last7 = getLast7Days();
  const xpByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of completed) {
      const dk = dayKey(q.completedAt!);
      map[dk] = (map[dk] ?? 0) + q.xpReward;
    }
    return last7.map((d) => ({ day: d, xp: map[d] ?? 0 }));
  }, [completed]);
  const maxXp = Math.max(...xpByDay.map((d) => d.xp), 1);

  // ── Category breakdown ───────────────────────────────────────────────────
  const catCounts = useMemo(() => {
    const map: Partial<Record<QuestCategory, number>> = {};
    for (const q of completed) {
      const cat = (q.category ?? 'other') as QuestCategory;
      map[cat] = (map[cat] ?? 0) + 1;
    }
    return CATEGORY_LIST.map((cat) => ({ cat, count: map[cat] ?? 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [completed]);
  const maxCat = Math.max(...catCounts.map((c) => c.count), 1);

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalDone    = completed.length;
  const totalXpEarned = completed.reduce((s, q) => s + q.xpReward, 0);
  const totalGoldEarned = completed.reduce((s, q) => s + q.goldReward, 0);
  const todayCount   = completed.filter((q) => dayKey(q.completedAt!) === last7[6]).length;

  return (
    <div>

      {/* ── Summary row ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0, marginBottom: 12,
        background: 'var(--bg-card)',
        border: '2px solid var(--border-light)',
        boxShadow: '3px 3px 0 #000',
      }}>
        {[
          { label: 'QUÊTES',   value: totalDone,                         color: 'var(--purple-light)' },
          { label: 'STREAK',   value: `${character.streak}j`,            color: 'var(--red)' },
          { label: 'XP',       value: totalXpEarned.toLocaleString(),    color: 'var(--purple-light)' },
          { label: "AUJ.",     value: todayCount,                        color: 'var(--green)' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '10px 4px', textAlign: 'center',
            borderRight: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--text-faint)', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly XP chart ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-light)',
        boxShadow: '3px 3px 0 #000',
        padding: '10px',
        marginBottom: 12,
      }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', marginBottom: 10 }}>
          ▸ XP — 7 DERNIERS JOURS
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
          {xpByDay.map(({ day, xp }) => {
            const h = xp === 0 ? 4 : Math.max(6, Math.round((xp / maxXp) * 52));
            const isToday = day === last7[6];
            return (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--text-faint)' }}>
                  {xp > 0 ? xp : ''}
                </div>
                <div style={{
                  width: '100%', height: h,
                  background: isToday
                    ? 'var(--purple-light)'
                    : xp > 0 ? 'var(--purple)' : 'var(--bg-surface)',
                  border: isToday ? '1px solid var(--purple-light)' : '1px solid transparent',
                  boxShadow: isToday ? '0 0 6px var(--purple)' : 'none',
                  transition: 'height 0.4s ease',
                }} />
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: isToday ? 'var(--purple-light)' : 'var(--text-faint)' }}>
                  {shortDay(day)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {catCounts.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-light)',
          boxShadow: '3px 3px 0 #000',
          padding: '10px',
          marginBottom: 12,
        }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', marginBottom: 10 }}>
            ▸ CATÉGORIES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {catCounts.map(({ cat, count }) => {
              const cfg = CATEGORIES[cat];
              const pct = Math.max(8, Math.round((count / maxCat) * 100));
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, width: 18, textAlign: 'center', flexShrink: 0 }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: cfg.color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: cfg.color, width: 20, textAlign: 'right', flexShrink: 0 }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Activity journal ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-light)',
        boxShadow: '3px 3px 0 #000',
      }}>
        <div style={{
          padding: '8px 10px',
          borderBottom: '2px solid var(--border)',
          fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)',
        }}>
          ▸ JOURNAL D'ACTIVITÉ
        </div>

        {completed.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-faint)', lineHeight: 2 }}>
            AUCUNE QUÊTE COMPLÉTÉE<br />
            <span style={{ color: 'var(--text-dim)' }}>Tes exploits apparaîtront ici</span>
          </div>
        ) : (
          <div>
            {completed.slice(0, 30).map((q, i) => {
              const catCfg  = q.category ? CATEGORIES[q.category as QuestCategory] : null;
              const diffColor = DIFF_COLORS[q.difficulty] ?? 'var(--text-dim)';
              return (
                <div
                  key={q.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    borderBottom: i < Math.min(completed.length, 30) - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Category icon */}
                  <span style={{ fontSize: 12, width: 18, textAlign: 'center', flexShrink: 0 }}>
                    {catCfg ? catCfg.icon : '⭐'}
                  </span>

                  {/* Title + diff */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-vt)', fontSize: '16px', lineHeight: 1,
                      color: 'var(--text-faint)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {q.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: diffColor }}>
                        {q.difficulty.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: 'var(--purple-light)' }}>
                        +{q.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)', flexShrink: 0 }}>
                    {q.completedAt ? dateLabel(q.completedAt) : ''}
                  </div>
                </div>
              );
            })}
            {completed.length > 30 && (
              <div style={{ padding: '8px', textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-faint)' }}>
                +{completed.length - 30} entrées archivées
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
