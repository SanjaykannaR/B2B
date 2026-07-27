import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Lock, Save, LogOut, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import type { RootState } from '../../store/store';

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200
  focus:ring-2 focus:ring-[var(--color-accent)] border`;

export const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Profile form
  const [firstName, setFirstName] = useState(user?.firstName || 'Sam');
  const [lastName, setLastName] = useState(user?.lastName || 'Manager');
  const [email, setEmail] = useState(user?.email || 'admin@logistics.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [company, setCompany] = useState(user?.company || 'B2B Logistics');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handlePasswordSave = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const inputStyle = {
    background: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[800px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Info */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,107,44,0.08)', color: 'var(--color-accent)' }}>
            <User size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Profile Information</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Update your personal details</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <Shield size={14} style={{ color: 'var(--color-accent)' }} />
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ background: 'rgba(255,107,44,0.08)', color: 'var(--color-accent)' }}
          >
            {user?.role || 'admin'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              First Name
            </label>
            <input
              type="text"
              className={inputCls}
              style={inputStyle}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Last Name
            </label>
            <input
              type="text"
              className={inputCls}
              style={inputStyle}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Email
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                className={`${inputCls} pl-9`}
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Phone
            </label>
            <input
              type="tel"
              className={inputCls}
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Company
            </label>
            <input
              type="text"
              className={inputCls}
              style={inputStyle}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleProfileSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{
              background: profileSaved ? 'var(--color-success)' : 'var(--color-accent)',
              boxShadow: profileSaved ? '0 2px 8px rgba(16,185,129,0.3)' : '0 2px 8px rgba(255,107,44,0.3)',
            }}
          >
            {profileSaved ? <CheckCircle size={14} /> : <Save size={14} />}
            {profileSaved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}>
            <Lock size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Change Password</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Update your account password</p>
          </div>
        </div>

        {passwordError && (
          <div className="text-xs font-medium px-4 py-2.5 rounded-xl" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Current Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type={showCurrent ? 'text' : 'password'}
                className={`${inputCls} pl-9 pr-10`}
                style={inputStyle}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                New Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  className={`${inputCls} pl-9 pr-10`}
                  style={inputStyle}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  className={`${inputCls} pl-9`}
                  style={inputStyle}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePasswordSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{
              background: passwordSaved ? 'var(--color-success)' : '#8B5CF6',
              boxShadow: passwordSaved ? '0 2px 8px rgba(16,185,129,0.3)' : '0 2px 8px rgba(139,92,246,0.3)',
            }}
          >
            {passwordSaved ? <CheckCircle size={14} /> : <Lock size={14} />}
            {passwordSaved ? 'Updated!' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Logout */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Session</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sign out of your account</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{
              background: 'var(--color-error)',
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-error)'; }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
