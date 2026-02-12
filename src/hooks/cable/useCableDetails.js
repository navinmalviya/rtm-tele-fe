'use client';

import { useQuery } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

/**
 * Hook to fetch detailed information for a single cable asset.
 * Includes all internal transmission media (Pairs/Fibers) and maintenance history.
 */
export const useCableDetails = (cableId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['cable', cableId],
		queryFn: () => CableService.getCableDetails(cableId),
		enabled: !!cableId,
		select: (response) => {
			const cable = response.data; // Standard axios response structure

			return {
				...cable,
				// Ensure arrays exist even if the backend returns null
				copperPairs: cable.copperPairs || [],
				fibers: cable.fibers || [],
				testReports: cable.testReports || [],
				joints: cable.joints || [],
				cuts: cable.cuts || [],
			};
		},
		onError: (error) => {
			const message = error?.response?.data?.message || 'Failed to fetch cable details';
			showToast(message, 'error');
		},
	});
};
