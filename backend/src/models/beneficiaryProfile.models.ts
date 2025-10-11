import mongoose, { Document, Schema } from 'mongoose';

// Address interface
export interface Address {
  careOf: string;
  street: string;
  village: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
}

// Aadhaar data interface
export interface AadhaarData {
  uid: string; // Masked for security
  fullName: string;
  dob: Date;
  gender: 'Male' | 'Female' | 'Other';
  address: Address;
  photoUrl?: string;
}

// Caste details interface
export interface CasteDetails {
  caste: string;
  category: 'SC' | 'ST';
  certificateNumber?: string;
  issuingAuthority?: string;
  issueDate?: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Beneficiary Profile interface
export interface BeneficiaryProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Reference to Users collection
  aadhaarData: AadhaarData;
  casteDetails: CasteDetails;
  applications: mongoose.Types.ObjectId[]; // Array of application IDs
  profileStatus: 'INCOMPLETE' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

// Address Schema
const AddressSchema = new Schema<Address>({
  careOf: { type: String, required: true },
  street: { type: String, required: true },
  village: { type: String, required: true },
  postOffice: {type: String, required: true},
  district: { type: String, required: true, index: true },
  state: { type: String, required: true, index: true },
  pincode: { type: String, required: true, match: /^\d{6}$/ },
  country: {type: String, required: true}
}, { _id: false });

// Aadhaar Data Schema
const AadhaarDataSchema = new Schema<AadhaarData>({
  uid: { type: String, required: true, match: /^XXXX-XXXX-\d{4}$/ }, // Masked format
  fullName: { type: String, required: true, index: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: AddressSchema, required: true },
  photoUrl: { type: String }
}, { _id: false });

// Caste Details Schema
const CasteDetailsSchema = new Schema<CasteDetails>({
  caste: { type: String, required: true, index: true },
  category: { type: String, enum: ['SC', 'ST'], required: true, index: true },
  certificateNumber: { type: String, sparse: true },
  issuingAuthority: { type: String },
  issueDate: { type: Date },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
    index: true
  }
}, { _id: false });

// Beneficiary Profile Schema
const BeneficiaryProfileSchema = new Schema<BeneficiaryProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  aadhaarData: {
    type: AadhaarDataSchema,
    required: true
  },
  casteDetails: {
    type: CasteDetailsSchema,
    required: true
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'Application'
  }],
  profileStatus: {
    type: String,
    enum: ['INCOMPLETE', 'SUBMITTED', 'VERIFIED', 'REJECTED'],
    default: 'INCOMPLETE',
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
BeneficiaryProfileSchema.index({ profileStatus: 1, createdAt: -1 });
BeneficiaryProfileSchema.index({ 'casteDetails.category': 1, 'casteDetails.verificationStatus': 1 });
export const BeneficiaryProfile = mongoose.model<BeneficiaryProfile>('BeneficiaryProfile', BeneficiaryProfileSchema);