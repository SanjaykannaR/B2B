import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Radio,
  ClipboardList,
  Search,
  FilePlus,
  Settings,
  PackageSearch,
  Receipt,
  BarChart3,
  Users,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { logoutUser } from '../../store/authSlice';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ADMIN: NavSection = {
  title: 'Admin',
  items: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/fleet', label: 'Fleet Monitor', icon: Truck },
    { to: '/admin/live', label: 'Live Operations', icon: Radio },
    { to: '/admin/manifests', label: 'Manifests', icon: ClipboardList },
    { to: '/admin/requests', label: 'Client Requests', icon: Search },
    { to: '/admin/invoices', label: 'Invoices', icon: Receipt },
    { to: '/admin/users', label: 'Users', icon: Users },
    // { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/manifests/new', label: 'Create Manifest', icon: FilePlus },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

const EXEC: NavSection = {
  title: 'Executive',
  items: [{ to: '/executive/analytics', label: 'Analytics', icon: BarChart3, end: true }],
};

// Client/Driver sections are owned by another developer's team — removed from this
// console. Admin sees Admin + Executive only.
const ROLE_SECTIONS: Record<string, NavSection[]> = {
  admin: [ADMIN, EXEC],
  executive: [EXEC],
};

interface SidebarProps {
  role: string;
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sections = ROLE_SECTIONS[role] || [];

  const handleLogout = () => {
    dispatch(logoutUser());
    onClose();
    navigate('/', { replace: true });
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 shrink-0">
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{
            background: '#0B0B0C',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,107,44,0.35)',
          }}
        >
          <PackageSearch size={18} strokeWidth={2.2} style={{ color: 'var(--color-accent)' }} />
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: 'var(--color-accent)', borderColor: '#0F1B33' }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight truncate text-white" style={{ fontFamily: 'var(--font-mono)' }}>
            B2B Logistics
          </p>
          <p className="text-[10px] font-medium text-white/45 uppercase tracking-wider">Operations Console</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden ml-auto p-1.5 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center text-white/60"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Sections */}
      <nav className="flex-1 scrollbar-hidden overflow-y-auto px-3 pb-6 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--color-accent)' : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(255,107,44,0.35)' : 'none',
                    minHeight: 44,
                  })}
                >
                  <Icon size={16} strokeWidth={2.2} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 transition-all duration-200"
          style={{ minHeight: 44 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = 'var(--color-error)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ''; }}
        >
          <LogOut size={16} strokeWidth={2.2} className="shrink-0" />
          <span className="truncate">Log out</span>
        </button>
        <p className="px-3 mt-2 text-[10px] text-white/35" style={{ fontFamily: 'var(--font-mono)' }}>
          v1.0 · JWT secured
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:block shrink-0"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-primary-dark)',
          boxShadow: 'var(--shadow-sidebar)',
        }}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[var(--z-sidebar)]">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[260px] animate-slide-right"
            style={{ background: 'var(--color-primary-dark)', boxShadow: 'var(--shadow-modal)' }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
