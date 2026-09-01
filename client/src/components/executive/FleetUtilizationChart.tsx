import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { FleetUtilizationData } from '../../services/analyticsApi';

interface FleetUtilizationChartProps {
  data: FleetUtilizationData;
}

export default function FleetUtilizationChart({ data }: FleetUtilizationChartProps) {
  const total = data.statusDistribution.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Fleet Status Distribution
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
            Available · In-Transit · Maintenance
          </p>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#1B2A4A',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {data.utilizationRate.toFixed(1)}% utilized
        </span>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data.statusDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={3}
              stroke="#FFFFFF"
              strokeWidth={3}
            >
              {data.statusDistribution.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}
              formatter={(value: number | string, name: string) => [`${value} vehicles`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.8125rem' }}
              formatter={(value: string) => {
                const slice = data.statusDistribution.find((s) => s.name === value);
                return `${value} (${slice ? Math.round((slice.value / total) * 100) : 0}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
