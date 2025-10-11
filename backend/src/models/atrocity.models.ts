import mongoose, { Document, Schema } from 'mongoose';

// FIR Details interface
export interface FirDetails {
  firNumber: string;
  policeStation: string;
  district: string;
  dateOfIncident: Date;
  incidentDescription: string;
  sectionsApplied: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'INVALID';
}

// Atrocity Relief Application interface
export interface AtrocityApplication extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: string;
  beneficiaryId: mongoose.Types.ObjectId;
  firDetails: FirDetails;
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

// FIR Details Schema
const FirDetailsSchema = new Schema<FirDetails>({
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

// Atrocity Application Schema
const AtrocityApplicationSchema = new Schema<AtrocityApplication>({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: /^ATR_\d{4}_\d{6}$/
  },
  beneficiaryId: {
    type: Schema.Types.ObjectId,
    ref: 'BeneficiaryProfile',
    required: true,
    index: true
  },
  firDetails: {
    type: FirDetailsSchema,
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
  applicationReason: { type: String, default: 'Compensation for atrocity incident' }
}, {
  timestamps: true
});

// Indexes for efficient querying
AtrocityApplicationSchema.index({ applicationStatus: 1, submittedAt: -1 });
AtrocityApplicationSchema.index({ assignedOfficer: 1, applicationStatus: 1 });
AtrocityApplicationSchema.index({ beneficiaryId: 1, createdAt: -1 });
AtrocityApplicationSchema.index({ 'firDetails.firNumber': 1 });
AtrocityApplicationSchema.index({ 'firDetails.district': 1 });

// Pre-save middleware to generate applicationId
AtrocityApplicationSchema.pre('save', function(next) {
  if (!this.applicationId && this.isNew) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    this.applicationId = `ATR_${year}_${random}`;
  }
  next();
});

// Static methods
AtrocityApplicationSchema.statics.findByBeneficiary = function(beneficiaryId: mongoose.Types.ObjectId) {
  return this.find({ beneficiaryId }).sort({ createdAt: -1 });
};

AtrocityApplicationSchema.statics.findPendingByOfficer = function(officerId: mongoose.Types.ObjectId) {
  return this.find({ 
    assignedOfficer: officerId, 
    applicationStatus: { $in: ['SUBMITTED', 'UNDER_REVIEW'] }
  }).sort({ submittedAt: 1 });
};

export const AtrocityApplication = mongoose.model<AtrocityApplication>('AtrocityApplication', AtrocityApplicationSchema);