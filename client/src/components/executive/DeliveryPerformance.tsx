import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { DeliveryPerformanceData } from '../../services/analyticsApi';

interface DeliveryPerformanceProps {
  data: DeliveryPerformanceData;
}

export default function DeliveryPerformance({ data }: DeliveryPerformanceProps) {
  const total = data.breakdown.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', height: '100%', minWidth: 0, maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Delivery Performance
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
            On-Time · Delayed · Cancelled breakdown
          </p>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#D1FAE5',
            color: '#047857',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {data.onTimeRate.toFixed(1)}% on-time
        </span>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data.breakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={96}
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#CBD5E1' }}
            >
              {data.breakdown.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}
              formatter={(value: number | string, name: string) => [
                `${value} orders (${((Number(value) / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
