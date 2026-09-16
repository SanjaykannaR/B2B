import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  PackageSearch, Activity, MapPin, FileText, RefreshCw, Package,
  Bell, Settings, Menu, X, LogOut, type LucideIcon,
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { getNotifications, markRead, markAllRead, type NotificationItem } from '../../services/notificationApi';
import toast from 'react-hot-toast';

type NavKey = 'dashboard' | 'track' | 'invoices' | 'place-order' | 'settings';

interface ClientNavbarProps {
  active: NavKey;
}

const NAV_LINKS: { key: NavKey; label: string; icon: LucideIcon; path: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity, path: '/client/dashboard' },
  { key: 'track', label: 'Live Tracking', icon: MapPin, path: '/client/track' },
  { key: 'invoices', label: 'Billing', icon: FileText, path: '/client/invoices' },
];

export default function ClientNavbar({ active }: ClientNavbarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchNotifs();
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  const navClass = (key: NavKey) =>
    key === active
      ? 'text-orange-600 bg-orange-50'
      : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50';

  const actionBtn = (isActive = false) =>
    `relative text-slate-600 hover:text-orange-600 hover:bg-orange-50 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
      isActive ? 'text-orange-600 bg-orange-50' : ''
    }`;

  const renderNotificationDropdown = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-[slideDown_0.2s_ease-out_forwards] origin-top-right">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500 font-medium">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div key={n._id} onClick={() => !n.isRead && handleMarkRead(n._id)} className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 ${n.isRead ? 'opacity-60' : 'bg-orange-50/30'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <nav className="bg-white border-b border-slate-200 py-3 md:py-4 px-4 md:px-8 sticky top-0 z-[100] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => go('/client/dashboard')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#0a0a0a] border border-orange-500 shadow-sm">
            <PackageSearch className="w-5 h-5 text-orange-500" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">B2B Logistics</span>
            <span className="text-[10px] font-semibold text-slate-500 leading-tight">Freight Operations Console</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1 text-sm font-semibold">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => go(link.path)}
              className={`${navClass(link.key)} px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1.5`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </button>
          ))}

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => window.location.reload()}
              className="text-slate-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1.5"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden lg:inline">Refresh</span>
            </button>
            <button
              onClick={() => go('/client/place-order')}
              className={`${navClass('place-order')} px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1.5`}
              title="New Shipment"
            >
              <Package className="w-4 h-4" />
              <span className="hidden lg:inline">Shipment</span>
            </button>

            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={actionBtn(showNotifications)} title="Notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border border-white"></span>
                  </span>
                )}
              </button>
              {showNotifications && renderNotificationDropdown()}
            </div>

            <button onClick={() => go('/client/settings')} className={actionBtn(active === 'settings')} title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-orange-600 transition-all duration-300"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden mt-4 border-t border-slate-100 pt-3 animate-[dashPopIn_0.25s_ease-out]">
          <div className="flex flex-col space-y-1 text-sm font-semibold">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => go(link.path)}
                className={`${navClass(link.key)} w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
            <button
              onClick={() => window.location.reload()}
              className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-orange-600 px-2 py-2.5 rounded-xl hover:bg-orange-50 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-[10px] font-bold">Refresh</span>
            </button>
            <button
              onClick={() => go('/client/place-order')}
              className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all duration-300 ${
                active === 'place-order' ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-bold">Shipment</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="w-full flex flex-col items-center gap-1.5 text-slate-600 hover:text-orange-600 px-2 py-2.5 rounded-xl hover:bg-orange-50 transition-all duration-300">
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border border-white"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold">Alerts</span>
              </button>
              {showNotifications && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 text-left z-50">
                  {renderNotificationDropdown()}
                </div>
              )}
            </div>
            <button
              onClick={() => go('/client/settings')}
              className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all duration-300 ${
                active === 'settings' ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-bold">Settings</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
