import { useQuery } from '@tanstack/react-query';
import { ChatService } from '@/services/chat';

export const useChatUnreadCount = (enabled = true) => {
	return useQuery({
		queryKey: ['chat-unread-count'],
		queryFn: async () => {
			const { data } = await ChatService.getUnreadCount();
			return Number(data?.total || 0);
		},
		enabled,
		refetchInterval: 10000,
	});
};

