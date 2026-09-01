interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const DEFAULT_CONFIG = { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', border: 'rgba(37, 99, 235, 0.3)', dot: '#2563EB' };

const STATUS_CONFIG: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  'Pending': { bg: 'rgba(217, 119, 6, 0.12)', color: '#D97706', border: 'rgba(217, 119, 6, 0.3)', dot: '#D97706' },
  'Assigned': { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', border: 'rgba(37, 99, 235, 0.3)', dot: '#2563EB' },
  'In-Transit': { bg: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', border: 'rgba(124, 58, 237, 0.3)', dot: '#7C3AED' },
  'Delivered': { bg: 'rgba(5, 150, 105, 0.12)', color: '#059669', border: 'rgba(5, 150, 105, 0.3)', dot: '#059669' },
  'Delayed': { bg: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', border: 'rgba(220, 38, 38, 0.3)', dot: '#DC2626' },
  'Cancelled': { bg: 'rgba(75, 85, 99, 0.12)', color: '#4B5563', border: 'rgba(75, 85, 99, 0.3)', dot: '#4B5563' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;
  
  const isSm = size === 'sm';
  const padding = isSm ? '2px 8px' : '4px 12px';
  const fontSize = isSm ? '0.7rem' : '0.75rem';

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding,
        fontSize,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dot,
          display: 'inline-block',
        }}
      />
      {status}
    </span>
  );
}
