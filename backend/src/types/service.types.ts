import mongoose from 'mongoose';

// Service interfaces for mock data and tracking
export interface IApplicationTimeline {
  status: string;
  timestamp: Date;
  updatedBy?: mongoose.Types.ObjectId;
  comments?: string;
}

export interface IStatusUpdateRequest {
  applicationId: string;
  newStatus: string;
  comments?: string;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface ApplicationStatusUpdate {
  applicationId: string;
  oldStatus: string;
  newStatus: string;
  remarks?: string;
  officerId?: string;
  amount?: number;
  transactionId?: string;
}

// Mock service interfaces
export interface IFirVerificationResult {
  isValid: boolean;
  firNumber: string;
  policeStation: string;
  filedDate: Date;
  status: 'VERIFIED' | 'NOT_FOUND' | 'MISMATCH';
  verificationSource: 'CCTNS' | 'MANUAL';
  details?: string;
}

export interface ICaseStatusResult {
  caseNumber: string;
  status: 'PENDING' | 'UNDER_TRIAL' | 'DISPOSED' | 'DISMISSED';
  lastHearingDate?: Date;
  nextHearingDate?: Date;
  courtName: string;
  judgeName?: string;
  verificationSource: 'E_COURT' | 'MANUAL';
}