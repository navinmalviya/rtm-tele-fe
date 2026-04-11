import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../common';
import { ChatService } from '@/services/chat';

export const useCreateChatConversation = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: async (targetUserId) => {
			const { data } = await ChatService.createConversation(targetUserId);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to start chat', 'error');
		},
	});
};

