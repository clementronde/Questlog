const NOTIF_KEY = 'ql:notif-next';

export function notificationsSupported(): boolean {
  return 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

/** Schedule a daily 9am reminder. No-op if already scheduled for today. */
export function scheduleDailyReminder(activeQuestCount: number): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;

  const now       = Date.now();
  const existing  = parseInt(localStorage.getItem(NOTIF_KEY) ?? '0');
  if (existing > now) return; // already scheduled

  const target = new Date();
  target.setHours(9, 0, 0, 0);
  if (target.getTime() <= now) target.setDate(target.getDate() + 1);

  const ms = target.getTime() - now;
  localStorage.setItem(NOTIF_KEY, String(target.getTime()));

  setTimeout(() => {
    localStorage.removeItem(NOTIF_KEY);
    try {
      new Notification('⚔️ QUESTLOG', {
        body: activeQuestCount > 0
          ? `${activeQuestCount} quête${activeQuestCount > 1 ? 's' : ''} t'attendent. L'aventure t'appelle !`
          : "Ajoute une quête et commence ta journée en héros !",
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'daily-reminder',
      });
    } catch {}
  }, ms);
}
