// Driver notifications — mock service backed by localStorage so the
// feature works without the backend running (same pattern as driverService).
// Module: Frontend API Services
// Shape mirrors the backend Notification model: recipient, title, message,
// type (info|warning|success|error), isRead, relatedManifest.

export interface NotificationReply {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface NotificationReaction {
  emoji: string;
  count: number;
}

export interface DriverNotification {
  id: string;
  sender: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  isRead: boolean;
  relatedManifest?: string;
  replies: NotificationReply[];
  reactions: NotificationReaction[];
}

const STORAGE_KEY = 'b2b_driver_notifications';

function minutesAgoISO(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const MOCK_NOTIFICATIONS: DriverNotification[] = [
  {
    id: 'ntf-1',
    sender: 'Dispatch',
    title: 'Route Update — TRK-7410-PA',
    message:
      'Baltimore Freight Hub has a 30-minute loading window delay. Your ETA for TRK-7410-PA is adjusted by +25 minutes.',
    type: 'warning',
    time: minutesAgoISO(12),
    isRead: false,
    relatedManifest: 'TRK-7410-PA',
    replies: [],
    reactions: [],
  },
  {
    id: 'ntf-2',
    sender: 'Dispatch',
    title: 'New Manifest Assigned',
    message:
      'Manifest TRK-8902-NY has been assigned to you. Scheduled pickup is 08:00 AM at New York Port (Hub A).',
    type: 'success',
    time: minutesAgoISO(48),
    isRead: false,
    relatedManifest: 'TRK-8902-NY',
    replies: [],
    reactions: [],
  },
  {
    id: 'ntf-3',
    sender: 'Admin',
    title: 'Vehicle Inspection Reminder',
    message:
      'Pre-trip inspection for V-102 Volvo FH16 is due before your next dispatch. Please complete the checklist.',
    type: 'info',
    time: minutesAgoISO(95),
    isRead: false,
    replies: [],
    reactions: [],
  },
  {
    id: 'ntf-4',
    sender: 'System',
    title: 'HAZMAT Re-Certification',
    message:
      'Your HAZMAT certification expires in 14 days. Please schedule a renewal with the compliance team.',
    type: 'error',
    time: minutesAgoISO(60 * 26),
    isRead: true,
    replies: [],
    reactions: [],
  },
];

function load(): DriverNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DriverNotification[];
  } catch (e) {
    console.error('Error reading driver notifications from localStorage:', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
  } catch (e) {
    console.error('Error saving initial notifications to localStorage:', e);
  }
  return MOCK_NOTIFICATIONS;
}

function save(list: DriverNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error updating driver notifications in localStorage:', e);
  }
}

export function getNotifications(): DriverNotification[] {
  return load();
}

export function getUnreadCount(): number {
  return load().filter((n) => !n.isRead).length;
}

export function markAllRead(): DriverNotification[] {
  const list = load().map((n) => ({ ...n, isRead: true }));
  save(list);
  return list;
}

export function markRead(id: string): DriverNotification[] {
  const list = load().map((n) => (n.id === id ? { ...n, isRead: true } : n));
  save(list);
  return list;
}

export function replyToNotification(id: string, text: string): DriverNotification[] {
  const list = load().map((n) =>
    n.id === id
      ? {
          ...n,
          isRead: true,
          replies: [
            ...n.replies,
            {
              id: `r-${Date.now()}`,
              author: 'You',
              text: text.trim(),
              time: new Date().toISOString(),
            },
          ],
        }
      : n
  );
  save(list);
  return list;
}

export function toggleReaction(id: string, emoji: string): DriverNotification[] {
  const list = load().map((n) => {
    if (n.id !== id) return n;
    const existing = n.reactions.find((r) => r.emoji === emoji);
    let reactions: NotificationReaction[];
    if (existing) {
      reactions = n.reactions.filter((r) => r.emoji !== emoji);
    } else {
      reactions = [...n.reactions, { emoji, count: 1 }];
    }
    return { ...n, isRead: true, reactions };
  });
  save(list);
  return list;
}
