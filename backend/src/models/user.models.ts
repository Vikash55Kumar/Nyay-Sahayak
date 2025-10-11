import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface
export interface User extends Document {
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

// User Schema
const UserSchema = new Schema<User>({
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  mobileNumber: {
    type: String,
    required: true,
    index: true,
    match: /^[6-9]\d{9}$/
  },
  email: {
    type: String,
    sparse: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  role: {
    type: String,
    enum: ['BENEFICIARY', 'DISTRICT_OFFICER', 'STATE_ADMIN'],
    default: 'BENEFICIARY',
    index: true
  },
  blockchainAddress: {
    type: String,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  password: {
    type: String,
    required: function(this: User): boolean {
      return this.role !== 'BENEFICIARY';
    }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ role: 1, isVerified: 1 });
UserSchema.index({ mobileNumber: 1, role: 1 });

// Hash password before saving
UserSchema.pre('save', async function(this: User, next: (err?: CallbackError) => void) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(this: User, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<User>('User', UserSchema);