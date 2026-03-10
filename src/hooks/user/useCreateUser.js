import { useMutation } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useCreateUser = () => {
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => UserService.createUser(payload),
		onSuccess: () => {
			showToast('User created successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create user', 'error');
		},
	});
};
