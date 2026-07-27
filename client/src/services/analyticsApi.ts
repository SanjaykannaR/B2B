// This file is for: Analytics API service — all executive endpoints
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Retrieves fleet utilization statistics (e.g. active vs idle ratio).
 * @returns Promise with fleet utilization data points
 */
export const getFleetUtilization = async () => {
  // Call GET /analytics/fleet-utilization to fetch active vehicles analytics
  const response = await api.get('/analytics/fleet-utilization');
  return response.data;
};

/**
 * Retrieves route efficiency statistics (e.g. distance/duration optimization).
 * @returns Promise with route efficiency data points
 */
export const getRouteEfficiency = async () => {
  // Call GET /analytics/route-efficiency to analyze transit paths
  const response = await api.get('/analytics/route-efficiency');
  return response.data;
};

/**
 * Retrieves monthly load capacity statistics (e.g. total volume/weight capacity used).
 * @returns Promise with monthly load capacity data points
 */
export const getMonthlyCapacity = async () => {
  // Call GET /analytics/monthly-capacity to audit load parameters
  const response = await api.get('/analytics/monthly-capacity');
  return response.data;
};

/**
 * Retrieves delivery performance metrics (e.g. SLA success rate, late delivery count).
 * @returns Promise with delivery performance charts data
 */
export const getDeliveryPerformance = async () => {
  // Call GET /analytics/delivery-performance to retrieve fulfillment ratios
  const response = await api.get('/analytics/delivery-performance');
  return response.data;
};

/**
 * Retrieves monthly revenue details (e.g. gross billed amounts, unpaid invoices total).
 * @returns Promise with revenue summaries
 */
export const getRevenueSummary = async () => {
  // Call GET /analytics/revenue-summary to inspect business cashflows
  const response = await api.get('/analytics/revenue-summary');
  return response.data;
};
