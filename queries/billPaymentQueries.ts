import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { BILL_PAYMENT_ROUTES } from '../api.config';

// Get bill payment categories
export const useBillPaymentCategories = () => {
  return useQuery({
    queryKey: ['bill-payment', 'categories'],
    queryFn: async () => {
      const response = await apiClient.get(BILL_PAYMENT_ROUTES.categories);
      return response.data;
    },
  });
};

// Get providers by category
export const useBillPaymentProviders = (categoryCode: string, countryCode?: string) => {
  return useQuery({
    queryKey: ['bill-payment', 'providers', categoryCode, countryCode],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('categoryCode', categoryCode);
      if (countryCode) params.append('countryCode', countryCode);
      
      const response = await apiClient.get(
        `${BILL_PAYMENT_ROUTES.providers}?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!categoryCode,
  });
};

// Get plans by provider
export const useBillPaymentPlans = (providerId: number) => {
  return useQuery({
    queryKey: ['bill-payment', 'plans', providerId],
    queryFn: async () => {
      const response = await apiClient.get(
        `${BILL_PAYMENT_ROUTES.plans}?providerId=${providerId}`
      );
      return response.data;
    },
    enabled: !!providerId,
  });
};

// Get beneficiaries
export const useBillPaymentBeneficiaries = () => {
  return useQuery({
    queryKey: ['bill-payment', 'beneficiaries'],
    queryFn: async () => {
      const response = await apiClient.get(BILL_PAYMENT_ROUTES.beneficiaries);
      return response.data;
    },
  });
};
