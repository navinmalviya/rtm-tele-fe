'use client';

import { useQuery } from '@tanstack/react-query';
import { EquipmentService } from '@/services/equipment';
import { useToast } from '../common';

/**
 * Fetches all equipment instances for a station.
 * @param {string} stationId - The ID of the station to filter by.
 */
export const useEquipmentByStation = (stationId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['equipment', 'station', stationId],
		queryFn: () => EquipmentService.findByStation(stationId),
		// Extract the data array from the Axios response
		select: (response) => response.data,
		// Keep existing data visible while fetching updates
		placeholderData: (previousData) => previousData,
		enabled: !!stationId, // Only run if stationId is provided
		onError: (error) => {
			showToast(error.response?.data?.error || 'Failed to load station equipment', 'error');
		},
	});
};
