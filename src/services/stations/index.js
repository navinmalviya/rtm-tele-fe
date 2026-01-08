import http from '../../../httpCommon';

const allStations = () => {
	return http.get(`/station/all`);
};

const addStation = (stationData) => {
	return http.post(`/station/create`, stationData);
};

const stationSummary = (stationId) => {
	return http.get(`/station/${stationId}`);
};

const bulkUpdateStations = (stationsData) => {
	return http.post(`/station/bulk-update`, stationsData);
};

export const StationService = {
	allStations,
	addStation,
	bulkUpdateStations,
	stationSummary,
};
