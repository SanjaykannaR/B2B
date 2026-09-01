export interface FleetStatusSlice {
  name: string;
  value: number;
  color: string;
}

export interface FleetUtilizationData {
  utilizationRate: number;
  utilizationDelta: number;
  statusDistribution: FleetStatusSlice[];
}

export interface RouteEfficiencyRow {
  corridor: string;
  onTime: number;
  delayed: number;
}

export interface RouteEfficiencyData {
  corridors: RouteEfficiencyRow[];
}

export interface MonthlyRow {
  month: string;
  shipments: number;
  revenue: number;
  capacityUtilized: number;
}

export interface MonthlyCapacityData {
  monthly: MonthlyRow[];
}

export interface DeliveryBreakdownSlice {
  name: string;
  value: number;
  color: string;
}

export interface DeliveryPerformanceData {
  onTimeRate: number;
  onTimeDelta: number;
  breakdown: DeliveryBreakdownSlice[];
}

export interface RevenueSummaryData {
  totalRevenue: number;
  revenueDelta: number;
  shipmentsDelta: number;
  monthly: MonthlyRow[];
}

const MOCK_FLEET_UTILIZATION: FleetUtilizationData = {
  utilizationRate: 78.4,
  utilizationDelta: 5.2,
  statusDistribution: [
    { name: 'Available', value: 14, color: '#10B981' },
    { name: 'In-Transit', value: 26, color: '#8B5CF6' },
    { name: 'Maintenance', value: 6, color: '#F59E0B' },
  ],
};

const MOCK_ROUTE_EFFICIENCY: RouteEfficiencyData = {
  corridors: [
    { corridor: 'New York → Boston', onTime: 86, delayed: 14 },
    { corridor: 'Philly → Baltimore', onTime: 92, delayed: 8 },
    { corridor: 'Newark → Hartford', onTime: 78, delayed: 22 },
    { corridor: 'DC → Richmond', onTime: 95, delayed: 5 },
    { corridor: 'Norfolk → Roanoke', onTime: 71, delayed: 29 },
  ],
};

const MOCK_MONTHLY_CAPACITY: MonthlyCapacityData = {
  monthly: [
    { month: 'Jan', shipments: 142, revenue: 840000, capacityUtilized: 64 },
    { month: 'Feb', shipments: 158, revenue: 912000, capacityUtilized: 68 },
    { month: 'Mar', shipments: 171, revenue: 1010000, capacityUtilized: 71 },
    { month: 'Apr', shipments: 165, revenue: 985000, capacityUtilized: 69 },
    { month: 'May', shipments: 189, revenue: 1124000, capacityUtilized: 74 },
    { month: 'Jun', shipments: 204, revenue: 1267000, capacityUtilized: 78 },
    { month: 'Jul', shipments: 221, revenue: 1398000, capacityUtilized: 82 },
  ],
};

const MOCK_DELIVERY_PERFORMANCE: DeliveryPerformanceData = {
  onTimeRate: 91.4,
  onTimeDelta: 2.8,
  breakdown: [
    { name: 'On-Time', value: 192, color: '#10B981' },
    { name: 'Delayed', value: 14, color: '#EF4444' },
    { name: 'Cancelled', value: 4, color: '#6B7280' },
  ],
};

const MOCK_REVENUE_SUMMARY: RevenueSummaryData = {
  totalRevenue: 7539000,
  revenueDelta: 12.4,
  shipmentsDelta: 8.7,
  monthly: MOCK_MONTHLY_CAPACITY.monthly,
};

const MOCK_DELAY_MS = 400;

function mockResolve<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY_MS));
}

function makeFallbackCall<T>(endpoint: string, mock: T, timeoutMs = 2500): Promise<T> {
  return new Promise<T>((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    fetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        clearTimeout(timer);
        resolve((json?.data ?? json) as T);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(mock);
      });
  });
}

export function getFleetUtilization(): Promise<FleetUtilizationData> {
  return makeFallbackCall<FleetUtilizationData>('/api/analytics/fleet-utilization', MOCK_FLEET_UTILIZATION).catch(() => mockResolve(MOCK_FLEET_UTILIZATION));
}

export function getRouteEfficiency(): Promise<RouteEfficiencyData> {
  return makeFallbackCall<RouteEfficiencyData>('/api/analytics/route-efficiency', MOCK_ROUTE_EFFICIENCY).catch(() => mockResolve(MOCK_ROUTE_EFFICIENCY));
}

export function getMonthlyCapacity(): Promise<MonthlyCapacityData> {
  return makeFallbackCall<MonthlyCapacityData>('/api/analytics/monthly-capacity', MOCK_MONTHLY_CAPACITY).catch(() => mockResolve(MOCK_MONTHLY_CAPACITY));
}

export function getDeliveryPerformance(): Promise<DeliveryPerformanceData> {
  return makeFallbackCall<DeliveryPerformanceData>('/api/analytics/delivery-performance', MOCK_DELIVERY_PERFORMANCE).catch(() => mockResolve(MOCK_DELIVERY_PERFORMANCE));
}

export function getRevenueSummary(): Promise<RevenueSummaryData> {
  return makeFallbackCall<RevenueSummaryData>('/api/analytics/revenue-summary', MOCK_REVENUE_SUMMARY).catch(() => mockResolve(MOCK_REVENUE_SUMMARY));
}

export { MOCK_MONTHLY_CAPACITY };
