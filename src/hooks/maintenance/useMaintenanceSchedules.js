import { useQuery } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useMaintenanceSchedules = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['maintenance-schedules'],
		queryFn: () => MaintenanceService.listSchedules(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch schedules', 'error');
		},
	});
};
