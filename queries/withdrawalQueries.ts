import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { WITHDRAWAL_ROUTES } from '../api.config';

// Get bank accounts
export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['withdrawal', 'bank-accounts'],
    queryFn: async () => {
      const response = await apiClient.get(WITHDRAWAL_ROUTES.bankAccounts);
      return response.data;
    },
  });
};

// Get withdrawal fee
export const useWithdrawalFee = (amount?: number, currency?: string) => {
  return useQuery({
    queryKey: ['withdrawal', 'fee', amount, currency],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (amount) params.append('amount', amount.toString());
      if (currency) params.append('currency', currency);
      
      const response = await apiClient.get(
        `${WITHDRAWAL_ROUTES.fee}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
    enabled: !!amount && !!currency,
  });
};

// Get withdrawal transactions
export const useWithdrawalTransactions = () => {
  return useQuery({
    queryKey: ['withdrawal', 'transactions'],
    queryFn: async () => {
      const response = await apiClient.get(WITHDRAWAL_ROUTES.transactions);
      return response.data;
    },
  });
};

// Get withdrawal transaction details
export const useWithdrawalTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: ['withdrawal', 'transaction', transactionId],
    queryFn: async () => {
      const response = await apiClient.get(WITHDRAWAL_ROUTES.transaction(transactionId));
      return response.data;
    },
    enabled: !!transactionId,
  });
};
