// RouteLayer — Status-colored animated route lines (Swiggy-style)
// IN_TRANSIT routes: purple flowing dashes
// DELAYED routes: red flowing dashes with warning glow
// Base faint polyline + bright dashed overlay with flowing stroke-dashoffset.
// Real roads via OSRM public API (no key, module-level cache, 3s timeout);
// falls back to a quadratic bezier curve when offline.
// Routes shown INSTANTLY via bezier, then upgraded to real roads in parallel.

import React, { useEffect, useState, useRef } from 'react';
import { Polyline, Marker } from 'react-leaflet';
import { makeDestIcon, makeOriginIcon } from './VehicleLayer';
import { bezierRoute } from '../../utils/geo';

interface RouteLayerProps {
  manifests: any[];
  selectedId: string | null;
}

const getId = (m: any) => m?._id || m?.id || '';

/** Status → route color config */
const ROUTE_COLORS: Record<string, { base: string; flow: string; glow: string }> = {
  IN_TRANSIT: { base: '#6D28D9', flow: '#A78BFA', glow: 'rgba(139,92,246,0.4)' },
  DELAYED:    { base: '#991B1B', flow: '#F87171', glow: 'rgba(239,68,68,0.4)' },
  DELIVERED:  { base: '#065F46', flow: '#34D399', glow: 'rgba(16,185,129,0.3)' },
  ASSIGNED:   { base: '#1E40AF', flow: '#60A5FA', glow: 'rgba(59,130,246,0.3)' },
};

const getRouteColors = (status?: string) =>
  ROUTE_COLORS[(status || '').toUpperCase()] || { base: '#475569', flow: '#94A3B8', glow: 'rgba(148,163,184,0.2)' };

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
      '?overview=full&geometries=geojson&alternatives=false';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000); // 3s timeout (down from 4)
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
  const upgradingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // Phase 1: INSTANTLY set all routes to bezier fallback (zero delay)
    const fallbacks: Record<string, [number, number][]> = {};
    for (const mnf of manifests) {
      const id = getId(mnf);
      const o = mnf.origin?.coordinates as [number, number] | undefined;
      const d = mnf.destination?.coordinates as [number, number] | undefined;
      if (Array.isArray(o) && Array.isArray(d) && o.length === 2 && d.length === 2) {
        // Use cached OSRM if available, else bezier
        const key = `${o[0].toFixed(4)},${o[1].toFixed(4)}|${d[0].toFixed(4)},${d[1].toFixed(4)}`;
        const cached = routeCache.get(key);
        fallbacks[id] = cached || bezierRoute(o, d);
      }
    }
    if (!cancelled) setRoutes(fallbacks);

    // Phase 2: Fetch ALL OSRM routes in PARALLEL (non-blocking, updates as each resolves)
    if (upgradingRef.current) return; // already upgrading from previous render
    upgradingRef.current = true;

    const pairs: { id: string; o: [number, number]; d: [number, number] }[] = [];
    for (const mnf of manifests) {
      const id = getId(mnf);
      const o = mnf.origin?.coordinates as [number, number] | undefined;
      const d = mnf.destination?.coordinates as [number, number] | undefined;
      if (Array.isArray(o) && Array.isArray(d) && o.length === 2 && d.length === 2) {
        pairs.push({ id, o, d });
      }
    }

    // Fire all fetches simultaneously, update state as each resolves
    Promise.all(
      pairs.map(async ({ id, o, d }) => {
        const route = await fetchRoute(o, d);
        return { id, route };
      })
    ).then((results) => {
      if (cancelled) return;
      setRoutes((prev) => {
        const next = { ...prev };
        for (const { id, route } of results) {
          next[id] = route;
        }
        return next;
      });
      upgradingRef.current = false;
    }).catch(() => {
      upgradingRef.current = false;
    });

    return () => {
      cancelled = true;
      upgradingRef.current = false;
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
        const status = (mnf.status || '').toUpperCase();
        const colors = getRouteColors(mnf.status);
        const isDelayed = status === 'DELAYED';

        return (
          <React.Fragment key={id}>
            {/* Base route (faint, always visible) */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: colors.base,
                weight: isSelected ? 6 : 4,
                opacity: isSelected ? 0.6 : 0.3,
                lineCap: 'round',
                interactive: false,
              }}
            />
            {/* Flowing light overlay — the "Swiggy" effect */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: colors.flow,
                weight: isSelected ? 4 : 2.5,
                opacity: isSelected ? 1 : 0.65,
                lineCap: 'round',
                className: isDelayed ? 'route-flow route-flow-delayed' : 'route-flow',
                interactive: false,
              }}
            />
            {/* Delayed route glow effect */}
            {isDelayed && isSelected && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: '#EF4444',
                  weight: 10,
                  opacity: 0.15,
                  lineCap: 'round',
                  className: 'route-glow',
                  interactive: false,
                }}
              />
            )}
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
