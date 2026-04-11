import { useQuery } from '@tanstack/react-query';
import { useToast } from '../common';
import { ChatService } from '@/services/chat';

export const useChatConversations = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['chat-conversations'],
		queryFn: async () => {
			const { data } = await ChatService.listConversations();
			return data || [];
		},
		refetchInterval: 15000,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load conversations', 'error');
		},
	});
};

