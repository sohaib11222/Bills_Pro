import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { USER_ROUTES } from '../api.config';

// Get authenticated user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(USER_ROUTES.profile);
        return response.data;
      } catch (error: any) {
        console.log('❌ User Profile Query Error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
