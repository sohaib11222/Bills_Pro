import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { SUPPORT_ROUTES } from '../api.config';

// Create support ticket
export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      subject: string;
      description: string;
      issue_type?: 'fiat_issue' | 'virtual_card_issue' | 'crypto_issue' | 'general';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }) => {
      const response = await apiClient.post(SUPPORT_ROUTES.createTicket, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
    },
  });
};

// Update support ticket
export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        subject?: string;
        description?: string;
        status?: 'open' | 'in_progress' | 'resolved' | 'closed';
      };
    }) => {
      const response = await apiClient.put(SUPPORT_ROUTES.updateTicket(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support', 'ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
    },
  });
};

// Close support ticket
export const useCloseSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(SUPPORT_ROUTES.closeTicket(id));
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['support', 'ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
    },
  });
};
