'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../common';

export const useCreatePortLink = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (linkData) => {
			// payload: { sourcePortId, targetPortId, mediaType, cableColor }
			return PortLinkService.createLink(linkData);
		},

		onSuccess: async () => {
			// Invalidate links for this specific station to show the new edge immediately
			await queryClient.invalidateQueries({
				queryKey: ['port-links', stationId],
			});

			// Optional: Invalidate equipment to update port occupancy status
			await queryClient.invalidateQueries({
				queryKey: ['equipment', stationId],
			});

			showToast('Cable link established successfully', 'success');
		},

		onError: (error) => {
			console.error('Cabling Error:', error);
			showToast(error.response?.data?.error || 'Failed to establish physical link', 'error');
		},
	});
};
