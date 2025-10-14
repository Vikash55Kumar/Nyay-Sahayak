import api from '../utils/baseApi';

// Inputs
export interface IntercasteMarriageInput {
	marriageRegistrationId: string;
	spouseName: string;
	spouseCategory: string;
	spouseAadhaarNumber: string;
	supportingDocuments: Array<any>;
	applicationReason?: string;
}

export interface AtrocityReliefInput {
	firNumber: string;
	policeStation: string;
	district: string;
	dateOfIncident: string; // ISO date
	incidentDescription: string;
	sectionsApplied?: string[];
	supportingDocuments?: Array<any>;
	applicationReason?: string;
}

export interface VerifyMarriageCertificateInput {
	marriageRegistrationId: string;
}

export interface CheckIntercasteInput {
	marriageRegistrationId: string;
}

export interface VerifyMarriageDetailsForAuthorityInput {
	applicationId: string;
	marriageRegistrationId: string;
	applicantAadhaar: string;
}

export interface UpdateApplicationStatusInput {
	action: 'APPROVE' | 'REJECT' | 'INITIATE_PAYMENT' | 'COMPLETE_PAYMENT';
	remarks?: string;
	amount?: number;
	transactionId?: string;
}

export const applicationService = {
	async submitIntercasteMarriage(data: IntercasteMarriageInput) {
        const response = await api.post('/applications/intercaste-marriage', data);
		return response.data.data;
	},

	async submitAtrocityRelief(data: AtrocityReliefInput) {
        const response = await api.post('/applications/atrocity-relief', data);
		return response.data.data;
	},

	async verifyMarriageCertificate(data: VerifyMarriageCertificateInput) {
		const response = await api.post('/applications/verify-marriage-certificate', data);
		return response.data.data;
	},

	async checkIntercasteMarriage(data: CheckIntercasteInput) {
		const response = await api.post('/applications/check-intercaste-marriage', data);
		return response.data.data;
	},

	async getApplicationStatus(applicationId: string) {
		const response = await api.get(`/applications/status/${encodeURIComponent(applicationId)}`);
		return response.data.data;
	},

	async getApplicationTimeline(applicationId: string) {
		const response = await api.get(`/applications/timeline/${encodeURIComponent(applicationId)}`);
		return response.data.data;
	},

	async getMyApplications() {
		const response = await api.get('/applications/my-applications');
		return response.data.data;
	},

	async updateApplicationStatus(applicationId: string, data: UpdateApplicationStatusInput) {
		const response = await api.put(`/applications/authority/update-status/${encodeURIComponent(applicationId)}`, data);
		return response.data.data;
	},

	async verifyMarriageDetailsForAuthority(data: VerifyMarriageDetailsForAuthorityInput) {
		const response = await api.post('/applications/authority/verify-marriage-details', data);
		return response.data.data;
	},

	async verifyAtrocityApplicationForAuthority(applicationId: string) {
		const response = await api.get(`/applications/authority/verify-atrocity/${encodeURIComponent(applicationId)}`);
		return response.data.data;
	}
};

export default applicationService;
