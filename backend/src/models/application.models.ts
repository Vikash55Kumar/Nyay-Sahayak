import mongoose, { Document, Schema } from 'mongoose';

// Base Application interface for common functionality
export interface BaseApplication extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

// Document Upload interface
export interface DocumentUpload {
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Generic Application interface for backward compatibility
export interface Application extends BaseApplication {
  applicationData?: {
    firDetails?: any;
    marriageDetails?: any;
  };
  documentsUploaded?: DocumentUpload[];
}

// Base Application Schema (for common queries across all application types)
const BaseApplicationSchema = new Schema<BaseApplication>({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  beneficiaryId: {
    type: Schema.Types.ObjectId,
    ref: 'BeneficiaryProfile',
    required: true,
    index: true
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
  applicationReason: { type: String }
}, {
  timestamps: true,
  discriminatorKey: 'applicationType'
});

// Indexes for efficient querying across all application types
BaseApplicationSchema.index({ applicationStatus: 1, submittedAt: -1 });
BaseApplicationSchema.index({ assignedOfficer: 1, applicationStatus: 1 });
BaseApplicationSchema.index({ beneficiaryId: 1, createdAt: -1 });
BaseApplicationSchema.index({ applicationType: 1, applicationStatus: 1 });

// Static methods for cross-application queries
BaseApplicationSchema.statics.findAllByBeneficiary = function(beneficiaryId: mongoose.Types.ObjectId) {
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

export const Application = mongoose.model<Application>('Application', BaseApplicationSchema);