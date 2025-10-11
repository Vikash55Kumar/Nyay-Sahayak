import mongoose, { Document, Schema } from 'mongoose';

// PFMS Response interface
export interface IPfmsResponse {
  statusCode: string;
  message: string;
  bankReference?: string;
}

// Payment Transaction interface - Simplified for DBT via Aadhaar
export interface IPaymentTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  beneficiaryId: mongoose.Types.ObjectId;
  beneficiaryAadhaar: string; // For DBT processing
  transactionId: string; // From PFMS (mock)
  amount: number;
  paymentStatus: 'INITIATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REVERSED';
  pfmsResponse?: IPfmsResponse;
  initiatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  retryCount: number;
  // Note: No bank details needed - DBT uses Aadhaar-linked bank account
  createdAt: Date;
  updatedAt: Date;
}

// PFMS Response Schema
const PfmsResponseSchema = new Schema<IPfmsResponse>({
  statusCode: { type: String, required: true },
  message: { type: String, required: true },
  bankReference: { type: String }
}, { _id: false });

// Payment Transaction Schema
const PaymentTransactionSchema = new Schema<IPaymentTransaction>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  beneficiaryId: {
    type: Schema.Types.ObjectId,
    ref: 'BeneficiaryProfile',
    required: true,
    index: true
  },
  beneficiaryAadhaar: {
    type: String,
    required: true,
    index: true // For DBT processing
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED'],
    default: 'INITIATED',
    index: true
  },
  pfmsResponse: { type: PfmsResponseSchema },
  initiatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: { type: Date },
  failureReason: { type: String },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
PaymentTransactionSchema.index({ paymentStatus: 1, initiatedAt: -1 });
PaymentTransactionSchema.index({ beneficiaryId: 1, paymentStatus: 1 });
PaymentTransactionSchema.index({ applicationId: 1, paymentStatus: 1 });

// Pre-save middleware to generate transactionId
PaymentTransactionSchema.pre('save', function(this: IPaymentTransaction, next: mongoose.CallbackError) {
  if (!this.transactionId && this.isNew) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.transactionId = `TXN_DBT_${timestamp}_${random}`;
  }
  next();
});

// Update completedAt when status changes to SUCCESS or FAILED
PaymentTransactionSchema.pre('save', function(this: IPaymentTransaction, next: mongoose.CallbackError) {
  if (this.isModified('paymentStatus') && 
      (this.paymentStatus === 'SUCCESS' || this.paymentStatus === 'FAILED' || this.paymentStatus === 'REVERSED') &&
      !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);