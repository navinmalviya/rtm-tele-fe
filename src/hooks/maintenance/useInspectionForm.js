import { useQuery } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useInspectionForm = (occurrenceId, enabled = true) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['maintenance-inspection-form', occurrenceId],
		queryFn: () => MaintenanceService.getInspectionForm(occurrenceId),
		enabled: Boolean(occurrenceId) && enabled,
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to load inspection form', 'error');
		},
	});
};
