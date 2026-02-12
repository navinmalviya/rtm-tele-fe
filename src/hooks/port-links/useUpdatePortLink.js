'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../common';

export const useUpdatePortLink = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => PortLinkService.updateLink(id, data),

		onSuccess: async () => {
			// 1. Invalidate the specific link details to refresh the drawer UI
			await queryClient.invalidateQueries({
				queryKey: ['port-link-details'],
			});

			// 2. Invalidate the station links to update edge colors/styles on the map
			await queryClient.invalidateQueries({
				queryKey: ['port-links', stationId],
			});

			showToast('Physical link parameters updated', 'success');
		},

		onError: (error) => {
			console.error('Update Link Error:', error);
			showToast(error.response?.data?.error || 'Failed to update cable details', 'error');
		},
	});
};
