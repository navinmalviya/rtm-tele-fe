'use client';

import { useQuery } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

/**
 * Hook to fetch all cables for a specific subsection.
 * Maps the raw database response into a structured format for the Track Layout UI.
 */
export const useCablesBySubsection = (subsectionId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['cables', subsectionId],
		queryFn: () => CableService.getCablesBySubsection(subsectionId),
		enabled: !!subsectionId,
		select: (response) => {
			const cables = response.data; // Standard axios response structure

			return cables.map((cable) => ({
				id: cable.id,
				type: cable.type,
				subType: cable.subType,
				side: cable.side,
				length: cable.length,
				maintenanceBy: cable.maintenanceBy,
				dateOfCommissioning: cable.dateOfCommissioning,
				// Metadata for graphical rendering and counts
				meta: {
					quadCount: cable.quadCount,
					fiberCount: cable.fiberCount,
					cutCount: cable._count?.cuts || 0,
					jointCount: cable._count?.joints || 0,
					socketCount: cable._count?.ecSockets || 0,
				},
			}));
		},
		onError: (error) => {
			const message =
				error?.response?.data?.message || 'Failed to fetch cables for this subsection';
			showToast(message, 'error');
		},
	});
};
