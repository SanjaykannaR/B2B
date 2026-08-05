import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Radio, FilePlus, Search, Settings, Menu, X, Bell, CheckCheck, PackageSearch, ClipboardList } from 'lucide-react';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FleetMonitor } from './pages/admin/FleetMonitor';
import { LiveOperations } from './pages/admin/LiveOperations';
import { ManifestCreate } from './pages/admin/ManifestCreate';
import { Settings as SettingsPage } from './pages/admin/Settings';
import { AllManifests } from './pages/admin/AllManifests';
import { ClientRequests } from './pages/admin/ClientRequests';
import * as notificationApi from './services/notificationApi';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/fleet', label: 'Fleet', icon: Truck },
  { to: '/admin/live', label: 'Live Ops', icon: Radio },
  { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/manifests/new', label: 'Create Manifest', icon: FilePlus },
];

const DEMO_NOTIFICATIONS = [
  { _id: 'n1', title: 'Manifest #TRK-8841 assigned', message: 'Vehicle MH-12-AB-1234 assigned to the trip.', read: false, time: '2 min ago' },
  { _id: 'n2', title: 'Delivery completed', message: 'TRK-8842 delivered to Bangalore DC.', read: false, time: '1 hr ago' },
  { _id: 'n3', title: 'Delay reported', message: 'TRK-8844 delayed near Sanand GIDC.', read: true, time: '3 hrs ago' },
];

export default function App() {
  const { pathname } = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load notifications (API-ready with demo fallback, same pattern as other pages)
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

  // Close the notification dropdown when navigating
  useEffect(() => { setNotifOpen(false); }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationApi.markAllRead().catch(() => { /* backend stub — local state is enough */ });
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    notificationApi.markRead(id).catch(() => { /* backend stub */ });
  };

  const isActive = (to: string) =>
    to === '/admin' ? pathname === '/admin' : pathname.startsWith(to);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
      {/* Top Nav */}
      <nav
        className="shrink-0 relative flex items-center px-4 sm:px-6 py-3.5 border-b gap-3 sm:gap-6 sticky top-0 z-50"
        style={{
          background: 'var(--color-surface-card)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {/* Hamburger — visible on mobile only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -ml-1 rounded-lg transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo — clickable, returns to dashboard */}
        <Link
          to="/admin"
          className="flex items-center gap-2.5 shrink-0 rounded-lg transition-opacity hover:opacity-85"
          aria-label="B2B Logistics — Dashboard"
        >
          <div
            className="relative flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              background: '#0B0B0C',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,107,44,0.3)',
            }}
          >
            <PackageSearch size={18} strokeWidth={2.2} style={{ color: 'var(--color-accent)' }} />
            {/* Orange pin dot — tracking accent */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: 'var(--color-accent)', borderColor: 'var(--color-surface-card)' }}
            />
          </div>
          <span className="hidden sm:inline text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            B2B Logistics
          </span>
        </Link>

        {/* Nav Links — hidden on mobile, inline on md+ */}
        <div className="hidden md:flex gap-1.5 shrink-0">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  active ? 'text-white' : ''
                }`}
                style={{
                  color: active ? '#fff' : 'var(--color-text-secondary)',
                  background: active ? 'var(--color-accent)' : 'transparent',
                  boxShadow: active ? '0 2px 8px rgba(255,107,44,0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <Icon size={14} strokeWidth={2.2} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Search Bar — responsive width */}
        <div
          className="relative rounded-full p-[2px] transition-all duration-500 ease-out flex-1 max-w-[140px] sm:max-w-[240px] md:flex-none md:w-[300px] lg:w-[380px]"
          style={{
            background: searchFocused
              ? 'linear-gradient(135deg, #FF6B2C, #8B5CF6, #3B82F6, #FF6B2C)'
              : 'transparent',
            backgroundSize: searchFocused ? '300% 300%' : '100% 100%',
            animation: searchFocused ? 'gradientSpin 3s linear infinite' : 'none',
          }}
        >
          <div
            className="flex items-center gap-2 pl-4 pr-2 sm:pl-5 sm:pr-3 py-1.5 rounded-full transition-all duration-500"
            style={{
              background: 'var(--color-surface-card)',
              boxShadow: searchFocused
                ? '0 0 12px 2px rgba(139,92,246,0.15), 0 0 24px 4px rgba(255,107,44,0.08)'
                : '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => {
              if (!searchFocused) {
                e.currentTarget.style.boxShadow = '0 0 16px 2px rgba(255,107,44,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!searchFocused) {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              }
            }}
          >
            <Search
              size={14}
              strokeWidth={2.2}
              className="shrink-0 transition-colors duration-300"
              style={{ color: searchFocused ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm font-medium w-full min-w-[90px] transition-all duration-300"
              style={{
                color: 'var(--color-text-primary)',
                caretColor: 'var(--color-accent)',
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Spacer — hidden on mobile when mobile menu is open */}
        <div className="hidden md:block flex-1" />

        {/* Right: Notifications + Settings */}
        <div className="relative flex items-center gap-1 shrink-0">
          {/* Notification bell */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: notifOpen ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-hover)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = notifOpen ? 'var(--color-accent)' : 'var(--color-text-muted)';
            }}
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

          {/* Notifications dropdown */}
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

        {/* Settings */}
        <Link
          to="/admin/settings"
          className="p-2 rounded-lg transition-all duration-200 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: isActive('/admin/settings') ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-hover)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isActive('/admin/settings') ? 'var(--color-accent)' : 'var(--color-text-muted)';
          }}
        >
          <Settings size={18} strokeWidth={1.8} />
        </Link>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b animate-fade-in relative z-50"
          style={{
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="px-4 pb-3 pt-1 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px]"
                  style={{
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                    background: active ? 'var(--color-accent)' : 'transparent',
                    boxShadow: active ? '0 2px 8px rgba(255,107,44,0.3)' : 'none',
                  }}
                >
                  <Icon size={18} strokeWidth={2.2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(15, 27, 51, 0.3)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative z-0">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/fleet" element={<FleetMonitor />} />
          <Route path="/admin/live" element={<LiveOperations />} />
          <Route path="/admin/manifests" element={<AllManifests />} />
          <Route path="/admin/requests" element={<ClientRequests />} />
          <Route path="/admin/manifests/new" element={<ManifestCreate />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
