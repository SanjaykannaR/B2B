import { useEffect, useState } from 'react';
import { FiPackage, FiTruck, FiClock, FiAlertTriangle } from 'react-icons/fi';
import MetricCard from '../../components/shared/MetricCard';
import RevenueSummary from '../../components/executive/RevenueSummary';
import FleetUtilizationChart from '../../components/executive/FleetUtilizationChart';
import RouteEfficiencyChart from '../../components/executive/RouteEfficiencyChart';
import DeliveryPerformance from '../../components/executive/DeliveryPerformance';
import MonthlyCapacityWidget from '../../components/executive/MonthlyCapacityWidget';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
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

export const AdminAnalytics: React.FC = () => {
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

  const totalShipments = data.capacity?.monthly?.reduce((sum, row) => sum + row.shipments, 0) ?? 0;

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <AnimatedCard>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Fleet utilization, route efficiency, monthly capacity, and delivery performance
          </p>
        </div>
      </AnimatedCard>

      {loading ? (
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}
        >
          Loading analytics data…
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatedCard delay={80}>
              <MetricCard
                label="TOTAL MANIFESTS"
                value={totalShipments.toLocaleString()}
                icon={<FiPackage size={22} color="#2563EB" />}
                accentColor="#2563EB"
                themeColor="#2563EB"
              />
            </AnimatedCard>
            <AnimatedCard delay={160}>
              <MetricCard
                label="ACTIVE VEHICLES"
                value={data.fleet?.statusDistribution?.find(s => s.name === 'In-Transit')?.value?.toString() ?? '0'}
                icon={<FiTruck size={22} color="#10B981" />}
                accentColor="#10B981"
                themeColor="#10B981"
              />
            </AnimatedCard>
            <AnimatedCard delay={240}>
              <MetricCard
                label="PENDING ORDERS"
                value={data.performance?.breakdown?.find(s => s.name === 'On-Time')?.value?.toString() ?? '0'}
                icon={<FiClock size={22} color="#F59E0B" />}
                accentColor="#F59E0B"
                themeColor="#F59E0B"
              />
            </AnimatedCard>
            <AnimatedCard delay={320}>
              <MetricCard
                label="ALERTS / DELAYS"
                value={data.performance?.breakdown?.find(s => s.name === 'Delayed')?.value?.toString() ?? '0'}
                icon={<FiAlertTriangle size={22} color="#EF4444" />}
                accentColor="#EF4444"
                themeColor="#EF4444"
              />
            </AnimatedCard>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {data.revenue && (
              <AnimatedCard delay={400}>
                <RevenueSummary data={data.revenue} />
              </AnimatedCard>
            )}
            {data.fleet && (
              <AnimatedCard delay={480}>
                <FleetUtilizationChart data={data.fleet} />
              </AnimatedCard>
            )}
            {data.route && (
              <AnimatedCard delay={560}>
                <RouteEfficiencyChart data={data.route} />
              </AnimatedCard>
            )}
            {data.performance && (
              <AnimatedCard delay={640}>
                <DeliveryPerformance data={data.performance} />
              </AnimatedCard>
            )}
          </div>

          {/* Monthly Capacity */}
          {data.capacity && (
            <AnimatedCard delay={720}>
              <MonthlyCapacityWidget data={data.capacity} />
            </AnimatedCard>
          )}
        </>
      )}
    </div>
  );
};
