'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

export const useAddJoint = (cableId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CableService.addJoint(cableId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['cables'] }),
				queryClient.invalidateQueries({ queryKey: ['cable', cableId] }),
			]);
			showToast('Joint added successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to add joint', 'error');
		},
	});
};
