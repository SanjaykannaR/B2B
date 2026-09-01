import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { RouteEfficiencyData } from '../../services/analyticsApi';

interface RouteEfficiencyChartProps {
  data: RouteEfficiencyData;
}

export default function RouteEfficiencyChart({ data }: RouteEfficiencyChartProps) {
  return (
    <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', height: '100%', minWidth: 0, maxWidth: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
          Route Efficiency by Corridor
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
          On-time vs delayed delivery percentage per route
        </p>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data.corridors} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="corridor"
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              interval={0}
              tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 14)}…` : value)}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}
              formatter={(value: number | string, name: string) => [`${value}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
            <Bar dataKey="onTime" name="On-Time" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar dataKey="delayed" name="Delayed" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
