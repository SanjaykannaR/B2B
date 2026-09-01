import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DEFAULT_ROUTES } from '../utils/constants';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleHome = () => {
    if (isAuthenticated && role) {
      navigate(DEFAULT_ROUTES[role]);
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: '#1B2A4A', fontFamily: "'IBM Plex Mono', monospace" }}>
          404
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1E293B', margin: '0.5rem 0' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={handleHome}
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
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
