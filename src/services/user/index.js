import http from '../../../httpCommon';

/**
 * Fetch all users within the current division scope
 * Used primarily for task assignments and work dispatching.
 */
const getAllUsers = () => {
	return http.get('/user/all');
};

export const UserService = {
	getAllUsers,
};
