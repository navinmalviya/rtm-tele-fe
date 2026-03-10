import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => UserService.updateUser(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			showToast('User updated successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update user', 'error');
		},
	});
};
