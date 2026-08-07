// This file is for: Notification Mongoose model — in-app notification alerts
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema: recipient, title, message, type (info|warning|success|error), isRead, relatedManifest
// Index: recipient+isRead

import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface NotificationDocument extends Document {
  recipient: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedManifest?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    message: { type: String, required: [true, 'Message is required'], trim: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info',
      required: true,
    },
    isRead: { type: Boolean, default: false },
    relatedManifest: { type: Schema.Types.ObjectId, ref: 'Manifest', default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = model<NotificationDocument>('Notification', notificationSchema);
export default Notification;
