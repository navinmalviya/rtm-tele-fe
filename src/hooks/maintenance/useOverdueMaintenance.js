import { useQuery } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useOverdueMaintenance = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['maintenance-overdue'],
		queryFn: () => MaintenanceService.listOverdue(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch overdue items', 'error');
		},
	});
};
