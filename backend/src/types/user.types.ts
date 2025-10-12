import mongoose, { Document } from 'mongoose';

// User interface - Updated to match current implementation
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  aadhaarNumber: string; // Encrypted/Hashed
  mobileNumber: string;
  email?: string;
  role: 'BENEFICIARY' | 'DISTRICT_OFFICER' | 'STATE_ADMIN';
  blockchainAddress?: string; // For role-based access control
  isVerified: boolean;
  password?: string; // For officers
  createdAt: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}