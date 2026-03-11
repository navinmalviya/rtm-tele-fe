import { useQuery } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useMaintenanceSchedules = (params = {}) => {
	const showToast = useToast();
	const queryScope = params.mine === true || params.mine === 'true' ? 'mine' : 'all';

	return useQuery({
		queryKey: ['maintenance-schedules', queryScope],
		queryFn: () => MaintenanceService.listSchedules(params),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch schedules', 'error');
		},
	});
};
