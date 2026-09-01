import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DEFAULT_ROUTES } from '../../utils/constants';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function PlaceholderPage({ title, description, icon = '🛠️' }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 3rem 1rem' }}>
      <div
        style={{
          backgroundColor: '#1B2A4A',
          color: '#FFFFFF',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1B2A4A 0%, #0F1B33 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <span style={{ backgroundColor: '#FF6B2C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            {title.toUpperCase()}
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0', color: '#FFFFFF' }}>
          {title}
        </h1>
        {description && (
          <p style={{ color: '#94A3B8', margin: '0.5rem 0 0 0', fontSize: '0.9375rem', maxWidth: '600px' }}>
            {description}
          </p>
        )}
      </div>

      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          color: '#64748B',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.5rem 0' }}>
          Module in Progress
        </h3>
        <p style={{ margin: '0 auto 1.5rem auto', fontSize: '0.875rem', maxWidth: 420 }}>
          The {title} module is part of the platform roadmap and will be available soon.
        </p>
        {role && (
          <button
            onClick={() => navigate(DEFAULT_ROUTES[role])}
            style={{
              backgroundColor: '#1B2A4A',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
