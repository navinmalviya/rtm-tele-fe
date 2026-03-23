import { useMutation } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useUpdateMyPassword = () => {
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => UserService.updateMyPassword(payload),
		onSuccess: () => {
			showToast('Password updated successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update password', 'error');
		},
	});
};
