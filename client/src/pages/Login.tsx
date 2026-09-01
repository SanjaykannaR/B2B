import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, clearError } from '../store/authSlice';
import { DEMO_CREDENTIALS } from '../services/authApi';
import { DEFAULT_ROUTES } from '../utils/constants';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('driver@b2b.com');
  const [password, setPassword] = useState('driver123');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(DEFAULT_ROUTES[result.user.role]);
    } catch {
      toast.error(error ?? 'Login failed. Check your credentials.');
      dispatch(clearError());
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 55%, #2D4A7A 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderRadius: '1rem',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
          padding: '2.25rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '0.75rem',
              backgroundColor: '#1B2A4A',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              marginBottom: '0.875rem',
            }}
          >
            🚚
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>
            B2B Logistics
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Sign in to your role-specific workspace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.375rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@b2b.com"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #CBD5E1',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.375rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #CBD5E1',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#FF6B2C',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(255, 107, 44, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => fillDemo(cred.email, cred.password)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: cred.color,
                    flexShrink: 0,
                  }}
                />
                {cred.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.6875rem', color: '#94A3B8', margin: '0.75rem 0 0 0' }}>
            Click a role to autofill, then press Sign In.
          </p>
        </div>
      </div>
    </div>
  );
}
