import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { USER_ROUTES } from '../api.config';

interface GetNotificationsParams {
  page?: number;
  per_page?: number;
  read?: boolean;
  type?: string;
}

// Get user notifications
export const useNotifications = (params?: GetNotificationsParams) => {
  return useQuery({
    queryKey: ['user', 'notifications', params],
    queryFn: async () => {
      try {
        const response = await apiClient.get(USER_ROUTES.notifications, {
          params,
        });
        return response.data;
      } catch (error: any) {
        console.log('❌ Notifications Query Error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get unread notifications count
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['user', 'notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(USER_ROUTES.notifications, {
          params: { read: false, per_page: 1 },
        });
        return response.data?.data?.unread_count || 0;
      } catch (error: any) {
        console.log('❌ Unread Count Query Error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};
