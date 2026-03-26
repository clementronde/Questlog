/** Returns today's date as a YYYY-MM-DD string (local time). */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns yesterday's date key. */
function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Given the last active date key and current streak count,
 * returns the updated streak after a task is completed today.
 */
export function updateStreak(
  lastActiveDate: string | null,
  currentStreak: number
): { streak: number; lastActiveDate: string } {
  const today = todayKey();

  if (lastActiveDate === today) {
    // Already active today — streak unchanged
    return { streak: currentStreak, lastActiveDate: today };
  }

  if (lastActiveDate === yesterdayKey()) {
    // Consecutive day — increment
    return { streak: currentStreak + 1, lastActiveDate: today };
  }

  // Streak broken
  return { streak: 1, lastActiveDate: today };
}

/**
 * XP multiplier based on streak days.
 * 1 day = 1.0×, 3 days = 1.25×, 7 days = 1.5×, 14+ days = 2.0×
 */
export function comboMultiplier(streak: number): number {
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
}

export function comboLabel(streak: number): string {
  if (streak >= 14) return 'LEGENDARY COMBO';
  if (streak >= 7) return 'EPIC COMBO';
  if (streak >= 3) return 'HOT STREAK';
  return 'Daily Combo';
}
