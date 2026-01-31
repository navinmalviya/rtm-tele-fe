import http from '../../../httpCommon';

const createLink = (linkData) => {
	// payload: { sourcePortId, targetPortId, mediaType, cableColor, length }
	return http.post('/port-link', linkData);
};

const getStationLinks = (stationId) => {
	// Fetches all physical cable connections for a specific station
	return http.get(`/port-link/station/${stationId}`);
};

const deleteLink = (linkId) => {
	// Removes the physical cable connection from the database
	return http.delete(`/port-link/${linkId}`);
};

export const PortLinkService = {
	createLink,
	getStationLinks,
	deleteLink,
};
