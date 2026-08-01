// VehicleLayer — Swiggy/Zomato-style animated truck markers (Item 15, Phase 1)
// One shared requestAnimationFrame loop lerps every truck from last-known →
// target position (ease-in-out) and rotates the glyph toward the heading.
// Positions update imperatively (marker.setLatLng) — no React re-render per frame.
// Owner: Developer 2 (Web Frontend Engineer)

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

/** Status → marker color (matches StatusBadge palette). */
export const statusColorFor = (status?: string): string => {
  switch ((status || '').toUpperCase()) {
    case 'IN_TRANSIT': return '#8B5CF6';
    case 'DELAYED':    return '#EF4444';
    case 'DELIVERED':  return '#10B981';
    case 'ASSIGNED':   return '#3B82F6';
    default:           return '#64748B';
  }
};

const TRUCK_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
  '<path d="M6 9h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"/>' +
  '<path d="M13 5h4a3 3 0 0 1 3 3v1h-9V7a2 2 0 0 1 2-2z"/>' +
  '<circle cx="8" cy="20.5" r="2"/><circle cx="15" cy="20.5" r="2"/></svg>';

export const makeVehicleIcon = (color: string): L.DivIcon =>
  L.divIcon({
    className: 'vehicle-marker-wrap',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div class="vehicle-marker" style="--vehicle-color:${color}">` +
      '<div class="vehicle-pulse"></div>' +
      `<div class="vehicle-glyph">${TRUCK_SVG}</div></div>`,
  });

export const makeDestIcon = (): L.DivIcon =>
  L.divIcon({
    className: 'vehicle-marker-wrap',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: '<div class="dest-marker"></div>',
  });

export const makeOriginIcon = (): L.DivIcon =>
  L.divIcon({
    className: 'vehicle-marker-wrap',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: '<div class="origin-marker"></div>',
  });

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
  /** Demo mode: trucks advance along their bezier route continuously. */
  simulate: boolean;
  /** Shared mutable positions (lat/lng) — updated per frame, read by camera/card. */
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
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  selectedRef.current = selectedId;

  /* ---------- create/update markers + animation targets ---------- */
  useEffect(() => {
    const ids = new Set(manifests.map(getId));

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
      }
    }

    // 1. Demo simulation first (so it wins over static currentLocation targets)
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
            simSpeed: 1 / 70, // full trip every ~70s
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
        duration: clamp(distKm * 350, 900, 2600), // longer journeys → slower glide
        angle: bearing([from.lng, from.lat], [target.lng, target.lat]),
        simulated: false,
      };
    }

    // 3. Create/refresh markers
    for (const mnf of manifests) {
      const id = getId(mnf);
      const color = statusColorFor(mnf.status);
      let marker = markersRef.current[id];
      if (!marker) {
        marker = L.marker([0, 0], { icon: makeVehicleIcon(color), keyboard: false });
        marker.bindTooltip(`#${mnf.trackingId || id}`, {
          direction: 'top',
          offset: [0, -24],
          className: 'vehicle-tooltip',
        });
        marker.on('click', () => onSelectRef.current?.(mnf));
        marker.addTo(map);
        markersRef.current[id] = marker;
      } else if (colorRef.current[id] !== color) {
        marker.setIcon(makeVehicleIcon(color));
      }
      colorRef.current[id] = color;
      glyphsRef.current[id] =
        (marker.getElement()?.querySelector('.vehicle-glyph') as HTMLElement | null) ?? null;
    }
  }, [manifests, map, positionRef, simulate]);

  /* ---------- selection: raise selected marker above others ---------- */
  useEffect(() => {
    for (const [id, marker] of Object.entries(markersRef.current)) {
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
          // Advance along the route continuously
          anim.simProgress = (anim.simProgress! + anim.simSpeed! * dt) % 1;
          const pt = pointAtProgress(anim.route, anim.simProgress);
          const pt2 = pointAtProgress(anim.route, Math.min(1, anim.simProgress! + 0.008));
          pos = { lat: pt[1], lng: pt[0] };
          angle = bearing(pt, pt2);
          anim.angle = angle;
        } else if (anim.to) {
          const t = clamp((now - anim.start) / anim.duration, 0, 1);
          pos = lerpLatLng(anim.from, anim.to, reduceMotion ? 1 : easeInOut(t));
          if (t >= 1) {
            // Arrived — leave marker parked at target; skip work next frames
            anim.to = anim.from = pos;
            anim.duration = 1;
            anim.start = now;
          }
        }

        if (pos) {
          marker.setLatLng([pos.lat, pos.lng]);
          positionRef.current[id] = pos;
          if (glyph) {
            glyph.style.transform = `rotate(${angle}deg)${id === sel ? ' scale(1.2)' : ''}`;
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
