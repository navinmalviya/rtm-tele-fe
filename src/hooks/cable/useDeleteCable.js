'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

/**
 * Hook to permanently remove a cable record.
 */
export const useDeleteCable = (subsectionId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => CableService.deleteCable(id),

		onSuccess: async () => {
			// Refresh the subsection inventory
			if (subsectionId) {
				await queryClient.invalidateQueries({
					queryKey: ['cables', subsectionId],
				});
			}

			showToast('Cable removed from inventory', 'info');
		},

		onError: (error) => {
			showToast(error?.response?.data?.error || 'Failed to delete cable', 'error');
		},
	});
};
