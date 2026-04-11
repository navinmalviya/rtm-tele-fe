import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../common';
import { ChatService } from '@/services/chat';

export const useSendChatMessage = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: async ({ conversationId, payload }) => {
			const { data } = await ChatService.sendMessage(conversationId, payload);
			return data;
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
			if (variables?.conversationId) {
				queryClient.invalidateQueries({
					queryKey: ['chat-messages', variables.conversationId],
				});
			}
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to send message', 'error');
		},
	});
};

