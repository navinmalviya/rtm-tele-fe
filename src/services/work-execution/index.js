import http from '../../../httpCommon';

const listWorks = () => http.get('/work-execution/all');
const getWorkById = (id) => http.get(`/work-execution/${id}`);
const createWork = (payload) => http.post('/work-execution/create', payload);
const updateWork = (id, payload) => http.patch(`/work-execution/update/${id}`, payload);
const deleteWork = (id) => http.delete(`/work-execution/delete/${id}`);

const listItems = (workId) => http.get(`/work-execution/${workId}/items`);
const createItem = (workId, payload) =>
	http.post(`/work-execution/${workId}/items/create`, payload);
const updateItem = (workId, itemId, payload) =>
	http.patch(`/work-execution/${workId}/items/update/${itemId}`, payload);

const listScope = (workId) => http.get(`/work-execution/${workId}/scope`);
const saveScope = (workId, payload) => http.post(`/work-execution/${workId}/scope/save`, payload);

const listRounds = (workId) => http.get(`/work-execution/${workId}/rounds`);
const createRound = (workId, payload) =>
	http.post(`/work-execution/${workId}/rounds/create`, payload);
const updateRound = (workId, roundId, payload) =>
	http.patch(`/work-execution/${workId}/rounds/update/${roundId}`, payload);

const listDemands = (workId, roundId) =>
	http.get(`/work-execution/${workId}/demands`, { params: roundId ? { roundId } : {} });
const submitDemands = (workId, payload) =>
	http.post(`/work-execution/${workId}/demands/submit`, payload);

const listAllocations = (workId, roundId) =>
	http.get(`/work-execution/${workId}/allocations`, {
		params: roundId ? { roundId } : {},
	});
const saveAllocations = (workId, payload) =>
	http.post(`/work-execution/${workId}/allocations/save`, payload);

const listProgress = (workId, roundId) =>
	http.get(`/work-execution/${workId}/progress`, {
		params: roundId ? { roundId } : {},
	});
const addProgress = (workId, payload) =>
	http.post(`/work-execution/${workId}/progress/add`, payload);

export const WorkExecutionService = {
	listWorks,
	getWorkById,
	createWork,
	updateWork,
	deleteWork,
	listItems,
	createItem,
	updateItem,
	listScope,
	saveScope,
	listRounds,
	createRound,
	updateRound,
	listDemands,
	submitDemands,
	listAllocations,
	saveAllocations,
	listProgress,
	addProgress,
};
