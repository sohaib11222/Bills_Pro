import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { SUPPORT_ROUTES } from '../api.config';

interface SupportFilters {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  issue_type?: 'fiat_issue' | 'virtual_card_issue' | 'crypto_issue' | 'general';
  limit?: number;
}

// Get support information
export const useSupportInfo = () => {
  return useQuery({
    queryKey: ['support', 'info'],
    queryFn: async () => {
      const response = await apiClient.get(SUPPORT_ROUTES.index);
      return response.data;
    },
  });
};

// Get user tickets
export const useSupportTickets = (filters?: SupportFilters) => {
  return useQuery({
    queryKey: ['support', 'tickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.issue_type) params.append('issue_type', filters.issue_type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(
        `${SUPPORT_ROUTES.tickets}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
  });
};

// Get ticket details
export const useSupportTicket = (id: number) => {
  return useQuery({
    queryKey: ['support', 'ticket', id],
    queryFn: async () => {
      const response = await apiClient.get(SUPPORT_ROUTES.ticket(id));
      return response.data;
    },
    enabled: !!id,
  });
};
