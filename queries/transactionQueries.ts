import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { TRANSACTION_ROUTES } from '../api.config';

interface TransactionFilters {
  type?: 'deposit' | 'withdrawal' | 'bill_payment' | 'transfer';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  category?: string;
  currency?: string;
  limit?: number;
}

// Get all transactions with filters
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.currency) params.append('currency', filters.currency);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(
        `${TRANSACTION_ROUTES.index}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
  });
};

// Get all transactions (aggregated from all sources)
interface AllTransactionsFilters {
  wallet_type?: 'naira' | 'crypto' | 'virtual_card';
  type?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export const useAllTransactions = (filters?: AllTransactionsFilters) => {
  return useQuery({
    queryKey: ['transactions', 'all', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.wallet_type) params.append('wallet_type', filters.wallet_type);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(
        `${TRANSACTION_ROUTES.all}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

// Get bill payment transactions
interface BillPaymentFilters {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  category?: string;
  limit?: number;
}

export const useBillPaymentTransactions = (filters?: BillPaymentFilters) => {
  return useQuery({
    queryKey: ['transactions', 'bill-payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(
        `${TRANSACTION_ROUTES.billPayments}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
  });
};

// Get withdrawal transactions
export const useWithdrawalTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'withdrawals'],
    queryFn: async () => {
      const response = await apiClient.get(TRANSACTION_ROUTES.withdrawals);
      return response.data;
    },
  });
};

// Get deposit transactions
export const useDepositTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'deposits'],
    queryFn: async () => {
      const response = await apiClient.get(TRANSACTION_ROUTES.deposits);
      return response.data;
    },
  });
};

// Get fiat transactions
export const useFiatTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', 'fiat', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.currency) params.append('currency', filters.currency);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(
        `${TRANSACTION_ROUTES.fiat}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
  });
};

// Get transaction statistics
export const useTransactionStats = (period?: 'day' | 'week' | 'month') => {
  return useQuery({
    queryKey: ['transactions', 'stats', period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const response = await apiClient.get(
        `${TRANSACTION_ROUTES.stats}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
  });
};

// Get transaction details
export const useTransactionDetails = (transactionId: string) => {
  return useQuery({
    queryKey: ['transactions', 'details', transactionId],
    queryFn: async () => {
      const response = await apiClient.get(TRANSACTION_ROUTES.show(transactionId));
      return response.data;
    },
    enabled: !!transactionId,
  });
};
