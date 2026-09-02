import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, CheckCheck, PackageSearch, Search, Truck, Receipt, Users, FileText } from 'lucide-react';
import * as notificationApi from '../../services/notificationApi';
import * as manifestApi from '../../services/manifestApi';
import * as vehicleApi from '../../services/vehicleApi';
import * as userApi from '../../services/userApi';
import * as invoiceApi from '../../services/invoiceApi';
import { useDebounce } from '../../hooks/useDebounce';
import type { RootState } from '../../store/store';

interface SearchResult {
  id: string;
  type: 'manifest' | 'vehicle' | 'user' | 'invoice';
  title: string;
  subtitle: string;
  route: string;
  icon: React.ReactNode;
}

const DEMO_NOTIFICATIONS = [
  { _id: 'n1', title: 'Manifest assigned', message: 'Vehicle assigned to a trip.', read: false, time: '2 min ago' },
  { _id: 'n2', title: 'Delivery completed', message: 'Shipment delivered to destination DC.', read: false, time: '1 hr ago' },
  { _id: 'n3', title: 'Delay reported', message: 'A shipment was delayed in transit.', read: true, time: '3 hrs ago' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  manifest: <FileText size={14} />,
  vehicle: <Truck size={14} />,
  user: <Users size={14} />,
  invoice: <Receipt size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  manifest: '#8B5CF6',
  vehicle: '#3B82F6',
  user: '#F59E0B',
  invoice: '#10B981',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

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

  useEffect(() => { setNotifOpen(false); }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationApi.markAllRead().catch(() => {});
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    notificationApi.markRead(id).catch(() => {});
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    try {
      const [manifestsRes, vehiclesRes, usersRes, invoicesRes] = await Promise.allSettled([
        manifestApi.getManifests({}).catch(() => ({ manifests: [] })),
        vehicleApi.getVehicles().catch(() => ({ vehicles: [] })),
        userApi.getUsers({}).catch(() => ({ users: [] })),
        invoiceApi.getInvoices().catch(() => ({ invoices: [] })),
      ]);

      // Search manifests
      const manifestsData = manifestsRes.status === 'fulfilled'
        ? (manifestsRes.value as any)?.manifests || (manifestsRes.value as any) || []
        : [];
      if (Array.isArray(manifestsData)) {
        manifestsData.slice(0, 30).forEach((m: any) => {
          const text = `${m.trackingId || ''} ${m.client?.name || m.clientName || ''} ${m.origin?.city || ''} ${m.destination?.city || ''} ${m.cargoDetails?.description || ''}`.toLowerCase();
          if (text.includes(q)) {
            results.push({
              id: m._id || '',
              type: 'manifest',
              title: m.trackingId || 'Manifest',
              subtitle: `${m.origin?.city || '?'} → ${m.destination?.city || '?'} · ${m.status || ''}`,
              route: '/admin/manifests',
              icon: TYPE_ICONS.manifest,
            });
          }
        });
      }

      // Search vehicles
      const vehiclesData = vehiclesRes.status === 'fulfilled'
        ? (vehiclesRes.value as any)?.vehicles || (vehiclesRes.value as any) || []
        : [];
      if (Array.isArray(vehiclesData)) {
        vehiclesData.slice(0, 15).forEach((v: any) => {
          const text = `${v.registrationNumber || ''} ${v.make || ''} ${v.model || ''}`.toLowerCase();
          if (text.includes(q)) {
            results.push({
              id: v._id || '',
              type: 'vehicle',
              title: v.registrationNumber || 'Vehicle',
              subtitle: `${v.make || ''} ${v.model || ''} · ${v.status || ''}`,
              route: '/admin/fleet',
              icon: TYPE_ICONS.vehicle,
            });
          }
        });
      }

      // Search users
      const usersData = usersRes.status === 'fulfilled'
        ? (usersRes.value as any)?.users || (usersRes.value as any) || []
        : [];
      if (Array.isArray(usersData)) {
        usersData.slice(0, 15).forEach((u: any) => {
          const text = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.company || ''}`.toLowerCase();
          if (text.includes(q)) {
            results.push({
              id: u._id || '',
              type: 'user',
              title: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
              subtitle: `${u.email || ''} · ${u.role || ''}`,
              route: '/admin/users',
              icon: TYPE_ICONS.user,
            });
          }
        });
      }

      // Search invoices
      const invoicesData = invoicesRes.status === 'fulfilled'
        ? (invoicesRes.value as any)?.invoices || (invoicesRes.value as any) || []
        : [];
      if (Array.isArray(invoicesData)) {
        invoicesData.slice(0, 15).forEach((inv: any) => {
          const text = `${inv.invoiceNumber || ''} ${inv.client?.name || inv.clientName || ''} ${inv.trackingId || ''}`.toLowerCase();
          if (text.includes(q)) {
            results.push({
              id: inv._id || '',
              type: 'invoice',
              title: inv.invoiceNumber || 'Invoice',
              subtitle: `${inv.client?.name || inv.clientName || ''} · ₹${inv.totalAmount || 0}`,
              route: '/admin/invoices',
              icon: TYPE_ICONS.invoice,
            });
          }
        });
      }
    } catch {
      // Silent fail — search results stay empty
    }

    setSearchResults(results.slice(0, 20));
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [debouncedQuery, performSearch]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchResults]);

  // Close search dropdown on click outside
  useEffect(() => {
    if (!searchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [searchOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < searchResults.length) {
      e.preventDefault();
      const result = searchResults[activeIndex];
      if (result) {
        navigate(result.route);
        setSearchOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.route);
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: { type: string; items: SearchResult[] }[] = [];
    const seen = new Set<string>();
    for (const r of searchResults) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        groups.push({ type: r.type, items: searchResults.filter((x) => x.type === r.type) });
      }
    }
    return groups;
  }, [searchResults]);

  const globalIndex = (groupIdx: number, itemIdx: number) => {
    let count = 0;
    for (let g = 0; g < groupIdx; g++) {
      const group = groupedResults[g];
      if (group) count += group.items.length;
    }
    return count + itemIdx;
  };

  return (
    <header
      className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b sticky top-0 z-[var(--z-topbar)]"
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

      {/* Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-xl">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search manifests, vehicles, users, invoices..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] min-h-[40px]"
            style={{
              background: 'var(--color-surface)',
              borderColor: searchOpen ? 'var(--color-accent)' : 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Clear search"
            >
              <span className="text-xs font-semibold">Esc</span>
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {searchOpen && (searchQuery.trim() || searchLoading) && (
          <div
            className="absolute left-0 right-0 top-full mt-2 rounded-2xl border overflow-hidden animate-scale-in z-50 max-h-[420px] overflow-y-auto"
            style={{
              background: 'var(--color-surface-card)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            {searchLoading && (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 mx-auto" style={{ borderColor: 'var(--color-accent)' }} />
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>Searching...</p>
              </div>
            )}

            {!searchLoading && searchResults.length === 0 && searchQuery.trim() && (
              <div className="px-4 py-8 text-center">
                <Search size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No results found</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Try a different search term
                </p>
              </div>
            )}

            {!searchLoading && groupedResults.map((group, gi) => (
              <div key={group.type}>
                <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: TYPE_COLORS[group.type] }}
                  >
                    {TYPE_ICONS[group.type]}
                    {group.type}s ({group.items.length})
                  </p>
                </div>
                {group.items.map((result, ii) => {
                  const idx = globalIndex(gi, ii);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-b last:border-b-0"
                      style={{
                        borderColor: 'var(--color-border-light)',
                        background: idx === activeIndex ? 'var(--color-surface-hover)' : 'transparent',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${TYPE_COLORS[result.type]}15`, color: TYPE_COLORS[result.type] }}
                      >
                        {result.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {result.title}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {result.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 hidden sm:block" />

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
            <button
              onClick={() => navigate('/admin/notifications')}
              className="w-full text-left px-4 py-3 border-t text-xs font-bold transition-colors min-h-[44px]"
              style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-accent)' }}
            >
              View all notifications →
            </button>
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
      </div>
    </header>
  );
};
