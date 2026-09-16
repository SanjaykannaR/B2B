import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { Skeleton } from '../../components/admin/shared/Skeleton';
import * as notificationApi from '../../services/notificationApi';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  info:    { icon: Info,          color: '#3B82F6', bg: '#DBEAFE' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FEF3C7' },
  success: { icon: CheckCircle2,  color: '#10B981', bg: '#D1FAE5' },
  error:   { icon: XCircle,       color: '#EF4444', bg: '#FEE2E2' },
};

type ReadFilter = 'ALL' | 'UNREAD';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReadFilter>('ALL');

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      const data = res.notifications || res.data?.notifications || res;
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  const filtered = useMemo(() => {
    if (filter === 'UNREAD') return notifications.filter((n) => !n.read && !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const handleMarkOne = async (n: any) => {
    if (n.read || n.isRead) return;
    setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true, isRead: true } : x)));
    try {
      await notificationApi.markRead(n._id);
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true, isRead: true })));
    try {
      await notificationApi.markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const goToManifest = (n: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (n.relatedManifest) navigate(`/admin/manifests`);
  };

  const TABS: { key: ReadFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'UNREAD', label: 'Unread' },
  ];

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Notifications
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 min-h-[44px]"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
            >
              <CheckCheck size={16} /> Mark All Read
            </button>
          )}
        </div>
      </AnimatedCard>

      {/* Filter tabs */}
      <AnimatedCard delay={80}>
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 min-h-[44px]"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 2px 8px rgba(255,107,44,0.2)' : 'none',
                }}
              >
                {tab.key === 'UNREAD' && <BellOff size={13} />}
                {tab.label}
                {tab.key === 'UNREAD' && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-card)', color: isActive ? '#fff' : 'var(--color-text-muted)' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Notification list */}
      <AnimatedCard delay={160}>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {loading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Bell size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Notifications appear here as manifests move through their lifecycle
              </p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
              {filtered.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? { icon: Info, color: '#3B82F6', bg: '#DBEAFE' };
                const Icon = cfg.icon;
                const isUnread = !n.read && !n.isRead;
                return (
                  <li
                    key={n._id}
                    onClick={() => handleMarkOne(n)}
                    className="flex items-start gap-4 px-4 sm:px-6 py-4 cursor-pointer transition-colors"
                    style={{ background: isUnread ? 'rgba(255,107,44,0.04)' : 'transparent' }}
                  >
                    <div
                      className="p-2.5 rounded-xl shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="shrink-0 inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                        )}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {n.message}
                      </p>
                      <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        {n.time || n.createdAt}
                      </p>
                    </div>
                    {n.relatedManifest && (
                      <button
                        onClick={(e) => goToManifest(n, e)}
                        className="shrink-0 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ color: 'var(--color-accent)' }}
                        title="Open manifests"
                        aria-label="Open related manifest"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};