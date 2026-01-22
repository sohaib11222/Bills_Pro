import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { CRYPTO_ROUTES } from '../api.config';

// Get USDT blockchains
export const useUsdtBlockchains = () => {
  return useQuery({
    queryKey: ['crypto', 'usdt', 'blockchains'],
    queryFn: async () => {
      const response = await apiClient.get(CRYPTO_ROUTES.usdtBlockchains);
      return response.data;
    },
  });
};

// Get virtual accounts (grouped)
export const useCryptoAccounts = () => {
  return useQuery({
    queryKey: ['crypto', 'accounts'],
    queryFn: async () => {
      const response = await apiClient.get(CRYPTO_ROUTES.accounts);
      return response.data;
    },
  });
};

// Get account details
export const useCryptoAccountDetails = (currency: string, blockchain?: string) => {
  return useQuery({
    queryKey: ['crypto', 'account', currency, blockchain],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (blockchain) params.append('blockchain', blockchain);
      
      const response = await apiClient.get(
        `${CRYPTO_ROUTES.accountDetails(currency)}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
    enabled: !!currency,
  });
};

// Get deposit address
export const useCryptoDepositAddress = (currency: string, blockchain: string) => {
  return useQuery({
    queryKey: ['crypto', 'deposit-address', currency, blockchain],
    queryFn: async () => {
      const response = await apiClient.get(
        `${CRYPTO_ROUTES.depositAddress}?currency=${currency}&blockchain=${blockchain}`
      );
      return response.data;
    },
    enabled: !!currency && !!blockchain,
  });
};

// Get exchange rate
export const useCryptoExchangeRate = (from: string, to: string, amount: number = 1) => {
  return useQuery({
    queryKey: ['crypto', 'exchange-rate', from, to, amount],
    queryFn: async () => {
      const response = await apiClient.get(
        `${CRYPTO_ROUTES.exchangeRate}?from_currency=${from}&to_currency=${to}&amount=${amount}`
      );
      return response.data;
    },
    enabled: !!from && !!to && amount > 0,
    staleTime: 60000, // 1 minute
  });
};
