'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EquipmentService } from '@/services/equipment';
import { useToast } from '../common';

export const useUpdateEquipment = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		// Destructure the incoming object and wrap coordinates in a 'data' key for the service
		mutationFn: async ({ id, ...updateData }) => {
			return await EquipmentService.updateEquipment(id, updateData);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['equipment'] });
			if (stationId) {
				queryClient.invalidateQueries({ queryKey: ['equipment', 'station', stationId] });
			}
			showToast('Asset position updated', 'success');
		},

		onError: (error) => {
			showToast(error.response?.data?.error || 'Update failed', 'error');
		},
	});
};
