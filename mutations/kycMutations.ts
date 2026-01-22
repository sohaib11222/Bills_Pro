import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { KYC_ROUTES } from '../api.config';

// Submit/Update KYC
export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      date_of_birth?: string;
      bvn_number?: string;
      nin_number?: string;
    }) => {
      console.log('🔵 KYC Mutation - Request URL:', KYC_ROUTES.submit);
      console.log('🔵 KYC Mutation - Request Data:', JSON.stringify(data, null, 2));
      
      try {
        const response = await apiClient.post(KYC_ROUTES.submit, data);
        console.log('🟢 KYC Mutation - Response Status:', response.status);
        console.log('🟢 KYC Mutation - Response Data:', JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error: any) {
        console.log('❌ KYC Mutation - Error in mutationFn:');
        console.log('Error:', error);
        console.log('Error Response:', error?.response);
        console.log('Error Data:', error?.response?.data);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ KYC Mutation - onSuccess:', JSON.stringify(data, null, 2));
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
    },
    onError: (error: any) => {
      console.log('❌ KYC Mutation - onError:');
      console.log('Error:', error);
      console.log('Error Response:', error?.response);
      console.log('Error Data:', error?.response?.data);
    },
  });
};
