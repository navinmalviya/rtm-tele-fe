import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => UserService.deleteUser(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			showToast('User deleted successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete user', 'error');
		},
	});
};
