import React from 'react';

type StatusType =
  | 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED'
  | 'DELAYED' | 'CANCELLED' | 'MAINTENANCE' | 'AVAILABLE';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { text: string; bg: string; dot?: string }> = {
  PENDING:     { text: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' },
  ASSIGNED:    { text: '#3B82F6', bg: '#DBEAFE', dot: '#3B82F6' },
  IN_TRANSIT:  { text: '#8B5CF6', bg: '#EDE9FE', dot: '#8B5CF6' },
  DELIVERED:   { text: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  DELAYED:     { text: '#EF4444', bg: '#FEE2E2', dot: '#EF4444' },
  CANCELLED:   { text: '#6B7280', bg: '#F3F4F6', dot: '#6B7280' },
  MAINTENANCE: { text: '#F97316', bg: '#FFF7ED', dot: '#F97316' },
  AVAILABLE:   { text: '#22C55E', bg: '#DCFCE7', dot: '#22C55E' },
};

/**
 * StatusBadge — colored pill with optional pulsing dot for active statuses.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();
  const config = STATUS_CONFIG[normalized] || { text: '#94A3B8', bg: '#F1F5F9' };
  const isActive = normalized === 'IN_TRANSIT';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]
        font-bold uppercase tracking-wider transition-colors duration-200 ${className}`}
      style={{ color: config.text, background: config.bg }}
    >
      {isActive && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: config.dot,
            animation: 'dotPulse 2s ease-in-out infinite',
          }}
        />
      )}
      {status?.replace(/_/g, ' ') || 'UNKNOWN'}
    </span>
  );
};
