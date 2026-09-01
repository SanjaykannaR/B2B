import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, LayoutGrid, Quote } from 'lucide-react';
import type { AppDispatch, RootState } from '../store/store';
import { loginUser, clearError } from '../store/authSlice';

const ROLE_REDIRECTS: Record<string, { label: string; path: string }> = {
  admin: { label: 'admin', path: '/admin/dashboard' },
  client: { label: 'client', path: '/client/dashboard' },
  driver: { label: 'driver', path: '/driver/dashboard' },
  executive: { label: 'executive', path: '/executive/analytics' },
};

const DEMO_ACCOUNTS = [
  { email: 'admin@logistics.com', password: 'admin123', role: 'Admin' },
  { email: 'client@abc.com', password: 'client123', role: 'Client' },
  { email: 'driver1@logistics.com', password: 'driver123', role: 'Driver' },
  { email: 'exec@logistics.com', password: 'exec123', role: 'Executive' },
];

const loginStyles = `
/* ── Mobile (≤640px) ── */
@media (max-width: 640px) {
  .login-brand { padding: 16px 20px 20px; }
  .login-brand h1 { font-size: 24px; line-height: 1.25; }
  .login-brand p { font-size: 13px; }
  .login-brand-stats { gap: 12px; }
  .login-brand-stats > div:first-child { min-width: 0; }
  .login-form-wrap { padding: 24px 0; }
  .login-form-wrap h2 { font-size: 22px; }
  .login-demo-grid { grid-template-columns: 1fr; }
  .login-quote { margin-top: 16px; }
}

/* ── Small mobile (≤400px) ── */
@media (max-width: 400px) {
  .login-brand { height: 44vh !important; }
  .login-brand-stats { gap: 10px; }
  .login-brand-stats .text-2xl { font-size: 20px; }
  .login-brand-stats .text-xs { font-size: 10px; }
  .login-form-wrap { padding: 20px 0; }
  .login-form-wrap .flex.justify-between { flex-wrap: wrap; gap: 8px; }
}

/* ── Tablet (641px–1024px) ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .login-brand h1 { font-size: 28px; }
  .login-brand-stats { gap: 16px; }
  .login-form-wrap { max-width: 360px; }
}
`;

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold tracking-tight text-white">{value}</div>
      <div className="text-xs text-white/45 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('b2b_remember_email') || ''; } catch { return ''; }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => {
    try { return !!localStorage.getItem('b2b_remember_email'); } catch { return false; }
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const match = ROLE_REDIRECTS[user.role];
      if (match) {
        toast.success(`Signed in as ${match.label}`, { duration: 2000 });
        setTimeout(() => navigate(match.path), 600);
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginUser({ email: email.trim(), password }));
    if (remember) {
      try { localStorage.setItem('b2b_remember_email', email.trim()); } catch {}
    } else {
      try { localStorage.removeItem('b2b_remember_email'); } catch {}
    }
  };

  const handleDemoClick = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    dispatch(loginUser({ email: demoEmail, password: demoPassword }));
  };

  const handleForgot = () => {
    toast.success('Password reset link would be sent to your email.');
  };

  return (
    <div className="min-h-screen h-screen font-sans flex flex-col lg:flex-row overflow-hidden">
      <style>{loginStyles}</style>

      {/* ── Brand Panel ── */}
      <div className="login-brand relative flex-none h-[40vh] lg:h-auto lg:flex-[1.5] p-5 lg:p-12 flex flex-col justify-between overflow-hidden animate-[dashFadeIn_1s_ease-out_both]">
        <img
          src="/truck-bg.jpg"
          alt="Logistics Trucks"
          className="absolute inset-0 w-full h-full object-cover object-center animate-[dashPopIn_2s_ease-out_both]"
        />
        <div className="absolute inset-0 bg-[#0a1424]/70" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-white">B2B Logistics</span>
        </div>

        <div className="relative z-10 max-w-[460px]">
          <div className="flex items-center gap-2 text-accent-light text-[11px] font-bold tracking-widest mb-2 md:mb-3">
            <span className="w-6 h-px bg-accent-light" />
            CLIENT · DRIVER · ADMIN · EXECUTIVE
          </div>
          <h1 className="text-3xl lg:text-[40px] leading-tight font-extrabold tracking-tight text-white mb-1.5 md:mb-2">
            Freight visibility,<br />the moment <span className="text-accent">it matters.</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-[400px]">
            One login, four workspaces. Track shipments in real time, dispatch drivers, and reconcile invoices.
          </p>

          <div className="login-brand-stats flex gap-6 pt-4 md:pt-5">
            <StatItem value="42" label="Active shipments" />
            <div className="w-px bg-white/12" />
            <StatItem value="99.8%" label="Platform uptime" />
            <div className="w-px bg-white/12" />
            <StatItem value="96.4%" label="On-time delivery" />
          </div>
        </div>

        <div className="login-quote relative z-10 flex items-center gap-3">
          <Quote className="w-5 h-5 text-accent flex-shrink-0" />
          <p className="text-sm text-white/55 italic max-w-[420px]">
            We stopped chasing spreadsheets the day we switched. <span className="text-white/85 not-italic font-semibold">— Fleet ops, ABC Manufacturing</span>
          </p>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-6 lg:p-8">
        <div className="login-form-wrap w-full max-w-[400px] animate-[dashPopIn_0.6s_ease-out_both]">
          <div className="text-accent text-[11px] font-bold tracking-widest mb-1.5">WELCOME BACK</div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-1">Sign in to your account</h2>
          <p className="text-[var(--color-text-secondary)] text-sm mb-5">Enter your credentials to access your dashboard.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3.5">
              <label htmlFor="email" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="you@company.com"
                  autoComplete="username"
                  className={`w-full border rounded-lg py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-text-primary)] outline-none transition-all font-medium
                    ${fieldErrors.email ? 'border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : 'border-[var(--color-border)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(255,107,44,0.12)]'}`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-[var(--color-error)] mt-1.5 font-medium">{fieldErrors.email}</p>}
            </div>

            <div className="mb-3.5">
              <label htmlFor="password" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className={`w-full border rounded-lg py-2.5 pl-10 pr-11 text-sm text-[var(--color-text-primary)] outline-none transition-all font-medium
                    ${fieldErrors.password ? 'border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : 'border-[var(--color-border)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(255,107,44,0.12)]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[#f3f4f6] rounded-md transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-[var(--color-error)] mt-1.5 font-medium">{fieldErrors.password}</p>}
            </div>

            <div className="flex justify-between items-center mb-5 text-[13px]">
              <label className="flex items-center gap-1.5 text-[var(--color-text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 cursor-pointer accent-accent"
                />
                Remember me
              </label>
              <button type="button" onClick={handleForgot} className="text-accent font-semibold hover:underline text-xs">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:bg-[#0d1c30] text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[10px] text-[var(--color-text-muted)] font-bold">DEMO ACCOUNTS</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <div className="border border-dashed border-[var(--color-border)] rounded-xl p-3 bg-[#fafbfc]">
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] tracking-wider mb-2">TAP TO AUTOFILL AND SIGN IN AS</p>
            <div className="login-demo-grid grid grid-cols-1 gap-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoClick(acc.email, acc.password)}
                  disabled={loading}
                  className="flex justify-between items-center text-xs px-2 py-2 rounded-md font-mono text-[var(--color-text-primary)] hover:bg-white hover:shadow-[0_0_0_1px_var(--color-border)] transition-all w-full text-left disabled:opacity-60"
                >
                  <span>{acc.email}</span>
                  <span className="font-sans font-semibold text-[var(--color-text-muted)]">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
