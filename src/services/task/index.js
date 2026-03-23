import http from '../../../httpCommon';

/**
 * Fetch all tasks with optional filters
 * @param {Object} params - { projectId, stationId }
 */
const getAllTasks = (params) => {
	return http.get('/task/all', { params });
};

/**
 * Create a new task (Polymorphic)
 * @param {Object} taskData - Contains base task info + specialized data
 * (failureData, maintenanceData, or trcData)
 */
const createTask = (taskData) => {
	return http.post('/task/', taskData);
};

/**
 * Update task status
 * This call triggers the backend project progress recalculation
 */
const updateTaskStatus = (id, status) => {
	// payload: { status: "CLOSED" | "RESOLVED" | "IN_PROGRESS" | "OPEN" }
	return http.patch(`/task/${id}/status`, { status });
};

/**
 * Update task core details (owner/edit privileged)
 */
const updateTask = (id, payload) => {
	if (!id) {
		return Promise.reject(new Error('Task id is required'));
	}
	return http.patch(`/task/${id}`, payload);
};

/**
 * Fetch task details by id
 */
const getTaskById = (id) => {
	if (!id) {
		return Promise.reject(new Error('Task id is required'));
	}
	return http.get(`/task/${id}`);
};

/**
 * Upsert failure details for a task
 */
const updateFailureDetails = (id, failureData) => {
	if (!id) {
		return Promise.reject(new Error('Task id is required'));
	}
	return http.patch(`/task/${id}/failure`, failureData);
};

/**
 * Add a technical comment or site update
 */
const addTaskComment = (id, commentData) => {
	// payload: { content: string }
	return http.post(`/task/${id}/comments`, commentData);
};

const deleteTask = (id) => {
	return http.delete(`/task/${id}`);
};

export const TaskService = {
	getAllTasks,
	createTask,
	updateTask,
	updateTaskStatus,
	getTaskById,
	updateFailureDetails,
	addTaskComment,
	deleteTask,
};
