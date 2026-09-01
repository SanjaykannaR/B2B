import { useEffect, useState } from 'react';
import StatCard from '../../components/shared/StatCard';
import RevenueSummary from '../../components/executive/RevenueSummary';
import FleetUtilizationChart from '../../components/executive/FleetUtilizationChart';
import RouteEfficiencyChart from '../../components/executive/RouteEfficiencyChart';
import DeliveryPerformance from '../../components/executive/DeliveryPerformance';
import MonthlyCapacityWidget from '../../components/executive/MonthlyCapacityWidget';
import {
  getFleetUtilization,
  getRouteEfficiency,
  getMonthlyCapacity,
  getDeliveryPerformance,
  getRevenueSummary,
  FleetUtilizationData,
  RouteEfficiencyData,
  MonthlyCapacityData,
  DeliveryPerformanceData,
  RevenueSummaryData,
} from '../../services/analyticsApi';

interface AnalyticsState {
  fleet: FleetUtilizationData | null;
  route: RouteEfficiencyData | null;
  capacity: MonthlyCapacityData | null;
  performance: DeliveryPerformanceData | null;
  revenue: RevenueSummaryData | null;
}

const EMPTY_STATE: AnalyticsState = {
  fleet: null,
  route: null,
  capacity: null,
  performance: null,
  revenue: null,
};

export default function ExecutiveAnalytics() {
  const [data, setData] = useState<AnalyticsState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled([
        getFleetUtilization(),
        getRouteEfficiency(),
        getMonthlyCapacity(),
        getDeliveryPerformance(),
        getRevenueSummary(),
      ]);

      if (cancelled) return;

      setData({
        fleet: results[0].status === 'fulfilled' ? results[0].value : null,
        route: results[1].status === 'fulfilled' ? results[1].value : null,
        capacity: results[2].status === 'fulfilled' ? results[2].value : null,
        performance: results[3].status === 'fulfilled' ? results[3].value : null,
        revenue: results[4].status === 'fulfilled' ? results[4].value : null,
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalShipments = data.capacity?.monthly.reduce((sum, row) => sum + row.shipments, 0) ?? 0;

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem 3rem 1rem', minWidth: 0, overflowX: 'hidden' }}>
      <div
        style={{
          backgroundColor: '#1B2A4A',
          color: '#FFFFFF',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(27, 42, 74, 0.25)',
          background: 'linear-gradient(135deg, #1B2A4A 0%, #0F1B33 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span style={{ backgroundColor: '#FF6B2C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              EXECUTIVE ANALYTICS
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Leadership overview · Current period</span>
          </div>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
            Executive Analytics
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9375rem', maxWidth: '640px' }}>
            Fleet utilization, route efficiency, monthly capacity, and delivery performance — fetched live with
            automatic fallback to reference data when the analytics service is unavailable.
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="card"
          style={{
            padding: '4rem',
            textAlign: 'center',
            color: '#64748B',
            backgroundColor: '#FFFFFF',
            fontSize: '0.9375rem',
          }}
        >
          Loading executive analytics data…
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(230px, 100%), 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <StatCard
              title="Total Shipments"
              value={totalShipments.toLocaleString()}
              icon={<span>📦</span>}
              change={data.revenue?.shipmentsDelta ?? 0}
              changeType="up"
            />
            <StatCard
              title="Revenue"
              value={`$${((data.revenue?.totalRevenue ?? 0) / 1000000).toFixed(1)}M`}
              icon={<span>💰</span>}
              change={data.revenue?.revenueDelta ?? 0}
              changeType="up"
            />
            <StatCard
              title="Fleet Utilization"
              value={`${(data.fleet?.utilizationRate ?? 0).toFixed(1)}%`}
              icon={<span>🚛</span>}
              change={data.fleet?.utilizationDelta ?? 0}
              changeType="up"
            />
            <StatCard
              title="On-Time Rate"
              value={`${(data.performance?.onTimeRate ?? 0).toFixed(1)}%`}
              icon={<span>⏱️</span>}
              change={data.performance?.onTimeDelta ?? 0}
              changeType="up"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(480px, 100%), 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {data.revenue && <RevenueSummary data={data.revenue} />}
            {data.fleet && <FleetUtilizationChart data={data.fleet} />}
            {data.route && <RouteEfficiencyChart data={data.route} />}
            {data.performance && <DeliveryPerformance data={data.performance} />}
          </div>

          {data.capacity && <MonthlyCapacityWidget data={data.capacity} />}
        </>
      )}
    </div>
  );
}
