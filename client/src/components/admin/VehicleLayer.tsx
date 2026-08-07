// VehicleLayer — 3D animated truck markers with CSS-transition smooth movement
// Google Maps-style: position updates via CSS transform + transition, NOT per-frame setLatLng.
// Only calls setLatLng when the animation segment completes (prevents zoom-fight glitch).
// Click a truck → popup with tracking ID, driver, goods, location, delay reason.

import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  toLeaflet,
  bezierRoute,
  pointAtProgress,
  bearing,
  type LatLng,
} from '../../utils/geo';
import { routeCache } from './RouteLayer';

/** Status → marker color */
export const statusColorFor = (status?: string): string => {
  switch ((status || '').toUpperCase()) {
    case 'IN_TRANSIT': return '#8B5CF6';
    case 'DELAYED':    return '#EF4444';
    case 'DELIVERED':  return '#10B981';
    case 'ASSIGNED':   return '#3B82F6';
    default:           return '#64748B';
  }
};

/** 3D truck SVG */
const TRUCK_SVG_3D = `
<svg viewBox="0 0 48 48" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cabGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="truckShadow" x="-20%" y="-10%" width="140%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <g filter="url(#truckShadow)">
    <rect x="3" y="12" width="22" height="18" rx="3" fill="var(--vehicle-color, #8B5CF6)" opacity="0.92"/>
    <rect x="3" y="12" width="22" height="18" rx="3" fill="url(#bodyGrad)"/>
    <rect x="5" y="14" width="18" height="4" rx="1.5" fill="#fff" opacity="0.18"/>
    <path d="M25 16 h10 a3 3 0 0 1 3 3 v6 h-13 z" fill="var(--vehicle-color, #8B5CF6)"/>
    <path d="M25 16 h10 a3 3 0 0 1 3 3 v6 h-13 z" fill="url(#cabGrad)"/>
    <path d="M28 18 h6 a1.5 1.5 0 0 1 1.5 1.5 v3 h-7.5 z" fill="#1e293b" opacity="0.85"/>
    <path d="M28.5 18.5 h5 a1 1 0 0 1 1 1 v2 h-6 z" fill="#38bdf8" opacity="0.35"/>
    <circle cx="11" cy="32" r="3.5" fill="#1e293b"/>
    <circle cx="11" cy="32" r="2" fill="#475569"/>
    <circle cx="11" cy="32" r="0.8" fill="#94a3b8"/>
    <circle cx="33" cy="32" r="3.5" fill="#1e293b"/>
    <circle cx="33" cy="32" r="2" fill="#475569"/>
    <circle cx="33" cy="32" r="0.8" fill="#94a3b8"/>
    <rect x="37" y="21" width="2.5" height="3" rx="1" fill="#fbbf24" opacity="0.9"/>
  </g>
</svg>`;

/** Build truck marker HTML */
const buildTruckHtml = (color: string, status: string): string => {
  const isDelayed = (status || '').toUpperCase() === 'DELAYED';
  const ringColor = isDelayed ? '#EF4444' : color;
  const glowColor = isDelayed ? 'rgba(239,68,68,0.35)' : `${color}55`;
  return `<div class="truck-marker-3d" style="--truck-color:${color}; --ring-color:${ringColor}; --glow-color:${glowColor}" data-status="${status}">` +
    '<div class="truck-glow"></div>' +
    '<div class="truck-pulse-ring"></div>' +
    `<div class="truck-icon-3d">${TRUCK_SVG_3D}</div>` +
    (isDelayed ? '<div class="truck-delay-badge">!</div>' : '') +
    '</div>';
};

