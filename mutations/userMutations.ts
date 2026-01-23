import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { USER_ROUTES } from '../api.config';

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code?: string;
}

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      try {
        const response = await apiClient.put(USER_ROUTES.updateProfile, data);
        return response.data;
      } catch (error: any) {
        console.log('❌ Update Profile Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate user profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
