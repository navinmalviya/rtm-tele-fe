import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RackService } from '@/services/racks';
import { useToast } from '../common';

export const useDeleteRack = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => RackService.deleteRack(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['racks', stationId] });
			await queryClient.invalidateQueries({ queryKey: ['racks'] });
			showToast('Rack deleted successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.error || 'Failed to delete rack', 'error');
		},
	});
};
