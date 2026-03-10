import http from '../../../httpCommon';

/**
 * Fetch all users within the current division scope
 * Used primarily for task assignments and work dispatching.
 */
const getAllUsers = () => {
	return http.get('/user/all');
};

const createUser = (userData) => {
	return http.post('/auth/sign-up', userData);
};

const updateUser = (id, userData) => {
	return http.patch(`/user/update/${id}`, userData);
};

const deleteUser = (id) => {
	return http.delete(`/user/delete/${id}`);
};

export const UserService = {
	getAllUsers,
	createUser,
	updateUser,
	deleteUser,
};
