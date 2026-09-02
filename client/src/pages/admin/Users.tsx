import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Users as UsersIcon,
  UserPlus,
  X,
  Save,
  Shield,
  Truck,
  Building2,
  BarChart3,
  CheckCircle2,
  Ban,
  KeyRound,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { Skeleton } from '../../components/admin/shared/Skeleton';
import { StatCard } from '../../components/admin/shared/StatCard';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import * as userApi from '../../services/userApi';
import { formatDate } from '../../utils/formatters';

type RoleFilter = 'ALL' | 'admin' | 'client' | 'driver' | 'executive';
const ROLE_TABS: RoleFilter[] = ['ALL', 'admin', 'client', 'driver', 'executive'];

const ROLE_META: Record<string, { color: string; bg: string }> = {
  admin: { color: '#8B5CF6', bg: '#EDE9FE' },
  client: { color: '#F59E0B', bg: '#FEF3C7' },
  driver: { color: '#3B82F6', bg: '#DBEAFE' },
  executive: { color: '#0EA5E9', bg: '#E0F2FE' },
};

const DEFAULT_META = { color: '#F59E0B', bg: '#FEF3C7' };

  const inputCls = `w-full px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200
  focus:ring-2 focus:ring-[var(--color-accent)] border min-h-[40px]`;

interface UserFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'client' | 'driver' | 'executive' | 'admin';
  company: string;
  phone: string;
  licenseNumber: string;
  contractRate: string;
}

