import http from '../../../httpCommon';

const getAll = () => http.get('/escalation-matrix/all');

const create = (payload) => http.post('/escalation-matrix/create', payload);

const update = (id, payload) => http.patch(`/escalation-matrix/update/${id}`, payload);

const remove = (id) => http.delete(`/escalation-matrix/delete/${id}`);

export const EscalationMatrixService = {
	getAll,
	create,
	update,
	remove,
};
