import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { CHAT_ROUTES } from '../api.config';

// Start chat
export const useStartChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      issue_type: 'fiat_issue' | 'virtual_card_issue' | 'crypto_issue' | 'general';
      message: string;
    }) => {
      const response = await apiClient.post(CHAT_ROUTES.start, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'session'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
};

// Send message
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: number;
      data: {
        message: string;
        attachment?: File;
      };
    }) => {
      const formData = new FormData();
      formData.append('message', data.message);
      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }
      
      const response = await apiClient.post(CHAT_ROUTES.sendMessage(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'session', variables.id] });
    },
  });
};

// Mark as read
export const useMarkChatAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(CHAT_ROUTES.markAsRead(id));
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'session', id] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', id] });
    },
  });
};

// Close session
export const useCloseChatSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(CHAT_ROUTES.closeSession(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'session'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
};
