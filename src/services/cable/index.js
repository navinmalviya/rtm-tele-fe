import http from '../../../httpCommon';

/**
 * Fetches all cables for a specific subsection.
 * Primary data source for the Sub-section Details inventory table.
 */
const getCablesBySubsection = (subsectionId) => {
	return http.get(`/cable/subsection/${subsectionId}`);
};

/**
 * Retrieves full history and technical specs for a single cable.
 * Includes nested data for cuts, joints, and test reports.
 */
const getCableDetails = (id) => {
	return http.get(`/cable/${id}`);
};

/**
 * Registers a new physical cable into the subsection inventory.
 */
const addCable = (cableData) => {
	return http.post('/cable/create', cableData);
};

/**
 * Adds an EC socket to a cable.
 */
const addEcSocket = (cableId, payload) => {
	return http.post(`/cable/${cableId}/ec-socket`, payload);
};

/**
 * Updates existing cable metadata such as length or maintenance authority.
 */
const updateCable = (id, data) => {
	return http.patch(`/cable/update/${id}`, data);
};

/**
 * Removes a cable record and its associated history from the system.
 */
const deleteCable = (id) => {
	return http.delete(`/cable/delete/${id}`);
};

export const CableService = {
	getCablesBySubsection,
	getCableDetails,
	addCable,
	addEcSocket,
	updateCable,
	deleteCable,
};
