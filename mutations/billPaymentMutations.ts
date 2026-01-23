import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { BILL_PAYMENT_ROUTES } from '../api.config';

// Preview bill payment
export const usePreviewBillPayment = () => {
  return useMutation({
    mutationFn: async (data: {
      categoryCode: string;
      providerId: number;
      amount?: number;
      currency?: string;
      planId?: number;
    }) => {
      const response = await apiClient.post(BILL_PAYMENT_ROUTES.preview, data);
      return response.data;
    },
  });
};

// Validate meter
export const useValidateMeter = () => {
  return useMutation({
    mutationFn: async (data: {
      providerId: number;
      meterNumber: string;
      accountType: 'prepaid' | 'postpaid';
    }) => {
      const response = await apiClient.post(BILL_PAYMENT_ROUTES.validateMeter, data);
      return response.data;
    },
  });
};

// Validate account
export const useValidateAccount = () => {
  return useMutation({
    mutationFn: async (data: {
      providerId: number;
      accountNumber: string;
    }) => {
      const response = await apiClient.post(BILL_PAYMENT_ROUTES.validateAccount, data);
      return response.data;
    },
  });
};

// Initiate bill payment
export const useInitiateBillPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      categoryCode: string;
      providerId: number;
      currency: string;
      amount?: number;
      accountNumber?: string;
      planId?: number;
      accountType?: string;
      beneficiaryId?: number;
    }) => {
      const response = await apiClient.post(BILL_PAYMENT_ROUTES.initiate, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-payment'] });
    },
  });
};

// Confirm bill payment
export const useConfirmBillPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      transactionId: number;
      pin: string;
    }) => {
      const response = await apiClient.post(BILL_PAYMENT_ROUTES.confirm, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-payment'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Create beneficiary
export const useCreateBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      categoryCode: string;
      providerId: number;
      accountNumber: string;
      name?: string;
      accountType?: string;
    }) => {
      const response = await apiClient.post(BILL_PAYMENT_ROUTES.createBeneficiary, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-payment', 'beneficiaries'] });
    },
  });
};

// Update beneficiary
export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        accountNumber?: string;
        name?: string;
        accountType?: string;
      };
    }) => {
      const response = await apiClient.put(BILL_PAYMENT_ROUTES.updateBeneficiary(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-payment', 'beneficiaries'] });
    },
  });
};

// Delete beneficiary
export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(BILL_PAYMENT_ROUTES.deleteBeneficiary(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-payment', 'beneficiaries'] });
    },
  });
};
