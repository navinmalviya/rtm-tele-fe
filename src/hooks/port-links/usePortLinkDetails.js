'use client';

import { useQuery } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../commom';

export const usePortLinkDetails = (linkId) => {
	const showToast = useToast();

	return useQuery({
		// Query is unique to the linkId
		queryKey: ['port-link-details', linkId],
		queryFn: () => PortLinkService.getLinkDetails(linkId),
		enabled: !!linkId, // Only fetch if an ID is actually provided
		select: (response) => response.data,
		onError: (error) => {
			console.error('Fetch Link Details Error:', error);
			showToast(
				error.response?.data?.error || 'Failed to fetch detailed link information',
				'error'
			);
		},
	});
};
