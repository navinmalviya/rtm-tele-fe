import http from '../../../httpCommon';

const allTemplates = (params) => {
	// params can include { category, subCategory, search }
	return http.get(`/equipment-template/all`, { params });
};

const addTemplate = (templateData) => {
	return http.post(`/equipment-template/create`, templateData);
};

const templateDetails = (templateId) => {
	return http.get(`/equipment-template/${templateId}`);
};

const updateTemplate = (templateId, templateData) => {
	return http.patch(`/equipment-template/update/${templateId}`, templateData);
};

const deleteTemplate = (templateId) => {
	return http.delete(`/equipment-template/delete/${templateId}`);
};

export const EquipmentTemplateService = {
	allTemplates,
	addTemplate,
	templateDetails,
	updateTemplate,
	deleteTemplate,
};
