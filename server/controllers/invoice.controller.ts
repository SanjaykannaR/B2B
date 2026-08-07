// Controller for: Invoice - generate, list, pay, stats
// Module: Backend Controllers (Module 5) | Owner: Developer 1
// Handles: amount calc (distance x contractRate), line items, payment marking

import { Request, Response, NextFunction } from 'express';
import Invoice, { InvoiceStatus } from '../models/Invoice';
import Manifest from '../models/Manifest';
import ApiError from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { generateInvoice } from '../services/invoiceGenerator';
import { parsePage, toPaginationMeta } from '../utils/helpers';

const VALID_STATUSES: InvoiceStatus[] = ['Pending', 'Paid', 'Overdue', 'Cancelled'];

export async function listInvoices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const filter: Record<string, unknown> = {};

    const status = req.query.status as string | undefined;
    if (status) {
      if (!VALID_STATUSES.includes(status as InvoiceStatus)) {
        throw new ApiError(400, `Invalid status filter. Allowed: ${VALID_STATUSES.join(', ')}`);
      }
      filter.status = status;
    }

    if (req.query.client) {
      filter.client = req.query.client;
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort({ issuedDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('client', 'firstName lastName email company')
      .populate('manifest', 'trackingId');

    res.json(ok({ items: invoices, ...toPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
}

export async function getMyInvoices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const clientId = (req as Request & { user: { _id: unknown } }).user._id;
    const filter: Record<string, unknown> = { client: clientId };

    const status = req.query.status as string | undefined;
    if (status) {
      filter.status = status;
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort({ issuedDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('manifest', 'trackingId routing');

    res.json(ok({ items: invoices, ...toPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email company phone')
      .populate('manifest', 'trackingId routing cargoDetails');
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found.');
    }
    res.json(ok(invoice));
  } catch (err) {
    next(err);
  }
}

export async function generateInvoiceForManifest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.manifestId).populate('client', 'contractRate');
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    if (manifest.currentStatus !== 'Delivered') {
      throw new ApiError(400, `Invoices can only be generated for Delivered manifests (current: ${manifest.currentStatus}).`);
    }

    const existing = await Invoice.findOne({ manifest: manifest._id });
    if (existing) {
      throw new ApiError(409, 'An invoice already exists for this manifest.');
    }

    const client = manifest.client as unknown as { _id: string; contractRate?: number };
    const invoice = await generateInvoice({
      manifestId: manifest._id.toString(),
      clientId: client._id.toString(),
      distanceKm: manifest.routing.distanceKm,
      weight: manifest.cargoDetails.weight,
      contractRate: client.contractRate ?? 0,
      description: manifest.cargoDetails.description,
    });

    res.status(201).json(ok(invoice, 'Invoice generated successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function markInvoicePaid(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found.');
    }
    if (invoice.status === 'Paid') {
      throw new ApiError(400, 'Invoice is already paid.');
    }
    if (invoice.status === 'Cancelled') {
      throw new ApiError(400, 'Cancelled invoices cannot be paid.');
    }

    invoice.status = 'Paid';
    invoice.paidDate = new Date();
    await invoice.save();

    res.json(ok(invoice, 'Invoice marked as paid.'));
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as Request & { user: { _id: unknown; role: string } }).user;
    const match: Record<string, unknown> = {};
    if (user.role === 'client') {
      match.client = user._id;
    }

    const [totals, byStatus] = await Promise.all([
      Invoice.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      ]),
    ]);

    const totalAmount = totals[0]?.total ?? 0;
    const totalCount = totals[0]?.count ?? 0;
    const statusBreakdown = byStatus.reduce<Record<string, { count: number; amount: number }>>((acc, s) => {
      acc[s._id] = { count: s.count, amount: s.amount };
      return acc;
    }, {});

    res.json(ok({
      totalAmount,
      totalCount,
      pending: statusBreakdown.Pending ?? { count: 0, amount: 0 },
      paid: statusBreakdown.Paid ?? { count: 0, amount: 0 },
      overdue: statusBreakdown.Overdue ?? { count: 0, amount: 0 },
      cancelled: statusBreakdown.Cancelled ?? { count: 0, amount: 0 },
    }));
  } catch (err) {
    next(err);
  }
}

export default {
  listInvoices,
  getMyInvoices,
  getInvoice,
  generateInvoiceForManifest,
  markInvoicePaid,
  getInvoiceStats,
};
