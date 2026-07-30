import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Radio, FilePlus, Search, Settings, Menu, X } from 'lucide-react';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FleetMonitor } from './pages/admin/FleetMonitor';
import { LiveOperations } from './pages/admin/LiveOperations';
import { ManifestCreate } from './pages/admin/ManifestCreate';
import { Settings as SettingsPage } from './pages/admin/Settings';
import { AllManifests } from './pages/admin/AllManifests';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/fleet', label: 'Fleet', icon: Truck },
  { to: '/admin/live', label: 'Live Ops', icon: Radio },
  { to: '/admin/manifests/new', label: 'Create Manifest', icon: FilePlus },
];

export default function App() {
  const { pathname } = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/admin' ? pathname === '/admin' : pathname.startsWith(to);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
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

        {/* Logo */}
        <span className="text-lg font-bold tracking-tight shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
          B2B Logistics
        </span>

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
          className="relative rounded-full p-[2px] transition-all duration-500 ease-out flex-1 max-w-[120px] sm:max-w-[200px] md:flex-none md:w-auto"
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
              className="bg-transparent outline-none text-xs font-medium w-full min-w-[60px] transition-all duration-300"
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

        {/* Right: Settings */}
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-0">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/fleet" element={<FleetMonitor />} />
          <Route path="/admin/live" element={<LiveOperations />} />
          <Route path="/admin/manifests" element={<AllManifests />} />
          <Route path="/admin/manifests/new" element={<ManifestCreate />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
