import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { TrendingUp, Wallet, Clock, Truck, Gauge } from 'lucide-react';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import {
  getFleetUtilization, getRouteEfficiency, getMonthlyCapacity,
  getDeliveryPerformance, getRevenueSummary,
} from '../../services/analyticsApi';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#FF6B2C'];

const fmtMoney = (v: number) =>
  Number(v || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const ExecutiveAnalytics: React.FC = () => {
  const [rev, setRev] = useState<any>(null);
  const [fleet, setFleet] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [perf, setPerf] = useState<any>(null);
  const [cap, setCap] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([
      getRevenueSummary(), getFleetUtilization(), getRouteEfficiency(),
      getDeliveryPerformance(), getMonthlyCapacity(),
    ]).then(([r, f, rt, p, c]) => {
      const val = (x: any) => (x as any).status === 'fulfilled' ? (x as any).value : null;
      setRev(val(r));
      setFleet(val(f));
      setRoute(val(rt));
      setPerf(val(p));
      const capData = val(c);
      setCap(Array.isArray(capData) ? capData : []);
    });
  }, []);

  const revenueMonthly = rev?.monthly || [];
  const utilizationData = fleet?.byStatus || [];
  const perfData = perf?.data || [];

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Executive Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Business-wide performance across revenue, fleet and delivery
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total revenue', value: fmtMoney(rev?.totalRevenue || 0), icon: TrendingUp, color: '#FF6B2C' },
          { label: 'Collected', value: fmtMoney(rev?.totalPaid || 0), icon: Wallet, color: '#10B981' },
          { label: 'Outstanding', value: fmtMoney(rev?.totalPending || 0), icon: Clock, color: '#F59E0B' },
          { label: 'On-time rate', value: `${route?.onTimeRate ?? 0}%`, icon: Gauge, color: '#3B82F6' },
        ]).map((kpi, i) => (
          <AnimatedCard key={kpi.label} delay={60 * (i + 1)}>
            <div className="rounded-2xl border p-5 h-full" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="h-1 w-full rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {kpi.label}
              </p>
              <p className="text-2xl font-bold tracking-tight mt-1 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {kpi.value}
              </p>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly revenue */}
        <AnimatedCard>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#8B92A8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#8B92A8" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: any) => fmtMoney(Number(v))} />
                <Bar dataKey="revenue" fill="#FF6B2C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Fleet utilization */}
        <AnimatedCard>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              <Truck size={15} style={{ color: 'var(--color-accent)' }} /> Fleet Utilization
            </h2>
            <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
              <span>{fleet?.total ?? 0} vehicles · {fleet?.avgEfficiencyKmPerLiter ?? 0} km/L avg</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={utilizationData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={(p: any) => `${p.name} (${p.count})`}>
                  {utilizationData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Delivery performance */}
        <AnimatedCard>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Delivery Performance</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={perfData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
                  {perfData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? '#10B981' : '#EF4444'} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-around mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-bold" style={{ color: '#10B981' }}>{perf?.delivered ?? 0} delivered</span>
              <span className="font-bold" style={{ color: '#EF4444' }}>{perf?.delayed ?? 0} delayed</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{perf?.deliveredRate ?? 0}% success</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Monthly capacity */}
        <AnimatedCard>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Monthly Load (kg)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#8B92A8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#8B92A8" />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('en-IN')} kg`} />
                <Line type="monotone" dataKey="totalWeightKg" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};
