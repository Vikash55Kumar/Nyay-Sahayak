import mongoose, { Document, Schema } from 'mongoose';

// Marriage Details interface
export interface MarriageDetails {
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

// Marriage Application interface
export interface MarriageApplication extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: string;
  beneficiaryId: mongoose.Types.ObjectId;
  marriageDetails: MarriageDetails;
  documentsUploaded: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  }>;
  applicationStatus: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAYMENT_INITIATED' | 'COMPLETED';
  assignedOfficer?: mongoose.Types.ObjectId;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAmount?: number;
  rejectionReason?: string;
  applicationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document Upload Schema
const DocumentUploadSchema = new Schema({
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

// Marriage Details Schema
const MarriageDetailsSchema = new Schema<MarriageDetails>({
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

// Marriage Application Schema
const MarriageApplicationSchema = new Schema<MarriageApplication>({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: /^MAR_\d{4}_\d{6}$/
  },
  beneficiaryId: {
    type: Schema.Types.ObjectId,
    ref: 'BeneficiaryProfile',
    required: true,
    index: true
  },
  marriageDetails: {
    type: MarriageDetailsSchema,
    required: true
  },
  documentsUploaded: [DocumentUploadSchema],
  applicationStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAYMENT_INITIATED', 'COMPLETED'],
    default: 'DRAFT',
    index: true
  },
  assignedOfficer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true
  },
  submittedAt: { type: Date, index: true },
  reviewedAt: { type: Date },
  approvedAmount: { type: Number, min: 0 },
  rejectionReason: { type: String },
  applicationReason: { type: String, default: 'Financial assistance for intercaste marriage' }
}, {
  timestamps: true
});

// Indexes for efficient querying
MarriageApplicationSchema.index({ applicationStatus: 1, submittedAt: -1 });
MarriageApplicationSchema.index({ assignedOfficer: 1, applicationStatus: 1 });
MarriageApplicationSchema.index({ beneficiaryId: 1, createdAt: -1 });
MarriageApplicationSchema.index({ 'marriageDetails.marriageRegistrationId': 1 });

// Pre-save middleware to generate applicationId
MarriageApplicationSchema.pre('save', function(next) {
  if (!this.applicationId && this.isNew) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    this.applicationId = `MAR_${year}_${random}`;
  }
  next();
});

// Static methods
MarriageApplicationSchema.statics.findByBeneficiary = function(beneficiaryId: mongoose.Types.ObjectId) {
  return this.find({ beneficiaryId }).sort({ createdAt: -1 });
};

MarriageApplicationSchema.statics.findPendingByOfficer = function(officerId: mongoose.Types.ObjectId) {
  return this.find({ 
    assignedOfficer: officerId, 
    applicationStatus: { $in: ['SUBMITTED', 'UNDER_REVIEW'] }
  }).sort({ submittedAt: 1 });
};

export const MarriageApplication = mongoose.model<MarriageApplication>('MarriageApplication', MarriageApplicationSchema);