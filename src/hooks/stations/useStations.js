import { useQuery } from '@tanstack/react-query';

import { StationService } from '@/services/stations';

import { useToast } from '../commom';

export const useStations = () => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['stations'],
		queryFn: () => StationService.allStations(),
		select: (response) => {
			const stations = response.data; // Assuming axios response structure

			return stations.map((station) => ({
				id: station.id,
				// React Flow expects position as an object
				position: {
					x: station.mapX,
					y: station.mapY,
				},
				// Add any additional data needed for the node UI here
				data: {
					label: station.name,
					code: station.code,
					section: station.section,
					subSection: station.subSection,
					createdBy: station.createdBy?.name,
				},
				// You can define node types based on your logic
				type: 'default',
			}));
		},
		onError: (error) => {
			showToast(error.response.data.message, 'error');
		},
	});
};
