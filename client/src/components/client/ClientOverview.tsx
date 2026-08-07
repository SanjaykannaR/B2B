import { Package, DollarSign, Activity, TrendingUp } from 'lucide-react';
import StatCard from '../shared/StatCard';

export default function ClientOverview() {
  const stats = [
    { label: 'Active Deliveries', value: '24', icon: Package, trend: '+12% this week', positive: true, theme: 'orange' as const },
    { label: 'Monthly Freight Spent', value: '$45,230', icon: DollarSign, trend: '-2.4% vs last month', positive: true, theme: 'emerald' as const },
    { label: 'Fulfillment Rate', value: '99.4%', icon: Activity, trend: '+0.1% vs average', positive: true, theme: 'blue' as const },
    { label: 'Pending Orders', value: '7', icon: TrendingUp, trend: 'Action required on 2', positive: false, theme: 'purple' as const }
  ];

  return (
    <div className="w-full">
      <div className="mb-3 animate-[dashPopIn_0.4s_ease-out_both]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Operations Overview</h2>
        <p className="text-slate-600">Track your real-time logistics KPIs and monthly freight spend.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-6 animate-[dashPopIn_0.5s_ease-out_both]">
        {stats.map((stat, idx) => (
          <StatCard 
            key={idx}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            isPositive={stat.positive}
            colorTheme={stat.theme}
          />
        ))}
      </div>
    </div>
  );
}
