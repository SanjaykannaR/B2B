import { useEffect, useState } from 'react';
import { FiPackage, FiTruck, FiClock, FiAlertTriangle } from 'react-icons/fi';
import MetricCard from '../../components/shared/MetricCard';
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
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <span style={{ backgroundColor: '#FF6B2C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            EXECUTIVE ANALYTICS
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Leadership overview · Current period</span>
        </div>

        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#1B2A4A' }}>
          Executive Analytics
        </h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '0.9375rem', maxWidth: '640px' }}>
          Fleet utilization, route efficiency, monthly capacity, and delivery performance — fetched live with
          automatic fallback to reference data when the analytics service is unavailable.
        </p>
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
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <MetricCard
              label="TOTAL MANIFESTS"
              value={totalShipments.toLocaleString()}
              icon={<FiPackage size={22} color="#2563EB" />}
              accentColor="#2563EB"
              themeColor="#2563EB"
            />
            <MetricCard
              label="ACTIVE VEHICLES"
              value={data.fleet?.statusDistribution.find(s => s.name === 'In-Transit')?.value?.toString() ?? '0'}
              icon={<FiTruck size={22} color="#10B981" />}
              accentColor="#10B981"
              themeColor="#10B981"
            />
            <MetricCard
              label="PENDING ORDERS"
              value={data.performance?.breakdown.find(s => s.name === 'On-Time')?.value?.toString() ?? '0'}
              icon={<FiClock size={22} color="#F59E0B" />}
              accentColor="#F59E0B"
              themeColor="#F59E0B"
            />
            <MetricCard
              label="ALERTS / DELAYS"
              value={data.performance?.breakdown.find(s => s.name === 'Delayed')?.value?.toString() ?? '0'}
              icon={<FiAlertTriangle size={22} color="#EF4444" />}
              accentColor="#EF4444"
              themeColor="#EF4444"
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
