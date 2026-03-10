import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StationService } from '@/services/stations';
import { useToast } from '../common';

export const useDeleteStation = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => StationService.deleteStation(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['stations'] });
			showToast('Station deleted successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete station', 'error');
		},
	});
};
