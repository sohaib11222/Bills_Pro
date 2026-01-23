import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { AUTH_ROUTES } from '../api.config';

// Check PIN status
export const useCheckPinStatus = () => {
  return useQuery({
    queryKey: ['auth', 'pin-status'],
    queryFn: async () => {
      const response = await apiClient.get(AUTH_ROUTES.checkPinStatus);
      return response.data;
    },
  });
};
