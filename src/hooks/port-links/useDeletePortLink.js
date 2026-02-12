'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../common';

export const useDeletePortLink = (stationId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (linkId) => PortLinkService.deleteLink(linkId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['port-links', stationId],
			});

			showToast('Cable link removed', 'info');
		},

		onError: (error) => {
			showToast(error.response?.data?.error || 'Failed to remove cable link', 'error');
		},
	});
};
