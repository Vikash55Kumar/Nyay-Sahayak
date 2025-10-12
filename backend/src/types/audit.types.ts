import mongoose, { Document } from 'mongoose';

// Target Resource interface
export interface ITargetResource {
  type: 'APPLICATION' | 'PAYMENT' | 'USER' | 'BENEFICIARY_PROFILE';
  id: mongoose.Types.ObjectId;
}

// Audit Log Interface
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