/** Build rich HTML popup */
const buildPopupHtml = (mnf: any): string => {
  const id = mnf.trackingId || mnf._id || '—';
  const status = (mnf.status || 'UNKNOWN').toUpperCase();
  const driver = mnf.driver?.name || 'Unassigned';
  const phone = mnf.driver?.phone || '';
  const goods = mnf.cargoDetails?.description || 'General Cargo';
  const weight = mnf.cargoDetails?.totalWeightKg;
  const origin = mnf.origin?.city || '—';
  const dest = mnf.destination?.city || '—';
  const vehicle = mnf.vehicle?.registrationNumber || '—';
  const vehicleMake = mnf.vehicle?.make || '';
  const delayReason = mnf.delayReason || '';
  const isDelayed = status === 'DELAYED';
  const isHazardous = mnf.cargoDetails?.isHazardous;

  const sc: Record<string, { bg: string; text: string }> = {
    IN_TRANSIT: { bg: '#8B5CF6', text: '#fff' },
    DELAYED:    { bg: '#EF4444', text: '#fff' },
    DELIVERED:  { bg: '#10B981', text: '#fff' },
    ASSIGNED:   { bg: '#3B82F6', text: '#fff' },
  };
  const c = sc[status] || { bg: '#64748B', text: '#fff' };

  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:260px;max-width:300px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:#1e293b;">#${id}</span>
          <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${c.bg};color:${c.text};text-transform:uppercase;letter-spacing:0.5px;">${status.replace('_',' ')}</span>
        </div>
        ${isHazardous ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:#FEE2E2;color:#EF4444;">HAZ</span>' : ''}
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f8fafc;border-radius:8px;margin-bottom:8px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#FF6B2C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${driver.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
        <div style="min-width:0;">
          <div style="font-size:12px;font-weight:600;color:#1e293b;">${driver}</div>
          <div style="font-size:10px;color:#64748B;">${vehicle}${vehicleMake?' • '+vehicleMake:''}</div>
        </div>
        ${phone ? `<a href="tel:${phone}" style="margin-left:auto;width:28px;height:28px;border-radius:50%;background:#10B981;color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;" title="Call ${driver}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#64748B;margin-bottom:8px;">
        <span style="color:#3B82F6;font-weight:600;">${origin}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        <span style="color:#10B981;font-weight:600;">${dest}</span>
      </div>
      <div style="padding:8px 10px;background:#f8fafc;border-radius:8px;margin-bottom:8px;">
        <div style="font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Cargo</div>
        <div style="font-size:12px;font-weight:500;color:#1e293b;">${goods}</div>
        ${weight ? `<div style="font-size:10px;color:#64748B;margin-top:2px;">${weight.toLocaleString()} kg</div>` : ''}
      </div>
      ${isDelayed && delayReason ? `<div style="padding:8px 10px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;"><div style="font-size:10px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Delay Reason</div><div style="font-size:11px;color:#991B1B;line-height:1.4;">${delayReason}</div></div>` : ''}
    </div>`;
};

export const makeDestIcon = (): L.DivIcon =>
  L.divIcon({ className: 'vehicle-marker-wrap', iconSize: [16, 16], iconAnchor: [8, 8], html: '<div class="dest-marker"></div>' });

export const makeOriginIcon = (): L.DivIcon =>
  L.divIcon({ className: 'vehicle-marker-wrap', iconSize: [12, 12], iconAnchor: [6, 6], html: '<div class="origin-marker"></div>' });

const getId = (m: any) => m?._id || m?.id || '';

/**
 * Animation segment: a smooth move from one point to another.
 * Uses CSS transition for butter-smooth movement (no per-frame setLatLng).
 */
interface AnimSegment {
  from: LatLng;
  to: LatLng;
  duration: number;      // ms
  startTime: number;     // when segment started
  angle: number;
}

/** Per-truck animation state */
interface TruckState {
  marker: L.Marker;
  glyph: HTMLElement | null;
  color: string;
  // Simulation
  route?: [number, number][];
  simProgress: number;
  simSpeed: number;
  direction: 1 | -1;  // Ping-pong: 1 = forward, -1 = backward
  // Current segment (CSS transition based)
  segment: AnimSegment | null;
  // Base position (where the marker actually is in Leaflet)
  basePos: LatLng;
  // Manifest ref
  manifest: any;
}

interface VehicleLayerProps {
  manifests: any[];
  selectedId: string | null;
  simulate: boolean;
  positionRef: React.MutableRefObject<Record<string, LatLng>>;
  onSelect?: (mnf: any) => void;
}

export const VehicleLayer: React.FC<VehicleLayerProps> = ({
  manifests,
  selectedId,
  simulate,
  positionRef,
  onSelect,
}) => {
  const map = useMap();
  const trucksRef = useRef<Map<string, TruckState>>(new Map());
  const rafRef = useRef(0);
  const isZoomingRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  selectedRef.current = selectedId;

  /* ---------- pause during zoom to prevent projection mismatch ---------- */
  useEffect(() => {
    const onZoomStart = () => { isZoomingRef.current = true; };
    const onZoomEnd = () => {
      isZoomingRef.current = false;
      // Refresh glyph refs & recalc rotation after zoom (marker DOM may have shifted)
      for (const state of trucksRef.current.values()) {
        state.glyph = state.marker.getElement()?.querySelector('.truck-icon-3d') as HTMLElement | null;
        if (state.glyph && state.route && simulate) {
          const pt = pointAtProgress(state.route, state.simProgress);
          const ptNext = pointAtProgress(state.route, Math.min(1, state.simProgress + state.direction * 0.003));
          const angle = bearing(pt, ptNext);
          const tiltX = Math.abs(Math.sin((angle * Math.PI) / 180)) * 8;
          const sel = selectedRef.current;
          const id = getId(state.manifest);
          state.glyph.style.transform = `rotate(${angle}deg) perspective(200px) rotateX(${tiltX}deg)${id === sel ? ' scale(1.15)' : ''}`;
        }
      }
    };
    map.on('zoomstart', onZoomStart);
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomstart', onZoomStart);
      map.off('zoomend', onZoomEnd);
    };
  }, [map, simulate]);

  /* ---------- create / remove markers when manifests change ---------- */
  useEffect(() => {
    const ids = new Set(manifests.map(getId));
    const trucks = trucksRef.current;

    // Remove stale
    for (const [id, state] of trucks) {
      if (!ids.has(id)) {
        map.removeLayer(state.marker);
        trucks.delete(id);
        delete positionRef.current[id];
      }
    }

    // Create / update
    for (const mnf of manifests) {
      const id = getId(mnf);
      const color = statusColorFor(mnf.status);
      const status = (mnf.status || '').toUpperCase();
      let state = trucks.get(id);

      if (!state) {
        // Initial position
        const initPos = toLeaflet(mnf.currentLocation?.coordinates)
          ?? toLeaflet(mnf.origin?.coordinates)
          ?? { lat: 20.5937, lng: 78.9629 };

        const marker = L.marker([initPos.lat, initPos.lng], {
          icon: L.divIcon({
            className: 'truck-icon-wrap',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            html: buildTruckHtml(color, status),
          }),
          keyboard: false,
          autoPan: false,
        });

        marker.bindPopup(buildPopupHtml(mnf), {
          className: 'truck-popup',
          maxWidth: 320,
          minWidth: 260,
          closeButton: true,
          autoPan: true,
          autoPanPadding: [40, 40],
        });
        marker.on('click', () => onSelectRef.current?.(mnf));
        marker.addTo(map);

        const glyph = marker.getElement()?.querySelector('.truck-icon-3d') as HTMLElement | null;

        state = {
          marker,
          glyph,
          color,
          simProgress: Math.random(),
          simSpeed: 1 / 120, // SLOW: full trip in ~2 minutes (very smooth)
          direction: 1, // Start forward
          segment: null,
          basePos: initPos,
          manifest: mnf,
        };

        // Set up route for simulation — prefer cached OSRM route (same as RouteLayer)
        if (simulate) {
          const o = mnf.origin?.coordinates as [number, number] | undefined;
          const d = mnf.destination?.coordinates as [number, number] | undefined;
          if (o && d) {
            const key = `${o[0].toFixed(4)},${o[1].toFixed(4)}|${d[0].toFixed(4)},${d[1].toFixed(4)}`;
            const cachedRoute = routeCache.get(key);
            state.route = cachedRoute || bezierRoute(o, d); // Use OSRM if available, else bezier fallback
            const pt = pointAtProgress(state.route, state.simProgress);
            state.basePos = { lat: pt[1], lng: pt[0] };
            marker.setLatLng([state.basePos.lat, state.basePos.lng]);
          }
        }

        trucks.set(id, state);
        positionRef.current[id] = state.basePos;
      } else {
        // Update popup content only (don't rebuild marker)
        state.marker.setPopupContent(buildPopupHtml(mnf));
        state.manifest = mnf;
        state.glyph = state.marker.getElement()?.querySelector('.truck-icon-3d') as HTMLElement | null;
      }
    }
  }, [manifests, map, positionRef, simulate]);

  /* ---------- selection: CSS class toggle only ---------- */
  useEffect(() => {
    for (const [id, state] of trucksRef.current) {
      const el = state.marker.getElement();
      if (el) {
        const wrapper = el.querySelector('.truck-marker-3d');
        if (wrapper) {
          if (id === selectedId) {
            wrapper.classList.add('selected');
          } else {
            wrapper.classList.remove('selected');
          }
        }
      }
      state.marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    }
  }, [selectedId]);

  /* ---------- keep trucks on upgraded OSRM roads (bezier → real route) ---------- */
  useEffect(() => {
    if (!simulate) return;
    const iv = setInterval(() => {
      for (const state of trucksRef.current.values()) {
        if (!state.manifest) continue;
        const o = state.manifest.origin?.coordinates as [number, number] | undefined;
        const d = state.manifest.destination?.coordinates as [number, number] | undefined;
        if (!Array.isArray(o) || !Array.isArray(d) || o.length !== 2 || d.length !== 2) continue;
        const key = `${o[0].toFixed(4)},${o[1].toFixed(4)}|${d[0].toFixed(4)},${d[1].toFixed(4)}`;
        const cached = routeCache.get(key);
        if (cached && cached !== state.route) {
          state.route = cached;
          const pt = pointAtProgress(cached, state.simProgress);
          state.basePos = { lat: pt[1], lng: pt[0] };
          state.marker.setLatLng([state.basePos.lat, state.basePos.lng]);
          state.glyph = state.marker.getElement()?.querySelector('.truck-icon-3d') as HTMLElement | null;
        }
      }
    }, 2500);
    return () => clearInterval(iv);
  }, [simulate]);

  /* ---------- main animation loop — per-frame smooth movement ---------- */
  useEffect(() => {
    let last = performance.now();

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = now - last;
      last = now;

      // Skip during zoom (prevents projection mismatch glitch)
      if (isZoomingRef.current) return;

      const trucks = trucksRef.current;

      for (const [id, state] of trucks) {
        if (!state.route || !simulate) continue;

        // Advance simulation progress with ping-pong (no teleport wrap-around)
        const delta = state.simSpeed * (dt / 1000) * state.direction;
        state.simProgress += delta;

        // Ping-pong at ends
        if (state.simProgress >= 1) {
          state.simProgress = 1;
          state.direction = -1;
        } else if (state.simProgress <= 0) {
          state.simProgress = 0;
          state.direction = 1;
        }

        // Calculate target position on route
        const pt = pointAtProgress(state.route, state.simProgress);
        // Look slightly ahead for smooth heading (handles direction change)
        const lookAhead = Math.min(1, state.simProgress + state.direction * 0.003);
        const ptNext = pointAtProgress(state.route, lookAhead);
        const target: LatLng = { lat: pt[1], lng: pt[0] };
        const angle = bearing(pt, ptNext);

        // Update position EVERY frame (no distance threshold = smooth micro-movement)
        state.marker.setLatLng([target.lat, target.lng]);
        state.basePos = target;
        positionRef.current[id] = target;

        // Rotate the truck glyph (no CSS transition on glyph = instant rotation sync)
        if (state.glyph) {
          const tiltX = Math.abs(Math.sin((angle * Math.PI) / 180)) * 8;
          const sel = selectedRef.current;
          state.glyph.style.transform = `rotate(${angle}deg) perspective(200px) rotateX(${tiltX}deg)${id === sel ? ' scale(1.15)' : ''}`;
        }
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      for (const state of trucksRef.current.values()) {
        map.removeLayer(state.marker);
      }
      trucksRef.current.clear();
    };
  }, [map, positionRef, simulate]);

  return null;
};
