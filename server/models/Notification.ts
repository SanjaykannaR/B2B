import { Schema, model, Model, Types } from 'mongoose';

export const NOTIFICATION_TYPES = ['info', 'warning', 'success', 'error'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification {
  recipient: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedManifest?: Types.ObjectId;
}

export interface NotificationModel extends Model<INotification> {}

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'info' },
    isRead: { type: Boolean, default: false },
    relatedManifest: { type: Schema.Types.ObjectId, ref: 'Manifest' },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema,
);
