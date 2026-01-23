import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { VIRTUAL_CARD_ROUTES } from '../api.config';

// Create virtual card
export const useCreateVirtualCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      card_name: string;
      card_color?: 'green' | 'brown' | 'purple';
      payment_wallet_type: 'naira_wallet' | 'crypto_wallet';
      payment_wallet_currency?: string;
      billing_address_street?: string;
      billing_address_city?: string;
      billing_address_state?: string;
      billing_address_country?: string;
      billing_address_postal_code?: string;
    }) => {
      console.log('🔵 Create Virtual Card Mutation - Request Data:', JSON.stringify(data, null, 2));
      const response = await apiClient.post(VIRTUAL_CARD_ROUTES.create, data);
      console.log('🟢 Create Virtual Card Mutation - Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ Create Virtual Card Mutation - Success');
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      console.log('❌ Create Virtual Card Mutation - Error:', JSON.stringify(error, null, 2));
    },
  });
};

// Fund card
export const useFundVirtualCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        amount: number;
        payment_wallet_type: 'naira_wallet' | 'crypto_wallet';
        payment_wallet_currency?: string;
        pin: string;
      };
    }) => {
      const response = await apiClient.post(VIRTUAL_CARD_ROUTES.fund(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Withdraw from card
export const useWithdrawVirtualCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        amount: number;
        payment_wallet_type: 'naira_wallet' | 'crypto_wallet';
        payment_wallet_currency?: string;
        pin?: string;
      };
    }) => {
      const response = await apiClient.post(VIRTUAL_CARD_ROUTES.withdraw(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Update billing address
export const useUpdateVirtualCardBillingAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
      };
    }) => {
      const response = await apiClient.put(VIRTUAL_CARD_ROUTES.updateBillingAddress(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards', 'billing-address', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['virtual-cards', 'details', variables.id] });
    },
  });
};

// Update card limits
export const useUpdateVirtualCardLimits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        daily_limit?: number;
        monthly_limit?: number;
      };
    }) => {
      const response = await apiClient.put(VIRTUAL_CARD_ROUTES.updateLimits(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards', 'limits', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['virtual-cards', 'details', variables.id] });
    },
  });
};

// Freeze card
export const useFreezeVirtualCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(VIRTUAL_CARD_ROUTES.freeze(id));
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
    },
  });
};

// Unfreeze card
export const useUnfreezeVirtualCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(VIRTUAL_CARD_ROUTES.unfreeze(id));
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards', 'details', id] });
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
    },
  });
};
