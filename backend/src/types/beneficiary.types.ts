import mongoose, { Document } from 'mongoose';

// Address interface
export interface IAddress {
  careOf: string;
  street: string;
  village: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
}

// Aadhaar data interface
export interface IAadhaarData {
  uid: string; // Masked for security
  fullName: string;
  dob: Date;
  gender: 'Male' | 'Female' | 'Other';
  fatherName?: string;
  motherName?: string;
  email?: string;
  district: string;
  state: string;
  pincode: string;
  address: IAddress;
  photoUrl?: string;
}

// Caste details interface
export interface ICasteDetails {
  caste: string;
  category: 'SC' | 'ST';
  certificateNumber?: string;
  issuingAuthority?: string;
  issueDate?: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Beneficiary Profile interface
export interface IBeneficiaryProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Reference to Users collection
  aadhaarData: IAadhaarData;
  casteDetails: ICasteDetails;
  bankDetails?: BankDetails;
  applications: mongoose.Types.ObjectId[]; // Array of application IDs
  profileStatus: 'INCOMPLETE' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

// Bank Details interface
export interface BankDetails {
  accountHolder: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifsc: string;
}
