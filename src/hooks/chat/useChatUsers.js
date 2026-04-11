import { useQuery } from '@tanstack/react-query';
import { useToast } from '../common';
import { ChatService } from '@/services/chat';

export const useChatUsers = (search = '') => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['chat-users', search],
		queryFn: async () => {
			const { data } = await ChatService.listUsers(search ? { q: search } : {});
			return data || [];
		},
		staleTime: 60 * 1000,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load chat users', 'error');
		},
	});
};

