// Controller for: Notifications - get, markRead, markAllRead, unreadCount
// Module: Backend Controllers (Module 5) | Owner: Developer 1

import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import ApiError from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { parsePage, toPaginationMeta } from '../utils/helpers';

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const recipientId = (req as Request & { user: { _id: unknown } }).user._id;

    const total = await Notification.countDocuments({ recipient: recipientId });
    const notifications = await Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('relatedManifest', 'trackingId');

    res.json(ok({ items: notifications, ...toPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipientId = (req as Request & { user: { _id: unknown } }).user._id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: recipientId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }
    res.json(ok(notification, 'Notification marked as read.'));
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipientId = (req as Request & { user: { _id: unknown } }).user._id;
    const result = await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true }
    );
    res.json(ok({ modifiedCount: result.modifiedCount }, 'All notifications marked as read.'));
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipientId = (req as Request & { user: { _id: unknown } }).user._id;
    const count = await Notification.countDocuments({ recipient: recipientId, isRead: false });
    res.json(ok({ count }));
  } catch (err) {
    next(err);
  }
}

export default { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount };
