import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, CheckCheck, LogOut, PackageSearch } from 'lucide-react';
import * as notificationApi from '../../services/notificationApi';
import { logoutUser } from '../../store/authSlice';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/fleet': 'Fleet Monitor',
  '/admin/live': 'Live Operations',
  '/admin/manifests': 'Manifests',
  '/admin/requests': 'Client Requests',
  '/admin/manifests/new': 'Create Manifest',
  '/admin/settings': 'Settings',
  '/client': 'Client Dashboard',
  '/client/place-order': 'Place Order',
  '/client/track': 'Track Shipment',
  '/client/invoices': 'Invoices',
  '/driver': 'My Deliveries',
  '/executive/analytics': 'Analytics',
};

const DEMO_NOTIFICATIONS = [
  { _id: 'n1', title: 'Manifest assigned', message: 'Vehicle assigned to a trip.', read: false, time: '2 min ago' },
  { _id: 'n2', title: 'Delivery completed', message: 'Shipment delivered to destination DC.', read: false, time: '1 hr ago' },
  { _id: 'n3', title: 'Delay reported', message: 'A shipment was delayed in transit.', read: true, time: '3 hrs ago' },
];

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useSelector((s: any) => s.auth);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const role = user?.role || (JSON.parse(localStorage.getItem('user') || 'null') || {}).role;
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || user?.company || 'User';
  const initials = displayName.split(' ').map((p: string) => p[0] || '').slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    let mounted = true;
    notificationApi.getNotifications()
      .then((res) => {
        if (!mounted) return;
        const data = res.notifications || res.data?.notifications || res;
        setNotifications(Array.isArray(data) && data.length > 0 ? data : DEMO_NOTIFICATIONS);
      })
      .catch(() => { if (mounted) setNotifications(DEMO_NOTIFICATIONS); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { setNotifOpen(false); }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationApi.markAllRead().catch(() => {});
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    notificationApi.markRead(id).catch(() => {});
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const title = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ? PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k))!] : 'Console';

  return (
    <header
      className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b sticky top-0 z-40"
      style={{
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
        height: 'var(--topbar-height)',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-1 rounded-lg transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight truncate" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: notifOpen ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell size={18} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--color-error)', boxShadow: '0 0 0 2px var(--color-surface-card)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border overflow-hidden animate-scale-in z-50"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                Notifications
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold transition-colors min-h-[36px] px-2 rounded-lg"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-center text-xs py-8" style={{ color: 'var(--color-text-muted)' }}>No notifications</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markOneRead(n._id)}
                  className="w-full text-left px-4 py-3 border-b transition-colors last:border-b-0"
                  style={{
                    borderColor: 'var(--color-border-light)',
                    background: n.read ? 'transparent' : 'rgba(255,107,44,0.05)',
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {n.title}
                    {!n.read && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle" style={{ background: 'var(--color-accent)' }} />}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{n.message}</p>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>{n.time}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User chip */}
      <div className="flex items-center gap-2.5 pl-1">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: 'var(--color-primary)', boxShadow: 'inset 0 0 0 1px rgba(255,107,44,0.4)' }}
        >
          {initials || <PackageSearch size={16} />}
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-[13px] font-bold leading-tight truncate max-w-[140px]" style={{ color: 'var(--color-text-primary)' }}>
            {displayName}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider leading-tight" style={{ color: 'var(--color-accent)' }}>
            {role || 'user'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-error)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};
