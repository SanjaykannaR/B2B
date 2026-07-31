import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FleetGrid } from '../../components/admin/FleetGrid';
import { AddEditVehicleModal } from '../../components/admin/AddEditVehicleModal';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { PageHeader } from '../../components/admin/shared/PageHeader';
import * as vehicleApi from '../../services/vehicleApi';

const DEMO_VEHICLES = [
  { _id: 'v1', registrationNumber: 'MH-12-AB-1234', make: 'Tata', model: 'Ace Gold', year: 2024, status: 'AVAILABLE', capacity: { weight: 2500, volume: 8 }, fuelEfficiency: 12 },
  { _id: 'v2', registrationNumber: 'DL-01-CD-5678', make: 'Mahindra', model: 'Blazo X', year: 2023, status: 'IN_TRANSIT', capacity: { weight: 16000, volume: 48 }, fuelEfficiency: 6 },
  { _id: 'v3', registrationNumber: 'TN-07-EF-9012', make: 'Eicher', model: 'Pro 2049', year: 2025, status: 'MAINTENANCE', capacity: { weight: 5000, volume: 18 }, fuelEfficiency: 10 },
  { _id: 'v4', registrationNumber: 'KA-05-GH-3456', make: 'Ashok Leyland', model: 'Dost+', year: 2024, status: 'AVAILABLE', capacity: { weight: 1500, volume: 6 }, fuelEfficiency: 14 },
  { _id: 'v5', registrationNumber: 'GJ-06-IJ-7890', make: 'Tata', model: 'Prima LX', year: 2023, status: 'IN_TRANSIT', capacity: { weight: 25000, volume: 70 }, fuelEfficiency: 4 },
];

type TabType = 'ALL' | 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE';

export const FleetMonitor: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tabs: TabType[] = ['ALL', 'AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'];

  useEffect(() => {
    setPage(1); // reset pagination when the tab changes
    const load = async () => {
      try {
        setLoading(true);
        const q = activeTab !== 'ALL' ? { status: activeTab } : {};
        const res = await vehicleApi.getVehicles(q);
        setVehicles(res.vehicles || res || []);
      } catch {
        setVehicles(DEMO_VEHICLES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  const handleSave = async (data: any) => {
    try {
      if (editingVehicle) {
        await vehicleApi.updateVehicle(editingVehicle._id || editingVehicle.id, data);
      } else {
        await vehicleApi.createVehicle(data);
      }
      setActiveTab((t) => t); // trigger refetch
    } catch (e) { console.error(e); throw e; }
  };

  const handleDelete = (id: string) => {
    setPendingDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setPendingDelete(null);
    try { await vehicleApi.deleteVehicle(pendingDelete); setActiveTab((t) => t); }
    catch (e) { console.error(e); }
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'AVAILABLE').length,
    inTransit: vehicles.filter((v) => v.status === 'IN_TRANSIT').length,
    maintenance: vehicles.filter((v) => v.status === 'MAINTENANCE').length,
  };

  // Pagination (client-side slice; stats above use the full list)
  const total = vehicles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageVehicles = vehicles.slice(start, start + pageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <AnimatedCard>
        <PageHeader
          title="Fleet Monitor"
          subtitle="Manage your vehicles and view real-time status."
          action={
            <button
              onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white
                transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg min-h-[44px]"
              style={{ background: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(255,107,44,0.3)' }}
            >
              <Plus size={16} /> Add Vehicle
            </button>
          }
        />
      </AnimatedCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: stats.total, color: '#3B82F6' },
          { label: 'Available', count: stats.available, color: '#10B981' },
          { label: 'In Transit', count: stats.inTransit, color: '#8B5CF6' },
          { label: 'Maintenance', count: stats.maintenance, color: '#F97316' },
        ].map((s, i) => (
          <AnimatedCard key={s.label} delay={i * 60}>
            <div
              className="rounded-xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: s.color }}>
                {s.count}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {s.label}
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Filter Tabs */}
      <AnimatedCard delay={200}>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface-hover)' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 min-h-[44px]"
              style={{
                background: activeTab === tab ? 'var(--color-surface-card)' : 'transparent',
                color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </AnimatedCard>

      {/* Grid */}
      <AnimatedCard delay={280}>
        <FleetGrid
          vehicles={pageVehicles}
          loading={loading}
          onEdit={(v) => { setEditingVehicle(v); setIsModalOpen(true); }}
          onDelete={handleDelete}
        />

        {/* Pagination footer */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Showing {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2 rounded-xl text-xs outline-none border min-h-[36px]"
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
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Prev
              </button>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>

      <AddEditVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingVehicle}
      />

      <ConfirmModal
        isOpen={!!pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
