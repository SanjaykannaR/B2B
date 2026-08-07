import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  colorTheme?: 'default' | 'emerald' | 'orange' | 'red' | 'blue' | 'purple';
}

export default function StatCard({ title, value, icon: Icon, trend, isPositive, colorTheme = 'default' }: StatCardProps) {
  const themeConfig = {
    'default': { icon: 'text-slate-900', shadow: 'hover:shadow-slate-500/10', border: 'hover:border-slate-300', value: 'text-slate-900' },
    'emerald': { icon: 'text-emerald-500', shadow: 'hover:shadow-emerald-500/10', border: 'hover:border-emerald-300', value: 'text-emerald-500' },
    'orange': { icon: 'text-orange-500', shadow: 'hover:shadow-orange-500/10', border: 'hover:border-orange-300', value: 'text-orange-500' },
    'red': { icon: 'text-red-500', shadow: 'hover:shadow-red-500/10', border: 'hover:border-red-300', value: 'text-red-500' },
    'blue': { icon: 'text-blue-500', shadow: 'hover:shadow-blue-500/10', border: 'hover:border-blue-300', value: 'text-blue-500' },
    'purple': { icon: 'text-purple-500', shadow: 'hover:shadow-purple-500/10', border: 'hover:border-purple-300', value: 'text-purple-500' },
  };

  const theme = themeConfig[colorTheme];

  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl ${theme.shadow} ${theme.border} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300">
        <Icon className={`w-10 h-12 ${theme.icon} group-hover:-rotate-6 transition-transform duration-300`} />
      </div>
      <div className="flex flex-col relative z-10">
        <span className="text-slate-500 font-semibold mb-1 block">{title}</span>
        <span className={`text-3xl font-extrabold tracking-tight ${theme.value}`}>{value}</span>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
          <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend}
          </p>
        </div>
      )}
    </div>
  );
}
