import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../common';

export const useMyProfile = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['user-profile'],
		queryFn: () => UserService.getMyProfile(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to load profile', 'error');
		},
	});
};
