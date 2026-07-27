import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FleetMonitor } from './pages/admin/FleetMonitor';
import { LiveOperations } from './pages/admin/LiveOperations';
import { ManifestCreate } from './pages/admin/ManifestCreate';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/fleet', label: 'Fleet' },
  { to: '/admin/live', label: 'Live Ops' },
  { to: '/admin/manifests/new', label: 'Create Manifest' },
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
      {/* Top Nav */}
      <nav
        className="shrink-0 flex items-center gap-6 px-6 py-3 border-b"
        style={{
          background: 'var(--color-surface-card)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
          B2B Logistics
        </span>
        <div className="flex gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-hover)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/fleet" element={<FleetMonitor />} />
          <Route path="/admin/live" element={<LiveOperations />} />
          <Route path="/admin/manifests/new" element={<ManifestCreate />} />
        </Routes>
      </main>
    </div>
  );
}
