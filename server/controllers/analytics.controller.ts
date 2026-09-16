import { NextFunction, Request, Response } from 'express';
import { Vehicle } from '../models/Vehicle';
import { Manifest } from '../models/Manifest';
import { Invoice } from '../models/Invoice';
import { sendSuccess } from '../utils/ApiResponse';

export const fleetUtilization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [byStatus, totalCapacity, avgEfficiency, counts] = await Promise.all([
      Vehicle.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Vehicle.aggregate([{ $group: { _id: null, total: { $sum: '$maxWeightKg' } } }]),
      Vehicle.aggregate([
        { $group: { _id: null, avg: { $avg: '$fuelEfficiencyKmPerLiter' } } },
      ]),
      Vehicle.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
            inTransit: { $sum: { $cond: [{ $eq: ['$status', 'IN_TRANSIT'] }, 1, 0] } },
            maintenance: { $sum: { $cond: [{ $eq: ['$status', 'MAINTENANCE'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    return sendSuccess(res, {
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      total: counts[0]?.total ?? 0,
      available: counts[0]?.available ?? 0,
      inTransit: counts[0]?.inTransit ?? 0,
      maintenance: counts[0]?.maintenance ?? 0,
      totalCapacityKg: totalCapacity[0]?.total ?? 0,
      avgEfficiencyKmPerLiter: Math.round((avgEfficiency[0]?.avg ?? 0) * 10) / 10,
    });
  } catch (err) {
    next(err);
  }
};

export const routeEfficiency = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivered = await Manifest.aggregate([
      {
        $match: {
          currentStatus: 'DELIVERED',
          'routing.estimatedDurationMinutes': { $exists: true, $gt: 0 },
          actualDeliveryTime: { $exists: true },
        },
      },
      {
        $project: {
          trackingId: 1,
          estimatedMinutes: '$routing.estimatedDurationMinutes',
          actualMinutes: {
            $divide: [
              { $subtract: ['$actualDeliveryTime', '$tripStartTime'] },
              60000,
            ],
          },
        },
      },
    ]);

    const total = delivered.length;
    const late = delivered.filter((d) => d.actualMinutes > d.estimatedMinutes).length;

    const avg = (key: 'estimatedMinutes' | 'actualMinutes') =>
      total === 0
        ? 0
        : Math.round(
            (delivered.reduce((sum, d) => sum + (d[key] || 0), 0) / total) * 10,
          ) / 10;

    return sendSuccess(res, {
      total,
      onTime: total - late,
      late,
      onTimeRate: total === 0 ? 0 : Math.round(((total - late) / total) * 1000) / 10,
      avgEstimatedMinutes: avg('estimatedMinutes'),
      avgActualMinutes: avg('actualMinutes'),
      data: delivered.slice(0, 30),
    });
  } catch (err) {
    next(err);
  }
};

export const monthlyCapacity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await Manifest.aggregate([
      { $match: { currentStatus: 'DELIVERED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$actualDeliveryTime' } },
          totalWeightKg: { $sum: '$cargoDetails.totalWeightKg' },
          totalVolumeCubicMeters: { $sum: '$cargoDetails.totalVolumeCubicMeters' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    return sendSuccess(
      res,
      rows.map((r) => ({
        month: r._id,
        totalWeightKg: Math.round(r.totalWeightKg * 10) / 10,
        totalVolumeCubicMeters: Math.round(r.totalVolumeCubicMeters * 10) / 10,
        count: r.count,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const deliveryPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [delivered, delayed, total] = await Promise.all([
      Manifest.countDocuments({ currentStatus: 'DELIVERED' }),
      Manifest.countDocuments({ currentStatus: 'DELAYED' }),
      Manifest.countDocuments({ currentStatus: { $in: ['DELIVERED', 'DELAYED'] } }),
    ]);

    const deliveredRate = total === 0 ? 0 : Math.round((delivered / total) * 1000) / 10;
    const delayedRate = total === 0 ? 0 : Math.round((delayed / total) * 1000) / 10;

    return sendSuccess(res, {
      delivered,
      delayed,
      total,
      deliveredRate,
      delayedRate,
      data: [
        { name: 'On-time delivered', value: delivered },
        { name: 'Delayed', value: delayed },
      ],
    });
  } catch (err) {
    next(err);
  }
};

export const revenueSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await Invoice.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$issuedDate' } },
          revenue: { $sum: '$amount' },
          paid: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const totals = await Invoice.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0] } },
        },
      },
    ]);

    return sendSuccess(res, {
      monthly: rows.map((r) => ({
        month: r._id,
        revenue: Math.round(r.revenue * 100) / 100,
        paid: Math.round(r.paid * 100) / 100,
        pending: Math.round(r.pending * 100) / 100,
      })),
      totalRevenue: Math.round((totals[0]?.revenue ?? 0) * 100) / 100,
      totalPaid: Math.round((totals[0]?.paid ?? 0) * 100) / 100,
      totalPending: Math.round((totals[0]?.pending ?? 0) * 100) / 100,
      currency: 'INR',
    });
  } catch (err) {
    next(err);
  }
};
