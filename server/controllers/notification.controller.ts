import { NextFunction, Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { sendSuccess } from '../utils/ApiResponse';
import { relativeTime } from '../utils/helpers';

const serializeNotification = (n: any): any => {
  const doc = n.toObject ? n.toObject() : n;
  return {
    ...doc,
    read: doc.isRead,
    time: relativeTime(doc.createdAt),
  };
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find({ recipient: req.user!._id }).sort({
      createdAt: -1,
    });
    return sendSuccess(res, { notifications: notifications.map(serializeNotification) });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, recipient: req.user!._id },
      { isRead: true },
    );
    return sendSuccess(res, {}, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany({ recipient: req.user!._id }, { isRead: true });
    return sendSuccess(res, {}, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

export const unreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user!._id,
      isRead: false,
    });
    return sendSuccess(res, { count });
  } catch (err) {
    next(err);
  }
};
