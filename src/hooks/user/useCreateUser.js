import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useCreateUser = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => UserService.createUser(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			showToast('User created successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create user', 'error');
		},
	});
};
