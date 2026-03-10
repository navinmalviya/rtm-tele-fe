import http from '../../../httpCommon';

const getAll = () => {
	return http.get('/tnp/all');
};

const create = (payload) => {
	return http.post('/tnp/create', payload);
};

const update = (id, payload) => {
	return http.patch(`/tnp/update/${id}`, payload);
};

const remove = (id) => {
	return http.delete(`/tnp/delete/${id}`);
};

export const TnpService = {
	getAll,
	create,
	update,
	remove,
};
