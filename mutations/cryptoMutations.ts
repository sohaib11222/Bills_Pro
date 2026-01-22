import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { CRYPTO_ROUTES } from '../api.config';

// Preview buy crypto
export const usePreviewBuyCrypto = () => {
  return useMutation({
    mutationFn: async (data: {
      currency: string;
      blockchain: string;
      amount: number;
      payment_method?: 'naira' | 'crypto_wallet';
    }) => {
      const response = await apiClient.post(CRYPTO_ROUTES.buyPreview, data);
      return response.data;
    },
  });
};

// Confirm buy crypto
export const useConfirmBuyCrypto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      currency: string;
      blockchain: string;
      amount: number;
      payment_method?: 'naira' | 'crypto_wallet';
    }) => {
      const response = await apiClient.post(CRYPTO_ROUTES.buyConfirm, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Preview sell crypto
export const usePreviewSellCrypto = () => {
  return useMutation({
    mutationFn: async (data: {
      currency: string;
      blockchain: string;
      amount: number;
    }) => {
      const response = await apiClient.post(CRYPTO_ROUTES.sellPreview, data);
      return response.data;
    },
  });
};

// Confirm sell crypto
export const useConfirmSellCrypto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      currency: string;
      blockchain: string;
      amount: number;
    }) => {
      const response = await apiClient.post(CRYPTO_ROUTES.sellConfirm, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Send crypto
export const useSendCrypto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      currency: string;
      blockchain: string;
      amount: number;
      address: string;
      network?: string;
    }) => {
      const response = await apiClient.post(CRYPTO_ROUTES.send, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
