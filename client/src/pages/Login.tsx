import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Truck, Shield, BarChart3, PackageSearch } from 'lucide-react';
import { loginUser, clearError } from '../store/authSlice';
import type { RootState } from '../store/store';

type RoleKey = 'admin' | 'executive' | 'client' | 'driver';

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  desc: string;
}

const ROLES: Record<RoleKey, RoleConfig> = {
  admin: {
    label: 'Admin',
    icon: <Shield size={22} />,
    color: '#FF6B2C',
    gradient: 'linear-gradient(135deg, #FF6B2C 0%, #FF9A5C 100%)',
    desc: 'Full system access',
  },
  executive: {
    label: 'Executive',
    icon: <BarChart3 size={22} />,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    desc: 'Analytics & reporting',
  },
  client: {
    label: 'Client',
    icon: <PackageSearch size={22} />,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    desc: 'Track shipments',
  },
  driver: {
    label: 'Driver',
    icon: <Truck size={22} />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    desc: 'Manage deliveries',
  },
};

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((s: RootState) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleKey>('admin');
  const [mounted, setMounted] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate(from, { replace: true });
    return () => { dispatch(clearError()); };
  }, [isAuthenticated]);

  useEffect(() => {
    // Auto-fill demo credentials based on role
    const demos: Record<RoleKey, { email: string; password: string }> = {
      admin: { email: 'admin@logistics.com', password: 'admin123' },
      executive: { email: 'exec@logistics.com', password: 'exec123' },
      client: { email: 'client@example.com', password: 'client123' },
      driver: { email: 'driver@logistics.com', password: 'driver123' },
    };
    setEmail(demos[selectedRole].email);
    setPassword(demos[selectedRole].password);
    dispatch(clearError());
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }) as any);
    if (!result.error) {
      const role = result.payload?.user?.role;
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        executive: '/executive/analytics',
        client: '/client/dashboard',
        driver: '/driver/dashboard',
      };
      navigate(redirectMap[role] || '/admin', { replace: true });
    }
  };

  const roleConfig = ROLES[selectedRole];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 50%, #0F1B33 100%)' }}>

      {/* Animated background orbs */}
      <motion.div
        className="absolute rounded-full opacity-20 blur-3xl"
        style={{ width: 400, height: 400, background: roleConfig.color, top: '-10%', right: '-5%' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full opacity-15 blur-3xl"
        style={{ width: 300, height: 300, background: '#FF6B2C', bottom: '-5%', left: '-5%' }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full opacity-10 blur-2xl"
        style={{ width: 200, height: 200, background: '#8B5CF6', top: '40%', left: '20%' }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(15, 27, 51, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(255,107,44,0.15)', border: '1px solid rgba(255,107,44,0.3)' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <PackageSearch size={28} style={{ color: '#FF6B2C' }} />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            B2B Logistics
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Operations Console
          </p>
        </div>

        {/* Role Selector */}
        <div className="px-8 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Select your role
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(ROLES) as RoleKey[]).map((key) => {
              const r = ROLES[key];
              const isActive = selectedRole === key;
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRole(key)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: isActive ? `${r.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? `${r.color}60` : 'rgba(255,255,255,0.06)'}`,
                    color: isActive ? r.color : 'rgba(255,255,255,0.45)',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Role Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="px-8 pb-4"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: `${roleConfig.color}10`, border: `1px solid ${roleConfig.color}25` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: roleConfig.gradient }}
              >
                {roleConfig.icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: roleConfig.color }}>
                  {roleConfig.label}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {roleConfig.desc}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 min-h-[44px]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    '--tw-ring-color': roleConfig.color,
                  } as React.CSSProperties}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 min-h-[44px]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    '--tw-ring-color': roleConfig.color,
                  } as React.CSSProperties}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
              >
                {String(error)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px]"
            style={{
              background: loading ? 'rgba(255,255,255,0.1)' : roleConfig.gradient,
              opacity: loading ? 0.6 : 1,
              boxShadow: loading ? 'none' : `0 8px 24px ${roleConfig.color}40`,
            }}
            whileHover={!loading ? { scale: 1.01, boxShadow: `0 12px 32px ${roleConfig.color}50` } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Signing in...
              </span>
            ) : (
              `Sign in as ${roleConfig.label}`
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
