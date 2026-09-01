import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../utils/constants';
import { FiBarChart2, FiTruck, FiFilePlus, FiMapPin, FiHome, FiPackage, FiSearch, FiFileText } from 'react-icons/fi';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  admin: [
    {
      label: 'Admin',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <FiBarChart2 size={17} /> },
        { to: '/admin/fleet', label: 'Fleet Monitor', icon: <FiTruck size={17} /> },
        { to: '/admin/manifest/create', label: 'Create Manifest', icon: <FiFilePlus size={17} /> },
        { to: '/admin/live-ops', label: 'Live Operations', icon: <FiMapPin size={17} /> },
      ],
    },
  ],
  client: [
    {
      label: 'Client',
      items: [
        { to: '/client/dashboard', label: 'Dashboard', icon: <FiHome size={17} /> },
        { to: '/client/place-order', label: 'Place Order', icon: <FiPackage size={17} /> },
        { to: '/client/track', label: 'Track Shipment', icon: <FiSearch size={17} /> },
        { to: '/client/invoices', label: 'Invoices', icon: <FiFileText size={17} /> },
      ],
    },
  ],
  driver: [
    {
      label: 'Driver',
      items: [{ to: '/driver', label: 'My Deliveries', icon: <FiTruck size={17} /> }],
    },
  ],
  executive: [
    {
      label: 'Executive',
      items: [{ to: '/executive/analytics', label: 'Analytics', icon: <FiBarChart2 size={17} /> }],
    },
  ],
};

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 240;

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed = false, onClose }: SidebarProps) {
  const { role, user } = useAuth();
  const sections = role ? NAV_BY_ROLE[role] : [];
  const isCollapsed = collapsed;

  return (
    <aside
      style={{
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        backgroundColor: '#0F1B33',
        background: 'linear-gradient(180deg, #1B2A4A 0%, #0F1B33 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        transition: 'width 0.25s ease',
      }}
    >
      <div
        style={{
          padding: isCollapsed ? '1.5rem 0' : '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: isCollapsed ? 'center' : 'left',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: isCollapsed ? '1rem' : '1.125rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }}>
          {isCollapsed ? 'B2B' : 'B2B Logistics'}
        </div>
        {!isCollapsed && (
          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
            Smart Delivery Platform
          </div>
        )}
      </div>

      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {sections.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem 0.5rem 0.5rem' }}>
                {section.label}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(255, 107, 44, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF6B2C' : '3px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                })}
              >
                <span style={{ display: 'inline-flex', flexShrink: 0 }}>{item.icon}</span>
                {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '1rem 0.875rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#FF6B2C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name ?? 'User'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {role ?? '…'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
