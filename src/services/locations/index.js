import http from '../../../httpCommon';

const allLocations = () => {
	return http.get(`/location/all`);
};

const addLocation = (locationData) => {
	return http.post(`/location/create`, locationData);
};

const stationLocations = (stationId) => {
	return http.get(`/location/all/${stationId}`);
};

export const LocationService = {
	allLocations,
	addLocation,
	stationLocations,
};
