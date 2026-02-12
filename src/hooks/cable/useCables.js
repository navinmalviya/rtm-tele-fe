'use client';

import { useQuery } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

/**
 * Hook to fetch all cables for a specific subsection.
 * Persists data across renders and provides toast feedback on failure.
 */
export const useCables = (subsectionId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['cables', subsectionId],
		queryFn: () => CableService.getCablesBySubsection(subsectionId),
		enabled: !!subsectionId, // Only fetch if an ID is provided
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.error || 'Failed to fetch subsection cables', 'error');
		},
	});
};
