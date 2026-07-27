// This file is for: Invoice API service — generate, list, pay, stats
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Retrieves all invoices in the system (admin/executive view).
 * @returns Promise with list of invoices
 */
export const getInvoices = async () => {
  // Call GET /invoices to fetch all billing statements
  const response = await api.get('/invoices');
  return response.data;
};

/**
 * Retrieves invoices belonging to the currently logged-in client.
 * @returns Promise with list of client-specific invoices
 */
export const getMyInvoices = async () => {
  // Call GET /invoices/my to fetch the logged-in client's billing statements
  const response = await api.get('/invoices/my');
  return response.data;
};

/**
 * Retrieves detailed information for a single invoice.
 * @param id - The ID of the invoice to retrieve
 * @returns Promise with detailed invoice object
 */
export const getInvoice = async (id: string) => {
  // Call GET /invoices/:id to retrieve full billing invoice details
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

/**
 * Generates a new invoice based on a completed manifest.
 * @param manifestId - The ID of the delivered manifest
 * @returns Promise with the newly generated invoice
 */
export const generateInvoice = async (manifestId: string) => {
  // Call POST /invoices/generate/:manifestId to invoice completed shipment
  const response = await api.post(`/invoices/generate/${manifestId}`);
  return response.data;
};

/**
 * Marks a pending/overdue invoice as paid.
 * @param id - The ID of the invoice
 * @returns Promise with transaction verification
 */
export const markPaid = async (id: string) => {
  // Call PATCH /invoices/:id/pay to register payment in database
  const response = await api.patch(`/invoices/${id}/pay`);
  return response.data;
};

/**
 * Retrieves summaries and statistics of billing (totals, paid, overdue).
 * @returns Promise with invoice KPI analytics
 */
export const getInvoiceStats = async () => {
  // Call GET /invoices/stats to fetch dashboard totals
  const response = await api.get('/invoices/stats');
  return response.data;
};
