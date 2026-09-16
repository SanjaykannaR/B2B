import { Types } from 'mongoose';
import { Notification } from '../models/Notification';

export interface NotifyInput {
  recipient: Types.ObjectId | string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  relatedManifest?: Types.ObjectId | string | null;
}

/** Create a single in-app notification (fire-and-forget). */
export const notify = async ({
  recipient,
  title,
  message,
  type = 'info',
  relatedManifest,
}: NotifyInput): Promise<void> => {
  if (!recipient) return;
  await Notification.create({
    recipient,
    title,
    message,
    type,
    relatedManifest: relatedManifest || undefined,
  });
};
