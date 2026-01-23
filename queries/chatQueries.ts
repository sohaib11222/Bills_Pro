import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { CHAT_ROUTES } from '../api.config';

// Get active chat session
export const useActiveChatSession = () => {
  return useQuery({
    queryKey: ['chat', 'session', 'active'],
    queryFn: async () => {
      const response = await apiClient.get(CHAT_ROUTES.session);
      return response.data;
    },
  });
};

// Get all chat sessions
export const useChatSessions = (limit?: number) => {
  return useQuery({
    queryKey: ['chat', 'sessions', limit],
    queryFn: async () => {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get(`${CHAT_ROUTES.sessions}${params}`);
      return response.data;
    },
  });
};

// Get session details
export const useChatSession = (id: number) => {
  return useQuery({
    queryKey: ['chat', 'session', id],
    queryFn: async () => {
      const response = await apiClient.get(CHAT_ROUTES.sessionDetails(id));
      return response.data;
    },
    enabled: !!id,
  });
};

// Get messages
export const useChatMessages = (id: number) => {
  return useQuery({
    queryKey: ['chat', 'messages', id],
    queryFn: async () => {
      const response = await apiClient.get(CHAT_ROUTES.getMessages(id));
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
};
