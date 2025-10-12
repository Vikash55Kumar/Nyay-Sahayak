import mongoose, { Document } from 'mongoose';

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