import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiPackage, FiActivity, FiTrendingUp, FiMap, FiBarChart2 } from 'react-icons/fi';
import StatusBadge from '../../components/shared/StatusBadge';
import { getStoredManifests, ManifestItem } from '../../services/driverService';
import { formatWeight } from '../../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#10B981',
  Delayed: '#EF4444',
  Pending: '#F59E0B',
  Assigned: '#3B82F6',
  'In-Transit': '#8B5CF6',
  Cancelled: '#6B7280',
};

const STATUS_ORDER = ['Delivered', 'In-Transit', 'Assigned', 'Delayed', 'Pending', 'Cancelled'];

export default function DriverAnalytics() {
  const navigate = useNavigate();
  const [manifests, setManifests] = useState<ManifestItem[]>([]);

  useEffect(() => {
    setManifests(getStoredManifests());
  }, []);

  const completed = manifests.filter((m) => m.status === 'Delivered').length;
  const delayed = manifests.filter((m) => m.status === 'Delayed').length;
  const inProgress = manifests.filter((m) => m.status === 'Assigned' || m.status === 'In-Transit').length;

  const resolved = completed + delayed;
  const onTimeRate = resolved > 0 ? (completed / resolved) * 100 : 0;
  const totalDistance = manifests.reduce((sum, m) => sum + (m.distanceKm || 0), 0);
  const totalWeight = manifests.reduce((sum, m) => sum + (m.cargo?.weightKg || 0), 0);

  const statusCounts = STATUS_ORDER.filter((s) => manifests.some((m) => m.status === s))
    .map((s) => ({
      status: s,
      count: manifests.filter((m) => m.status === s).length,
      color: STATUS_COLORS[s] || '#94A3B8',
    }))
    .filter((s) => s.count > 0);

  const chartData = statusCounts.map((s) => ({ name: s.status, count: s.count, fill: s.color }));

  const routes = manifests
    .filter((m) => m.status === 'Delivered' || m.status === 'Delayed')
    .map((m) => ({
      trackingId: m.trackingId,
      corridor: `${m.origin.split(' (')[0]} → ${m.destination.split(' (')[0]}`,
      status: m.status,
      distanceKm: m.distanceKm,
      deliveredAt: m.schedule.actualDeliveryTime,
    }));

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <button
          onClick={() => navigate('/driver')}
          aria-label="Back"
          className="b2b-tap"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #E2E8F0', borderRadius: '0.75rem', backgroundColor: '#F8FAFC', color: '#1B2A4A', cursor: 'pointer', flexShrink: 0 }}
        >
<FiArrowLeft size={18} strokeWidth={2.5} />
          </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#1B2A4A' }}>Analytics</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Driver performance overview · {today}</div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '1rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-fade-in-up" style={{ flexShrink: 0, background: 'linear-gradient(135deg, #1B2A4A 0%, #0F1B33 100%)', borderRadius: '1rem', padding: '1.125rem 1.25rem', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.375rem' }}>
            <span style={{ backgroundColor: '#FF6B2C', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              DRIVER ANALYTICS
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Shift Performance</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
            {manifests.length} manifests · {inProgress} in progress
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s', flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <KpiTile icon={<FiCheckCircle size={16} />} label="On-Time Rate" value={`${onTimeRate.toFixed(0)}%`} color="#10B981" />
          <KpiTile icon={<FiPackage size={16} />} label="Completed" value={`${completed}`} color="#3B82F6" />
          <KpiTile icon={<FiActivity size={16} />} label="Distance" value={`${totalDistance} km`} color="#FF6B2C" />
          <KpiTile icon={<FiTrendingUp size={16} />} label="Cargo" value={formatWeight(totalWeight)} color="#8B5CF6" />
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader icon={<FiBarChart2 size={16} />} title="On-Time Delivery" />
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Completed vs delayed trips</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 800, fontSize: '1.375rem', color: completed > 0 ? '#059669' : '#94A3B8' }}>
                {onTimeRate.toFixed(1)}%
              </span>
            </div>
            <div style={{ height: 12, borderRadius: '9999px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${onTimeRate}%`,
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
              <span><strong style={{ color: '#059669' }}>{completed}</strong> on-time</span>
              <span><strong style={{ color: '#DC2626' }}>{delayed}</strong> delayed</span>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader icon={<FiPackage size={16} />} title="Status Distribution" />
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {statusCounts.map((s) => {
              const pct = manifests.length > 0 ? (s.count / manifests.length) * 100 : 0;
              return (
                <div key={s.status}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                      {s.status}
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>
                      {s.count} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: '9999px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '9999px', backgroundColor: s.color, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {chartData.length > 0 && (
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader icon={<FiBarChart2 size={16} />} title="Deliveries by Status" />
            <div style={{ width: '100%', height: 200, padding: '0.75rem 0.5rem 0.25rem' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}
                    formatter={(value: number | string, name: string) => [`${value} manifests`, name]}
                  />
                  <Bar dataKey="count" name="Deliveries" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <CardHeader icon={<FiMap size={16} />} title="Route Performance" />
          <div style={{ padding: '0.5rem 1rem 1rem', display: 'flex', flexDirection: 'column' }}>
            {routes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.8125rem' }}>
                No completed or delayed trips yet.
              </div>
            ) : (
              routes.map((r) => (
                <div key={r.trackingId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #EDF0F7' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: STATUS_COLORS[r.status] || '#94A3B8', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.corridor}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontFamily: "'IBM Plex Mono', monospace", marginTop: '2px' }}>
                      {r.trackingId} · {r.distanceKm} km
                    </div>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ flexShrink: 0, minWidth: 0, width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(26, 29, 38, 0.06)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.875rem 1rem', borderBottom: '1px solid #EDF0F7' }}>
      <span style={{ display: 'inline-flex', color: '#FF6B2C' }}>{icon}</span>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>{title}</h3>
    </div>
  );
}

function KpiTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '0.875rem', boxShadow: '0 1px 3px rgba(26, 29, 38, 0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #EDF0F7' }}>
          {icon}
        </span>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1.375rem', fontWeight: 800, color: '#1B2A4A', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '3px' }}>
        {label}
      </div>
    </div>
  );
}
