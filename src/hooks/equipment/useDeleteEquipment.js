import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EquipmentService } from '@/services/equipment';
import { useToast } from '../common';

export const useDeleteEquipment = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => EquipmentService.deleteEquipment(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['equipment'] });
			if (stationId) {
				await queryClient.invalidateQueries({ queryKey: ['equipment', 'station', stationId] });
			}
			showToast('Asset deleted successfully!', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.error || 'Failed to delete asset', 'error');
		},
	});
};
