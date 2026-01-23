import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { DASHBOARD_ROUTES } from '../api.config';

// Get dashboard data
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get(DASHBOARD_ROUTES.index);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};
