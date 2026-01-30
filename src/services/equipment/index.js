import http from '../../../httpCommon';

/**
 * Creates a new physical equipment instance.
 * Automatically triggers port generation on the backend.
 */
const addEquipment = (equipmentData) => {
	return http.post('/equipment/create', equipmentData);
};

/**
 * Fetches all equipment for a specific station.
 * Useful for both the Equipment Table and the XYFlow Station View.
 */
const findByStation = (stationId) => {
	return http.get(`/equipment/station/${stationId}`);
};

/**
 * Universal update for a single asset.
 * Handles metadata, status, or single-node position changes.
 */
const updateEquipment = (id, data) => {
	return http.patch(`/equipment/update/${id}`, data);
};

/**
 * Bulk update for multiple assets.
 * Optimized for saving the entire XYFlow layout state in one transaction.
 */
const bulkUpdateEquipment = (updates) => {
	// Expects updates to be an array of { id, mapX, mapY, ... }
	return http.patch('/equipment/bulk-update', { updates });
};

/**
 * Removes an equipment instance and its associated ports from the database.
 */
const deleteEquipment = (id) => {
	return http.delete(`/equipment/delete/${id}`);
};

export const EquipmentService = {
	addEquipment,
	findByStation,
	updateEquipment,
	bulkUpdateEquipment,
	deleteEquipment,
};
