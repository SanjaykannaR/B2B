import { NextFunction, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { sendError, sendSuccess } from '../utils/ApiResponse';
import { paginate, toObjectId, userDisplay } from '../utils/helpers';
import { generateInvoiceForManifest } from '../services/invoiceGenerator';
import { notify } from '../services/notificationService';

const serializeInvoice = (i: any): any => {
  const doc = i.toObject ? i.toObject() : i;
  const { client, manifest, ...rest } = doc;
  return {
    ...rest,
    client: client ? userDisplay(client) : client,
    manifest: manifest
      ? { _id: manifest._id, trackingId: manifest.trackingId, status: manifest.currentStatus }
      : manifest,
  };
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter: Record<string, unknown> = {};

    if (req.query.status) filter.status = String(req.query.status).toUpperCase();
    if (req.query.client) {
      const cid = toObjectId(String(req.query.client));
      if (cid) filter.client = cid;
    }
    const search = String(req.query.search || '').trim();
    if (search) filter.invoiceNumber = new RegExp(search, 'i');

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('client', 'firstName lastName email phone company')
        .populate('manifest', 'trackingId currentStatus')
        .sort({ issuedDate: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      invoices: invoices.map(serializeInvoice),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await Invoice.find({ client: req.user!._id })
      .populate('client', 'firstName lastName email phone company')
      .populate('manifest', 'trackingId currentStatus')
      .sort({ issuedDate: -1 });
    return sendSuccess(res, { invoices: invoices.map(serializeInvoice) });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const invoice = id
      ? await Invoice.findById(id)
          .populate('client', 'firstName lastName email phone company')
          .populate('manifest', 'trackingId currentStatus')
      : null;
    if (!invoice) return sendError(res, 404, 'Invoice not found');

    const user = req.user!;
    if (user.role === 'client' && invoice.client.toString() !== user._id.toString()) {
      return sendError(res, 403, 'Forbidden. This invoice does not belong to you.');
    }

    return sendSuccess(res, { invoice: serializeInvoice(invoice) });
  } catch (err) {
    next(err);
  }
};

export const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await generateInvoiceForManifest(req.params.manifestId);
    if (!invoice) return sendError(res, 404, 'Manifest not found');

    const full = await Invoice.findById(invoice._id)
      .populate('client', 'firstName lastName email phone company')
      .populate('manifest', 'trackingId currentStatus');

    await notify({
      recipient: full!.client,
      title: `Invoice generated: ${invoice.invoiceNumber}`,
      message: `Invoice ${invoice.invoiceNumber} for ${invoice.amount} ${invoice.currency} is now pending.`,
      type: 'info',
      relatedManifest: invoice.manifest,
    });

    return sendSuccess(res, { invoice: serializeInvoice(full) }, 'Invoice generated', 201);
  } catch (err) {
    next(err);
  }
};

export const markPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const invoice = id ? await Invoice.findById(id) : null;
    if (!invoice) return sendError(res, 404, 'Invoice not found');

    invoice.status = 'PAID';
    invoice.paidDate = new Date();
    await invoice.save();

    const full = await Invoice.findById(invoice._id)
      .populate('client', 'firstName lastName email phone company')
      .populate('manifest', 'trackingId currentStatus');
    return sendSuccess(res, { invoice: serializeInvoice(full) }, 'Invoice marked as paid');
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [billed, paid, pending, overdue, total] = await Promise.all([
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Invoice.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Invoice.aggregate([
        { $match: { status: 'PENDING' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Invoice.aggregate([
        { $match: { status: 'OVERDUE' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Invoice.countDocuments({}),
    ]);

    return sendSuccess(res, {
      billed: billed[0]?.total ?? 0,
      paid: paid[0]?.total ?? 0,
      pending: pending[0]?.total ?? 0,
      overdue: overdue[0]?.total ?? 0,
      total,
      currency: 'INR',
    });
  } catch (err) {
    next(err);
  }
};
