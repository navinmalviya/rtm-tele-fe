import { useQuery } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useMyMaintenanceSummary = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['maintenance-my-summary'],
		queryFn: () => MaintenanceService.listMySummary(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch maintenance summary', 'error');
		},
	});
};

