// services/sections/sectionService.js
import http from '../../../httpCommon';

const allSections = () => {
	return http.get(`/section/all`);
};

const addSection = (sectionData) => {
	// payload: { name, code, subsectionIds: [] }
	return http.post(`/section/create`, sectionData);
};

const sectionDetails = (sectionId) => {
	return http.get(`/section/${sectionId}`);
};

const deleteSection = (sectionId) => {
	return http.delete(`/section/${sectionId}`);
};

export const SectionService = {
	allSections,
	addSection,
	sectionDetails,
	deleteSection,
};
