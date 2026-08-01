// RouteLayer — Swiggy/Zomato-style animated route lines (Item 15, Phase 2)
// Base faint polyline + bright dashed overlay with flowing stroke-dashoffset.
// Real roads via OSRM public API (no key, module-level cache, 4s timeout);
// falls back to a quadratic bezier curve when offline.
// Owner: Developer 2 (Web Frontend Engineer)

import React, { useEffect, useState } from 'react';
import { Polyline, Marker } from 'react-leaflet';
import { makeDestIcon, makeOriginIcon } from './VehicleLayer';
import { bezierRoute } from '../../utils/geo';

interface RouteLayerProps {
  manifests: any[];
  selectedId: string | null;
}

const getId = (m: any) => m?._id || m?.id || '';

/** Module-level route cache — survives remounts, avoids OSRM refetch storms. */
const routeCache = new Map<string, [number, number][]>();

const fetchRoute = async (o: [number, number], d: [number, number]): Promise<[number, number][]> => {
  const key = `${o[0].toFixed(4)},${o[1].toFixed(4)}|${d[0].toFixed(4)},${d[1].toFixed(4)}`;
  const cached = routeCache.get(key);
  if (cached) return cached;

  const fallback = bezierRoute(o, d);
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/${o[0]},${o[1]};${d[0]},${d[1]}` +
      '?overview=full&geometries=geojson';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    const json = await res.json();
    const coords: number[][] = json?.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length > 1) {
      const route = coords.map(([lng, lat]) => [lng, lat] as [number, number]);
      routeCache.set(key, route);
      return route;
    }
  } catch {
    /* offline / timeout → bezier fallback */
  }
  routeCache.set(key, fallback);
  return fallback;
};

export const RouteLayer: React.FC<RouteLayerProps> = ({ manifests, selectedId }) => {
  const [routes, setRoutes] = useState<Record<string, [number, number][]>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, [number, number][]> = {};
      for (const mnf of manifests) {
        const id = getId(mnf);
        const o = mnf.origin?.coordinates as [number, number] | undefined;
        const d = mnf.destination?.coordinates as [number, number] | undefined;
        if (Array.isArray(o) && Array.isArray(d) && o.length === 2 && d.length === 2) {
          next[id] = await fetchRoute(o, d);
          if (cancelled) return;
        }
      }
      if (!cancelled) setRoutes(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [manifests]);

  return (
    <>
      {manifests.map((mnf) => {
        const id = getId(mnf);
        const route = routes[id];
        const o = mnf.origin?.coordinates;
        const d = mnf.destination?.coordinates;
        if (!route) return null;

        const positions = route.map(([lng, lat]) => [lat, lng] as [number, number]);
        const isSelected = id === selectedId;

        return (
          <React.Fragment key={id}>
            {/* Base route (faint, always visible) */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: isSelected ? '#64748B' : '#475569',
                weight: 4,
                opacity: isSelected ? 0.55 : 0.25,
                lineCap: 'round',
                interactive: false,
              }}
            />
            {/* Flowing light overlay (the Swiggy effect) */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: isSelected ? 'var(--color-accent)' : '#94A3B8',
                weight: isSelected ? 3.5 : 2.5,
                opacity: isSelected ? 1 : 0.6,
                lineCap: 'round',
                className: 'route-flow',
                interactive: false,
              }}
            />
            {/* Origin dot + pulsing destination pin */}
            {Array.isArray(o) && o.length === 2 && (
              <Marker position={[o[1], o[0]]} icon={makeOriginIcon()} interactive={false} />
            )}
            {Array.isArray(d) && d.length === 2 && (
              <Marker position={[d[1], d[0]]} icon={makeDestIcon()} interactive={false} />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