const EMPTY_FORM: UserFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'client',
  company: '',
  phone: '',
  licenseNumber: '',
  contractRate: '',
};

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<any | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<any | null>(null);
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers({ page: 1, limit: pageSize });
      const list = res.users || res.data?.users || res;
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageSize]);

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.company?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [users, search, roleFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: users.length };
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  const activeCount = users.filter((u) => u.isActive !== false).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      role: u.role || 'client',
      company: u.company || '',
      phone: u.phone || '',
      licenseNumber: u.licenseNumber || '',
      contractRate: u.contractRate ? String(u.contractRate) : '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required');
      return;
    }
    if (!editing && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (editing && form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setSaving(true);
      const payload: Record<string, any> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        company: form.company || undefined,
        phone: form.phone || undefined,
        licenseNumber: form.licenseNumber || undefined,
        contractRate: form.contractRate ? Number(form.contractRate) : undefined,
      };
      if (editing) {
        if (form.password) payload.password = form.password;
        const res = await userApi.updateUser(editing._id, payload);
        toast.success(res?.message || 'User updated');
      } else {
        payload.password = form.password;
        const res = await userApi.createUser(payload);
        toast.success(res?.message || 'User created');
      }
      setFormOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await userApi.deactivateUser(deactivateTarget._id);
      toast.success(`${deactivateTarget.firstName} ${deactivateTarget.lastName} deactivated`);
      setDeactivateTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleReactivate = async () => {
    if (!reactivateTarget) return;
    try {
      await userApi.updateUser(reactivateTarget._id, { isActive: true });
      toast.success(`${reactivateTarget.firstName} ${reactivateTarget.lastName} reactivated`);
      setReactivateTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reactivate user');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await userApi.resetPassword(resetTarget._id, newPassword);
      toast.success('Password reset');
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    }
  };

  const set = (k: keyof UserFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                User Management
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {activeCount} active · {users.length} total accounts
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 min-h-[44px]"
            style={{ background: 'var(--color-accent)', boxShadow: '0 2px 8px rgba(255,107,44,0.3)' }}
          >
            <UserPlus size={16} /> Create User
          </button>
        </div>
      </AnimatedCard>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={UsersIcon} color="#8B5CF6" />
        <StatCard title="Active" value={activeCount} icon={CheckCircle2} color="#10B981" />
        <StatCard title="Clients" value={roleCounts.client || 0} icon={Building2} color="#F59E0B" />
        <StatCard title="Drivers" value={roleCounts.driver || 0} icon={Truck} color="#3B82F6" />
      </div>

      {/* Search + Filters */}
      <AnimatedCard delay={80}>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] min-h-[44px]"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {ROLE_TABS.map((tab) => {
            const isActive = roleFilter === tab;
            const count = tab === 'ALL' ? users.length : roleCounts[tab] || 0;
            return (
              <button
                key={tab}
                onClick={() => setRoleFilter(tab)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 min-h-[44px]"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 2px 8px rgba(255,107,44,0.2)' : 'none',
                }}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-card)',
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Table */}
      <AnimatedCard delay={160}>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">User</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Role</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Company</th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                    </tr>
                  ))
                ) : pageItems.length > 0 ? (
                  pageItems.map((u, i) => {
                    const meta = ROLE_META[u.role] ?? DEFAULT_META;
                    const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
                    const isActive = u.isActive !== false;
                    return (
                      <tr
                        key={u._id}
                        className="row-glow transition-colors"
                        style={{ borderBottom: '1px solid var(--color-border-light)', animationDelay: `${i * 40}ms` }}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}44` }}
                            >
                              {initials || <UsersIcon size={14} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {u.firstName} {u.lastName}
                              </p>
                              {u.phone && (
                                <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{u.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {u.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: meta.color, background: meta.bg }}
                          >
                            {u.role === 'executive' ? <BarChart3 size={11} /> : u.role === 'driver' ? <Truck size={11} /> : <Shield size={11} />}
                            {u.role}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {u.company || '—'}
                        </td>
                        <td className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{
                              color: isActive ? '#10B981' : '#6B7280',
                              background: isActive ? '#D1FAE5' : '#F3F4F6',
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? '#10B981' : '#6B7280' }} />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => openEdit(u)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[44px]"
                              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { setResetTarget(u); setNewPassword(''); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[44px]"
                              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: '#8B5CF6' }}
                              title="Reset password"
                            >
                              <KeyRound size={13} />
                            </button>
                            {isActive ? (
                              <button
                                onClick={() => setDeactivateTarget(u)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[44px]"
                                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-error)' }}
                              >
                                <Ban size={13} /> Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => setReactivateTarget(u)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[44px]"
                                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: '#10B981' }}
                              >
                                <CheckCircle2 size={13} /> Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <UsersIcon size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No users found</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t"
            style={{ borderColor: 'var(--color-border-light)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="px-3 py-2 rounded-xl text-xs outline-none border min-h-[44px]"
                style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                aria-label="Page size"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Create / Edit user modal */}
      {formOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setFormOpen(false)} />
          <div
            className="relative w-full max-w-lg rounded-2xl border max-h-[calc(100vh-32px)] overflow-y-auto overscroll-contain"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-3 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface-card)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {editing ? 'Edit User' : 'Create User'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {editing ? `Editing ${editing.firstName} ${editing.lastName}` : 'Create a role-based account'}
                </p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mt-3 px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    First Name *
                  </label>
                  <input type="text" className={inputCls} style={inputStyle} value={form.firstName} onChange={set('firstName')} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Last Name *
                  </label>
                  <input type="text" className={inputCls} style={inputStyle} value={form.lastName} onChange={set('lastName')} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Email *
                </label>
                <input type="email" className={inputCls} style={inputStyle} value={form.email} onChange={set('email')} />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  {editing ? 'Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input type="password" className={inputCls} style={inputStyle} value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Role *
                </label>
                <select className={inputCls} style={inputStyle} value={form.role} onChange={set('role')}>
                  <option value="client">Client</option>
                  <option value="driver">Driver</option>
                  <option value="executive">Executive</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  New accounts log in and auto-redirect to their own page via JWT role.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Company
                  </label>
                  <input type="text" className={inputCls} style={inputStyle} value={form.company} onChange={set('company')} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Phone
                  </label>
                  <input type="tel" className={inputCls} style={inputStyle} value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              {(form.role === 'driver' || form.role === 'client') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.role === 'driver' && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                        License Number
                      </label>
                      <input type="text" className={inputCls} style={inputStyle} value={form.licenseNumber} onChange={set('licenseNumber')} />
                    </div>
                  )}
                  {form.role === 'client' && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                        Contract Rate (₹/km)
                      </label>
                      <input type="number" className={inputCls} style={inputStyle} value={form.contractRate} onChange={set('contractRate')} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px]"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 min-h-[44px] disabled:opacity-50"
                style={{ background: 'var(--color-accent)', boxShadow: '0 2px 8px rgba(255,107,44,0.3)' }}
              >
                <Save size={14} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => { setResetTarget(null); setNewPassword(''); }} />
          <div
            className="relative w-full max-w-sm rounded-2xl border p-5 sm:p-6 max-h-[calc(100vh-32px)] overflow-y-auto overscroll-contain"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-modal)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Reset Password</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              New password for {resetTarget.firstName} {resetTarget.lastName} ({resetTarget.email})
            </p>
            <input
              type="password"
              className={`${inputCls} mt-4`}
              style={inputStyle}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => { setResetTarget(null); setNewPassword(''); }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px]"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 min-h-[44px]"
                style={{ background: '#8B5CF6', boxShadow: '0 2px 8px rgba(139,92,246,0.3)' }}
              >
                <KeyRound size={13} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate / Reactivate confirm */}
      <ConfirmModal
        isOpen={!!deactivateTarget}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        title="Deactivate user?"
        message={`${deactivateTarget?.firstName} ${deactivateTarget?.lastName} will lose access to their account immediately. Their login will be blocked.`}
        confirmText="Deactivate"
        variant="danger"
      />
      <ConfirmModal
        isOpen={!!reactivateTarget}
        onConfirm={handleReactivate}
        onCancel={() => setReactivateTarget(null)}
        title="Reactivate user?"
        message={`${reactivateTarget?.firstName} ${reactivateTarget?.lastName} will regain access and be able to log in again.`}
        confirmText="Reactivate"
        variant="default"
      />
    </div>
  );
};

const inputStyle = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text-primary)',
};