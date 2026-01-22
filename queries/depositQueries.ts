import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { DEPOSIT_ROUTES } from '../api.config';

// Get deposit bank account
export const useDepositBankAccount = (currency?: string, countryCode?: string) => {
  return useQuery({
    queryKey: ['deposit', 'bank-account', currency, countryCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currency) params.append('currency', currency);
      if (countryCode) params.append('country_code', countryCode);
      
      const response = await apiClient.get(
        `${DEPOSIT_ROUTES.bankAccount}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
  });
};

// Get deposit history
export const useDepositHistory = () => {
  return useQuery({
    queryKey: ['deposit', 'history'],
    queryFn: async () => {
      const response = await apiClient.get(DEPOSIT_ROUTES.history);
      return response.data;
    },
  });
};

// Get deposit details
export const useDepositDetails = (reference: string) => {
  return useQuery({
    queryKey: ['deposit', 'details', reference],
    queryFn: async () => {
      const response = await apiClient.get(DEPOSIT_ROUTES.show(reference));
      return response.data;
    },
    enabled: !!reference,
  });
};
