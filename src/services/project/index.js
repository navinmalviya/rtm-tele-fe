import http from '../../../httpCommon';

const getAllProjects = () => {
	return http.get('/project/all');
};

const createProject = (projectData) => {
	// payload: { name, description, startDate, endDate }
	return http.post('/project/', projectData);
};

const getProjectDetails = (id) => {
	return http.get(`/project/${id}`);
};

const updateProject = (id, projectData) => {
	// payload: { name, description, status, endDate }
	return http.patch(`/project/${id}`, projectData);
};

const deleteProject = (id) => {
	return http.delete(`/project/${id}`);
};

const syncProjectProgress = (id) => {
	// Manually trigger a recalculation of the completion percentage
	return http.post(`/project/${id}/sync-progress`);
};

export const ProjectService = {
	getAllProjects,
	createProject,
	getProjectDetails,
	updateProject,
	deleteProject,
	syncProjectProgress,
};
