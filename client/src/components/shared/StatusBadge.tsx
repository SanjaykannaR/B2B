import { CheckCircle2, Clock, AlertCircle, Truck, Package } from 'lucide-react';

export default function StatusBadge({ status }: { status: string }) {
  const configMap: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    'Paid': { bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30', icon: CheckCircle2 },
    'Delivered': { bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30', icon: CheckCircle2 },
    'Pending': { bg: 'bg-orange-500/15', text: 'text-orange-600', border: 'border-orange-500/30', icon: Clock },
    'Overdue': { bg: 'bg-red-500/15', text: 'text-red-600', border: 'border-red-500/30', icon: AlertCircle },
    'In-Transit': { bg: 'bg-[#FF6B2C]/15', text: 'text-[#FF6B2C]', border: 'border-[#FF6B2C]/30', icon: Truck },
    'Assigned': { bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-500/30', icon: Package },
  };

  const config = configMap[status] || { bg: 'bg-slate-500/15', text: 'text-slate-500', border: 'border-slate-500/30', icon: null };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${config.bg} ${config.text} ${config.border}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}
