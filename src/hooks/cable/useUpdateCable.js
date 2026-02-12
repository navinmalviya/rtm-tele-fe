'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

/**
 * Hook to update existing cable metadata (length, maintenance authority).
 */
export const useUpdateCable = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => CableService.updateCable(id, data),

		onSuccess: async (response) => {
			const updatedCable = response.data;

			// Refresh specific cable detail and the subsection list
			queryClient.invalidateQueries({ queryKey: ['cable', updatedCable.id] });
			queryClient.invalidateQueries({ queryKey: ['cables', updatedCable.subsectionId] });

			showToast('Cable metadata updated successfully', 'success');
		},

		onError: (error) => {
			showToast(error?.response?.data?.error || 'Update failed', 'error');
		},
	});
};
