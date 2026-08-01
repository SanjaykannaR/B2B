// LiveMap — Swiggy/Zomato-style animated Live Ops map (Item 15)
// Orchestrates: animated vehicle markers, flowing route lines, camera follow,
// and a floating trip info card over a dark CartoDB tile layer.
// Owner: Developer 2 (Web Frontend Engineer)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { VehicleLayer } from './VehicleLayer';
import { RouteLayer } from './RouteLayer';
import { TripInfoCard } from './TripInfoCard';
import { toLeaflet, type LatLng } from '../../utils/geo';
import { LocateFixed } from 'lucide-react';

interface LiveMapProps {
  manifests: any[];
  selectedId: string | null;
  /** Demo mode: trucks advance along routes continuously (no real GPS). */
  simulate?: boolean;
  onSelect?: (manifest: any) => void;
  onViewDetails?: (manifestId: string) => void;
}

const CENTER: [number, number] = [20.5937, 78.9629]; // India overview

/* Fly to the selected truck (once per selection change). */
const MapController: React.FC<{
  selected: any | null;
  positionRef: React.MutableRefObject<Record<string, LatLng>>;
}> = ({ selected, positionRef }) => {
  const map = useMap();
  useEffect(() => {
    const id = selected?._id || selected?.id;
    if (!id) return;
    const pos =
      positionRef.current[id] ??
      toLeaflet(selected?.currentLocation?.coordinates) ??
      toLeaflet(selected?.origin?.coordinates);
    if (pos) map.flyTo([pos.lat, pos.lng], 13, { duration: 1.2 });
  }, [selected, map, positionRef]);
  return null;
};

/* Smoothly follow the selected truck while follow mode is on. */
const FollowController: React.FC<{
  follow: boolean;
  selectedId: string | null;
  positionRef: React.MutableRefObject<Record<string, LatLng>>;
  onMapClick: () => void;
}> = ({ follow, selectedId, positionRef, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!follow || !selectedId) return;
    const iv = setInterval(() => {
      const pos = positionRef.current[selectedId];
      if (!pos) return;
      const point = map.latLngToContainerPoint([pos.lat, pos.lng]);
      const center = map.getSize().divideBy(2);
      // Only pan when the truck drifts > 60px off-center (avoids wasted pans)
      if (point.distanceTo(center) > 60) {
        map.panTo([pos.lat, pos.lng], { animate: true, duration: 0.9 });
      }
    }, 900);
    return () => clearInterval(iv);
  }, [follow, selectedId, map, positionRef]);

  // Clicking anywhere on the map unlocks follow mode
  useEffect(() => {
    if (!follow) return;
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [follow, map, onMapClick]);

  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({
  manifests,
  selectedId,
  simulate = false,
  onSelect,
  onViewDetails,
}) => {
  const positionRef = useRef<Record<string, LatLng>>({});
  const [follow, setFollow] = useState(false);
  const selected = manifests.find((m) => (m._id || m.id) === selectedId) || null;

  // Selecting a trip auto-enables follow mode
  useEffect(() => {
    setFollow(!!selectedId);
  }, [selectedId]);

  const handleSelect = useCallback((mnf: any) => onSelect?.(mnf), [onSelect]);
  const handleMapClick = useCallback(() => setFollow(false), []);

  const fleet = useMemo(() => {
    let inTransit = 0;
    let delayed = 0;
    for (const m of manifests) {
      const s = (m.status || '').toUpperCase();
      if (s === 'IN_TRANSIT') inTransit++;
      else if (s === 'DELAYED') delayed++;
    }
    return { total: manifests.length, inTransit, delayed };
  }, [manifests]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={CENTER}
        zoom={5}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController selected={selected} positionRef={positionRef} />
        <FollowController
          follow={follow}
          selectedId={selectedId}
          positionRef={positionRef}
          onMapClick={handleMapClick}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <RouteLayer manifests={manifests} selectedId={selectedId} />
        <VehicleLayer
          manifests={manifests}
          selectedId={selectedId}
          simulate={simulate}
          positionRef={positionRef}
          onSelect={handleSelect}
        />
      </MapContainer>

      {/* Follow toggle */}
      <button
        onClick={() => setFollow((f) => !f)}
        disabled={!selectedId}
        title={follow ? 'Stop following truck' : 'Follow selected truck'}
        className="absolute top-3 right-3 z-[1100] p-2.5 rounded-full transition-all duration-200 disabled:opacity-40"
        style={{
          background: follow ? 'var(--color-accent)' : 'rgba(15,27,51,0.85)',
          color: '#fff',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <LocateFixed size={16} className={follow ? 'animate-pulse' : ''} />
      </button>

      {/* Trip info / fleet summary card */}
      <div className="absolute top-3 left-3 z-[1100] w-[280px] max-w-[calc(100%-24px)]">
        <TripInfoCard
          manifest={selected}
          fleet={fleet}
          positionRef={positionRef}
          onSelect={handleSelect}
          onViewDetails={onViewDetails}
        />
      </div>
    </div>
  );
};
