import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { WITHDRAWAL_ROUTES } from '../api.config';

// Add bank account
export const useAddBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      bank_name: string;
      account_number: string;
      account_name: string;
      currency?: string;
      country_code?: string;
    }) => {
      const response = await apiClient.post(WITHDRAWAL_ROUTES.addBankAccount, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal', 'bank-accounts'] });
    },
  });
};

// Update bank account
export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        bank_name?: string;
        account_number?: string;
        account_name?: string;
      };
    }) => {
      const response = await apiClient.put(WITHDRAWAL_ROUTES.updateBankAccount(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal', 'bank-accounts'] });
    },
  });
};

// Set default bank account
export const useSetDefaultBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(WITHDRAWAL_ROUTES.setDefaultBankAccount(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal', 'bank-accounts'] });
    },
  });
};

// Delete bank account
export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(WITHDRAWAL_ROUTES.deleteBankAccount(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal', 'bank-accounts'] });
    },
  });
};

// Withdraw funds
export const useWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      bank_account_id: number;
      currency?: string;
      pin: string;
    }) => {
      const response = await apiClient.post(WITHDRAWAL_ROUTES.withdraw, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
