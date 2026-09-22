import React, { useState, useEffect } from 'react';
import { X, Truck, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestId: string;
  manifestLabel?: string;
  onAssigned?: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, manifestId, manifestLabel, onAssigned }) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setFetching(true);
    Promise.all([
      api.get('/users/drivers'),
      api.get('/vehicles/available'),
    ]).then(([driversRes, vehiclesRes]) => {
      const d = driversRes.data?.users || driversRes.data?.data?.users || [];
      let v = vehiclesRes.data?.vehicles || vehiclesRes.data?.data?.vehicles || [];
      setDrivers(Array.isArray(d) ? d : []);
      if (Array.isArray(v) && v.length === 0) {
        return api.get('/vehicles').then((allRes) => {
          const all = allRes.data?.vehicles || allRes.data?.data?.vehicles || [];
          setVehicles(Array.isArray(all) ? all : []);
        });
      }
      setVehicles(Array.isArray(v) ? v : []);
    }).catch(() => {
      setDrivers([]);
      setVehicles([]);
    }).finally(() => setFetching(false));
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedDriver || !selectedVehicle) {
      toast.error('Select both a driver and a vehicle');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/manifests/${manifestId}/assign`, {
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
      });
      toast.success('Driver assigned successfully!');
      onAssigned?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(15, 27, 51, 0.6)', zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1B2A4A' }}>Assign Driver</h2>
            {manifestLabel && <p className="text-xs mt-0.5" style={{ color: '#64748B', fontFamily: "'IBM Plex Mono', monospace" }}>{manifestLabel}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {fetching ? (
            <div className="py-8 text-center text-sm" style={{ color: '#64748B' }}>Loading drivers and vehicles...</div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748B' }}>
                  <User size={12} className="inline mr-1" /> Select Driver
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none min-h-[44px]"
                  style={{ borderColor: '#E2E8F0', color: '#1B2A4A' }}
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.firstName} {d.lastName} {d.phone ? `(${d.phone})` : ''}
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && <p className="text-xs" style={{ color: '#EF4444' }}>No drivers found. Create a driver account first.</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748B' }}>
                  <Truck size={12} className="inline mr-1" /> Select Vehicle
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none min-h-[44px]"
                  style={{ borderColor: '#E2E8F0', color: '#1B2A4A' }}
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v: any) => (
                    <option key={v._id} value={v._id} disabled={v.status !== 'AVAILABLE'}>
                      {v.registrationNumber} {v.make ? `- ${v.make} ${v.model || ''}` : ''} ({v.capacity?.weight || v.maxWeightKg || '?'} kg) {v.status !== 'AVAILABLE' ? `[${v.status}]` : ''}
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && <p className="text-xs" style={{ color: '#EF4444' }}>No vehicles found. Add a vehicle from Fleet page first.</p>}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t" style={{ borderColor: '#E2E8F0' }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-all min-h-[44px]"
            style={{ borderColor: '#E2E8F0', color: '#475569', background: '#F8FAFC' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || fetching || !selectedDriver || !selectedVehicle}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#2563EB', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Assigning...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Assign
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
