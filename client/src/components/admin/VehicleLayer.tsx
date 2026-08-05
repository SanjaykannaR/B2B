// VehicleLayer — 3D animated truck markers with click popup (Swiggy-style)
// Smooth movement: selection only toggles CSS class, never rebuilds the marker.
// Click a truck → popup with tracking ID, driver, goods, location, delay reason.

import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  toLeaflet,
  bezierRoute,
  pointAtProgress,
  haversineKm,
  bearing,
  easeInOut,
  clamp,
  lerpLatLng,
  type LatLng,
} from '../../utils/geo';

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

/** Build truck marker HTML — one-time creation, selection handled via CSS class */
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

interface VehicleAnim {
  from: LatLng;
  to: LatLng;
  start: number;
  duration: number;
  angle: number;
  simulated: boolean;
  route?: [number, number][];
  simProgress?: number;
  simSpeed?: number;
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
  const markersRef = useRef<Record<string, L.Marker>>({});
  const glyphsRef = useRef<Record<string, HTMLElement | null>>({});
  const colorRef = useRef<Record<string, string>>({});
  const animsRef = useRef<Record<string, VehicleAnim>>({});
  const manifestMapRef = useRef<Record<string, any>>({});
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  selectedRef.current = selectedId;

  /* ---------- create/update markers + animation targets ---------- */
  useEffect(() => {
    const ids = new Set(manifests.map(getId));

    for (const mnf of manifests) {
      manifestMapRef.current[getId(mnf)] = mnf;
    }

    // Remove stale markers
    for (const id of Object.keys(markersRef.current)) {
      if (!ids.has(id)) {
        const m = markersRef.current[id];
        if (m) map.removeLayer(m);
        delete markersRef.current[id];
        delete glyphsRef.current[id];
        delete colorRef.current[id];
        delete animsRef.current[id];
        delete positionRef.current[id];
        delete manifestMapRef.current[id];
      }
    }

    // 1. Demo simulation — set up bezier routes
    if (simulate) {
      for (const mnf of manifests) {
        const id = getId(mnf);
        const o = mnf.origin?.coordinates as [number, number] | undefined;
        const d = mnf.destination?.coordinates as [number, number] | undefined;
        if (!o || !d) continue;
        const existing = animsRef.current[id];
        if (!existing?.route) {
          const route = bezierRoute(o, d);
          animsRef.current[id] = {
            from: { lat: o[1], lng: o[0] },
            to: { lat: o[1], lng: o[0] },
            start: 0,
            duration: 1,
            angle: bearing(o, pointAtProgress(route, 0.02)),
            simulated: true,
            route,
            simProgress: existing?.simProgress ?? Math.random(),
            simSpeed: 1 / 90, // SLOWER: full trip every ~90s (was 70s)
          };
          const pt = pointAtProgress(route, animsRef.current[id].simProgress!);
          positionRef.current[id] = { lat: pt[1], lng: pt[0] };
        }
      }
    }

    // 2. Live targets for non-simulated vehicles
    for (const mnf of manifests) {
      const id = getId(mnf);
      const anim = animsRef.current[id];
      if (anim?.simulated) continue;

      const target = toLeaflet(mnf.currentLocation?.coordinates) ?? toLeaflet(mnf.origin?.coordinates);
      if (!target) continue;
      const from = positionRef.current[id] ?? target;
      positionRef.current[id] ??= from;
      const distKm = haversineKm([from.lng, from.lat], [target.lng, target.lat]);
      animsRef.current[id] = {
        from,
        to: target,
        start: performance.now(),
        duration: clamp(distKm * 350, 900, 2600),
        angle: bearing([from.lng, from.lat], [target.lng, target.lat]),
        simulated: false,
      };
    }

    // 3. Create/refresh markers — ONLY create new ones, don't rebuild existing
    for (const mnf of manifests) {
      const id = getId(mnf);
      const color = statusColorFor(mnf.status);
      const status = (mnf.status || '').toUpperCase();
      let marker = markersRef.current[id];

      if (!marker) {
        // First time — create marker
        marker = L.marker([0, 0], {
          icon: L.divIcon({
            className: 'truck-icon-wrap',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            html: buildTruckHtml(color, status),
          }),
          keyboard: false,
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
        markersRef.current[id] = marker;
        colorRef.current[id] = color;
      } else {
        // Marker exists — update popup content only (DON'T call setIcon — it destroys DOM)
        marker.setPopupContent(buildPopupHtml(mnf));
      }

      // Cache glyph reference
      glyphsRef.current[id] =
        (marker.getElement()?.querySelector('.truck-icon-3d') as HTMLElement | null) ?? null;
    }
  }, [manifests, map, positionRef, simulate]);

  /* ---------- selection: toggle CSS class ONLY — no setIcon, no DOM rebuild ---------- */
  useEffect(() => {
    for (const [id, marker] of Object.entries(markersRef.current)) {
      const el = marker.getElement();
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
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    }
  }, [selectedId]);

  /* ---------- shared animation loop ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const sel = selectedRef.current;

      for (const [id, anim] of Object.entries(animsRef.current)) {
        const marker = markersRef.current[id];
        if (!marker) continue;
        const glyph = glyphsRef.current[id];
        let pos: LatLng | null = null;
        let angle = anim.angle ?? 0;

        if (anim.simulated && anim.route) {
          // Advance along the route — SMOOTH continuous movement
          anim.simProgress = (anim.simProgress! + anim.simSpeed! * dt) % 1;
          const pt = pointAtProgress(anim.route, anim.simProgress);
          const pt2 = pointAtProgress(anim.route, Math.min(1, anim.simProgress! + 0.005));
          pos = { lat: pt[1], lng: pt[0] };
          angle = bearing(pt, pt2);
          anim.angle = angle;
        } else if (anim.to) {
          const t = clamp((now - anim.start) / anim.duration, 0, 1);
          pos = lerpLatLng(anim.from, anim.to, reduceMotion ? 1 : easeInOut(t));
          if (t >= 1) {
            anim.to = anim.from = pos;
            anim.duration = 1;
            anim.start = now;
          }
        }

        if (pos) {
          marker.setLatLng([pos.lat, pos.lng]);
          positionRef.current[id] = pos;
          if (glyph) {
            const tiltX = Math.abs(Math.sin((angle * Math.PI) / 180)) * 8;
            glyph.style.transform = `rotate(${angle}deg) perspective(200px) rotateX(${tiltX}deg)${id === sel ? ' scale(1.15)' : ''}`;
          }
        }
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      for (const m of Object.values(markersRef.current)) map.removeLayer(m);
      markersRef.current = {};
      glyphsRef.current = {};
      animsRef.current = {};
    };
  }, [map, positionRef]);

  return null;
};
