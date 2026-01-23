import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { KYC_ROUTES } from '../api.config';

// Get KYC information
export const useKyc = () => {
  return useQuery({
    queryKey: ['kyc'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(KYC_ROUTES.get);
        return response.data;
      } catch (error: any) {
        // If KYC doesn't exist yet (404 or 500), return null instead of throwing
        // This allows the form to work for new users
        if (error?.status === 404 || error?.status === 500) {
          console.log('ℹ️ KYC Query - No existing KYC data found, returning null');
          return { success: true, data: { kyc: null } };
        }
        throw error;
      }
    },
    retry: false, // Don't retry on error
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
