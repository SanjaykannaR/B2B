// This file is for: Notification API service — get, markRead, markAllRead
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Retrieves a list of in-app notifications for the logged-in user.
 * @returns Promise with list of notifications
 */
export const getNotifications = async () => {
  // Call GET /notifications to fetch all alerts and status changes
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Marks a specific notification as read.
 * @param id - The ID of the notification to update
 * @returns Promise with status patch verification
 */
export const markRead = async (id: string) => {
  // Call PATCH /notifications/:id/read to mark notification read
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Marks all notifications for the current user as read.
 * @returns Promise with bulk update verification
 */
export const markAllRead = async () => {
  // Call PATCH /notifications/read-all to clear all notification counts
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

/**
 * Retrieves the count of unread notifications for the user.
 * @returns Promise with unread notifications count
 */
export const getUnreadCount = async () => {
  // Call GET /notifications/unread-count to show badge count in Topbar
  const response = await api.get('/notifications/unread-count');
  return response.data;
};
