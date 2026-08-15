// Analytics API service — executive aggregation endpoints
// Module: Frontend API Services (Module 10) | Owner: Developer 2

import api from './api';

export interface FleetUtilization {
  total: number;
  available: number;
  inTransit: number;
  maintenance: number;
  availablePct: number;
  inTransitPct: number;
  maintenancePct: number;
}

export interface RouteEfficiencyRow {
  trackingId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  status: string;
  onTime: boolean;
}

export interface RouteEfficiency {
  total: number;
  onTime: number;
  late: number;
  onTimePct: number;
  averageDistanceKm: number;
  rows: RouteEfficiencyRow[];
}

export interface MonthlyCapacityEntry {
  month: string;
  totalWeightKg: number;
  totalVolumeM3: number;
  shipmentCount: number;
}

export interface MonthlyCapacity {
  months: MonthlyCapacityEntry[];
}

export interface DeliveryPerformance {
  total: number;
  onTime: number;
  delayed: number;
  cancelled: number;
  onTimePct: number;
  delayedPct: number;
  cancelledPct: number;
}

export interface RevenueMonth {
  month: string;
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

export interface RevenueSummary {
  months: RevenueMonth[];
  summary: { paid: number; pending: number; overdue: number; total: number };
}

export async function getFleetUtilization(): Promise<FleetUtilization> {
  const { data } = await api.get<FleetUtilization>('/analytics/fleet-utilization');
  return data;
}

export async function getRouteEfficiency(): Promise<RouteEfficiency> {
  const { data } = await api.get<RouteEfficiency>('/analytics/route-efficiency');
  return data;
}

export async function getMonthlyCapacity(): Promise<MonthlyCapacity> {
  const { data } = await api.get<MonthlyCapacity>('/analytics/monthly-capacity');
  return data;
}

export async function getDeliveryPerformance(): Promise<DeliveryPerformance> {
  const { data } = await api.get<DeliveryPerformance>('/analytics/delivery-performance');
  return data;
}

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const { data } = await api.get<RevenueSummary>('/analytics/revenue-summary');
  return data;
}
