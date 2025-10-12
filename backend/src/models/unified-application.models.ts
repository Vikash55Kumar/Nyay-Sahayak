import mongoose, { Schema } from 'mongoose';
import { 
  IBaseApplication, 
  IBaseApplicationModel, 
  IMarriageApplication, 
  ICasteDiscriminationApplication,
  IDocumentUpload,
  IMarriageDetails,
  IFirDetails
} from '../types/application.types';

// Document Upload Schema
const DocumentUploadSchema = new Schema<IDocumentUpload>({
  documentType: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  }
}, { _id: false });

// Base Application Schema
const BaseApplicationSchema = new Schema<IBaseApplication>({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  beneficiaryId: {
    type: Schema.Types.ObjectId,
    ref: 'BeneficiaryProfile',
    required: true
  },
  applicationType: {
    type: String,
    enum: ['ATROCITY_RELIEF', 'INTERCASTE_MARRIAGE'],
    required: true,
    index: true
  },
  applicationStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAYMENT_INITIATED', 'COMPLETED'],
    default: 'DRAFT'
  },
  assignedOfficer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  approvedAmount: { type: Number, min: 0 },
  rejectionReason: { type: String },
  applicationReason: { type: String },
  documentsUploaded: [DocumentUploadSchema]
}, {
  timestamps: true,
  discriminatorKey: 'applicationType'
});

// Indexes
BaseApplicationSchema.index({ applicationStatus: 1, submittedAt: -1 });
BaseApplicationSchema.index({ assignedOfficer: 1, applicationStatus: 1 });
BaseApplicationSchema.index({ beneficiaryId: 1, createdAt: -1 });

// Pre-save middleware to generate applicationId
BaseApplicationSchema.pre('save', function(next) {
  if (!this.applicationId && this.isNew) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    
    if (this.applicationType === 'INTERCASTE_MARRIAGE') {
      this.applicationId = `MAR_${year}_${random}`;
    } else if (this.applicationType === 'ATROCITY_RELIEF') {
      this.applicationId = `ATR_${year}_${random}`;
    }
  }
  next();
});

// Static methods
BaseApplicationSchema.statics.findByBeneficiary = function(beneficiaryId: mongoose.Types.ObjectId) {
  return this.find({ beneficiaryId }).sort({ createdAt: -1 });
};

BaseApplicationSchema.statics.getApplicationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          type: '$applicationType',
          status: '$applicationStatus'
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

BaseApplicationSchema.statics.findPendingApplications = function() {
  return this.find({ 
    applicationStatus: { $in: ['SUBMITTED', 'UNDER_REVIEW'] }
  }).sort({ submittedAt: 1 });
};

// Base model
export const Application = mongoose.model<IBaseApplication, IBaseApplicationModel>('Application', BaseApplicationSchema);

// Marriage Application discriminator
const MarriageDetailsSchema = new Schema<IMarriageDetails>({
  spouseDetails: {
    name: { type: String, required: true },
    category: { type: String, enum: ['GENERAL', 'OBC', 'SC', 'ST'], required: true },
    aadhaarNumber: { type: String, required: true }
  },
  marriageRegistrationId: { type: String, required: true, index: true },
  marriageDate: { type: Date, required: true },
  registrationAuthority: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'INVALID'],
    default: 'PENDING',
    index: true
  }
}, { _id: false });

export const MarriageApplication = Application.discriminator<IMarriageApplication>('INTERCASTE_MARRIAGE', new Schema({
  marriageDetails: {
    type: MarriageDetailsSchema,
    required: true
  }
}));

// Caste Discrimination Application discriminator
const FirDetailsSchema = new Schema<IFirDetails>({
  firNumber: { type: String, required: true, index: true },
  policeStation: { type: String, required: true },
  district: { type: String, required: true, index: true },
  dateOfIncident: { type: Date, required: true },
  incidentDescription: { type: String, required: true },
  sectionsApplied: [{ type: String, required: true }],
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'INVALID'],
    default: 'PENDING',
    index: true
  }
}, { _id: false });

export const CasteDiscriminationApplication = Application.discriminator<ICasteDiscriminationApplication>('ATROCITY_RELIEF', new Schema({
  firDetails: {
    type: FirDetailsSchema,
    required: true
  }
}));