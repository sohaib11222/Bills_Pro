import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { WALLET_ROUTES } from '../api.config';

// Get wallet balance
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const response = await apiClient.get(WALLET_ROUTES.balance);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

// Get fiat wallets
export const useFiatWallets = () => {
  return useQuery({
    queryKey: ['wallet', 'fiat'],
    queryFn: async () => {
      const response = await apiClient.get(WALLET_ROUTES.fiat);
      return response.data;
    },
    staleTime: 30000,
  });
};

// Get crypto wallets
export const useCryptoWallets = () => {
  return useQuery({
    queryKey: ['wallet', 'crypto'],
    queryFn: async () => {
      const response = await apiClient.get(WALLET_ROUTES.crypto);
      return response.data;
    },
    staleTime: 30000,
  });
};
