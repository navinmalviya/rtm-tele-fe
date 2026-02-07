import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/user';
import { useToast } from '../commom';

/**
 * Hook to fetch all available staff/users for task assignment.
 * Automatically handles error notifications via the common toast utility.
 */
export const useUsers = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['users'],
		queryFn: () => UserService.getAllUsers(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch divisional staff', 'error');
		},
	});
};
