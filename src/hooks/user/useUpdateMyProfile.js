import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useUpdateMyProfile = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => UserService.updateMyProfile(payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
				queryClient.invalidateQueries({ queryKey: ['users'] }),
			]);
			showToast('Profile updated successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update profile', 'error');
		},
	});
};
