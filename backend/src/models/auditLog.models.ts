import mongoose, { Schema } from 'mongoose';
import { IAuditLog, ITargetResource } from '../types/audit.types';

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
    index: { sparse: true }
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
        // Comprehensive IP validation (IPv4 and IPv6)
        
        // IPv4 validation with proper range checking
        const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const ipv4Match = v.match(ipv4Regex);
        if (ipv4Match) {
          const octets = ipv4Match.slice(1, 5).map(Number);
          return octets.every(octet => octet >= 0 && octet <= 255);
        }
        
        // IPv6 validation (including compressed formats like ::1, ::ffff:192.0.2.1)
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^([0-9a-fA-F]{1,4}:)*:([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*$|^::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
        
        // Also handle IPv4-mapped IPv6 addresses like ::ffff:192.0.2.1
        const ipv4MappedRegex = /^::ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/i;
        const ipv4MappedMatch = v.match(ipv4MappedRegex);
        if (ipv4MappedMatch) {
          const octets = ipv4MappedMatch.slice(1, 5).map(Number);
          return octets.every(octet => octet >= 0 && octet <= 255);
        }
        
        return ipv6Regex.test(v);
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