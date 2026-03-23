import http from '../../../httpCommon';

/**
 * Fetch all users within the current division scope
 * Used primarily for task assignments and work dispatching.
 */
const getAllUsers = () => {
	return http.get('/user/all');
};

const getMyProfile = () => {
	return http.get('/user/me');
};

const updateMyProfile = (payload) => {
	return http.patch('/user/me', payload);
};

const updateMyPassword = (payload) => {
	return http.patch('/user/me/password', payload);
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
	getMyProfile,
	updateMyProfile,
	updateMyPassword,
	createUser,
	updateUser,
	deleteUser,
};
