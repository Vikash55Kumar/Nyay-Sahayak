import mongoose, { Schema } from 'mongoose';
import { IBeneficiaryProfile, IAddress, IAadhaarData, ICasteDetails } from '../types/beneficiary.types';

// Address Schema
const AddressSchema = new Schema<IAddress>({
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
const AadhaarDataSchema = new Schema<IAadhaarData>({
  uid: { type: String, required: true, match: /^XXXX-XXXX-\d{4}$/ }, // Masked format
  fullName: { type: String, required: true, index: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: AddressSchema, required: true },
  photoUrl: { type: String }
}, { _id: false });

// Caste Details Schema
const CasteDetailsSchema = new Schema<ICasteDetails>({
  caste: { type: String, required: true, index: true },
  category: { type: String, enum: ['SC', 'ST'], required: true },
  certificateNumber: { type: String, sparse: true },
  issuingAuthority: { type: String },
  issueDate: { type: Date },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  }
}, { _id: false });

// Beneficiary Profile Schema
const BeneficiaryProfileSchema = new Schema<IBeneficiaryProfile>({
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
export const BeneficiaryProfile = mongoose.model<IBeneficiaryProfile>('BeneficiaryProfile', BeneficiaryProfileSchema);