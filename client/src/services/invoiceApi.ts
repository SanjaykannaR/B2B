// Invoice API service — generate, list, pay, stats
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  manifest?: { trackingId: string; routing: { origin: { name: string }; destination: { name: string } } } | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceStats {
  totalAmount: number;
  totalCount: number;
  pending: { count: number; amount: number };
  paid: { count: number; amount: number };
  overdue: { count: number; amount: number };
  cancelled: { count: number; amount: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getMyInvoices(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<Invoice>> {
  const { data } = await api.get<Paginated<Invoice>>('/invoices/my', { params });
  return data;
}

export async function getInvoiceStats(): Promise<InvoiceStats> {
  const { data } = await api.get<InvoiceStats>('/invoices/stats');
  return data;
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  const { data } = await api.patch<Invoice>(`/invoices/${id}/pay`);
  return data;
}
