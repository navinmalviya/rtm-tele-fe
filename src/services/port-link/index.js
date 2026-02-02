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

const getLinkDetails = (linkId) => http.get(`/port-link/${linkId}`);
const getAllLinks = () => http.get(`/port-link/all`);
const updateLink = (linkId) => http.patch(`/port-link/${linkId}`);

const getAvailablePortsByStation = (stationId) => {
	return http.get(`/port-link/station/${stationId}/available-ports`);
};

export const PortLinkService = {
	createLink,
	getStationLinks,
	deleteLink,
	getLinkDetails,
	updateLink,
	getAvailablePortsByStation,
	getAllLinks,
};
