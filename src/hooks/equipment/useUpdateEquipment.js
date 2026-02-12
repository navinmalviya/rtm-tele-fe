'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EquipmentService } from '@/services/equipment';
import { useToast } from '../common';

export const useUpdateEquipment = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => EquipmentService.updateEquipment(id, data),

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['equipment'] });
			showToast('Asset updated successfully', 'success');
		},

		onError: (error) => {
			showToast(error.response?.data?.error || 'Update failed', 'error');
		},
	});
};
