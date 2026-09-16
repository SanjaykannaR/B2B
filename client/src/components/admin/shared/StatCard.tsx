import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../../hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  trend?: { value: string; isPositive: boolean };
  delay?: number;
  /** Optional route to navigate to when the card is clicked */
  to?: string;
}

/**
 * StatCard — KPI card with count-up animation and hover glow.
 * Dark glass-morphism card with accent-colored icon orb.
 * When `to` is provided, the card becomes a clickable link.
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'var(--color-accent)',
  trend,
  delay = 0,
  to,
}) => {
  const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/,/g, ''), 10);
  const displayCount = useCountUp(numericValue, 1200);
  const formattedValue = typeof value === 'number'
    ? displayCount.toLocaleString()
    : value;

  const card = (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-lg h-full ${to ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-border)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Accent glow orb — visible on hover */}
      <div
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-0
          group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: color, opacity: 0.12 }}
      />

      {/* Top accent line */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider leading-none"
               style={{ color: 'var(--color-text-muted)' }}>
              {title}
            </p>
            <div
              className="text-3xl font-bold tracking-tight leading-none"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-primary)',
                animation: 'countReveal 0.6s ease-out both',
                animationDelay: `${delay + 200}ms`,
              }}
            >
              {formattedValue}
            </div>

            {trend && (
              <div className="flex items-center gap-1 pt-2">
                <span
                  className="text-xs font-bold"
                  style={{ color: trend.isPositive ? 'var(--color-success)' : 'var(--color-error)' }}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  vs last month
                </span>
              </div>
            )}
          </div>

          {/* Icon orb */}
          <div
            className="p-2.5 rounded-xl transition-all duration-300
              group-hover:scale-110 group-hover:rotate-3 shrink-0"
            style={{
              background: `${color}15`,
              color,
            }}
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full" aria-label={title}>
      {card}
    </Link>
  ) : card;
};
