import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  change?: number;
  changeType?: 'up' | 'down';
}

export default function StatCard({ title, value, icon, change, changeType }: StatCardProps) {
  const up = changeType === 'up';
  const down = changeType === 'down';

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {title}
        </div>
        <div
          className="kpi-value"
          style={{ color: '#1B2A4A', marginTop: '0.375rem', fontSize: '1.75rem', whiteSpace: 'nowrap' }}
        >
          {value}
        </div>
        {change !== undefined && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '0.5rem',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              backgroundColor: up ? '#D1FAE5' : down ? '#FEE2E2' : '#F1F5F9',
              color: up ? '#047857' : down ? '#B91C1C' : '#475569',
            }}
          >
            {up ? '▲' : down ? '▼' : '■'} {Math.abs(change).toFixed(1)}%
            <span style={{ fontWeight: 500, opacity: 0.8 }}>vs prev.</span>
          </div>
        )}
      </div>
      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.375rem',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
