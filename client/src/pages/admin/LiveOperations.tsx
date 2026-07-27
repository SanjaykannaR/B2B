import React, { useState, useEffect } from 'react';
import { DispatchPanel } from '../../components/admin/DispatchPanel';
import { LiveMap } from '../../components/admin/LiveMap';
import { ManifestDetailModal } from '../../components/admin/ManifestDetailModal';
import * as manifestApi from '../../services/manifestApi';

const DEMO_TRIPS = [
  {
    _id: 'mock-1', trackingId: 'TRK-9021', status: 'IN_TRANSIT',
    client: { name: 'Acme Corp' },
    origin: { city: 'Mumbai', coordinates: [72.8777, 19.0760] },
    destination: { city: 'Delhi', coordinates: [77.1025, 28.7041] },
    currentLocation: { coordinates: [75.8573, 21.1458] },
    vehicle: { registrationNumber: 'MH-12-AB-1234', make: 'Tata' },
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'mock-2', trackingId: 'TRK-9022', status: 'IN_TRANSIT',
    client: { name: 'GlobalTrade' },
    origin: { city: 'Chennai', coordinates: [80.2707, 13.0827] },
    destination: { city: 'Bangalore', coordinates: [77.5946, 12.9716] },
    currentLocation: { coordinates: [78.4867, 13.0827] },
    vehicle: { registrationNumber: 'TN-07-EF-9012', make: 'Eicher' },
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: 'mock-3', trackingId: 'TRK-9023', status: 'DELAYED',
    client: { name: 'FastFreight' },
    origin: { city: 'Pune', coordinates: [73.8567, 18.5204] },
    destination: { city: 'Ahmedabad', coordinates: [72.5714, 23.0225] },
    currentLocation: { coordinates: [73.2, 19.8] },
    vehicle: { registrationNumber: 'GJ-06-IJ-7890', make: 'Tata' },
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const LiveOperations: React.FC = () => {
  const [activeManifests, setActiveManifests] = useState<any[]>([]);
  const [selectedManifestId, setSelectedManifestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingManifestId, setViewingManifestId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await manifestApi.getManifests({ status: 'IN_TRANSIT' });
        const data = res.manifests || res || [];
        setActiveManifests(data.length > 0 ? data : DEMO_TRIPS);
      } catch {
        setActiveManifests(DEMO_TRIPS);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (m: any) => {
    const id = m._id || m.id;
    setSelectedManifestId((prev) => (prev === id ? null : id));
  };

  const handleViewDetails = (id: string) => {
    setViewingManifestId(id);
    setIsModalOpen(true);
  };

  const handleModalAction = (action: string, id: string) => {
    console.log(`Action: ${action} for manifest: ${id}`);
    setIsModalOpen(false);
  };

  const viewingManifest = activeManifests.find((m) => (m._id || m.id) === viewingManifestId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-card)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Live Operations</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {activeManifests.length} active trips &bull; Last updated just now
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2" style={{ borderColor: 'var(--color-accent)' }} />
              Refreshing...
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Dispatch Panel */}
        <DispatchPanel
          manifests={activeManifests}
          onSelect={handleSelect}
          selectedId={selectedManifestId}
          onViewDetails={handleViewDetails}
        />

        {/* Map */}
        <div className="flex-1 relative h-full">
          <LiveMap
            manifests={activeManifests}
            selectedId={selectedManifestId}
            onViewDetails={handleViewDetails}
          />

          {loading && activeManifests.length === 0 && (
            <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
              style={{ background: 'rgba(15,22,41,0.5)' }}>
              <div className="px-6 py-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--color-surface-card)', boxShadow: 'var(--shadow-xl)' }}>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--color-accent)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Connecting to fleet...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ManifestDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        manifest={viewingManifest}
        onAction={handleModalAction}
      />
    </div>
  );
};
