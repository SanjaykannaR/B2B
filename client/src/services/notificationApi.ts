// This file is for: Notification API service — get, markRead, markAllRead
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';
import { getErrorMessage } from './errorMessage';

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  link?: string;
  createdAt: string;
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const res = await api.get('/notifications');
    const body = res.data as { items?: NotificationItem[]; data?: NotificationItem[] } | NotificationItem[];
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.items)) return body.items;
    if (body && Array.isArray(body.data)) return body.data;
    return [];
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load notifications'));
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await api.get('/notifications/unread-count');
    const body = res.data as { count?: number };
    return typeof body?.count === 'number' ? body.count : 0;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load unread count'));
  }
};

export const markRead = async (id: string): Promise<void> => {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to mark notification as read'));
  }
};

export const markAllRead = async (): Promise<void> => {
  try {
    await api.patch('/notifications/read-all');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to mark all as read'));
  }
};
