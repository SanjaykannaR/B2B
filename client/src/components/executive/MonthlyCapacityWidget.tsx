import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { MonthlyCapacityData } from '../../services/analyticsApi';

interface MonthlyCapacityWidgetProps {
  data: MonthlyCapacityData;
}

export default function MonthlyCapacityWidget({ data }: MonthlyCapacityWidgetProps) {
  const rows = data.monthly.map((row) => ({
    month: row.month,
    shipments: row.shipments,
    capacityUtilized: row.capacityUtilized,
  }));

  return (
    <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', height: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
          Monthly Shipment Trends
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
          Year-to-date shipment volume with capacity utilization
        </p>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}
              formatter={(value: number | string, name: string) =>
                name === 'capacityUtilized' ? [`${value}%`, 'Capacity Utilized'] : [value, 'Shipments']
              }
            />
            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
            <ReferenceLine
              yAxisId="right"
              y={80}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              label={{ value: '80% target', position: 'insideTopRight', fontSize: 11, fill: '#B45309' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="shipments" name="Shipments" stroke="#1B2A4A" strokeWidth={2.5} dot={{ r: 4, fill: '#1B2A4A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="capacityUtilized" name="Capacity Utilized" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
