import http from '../../../httpCommon';

const addRack = (rackData) => {
	return http.post(`/rack/create`, rackData);
};

const stationRacks = (stationId) => {
	return http.get(`/rack/${stationId}`);
};

const updateRack = (id, data) => {
	return http.patch(`/rack/update/${id}`, data);
};

const deleteRack = (id) => {
	return http.delete(`/rack/delete/${id}`);
};

export const RackService = {
	addRack,
	stationRacks,
	updateRack,
	deleteRack,
};
