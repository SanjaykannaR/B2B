import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/shared/StatusBadge';
import { useRecovery } from '../../hooks/useRecovery';
import { getStoredManifests, ManifestItem } from '../../services/driverService';
import { formatWeight, formatDateTime, formatElapsedTime } from '../../utils/formatters';

interface DriverDashboardProps {
  onNavigateToDelivery?: (manifestId: string) => void;
}

type Tab = 'home' | 'deliveries' | 'history';

const FILTERS: { id: 'ALL' | 'DELIVERED' | 'DELAYED'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'DELAYED', label: 'Delayed' },
];

function DeliveryCard({ manifest, onOpen, featured = false }: { manifest: ManifestItem; onOpen: (id: string) => void; featured?: boolean }) {
  const { formattedTime, isRunning } = useRecovery(
    manifest.id,
    manifest.status === 'In-Transit'
  );

  return (
    <div
      className="b2b-tap"
      onClick={() => onOpen(manifest.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(manifest.id);
        }
      }}
      style={{
        cursor: 'pointer',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderLeft: `4px solid ${manifest.cargo.isHazmat ? '#F59E0B' : '#2563EB'}`,
        borderRadius: '1rem',
        boxShadow: '0 1px 3px rgba(26, 29, 38, 0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1rem 1rem 0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: '1rem', color: '#1B2A4A', letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
              {manifest.trackingId}
            </span>
            {manifest.cargo.isHazmat && (
              <span
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FCD34D',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                ⚠️
              </span>
            )}
          </div>
          <StatusBadge status={manifest.status} size="sm" />
        </div>

        <div style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {manifest.clientName}
        </div>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #EDF0F7', borderRadius: '0.75rem', padding: '0.625rem 0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.625rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>From</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {manifest.origin}
              </div>
            </div>
            <div style={{ color: '#FF6B2C', fontSize: '1.125rem', fontWeight: 800, flexShrink: 0 }}>➔</div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>To</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {manifest.destination}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <MetaChip label="Weight" value={formatWeight(manifest.cargo.weightKg)} />
          <MetaChip label="Items" value={`${manifest.cargo.itemCount} pkgs`} />
          <MetaChip label="Distance" value={`${manifest.distanceKm} km`} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.625rem', borderTop: '1px solid #EDF0F7' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isRunning ? '#1E1B4B' : '#F1F5F9',
              color: isRunning ? '#A5B4FC' : '#64748B',
              padding: '0.25rem 0.625rem',
              borderRadius: '0.5rem',
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.04em',
            }}
          >
            <span
              className={isRunning ? 'animate-pulse' : ''}
              style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isRunning ? '#10B981' : '#94A3B8' }}
            />
            {formattedTime}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#FF6B2C', fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            {featured ? 'View' : 'Open'}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', backgroundColor: '#F1F5F9', borderRadius: '0.5rem', padding: '4px 6px', minWidth: 0 }}>
      <span style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {value}
      </span>
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>{subtitle}</p>}
    </div>
  );
}

function EmptyState({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem 0' }}>{title}</div>
      <div style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>{note}</div>
    </div>
  );
}

