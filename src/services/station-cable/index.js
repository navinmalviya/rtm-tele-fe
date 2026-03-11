import http from '../../../httpCommon';

const byStation = (stationId) => {
	return http.get(`/station-cable/station/${stationId}`);
};

const create = (payload) => {
	return http.post('/station-cable/create', payload);
};

const remove = (id) => {
	return http.delete(`/station-cable/delete/${id}`);
};

export const StationCableService = {
	byStation,
	create,
	remove,
};
