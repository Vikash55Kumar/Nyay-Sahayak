import mongoose, { Document, Schema } from 'mongoose';

// Target Resource interface
export interface ITargetResource {
  type: 'APPLICATION' | 'PAYMENT' | 'USER' | 'BENEFICIARY_PROFILE';
  id: mongoose.Types.ObjectId;
}

// Audit Log interface
export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: string; // 'APPLICATION_SUBMITTED', 'PAYMENT_APPROVED', etc.
  performedBy: mongoose.Types.ObjectId; // User ID
  targetResource: ITargetResource;
  blockchainTxHash?: string; // When logged to blockchain
  metadata?: Record<string, any>; // Additional context data
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
}

// Target Resource Schema
const TargetResourceSchema = new Schema<ITargetResource>({
  type: {
    type: String,
    enum: ['APPLICATION', 'PAYMENT', 'USER', 'BENEFICIARY_PROFILE'],
    required: true,
    index: true
  },
  id: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  }
}, { _id: false });

// Audit Log Schema
const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    index: true,
    enum: [
      'USER_REGISTERED',
      'USER_LOGIN',
      'PROFILE_CREATED',
      'PROFILE_VERIFIED',
      'APPLICATION_SUBMITTED',
      'APPLICATION_REVIEWED',
      'APPLICATION_APPROVED',
      'APPLICATION_REJECTED',
      'PAYMENT_INITIATED',
      'PAYMENT_COMPLETED',
      'PAYMENT_FAILED',
      'DOCUMENT_UPLOADED',
      'DOCUMENT_VERIFIED',
      'NOTIFICATION_SENT',
      'ROLE_ASSIGNED',
      'ROLE_REVOKED'
    ]
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetResource: {
    type: TargetResourceSchema,
    required: true
  },
  blockchainTxHash: {
    type: String,
    sparse: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only track creation time
});

// Compound indexes for efficient queries
AuditLogSchema.index({ performedBy: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ 'targetResource.type': 1, 'targetResource.id': 1, timestamp: -1 });
AuditLogSchema.index({ blockchainTxHash: 1 }, { sparse: true });

// TTL index - remove audit logs after 7 years (legal compliance)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 });

// Static method to create audit log
AuditLogSchema.statics.logAction = async function(
  action: string,
  performedBy: mongoose.Types.ObjectId,
  targetResource: ITargetResource,
  ipAddress: string,
  userAgent?: string,
  metadata?: Record<string, any>
) {
  return this.create({
    action,
    performedBy,
    targetResource,
    ipAddress,
    userAgent,
    metadata
  });
};

// Static method to get user activity
AuditLogSchema.statics.getUserActivity = async function(
  userId: mongoose.Types.ObjectId,
  limit: number = 50,
  skip: number = 0
) {
  return this.find({ performedBy: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('performedBy', 'aadhaarNumber role')
    .exec();
};

// Static method to get resource history
AuditLogSchema.statics.getResourceHistory = async function(
  resourceType: string,
  resourceId: mongoose.Types.ObjectId,
  limit: number = 20
) {
  return this.find({
    'targetResource.type': resourceType,
    'targetResource.id': resourceId
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'aadhaarNumber role')
    .exec();
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);