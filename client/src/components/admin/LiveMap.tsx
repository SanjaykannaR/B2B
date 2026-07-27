import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StatusBadge } from './shared/StatusBadge';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/751/751416.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface LiveMapProps {
  manifests: any[];
  selectedId: string | null;
  onViewDetails?: (manifestId: string) => void;
}

const MapController: React.FC<{ selected: any | null }> = ({ selected }) => {
  const map = useMap();
  useEffect(() => {
    if (selected?.currentLocation?.coordinates) {
      const [lng, lat] = selected.currentLocation.coordinates;
      map.flyTo([lat, lng], 13, { duration: 1.5 });
    }
  }, [selected, map]);
  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({ manifests, selectedId, onViewDetails }) => {
  const selected = manifests.find((m) => (m._id || m.id) === selectedId) || null;
  const center: [number, number] = [20.5937, 78.9629]; // Center of India

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController selected={selected} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {manifests.map((mnf) => {
          const lat = mnf.currentLocation?.coordinates?.[1] || 20 + (Math.random() * 8 - 4);
          const lng = mnf.currentLocation?.coordinates?.[0] || 78 + (Math.random() * 8 - 4);
          return (
            <Marker
              key={mnf._id || mnf.id}
              position={[lat, lng]}
              icon={truckIcon}
              zIndexOffset={selectedId === (mnf._id || mnf.id) ? 1000 : 0}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-sm">#{mnf.trackingId}</span>
                    <StatusBadge status={mnf.status} />
                  </div>
                  <p className="text-xs font-medium">{mnf.client?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {mnf.vehicle?.registrationNumber} • {mnf.vehicle?.make}
                  </p>
                  <button
                    onClick={() => onViewDetails?.(mnf._id || mnf.id)}
                    className="mt-2 text-[11px] font-bold cursor-pointer hover:underline"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
