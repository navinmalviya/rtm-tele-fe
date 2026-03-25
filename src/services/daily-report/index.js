import http from '../../../httpCommon';

const getDashboard = (params = {}) => http.get('/daily-report/dashboard', { params });

const listInputs = (params = {}) => http.get('/daily-report/inputs', { params });

const createInput = (payload) => http.post('/daily-report/input', payload);

const updateInput = (id, payload) => http.patch(`/daily-report/input/${id}`, payload);

const deleteInput = (id) => http.delete(`/daily-report/input/${id}`);

const getCoverage = (params = {}) => http.get('/daily-report/coverage', { params });

const listRuns = (params = {}) => http.get('/daily-report/runs', { params });

const exportReport = (params = {}) =>
	http.get('/daily-report/export', {
		params,
		responseType: 'blob',
	});

export const DailyReportService = {
	getDashboard,
	listInputs,
	createInput,
	updateInput,
	deleteInput,
	getCoverage,
	listRuns,
	exportReport,
};
