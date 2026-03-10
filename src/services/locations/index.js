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

const updateLocation = (id, payload) => {
	return http.patch(`/location/update/${id}`, payload);
};

const deleteLocation = (id) => {
	return http.delete(`/location/delete/${id}`);
};

export const LocationService = {
	allLocations,
	addLocation,
	stationLocations,
	updateLocation,
	deleteLocation,
};
