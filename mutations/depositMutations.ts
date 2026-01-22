import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { DEPOSIT_ROUTES } from '../api.config';

// Initiate deposit
export const useInitiateDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      currency?: string;
      payment_method?: string;
    }) => {
      const response = await apiClient.post(DEPOSIT_ROUTES.initiate, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposit'] });
    },
  });
};

// Confirm deposit
export const useConfirmDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { reference: string }) => {
      const response = await apiClient.post(DEPOSIT_ROUTES.confirm, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposit'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
