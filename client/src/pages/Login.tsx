import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PackageSearch, LogIn, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { loginUser, clearError } from '../store/authSlice';

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  client: '/client',
  driver: '/driver',
  executive: '/executive/analytics',
};

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@logistics.com', password: 'admin123' },
  { role: 'Client', email: 'client@abc.com', password: 'client123' },
  { role: 'Driver', email: 'driver1@logistics.com', password: 'driver123' },
  { role: 'Executive', email: 'exec@logistics.com', password: 'exec123' },
];

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error, user } = useSelector((s: any) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Surface backend login errors via toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Redirect to the role-specific dashboard once authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const target = (location.state as any)?.from || ROLE_HOME[user.role] || '/admin';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  if (isAuthenticated && user?.role) {
    const target = (location.state as any)?.from || ROLE_HOME[user.role] || '/admin';
    return <Navigate to={target} replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    dispatch(loginUser({ email: email.trim(), password }) as any);
  };

  const fill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(1100px 600px at 15% -10%, rgba(45,74,122,0.55), transparent 60%), radial-gradient(900px 500px at 100% 110%, rgba(255,107,44,0.18), transparent 55%), var(--color-primary-dark)',
      }}
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="relative flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{
              background: '#0B0B0C',
              boxShadow: '0 4px 18px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,107,44,0.35)',
            }}
          >
            <PackageSearch size={22} strokeWidth={2.2} style={{ color: 'var(--color-accent)' }} />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: 'var(--color-accent)', borderColor: '#0F1B33' }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-mono)' }}>
              B2B Logistics
            </h1>
            <p className="text-[11px] font-medium text-white/60 -mt-0.5">Freight Operations Console</p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border p-7 sm:p-8 animate-fade-in-up"
          style={{
            background: 'rgba(255,255,255,0.98)',
            borderColor: 'rgba(255,255,255,0.25)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
          }}
        >
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Sign in
          </h2>
          <p className="text-xs mt-1 mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Access your role-specific dashboard. Admin has full access to every page.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Email
              </span>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Password
              </span>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px] disabled:opacity-60"
              style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-accent)'; }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck size={12} style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Demo accounts
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fill(acc.email, acc.password)}
                  className="text-left px-3 py-2 rounded-xl border transition-all duration-200"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <p className="text-[11px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{acc.role}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {acc.email}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] mt-6 text-white/50">
          Admin, Client, Driver & Executive — one unified console
        </p>
      </div>
    </div>
  );
};
