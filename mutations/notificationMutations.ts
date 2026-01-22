import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { USER_ROUTES } from '../api.config';

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      try {
        const response = await apiClient.post(
          USER_ROUTES.markNotificationAsRead(notificationId)
        );
        return response.data;
      } catch (error: any) {
        console.log('❌ Mark Notification as Read Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await apiClient.post(
          USER_ROUTES.markAllNotificationsAsRead
        );
        return response.data;
      } catch (error: any) {
        console.log('❌ Mark All Notifications as Read Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
    },
  });
};
