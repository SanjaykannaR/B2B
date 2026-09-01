interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  label?: string;
}

const SIZES = {
  sm: 18,
  md: 28,
  lg: 42,
};

export default function LoadingSpinner({ size = 'md', fullPage = false, label }: LoadingSpinnerProps) {
  const dimension = SIZES[size];

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div
        className="animate-spin"
        style={{
          width: dimension,
          height: dimension,
          borderRadius: '50%',
          border: `3px solid #E2E8F0`,
          borderTopColor: '#FF6B2C',
        }}
      />
      {label && <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>{label}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F9FC',
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {spinner}
    </div>
  );
}
