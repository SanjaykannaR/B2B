import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { RevenueSummaryData } from '../../services/analyticsApi';

interface RevenueSummaryProps {
  data: RevenueSummaryData;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function RevenueSummary({ data }: RevenueSummaryProps) {
  const rows = data.monthly.map((row) => ({
    month: row.month,
    shipments: row.shipments,
    revenue: row.revenue,
  }));

  return (
    <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Monthly Shipments & Revenue
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
            Dual Y-axis trend for the current year
          </p>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 600,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          ${(data.totalRevenue / 1000000).toFixed(1)}M total
        </span>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradShipments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}
              formatter={(value: number | string, name: string) =>
                name === 'revenue' ? [formatCurrency(Number(value)), 'Revenue'] : [value, 'Shipments']
              }
            />
            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
            <Area yAxisId="left" type="monotone" dataKey="shipments" name="Shipments" stroke="#FF6B2C" strokeWidth={2.5} fill="url(#gradShipments)" />
            <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
