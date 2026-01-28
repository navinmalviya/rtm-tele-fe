import http from '../../../httpCommon';

const allPortTemplates = () => {
	return http.get(`/port-template/all`);
};

const addPortTemplate = (portTemplateData) => {
	// payload: { name, type, speed, voltage, isSFPInserted, sfpType, equipmentTemplateId }
	return http.post(`/port-template/create`, portTemplateData);
};

const updatePortTemplate = (id, portTemplateData) => {
	return http.put(`/port-template/update/${id}`, portTemplateData);
};

const deletePortTemplate = (id) => {
	return http.delete(`/port-template/delete/${id}`);
};

const getTemplatesByEquipment = (equipmentTemplateId) => {
	return http.get(`/port-template/equipment/${equipmentTemplateId}`);
};

export const PortTemplateService = {
	allPortTemplates,
	addPortTemplate,
	updatePortTemplate,
	deletePortTemplate,
	getTemplatesByEquipment,
};