const TAB_ICONS: Record<Tab, (active: boolean) => JSX.Element> = {
  home: (active) => (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? '#FF6B2C' : 'none'} stroke={active ? '#FF6B2C' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  deliveries: (active) => (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? '#FF6B2C' : 'none'} stroke={active ? '#FF6B2C' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  ),
  history: (active) => (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? '#FF6B2C' : 'none'} stroke={active ? '#FF6B2C' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  ),
};

const STATUS_DOT: Record<string, string> = {
  Delivered: '#10B981',
  Delayed: '#EF4444',
  Pending: '#F59E0B',
  Assigned: '#3B82F6',
  'In-Transit': '#8B5CF6',
  Cancelled: '#6B7280',
};

export default function DriverDashboard({ onNavigateToDelivery }: DriverDashboardProps) {
  const navigate = useNavigate();
  const [manifests, setManifests] = useState<ManifestItem[]>([]);
  const [tab, setTab] = useState<Tab>('home');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DELIVERED' | 'DELAYED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setManifests(getStoredManifests());
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const activeDeliveries = manifests.filter(
    (m) => m.status === 'Assigned' || m.status === 'In-Transit'
  );

  const recentHistory = manifests
    .filter((m) => m.status === 'Delivered' || m.status === 'Delayed')
    .filter((m) => {
      if (historyFilter === 'DELIVERED') return m.status === 'Delivered';
      if (historyFilter === 'DELAYED') return m.status === 'Delayed';
      return true;
    })
    .filter((m) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        m.trackingId.toLowerCase().includes(query) ||
        m.origin.toLowerCase().includes(query) ||
        m.destination.toLowerCase().includes(query) ||
        m.clientName.toLowerCase().includes(query)
      );
    });

  const handleOpenDelivery = (manifestId: string) => {
    if (onNavigateToDelivery) {
      onNavigateToDelivery(manifestId);
    } else {
      navigate(`/driver/delivery/${manifestId}`);
    }
  };

  const counts = {
    active: activeDeliveries.length,
    delivered: manifests.filter((m) => m.status === 'Delivered').length,
    delayed: manifests.filter((m) => m.status === 'Delayed').length,
  };

  const shiftStart = (() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  })();

  const shiftElapsed = Math.max(0, Math.floor((now.getTime() - shiftStart.getTime()) / 1000));

  const tabItems: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1.5rem' }}>
        {tab === 'home' && (
          <div className="animate-tab-enter" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 3px rgba(26, 29, 38, 0.06)', overflow: 'hidden', position: 'relative' }}>
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #FF6B2C, transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.5s linear infinite',
                  opacity: 0.9,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.9375rem' }}>Today's Shift</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#D1FAE5', color: '#047857', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  On Duty
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <StatTile icon={<TruckIcon />} label="Active" value={counts.active} color="#2563EB" />
                <StatTile icon={<CheckIcon />} label="Delivered" value={counts.delivered} color="#10B981" />
                <StatTile icon={<AlertIcon />} label="Delayed" value={counts.delayed} color="#EF4444" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid #EDF0F7', fontSize: '0.75rem', color: '#64748B' }}>
                <span>
                  Shift started <strong style={{ color: '#1E293B' }}>08:00 AM</strong>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Elapsed
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: '#FF6B2C', fontSize: '0.875rem', letterSpacing: '0.03em' }}>
                    {formatElapsedTime(shiftElapsed)}
                  </span>
                </span>
              </div>
            </div>

            {activeDeliveries.length > 0 ? (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <SectionHeader title="Next Up" subtitle="Your most urgent assigned manifest" />
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.08s' }}>
                  <DeliveryCard manifest={activeDeliveries[0]!} onOpen={handleOpenDelivery} featured />
                </div>
                {activeDeliveries.length > 1 && (
                  <button
                    onClick={() => setTab('deliveries')}
                    className="b2b-tap"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '0.625rem', color: '#1B2A4A', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    View all {activeDeliveries.length} active deliveries
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}
              </section>
            ) : (
              <div className="animate-fade-in-up">
                <EmptyState icon="🚚" title="No Active Deliveries" note="All assigned manifests are complete. New dispatches will appear here." />
              </div>
            )}
          </div>
        )}

        {tab === 'deliveries' && (
          <div className="animate-tab-enter" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="animate-fade-in-up">
              <SectionHeader title="Active Deliveries" subtitle={`${counts.active} manifests assigned to you`} />
            </div>
            {activeDeliveries.length === 0 ? (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                <EmptyState icon="🚚" title="No Active Deliveries" note="Manifests assigned to you or currently in transit will show here." />
              </div>
            ) : (
              activeDeliveries.map((manifest, i) => (
                <div key={manifest.id} className="animate-scale-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <DeliveryCard manifest={manifest} onOpen={handleOpenDelivery} />
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="animate-tab-enter" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="animate-fade-in-up">
              <SectionHeader title="Delivery History" subtitle="Completed and delayed manifests" />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.05s', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '0.5rem 0.75rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search tracking ID or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', color: '#1E293B', background: 'transparent' }}
              />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', display: 'flex', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '0.75rem' }}>
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setHistoryFilter(filter.id)}
                  className="b2b-tap"
                  style={{
                    flex: 1,
                    backgroundColor: historyFilter === filter.id ? '#FFFFFF' : 'transparent',
                    color: historyFilter === filter.id ? '#1B2A4A' : '#64748B',
                    border: 'none',
                    padding: '0.375rem 0.625rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: historyFilter === filter.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {recentHistory.length === 0 ? (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <EmptyState icon="🗂️" title="No History Found" note="No records match your current filters." />
              </div>
            ) : (
              recentHistory.map((manifest, i) => (
                <div
                  key={manifest.id}
                  className="b2b-tap animate-scale-in"
                  onClick={() => handleOpenDelivery(manifest.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenDelivery(manifest.id);
                    }
                  }}
                  style={{ animationDelay: `${i * 0.06}s`, cursor: 'pointer', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.875rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: STATUS_DOT[manifest.status] || '#94A3B8', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: '0.875rem', color: '#1B2A4A' }}>
                        {manifest.trackingId}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: manifest.status === 'Delayed' ? '#DC2626' : '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                        {manifest.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {manifest.origin} <span style={{ color: '#FF6B2C' }}>➔</span> {manifest.destination}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px', fontFamily: "'IBM Plex Mono', monospace" }}>
                      {manifest.schedule.actualDeliveryTime
                        ? formatDateTime(manifest.schedule.actualDeliveryTime)
                        : formatDateTime(manifest.schedule.pickupTime)}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <nav style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '0.375rem 0.75rem 0.5rem', display: 'flex' }}>
        {tabItems.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              aria-current={active ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '0.25rem 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: active ? '#FF6B2C' : '#94A3B8',
              }}
            >
              <span
                className={active ? 'animate-scale-in' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 28,
                  borderRadius: '0.875rem',
                  backgroundColor: active ? 'rgba(255, 107, 44, 0.12)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {TAB_ICONS[item.id](active)}
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: active ? 800 : 600 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function StatTile({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) {
  return (
    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #EDF0F7', borderRadius: '0.75rem', padding: '0.625rem 0.5rem', textAlign: 'center' }}>
      <div style={{ color, display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1.375rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8.5 12.5 11 15 15.5 9.5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
