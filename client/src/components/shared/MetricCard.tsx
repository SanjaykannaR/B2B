import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accentColor: string;
  themeColor: string;
  style?: React.CSSProperties;
}

export default function MetricCard({ label, value, icon, accentColor, themeColor, style }: MetricCardProps) {
  return (
    <div
      className="b2b-tap"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div style={{ height: 4, background: accentColor, borderRadius: '0.75rem 0.75rem 0 0' }} />
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1.75rem', fontWeight: 800, color: '#1B2A4A', lineHeight: 1.1, marginTop: '0.375rem' }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: `${themeColor}12`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
