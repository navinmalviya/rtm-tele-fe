import http from '../../../httpCommon';

const listSchedules = (params = {}) => {
	return http.get('/maintenance', { params });
};
const listMySummary = () => {
	return http.get('/maintenance/my-summary');
};

const createSchedule = (payload) => {
	return http.post('/maintenance', payload);
};

const updateSchedule = (id, payload) => {
	return http.patch(`/maintenance/${id}`, payload);
};

const toggleScheduleStatus = (id) => {
	return http.patch(`/maintenance/${id}/toggle-status`);
};

const deleteSchedule = (id) => {
	return http.delete(`/maintenance/${id}`);
};

const createOccurrence = (scheduleId) => {
	return http.post(`/maintenance/${scheduleId}/occurrences`);
};

const listOverdue = () => {
	return http.get('/maintenance/overdue');
};

const completeOccurrence = (occurrenceId, payload) => {
	return http.patch(`/maintenance/occurrences/${occurrenceId}/complete`, payload);
};

const getInspectionForm = (occurrenceId) => {
	return http.get(`/maintenance/occurrences/${occurrenceId}/inspection-form`);
};

export const MaintenanceService = {
	listSchedules,
	listMySummary,
	createSchedule,
	updateSchedule,
	toggleScheduleStatus,
	deleteSchedule,
	createOccurrence,
	listOverdue,
	completeOccurrence,
	getInspectionForm,
};
