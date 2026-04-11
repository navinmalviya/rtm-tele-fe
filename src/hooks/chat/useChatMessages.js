import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../common';
import { ChatService } from '@/services/chat';

export const useChatMessages = (conversationId) => {
	const showToast = useToast();
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ['chat-messages', conversationId],
		queryFn: async () => {
			if (!conversationId) return [];
			const { data } = await ChatService.listMessages(conversationId, { take: 300 });
			return data || [];
		},
		enabled: Boolean(conversationId),
		refetchInterval: 5000,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
			queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load messages', 'error');
		},
	});
};
