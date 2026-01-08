import http from '../../../httpCommon';

const addRack = (rackData) => {
	return http.post(`/rack/create`, rackData);
};

const stationRacks = (stationId) => {
	return http.get(`/rack/${stationId}`);
};

export const RackService = {
	addRack,
	stationRacks,
};
