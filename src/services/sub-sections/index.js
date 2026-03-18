// services/sections/subSectionService.js
import http from '../../../httpCommon';

const allSubSections = () => {
	return http.get(`/subsection/all`);
};

const addSubSection = (subSectionData) => {
	// payload: { name, code, fromStationId, toStationId }
	return http.post(`/subsection/create`, subSectionData);
};

const updateSubSection = (subId, subSectionData) => {
	return http.put(`/subsection/update/${subId}`, subSectionData);
};

const subSectionDetails = (subId) => {
	return http.get(`/subsection/${subId}`);
};

const deleteSubSection = (subId) => {
	return http.delete(`/subsection/${subId}`);
};

export const SubSectionService = {
	allSubSections,
	addSubSection,
	updateSubSection,
	subSectionDetails,
	deleteSubSection,
};
