import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationService } from '@/services/locations';
import { useToast } from '../common';

export const useDeleteLocation = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => LocationService.deleteLocation(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['locations', stationId] });
			await queryClient.invalidateQueries({ queryKey: ['locations'] });
			showToast('Location deleted successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete location', 'error');
		},
	});
};
