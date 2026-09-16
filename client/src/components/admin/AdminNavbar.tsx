import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ShieldAlert, LayoutDashboard, Truck, Activity, FilePlus, RefreshCw,
  Bell, Menu, X, LogOut, type LucideIcon,
} from 'lucide-react';
import { logout } from '../../store/authSlice';

type NavKey = 'dashboard' | 'fleet' | 'operations' | 'create-manifest' | 'settings';

interface AdminNavbarProps {
  active: NavKey;
}

const NAV_LINKS: { key: NavKey; label: string; icon: LucideIcon; path: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { key: 'fleet', label: 'Fleet Monitor', icon: Truck, path: '/admin/fleet' },
  { key: 'operations', label: 'Live Operations', icon: Activity, path: '/admin/operations' },
  { key: 'create-manifest', label: 'New Manifest', icon: FilePlus, path: '/admin/manifest/create' },
];

export default function AdminNavbar({ active }: AdminNavbarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  // Using a blue theme for Admin to differentiate from Client (orange)
  const navClass = (key: NavKey) =>
    key === active
      ? 'text-blue-600 bg-blue-50'
      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50';

  const actionBtn = (isActive = false) =>
    `relative text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
      isActive ? 'text-blue-600 bg-blue-50' : ''
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 py-3 md:py-4 px-4 md:px-8 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => go('/admin/dashboard')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-blue-500 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">Admin Console</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-tight">System Control</span>
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
          <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-slate-200">
            <button
              onClick={() => window.location.reload()}
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1.5"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button className={actionBtn()} title="System Alerts">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
              </span>
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-all duration-300 flex items-center space-x-1.5 ml-1" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-300"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden mt-4 border-t border-slate-100 pt-3 animate-in slide-in-from-top-2 fade-in duration-200">
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
              className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-blue-600 px-2 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-[10px] font-bold">Refresh</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-blue-600 px-2 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="text-[10px] font-bold">Alerts</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out System</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
