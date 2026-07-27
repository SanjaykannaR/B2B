import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import * as vehicleApi from '../../../services/vehicleApi';

interface StepRouteProps {
  data: any;
  updateData: (patch: any) => void;
}

const DEMO_VEHICLES = [
  { _id: 'v1', registrationNumber: 'MH-12-AB-1234', make: 'Tata', model: 'Ace Gold', capacity: { weight: 2500 }, fuelEfficiency: 12 },
  { _id: 'v4', registrationNumber: 'KA-05-GH-3456', make: 'Ashok Leyland', model: 'Dost+', capacity: { weight: 1500 }, fuelEfficiency: 14 },
  { _id: 'v2', registrationNumber: 'DL-01-CD-5678', make: 'Mahindra', model: 'Blazo X', capacity: { weight: 16000 }, fuelEfficiency: 6 },
];

export const StepRoute: React.FC<StepRouteProps> = ({ data, updateData }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await vehicleApi.getVehicles({ status: 'AVAILABLE' });
        const all = res.vehicles || res || [];
        const suitable = all.filter((v: any) => (v.capacity?.weight || 0) >= (data.weight || 0));
        setVehicles(suitable.length > 0 ? suitable : all.length > 0 ? all : DEMO_VEHICLES);
      } catch {
        setVehicles(DEMO_VEHICLES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [data.weight, data.volume]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Assign Vehicle</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Select an available vehicle that meets cargo requirements.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-accent)' }} />
          <p className="text-sm">Finding suitable vehicles...</p>
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vehicles.map((v) => {
            const isSelected = data.assignedVehicle === (v._id || v.id);
            return (
              <div
                key={v._id || v.id}
                onClick={() => updateData({ assignedVehicle: v._id || v.id })}
                className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group"
                style={{
                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                  background: isSelected ? 'rgba(255,107,44,0.04)' : 'var(--color-surface-hover)',
                }}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 rounded-full" style={{ background: 'var(--color-surface-card)' }}>
                    <CheckCircle2 size={22} style={{ color: 'var(--color-accent)' }} />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className="p-2.5 rounded-lg transition-colors"
                    style={{
                      background: isSelected ? 'rgba(255,107,44,0.1)' : 'var(--color-surface-card)',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {v.registrationNumber}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {v.make} {v.model}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: 'var(--color-surface-card)', color: 'var(--color-text-muted)' }}>
                        Max: {v.capacity?.weight} kg
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: 'var(--color-surface-card)', color: 'var(--color-text-muted)' }}>
                        {v.fuelEfficiency} MPG
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border" style={{ background: 'var(--color-surface-hover)', borderColor: 'var(--color-border-light)' }}>
          <AlertTriangle className="mx-auto mb-3" size={36} style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>No Vehicles Available</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            No available vehicles can handle {data.weight} kg of cargo.
          </p>
        </div>
      )}
    </div>
  );
};
