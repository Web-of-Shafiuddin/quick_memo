import api from '@/lib/api';

export interface Notification {
  notification_id: number;
  user_id: number;
  type: 'SUBSCRIPTION_EXPIRING' | 'SUBSCRIPTION_EXPIRED' | 'SUBSCRIPTION_GRACE_PERIOD' | string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// Get all notifications
export const getNotifications = async (params?: {
  unread_only?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationsResponse> => {
  const response = await api.get('/notifications', { params });
  return response.data.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.data.unreadCount;
};

// Mark a notification as read
export const markAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data.data;
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/mark-all-read');
};

// Delete a notification
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

// Delete all read notifications
export const deleteReadNotifications = async (): Promise<void> => {
  await api.delete('/notifications/read');
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
};
