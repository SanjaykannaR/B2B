// Controller for: Analytics - MongoDB aggregation pipelines
// Module: Backend Controllers (Module 5) | Owner: Developer 1
// Handles: fleet utilization, route efficiency, monthly capacity, delivery performance, revenue

import { Request, Response, NextFunction } from 'express';
import Manifest from '../models/Manifest';
import Vehicle from '../models/Vehicle';
import Invoice from '../models/Invoice';
import { ok } from '../utils/ApiResponse';

export async function getFleetUtilization(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [byStatus, total] = await Promise.all([
      Vehicle.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Vehicle.countDocuments(),
    ]);

    const breakdown = byStatus.reduce<Record<string, number>>((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    const available = breakdown.Available ?? 0;
    const inTransit = breakdown['In-Transit'] ?? 0;
    const maintenance = breakdown.Maintenance ?? 0;

    res.json(ok({
      total,
      available,
      inTransit,
      maintenance,
      availablePct: total ? Math.round((available / total) * 1000) / 10 : 0,
      inTransitPct: total ? Math.round((inTransit / total) * 1000) / 10 : 0,
      maintenancePct: total ? Math.round((maintenance / total) * 1000) / 10 : 0,
    }));
  } catch (err) {
    next(err);
  }
}

export async function getRouteEfficiency(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifests = await Manifest.find({
      currentStatus: { $in: ['Delivered', 'Delayed'] },
      actualDeliveryTime: { $ne: null },
    }).select('trackingId routing currentStatus scheduledDeliveryWindowClose actualDeliveryTime');

    let onTime = 0;
    let late = 0;

    const rows = manifests.map((m) => {
      const isOnTime = m.actualDeliveryTime! <= m.scheduledDeliveryWindowClose;
      if (isOnTime) onTime += 1;
      else late += 1;
      return {
        trackingId: m.trackingId,
        origin: m.routing.origin.name,
        destination: m.routing.destination.name,
        distanceKm: m.routing.distanceKm,
        estimatedDurationMinutes: m.routing.estimatedDurationMinutes,
        status: m.currentStatus,
        onTime: isOnTime,
      };
    });

    const total = rows.length;
    res.json(ok({
      total,
      onTime,
      late,
      onTimePct: total ? Math.round((onTime / total) * 1000) / 10 : 0,
      averageDistanceKm: total
        ? Math.round((rows.reduce((sum, r) => sum + r.distanceKm, 0) / total) * 10) / 10
        : 0,
      rows,
    }));
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyCapacity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const results = await Manifest.aggregate([
      {
        $match: {
          currentStatus: { $in: ['Delivered', 'In-Transit', 'Assigned'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalWeightKg: { $sum: '$cargoDetails.weight' },
          totalVolumeM3: { $sum: '$cargoDetails.volume' },
          shipmentCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = results.map((r) => ({
      month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
      totalWeightKg: r.totalWeightKg,
      totalVolumeM3: r.totalVolumeM3,
      shipmentCount: r.shipmentCount,
    }));

    res.json(ok({ months }));
  } catch (err) {
    next(err);
  }
}

export async function getDeliveryPerformance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifests = await Manifest.find({
      currentStatus: { $in: ['Delivered', 'Delayed', 'Cancelled'] },
    }).select('currentStatus actualDeliveryTime scheduledDeliveryWindowClose');

    let onTime = 0;
    let delayed = 0;
    let cancelled = 0;

    for (const m of manifests) {
      if (m.currentStatus === 'Cancelled') {
        cancelled += 1;
      } else if (m.currentStatus === 'Delayed' || (m.actualDeliveryTime && m.actualDeliveryTime > m.scheduledDeliveryWindowClose)) {
        delayed += 1;
      } else {
        onTime += 1;
      }
    }

    const total = manifests.length;
    res.json(ok({
      total,
      onTime,
      delayed,
      cancelled,
      onTimePct: total ? Math.round((onTime / total) * 1000) / 10 : 0,
      delayedPct: total ? Math.round((delayed / total) * 1000) / 10 : 0,
      cancelledPct: total ? Math.round((cancelled / total) * 1000) / 10 : 0,
    }));
  } catch (err) {
    next(err);
  }
}

export async function getRevenueSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const results = await Invoice.aggregate([
      { $match: { status: { $in: ['Paid', 'Pending', 'Overdue'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$issuedDate' },
            month: { $month: '$issuedDate' },
            status: '$status',
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const byMonth = new Map<string, { month: string; total: number; paid: number; pending: number; overdue: number }>();
    for (const r of results) {
      const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
      if (!byMonth.has(key)) {
        byMonth.set(key, { month: key, total: 0, paid: 0, pending: 0, overdue: 0 });
      }
      const entry = byMonth.get(key)!;
      entry.total += r.amount;
      if (r._id.status === 'Paid') entry.paid += r.amount;
      if (r._id.status === 'Pending') entry.pending += r.amount;
      if (r._id.status === 'Overdue') entry.overdue += r.amount;
    }

    const months = Array.from(byMonth.values());

    const totals = await Invoice.aggregate([
      { $match: { status: { $in: ['Paid', 'Pending', 'Overdue'] } } },
      { $group: { _id: '$status', amount: { $sum: '$amount' } } },
    ]);

    const summary = totals.reduce<Record<string, number>>((acc, t) => {
      acc[t._id] = t.amount;
      return acc;
    }, {});

    res.json(ok({
      months,
      summary: {
        paid: summary.Paid ?? 0,
        pending: summary.Pending ?? 0,
        overdue: summary.Overdue ?? 0,
        total: (summary.Paid ?? 0) + (summary.Pending ?? 0) + (summary.Overdue ?? 0),
      },
    }));
  } catch (err) {
    next(err);
  }
}

export default {
  getFleetUtilization,
  getRouteEfficiency,
  getMonthlyCapacity,
  getDeliveryPerformance,
  getRevenueSummary,
};
