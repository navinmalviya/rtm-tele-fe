import { useQuery } from '@tanstack/react-query';

import { LocationService } from '@/services/locations';

import { useToast } from '../commom';

export const useLocations = () => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['locations'],
		queryFn: () => LocationService.allLocations(),
		select: (response) => {
			const locations = response.data; // Assuming axios response structure

			return locations;
		},
		onError: (error) => {
			showToast(error.response.data.message, 'error');
		},
	});
};
