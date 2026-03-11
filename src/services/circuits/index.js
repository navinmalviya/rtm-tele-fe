import http from '../../../httpCommon';

const listMasters = (params = {}) => http.get('/circuits/masters', { params });
const createMaster = (payload) => http.post('/circuits/masters', payload);
const updateMaster = (id, payload) => http.patch(`/circuits/masters/${id}`, payload);
const deactivateMaster = (id) => http.delete(`/circuits/masters/${id}`);

const listStationCircuits = (params = {}) => http.get('/circuits/station', { params });
const createStationCircuit = (payload) => http.post('/circuits/station', payload);
const approveStationCircuit = (id, payload = {}) =>
	http.patch(`/circuits/station/${id}/approve`, payload);
const rejectStationCircuit = (id, payload) => http.patch(`/circuits/station/${id}/reject`, payload);

export const CircuitsService = {
	listMasters,
	createMaster,
	updateMaster,
	deactivateMaster,
	listStationCircuits,
	createStationCircuit,
	approveStationCircuit,
	rejectStationCircuit,
};
