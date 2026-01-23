import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { VIRTUAL_CARD_ROUTES } from '../api.config';

// Get user's virtual cards
export const useVirtualCards = () => {
  return useQuery({
    queryKey: ['virtual-cards'],
    queryFn: async () => {
      const response = await apiClient.get(VIRTUAL_CARD_ROUTES.index);
      return response.data;
    },
  });
};

// Get card details
export const useVirtualCardDetails = (id: number) => {
  return useQuery({
    queryKey: ['virtual-cards', 'details', id],
    queryFn: async () => {
      const response = await apiClient.get(VIRTUAL_CARD_ROUTES.show(id));
      return response.data;
    },
    enabled: !!id,
  });
};

// Get card transactions
export const useVirtualCardTransactions = (id: number) => {
  return useQuery({
    queryKey: ['virtual-cards', 'transactions', id],
    queryFn: async () => {
      const response = await apiClient.get(VIRTUAL_CARD_ROUTES.transactions(id));
      return response.data;
    },
    enabled: !!id,
  });
};

// Get billing address
export const useVirtualCardBillingAddress = (id: number) => {
  return useQuery({
    queryKey: ['virtual-cards', 'billing-address', id],
    queryFn: async () => {
      const response = await apiClient.get(VIRTUAL_CARD_ROUTES.billingAddress(id));
      return response.data;
    },
    enabled: !!id,
  });
};

// Get card limits
export const useVirtualCardLimits = (id: number) => {
  return useQuery({
    queryKey: ['virtual-cards', 'limits', id],
    queryFn: async () => {
      const response = await apiClient.get(VIRTUAL_CARD_ROUTES.limits(id));
      return response.data;
    },
    enabled: !!id,
  });
};
