import mongoose, { Document } from 'mongoose';

// Document Upload interface
export interface IDocumentUpload {
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Base Application Interface
export interface IBaseApplication extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: string;
  beneficiaryId: mongoose.Types.ObjectId;
  applicationType: 'ATROCITY_RELIEF' | 'INTERCASTE_MARRIAGE';
  applicationStatus: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAYMENT_INITIATED' | 'COMPLETED';
  assignedOfficer?: mongoose.Types.ObjectId;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAmount?: number;
  rejectionReason?: string;
  applicationReason?: string;
  documentsUploaded: IDocumentUpload[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for static methods
export interface IBaseApplicationModel extends mongoose.Model<IBaseApplication> {
  findByBeneficiary(beneficiaryId: mongoose.Types.ObjectId): mongoose.Query<IBaseApplication[], IBaseApplication>;
  getApplicationStats(): mongoose.Aggregate<any[]>;
  findPendingApplications(): mongoose.Query<IBaseApplication[], IBaseApplication>;
}

// Marriage Details interface
export interface IMarriageDetails {
  spouseDetails: {
    name: string;
    category: 'GENERAL' | 'OBC' | 'SC' | 'ST';
    aadhaarNumber: string;
  };
  marriageRegistrationId: string;
  marriageDate: Date;
  registrationAuthority: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'INVALID';
}

// FIR Details interface
export interface IFirDetails {
  firNumber: string;
  policeStation: string;
  district: string;
  dateOfIncident: Date;
  incidentDescription: string;
  sectionsApplied: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'INVALID';
}

// Marriage Application interface (extends base)
export interface IMarriageApplication extends IBaseApplication {
  applicationType: 'INTERCASTE_MARRIAGE';
  marriageDetails: IMarriageDetails;
}

// Caste Discrimination Application interface (extends base)
export interface ICasteDiscriminationApplication extends IBaseApplication {
  applicationType: 'ATROCITY_RELIEF';
  firDetails: IFirDetails;
}