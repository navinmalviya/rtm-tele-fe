import http from '../../../httpCommon';

const allStations = () => {
	return http.get(`/station/all`);
};

const addStation = (stationData) => {
	return http.post(`/station/create`, stationData);
};

const bulkUpdateStations = (stationsData) => {
	return http.post(`/station/bulk-update`, stationsData);
};

export const StationService = {
	allStations,
	addStation,
	bulkUpdateStations,
};
