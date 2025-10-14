import type { User } from '../types';
import api from '../utils/baseApi';

interface AadhaarRegistrationInput {
  aadhaarNumber: string;
  mobileNumber: string;
}

interface OTPVerifyInput {
  aadhaarNumber: string;
  mobileNumber: string;
  otp: string;
}

interface CasteVerificationInput {
  sessionToken: string;
  aadhaarNumber: string;
}

interface AadhaarData {
  name?: string;
  dob?: string;
  gender?: string;
  photoUrl?: string;
}

interface CasteDetailsPayload {
  caste?: string;
  category?: string;
  verificationStatus?: string;
  verificationMethod?: string;
}

interface FinalRegistrationInput {
  sessionToken: string;
  aadhaarNumber: string;
  mobileNumber: string;
  aadhaarData: AadhaarData;
  casteDetails: CasteDetailsPayload;
  documentUrl?: string;
}

interface LoginOTPInput {
  aadhaarNumber: string;
  mobileNumber: string;
}

interface LoginVerifyInput {
  aadhaarNumber: string;
  mobileNumber: string;
  otp: string;
}

export const authService = {
  // Step 1: Initiate Aadhaar registration (send OTP)
  async initiateRegistration(data: AadhaarRegistrationInput) {
    const response = await api.post('/users/initiate-registration', data);
    return response.data.data;
  },

  // Step 2: Verify OTP and get Aadhaar data
  async verifyOTPAndGetAadhaarData(data: OTPVerifyInput) {
    const response = await api.post('/users/verify-otp-get-aadhaar', data);
    return response.data.data;
  },

  // Step 3: Fetch caste certificate from DigiLocker
  async fetchCasteFromDigiLocker(data: CasteVerificationInput) {
    const response = await api.post('/users/fetch-caste-digilocker', data);
    return response.data.data;
  },

  // Step 4: Complete registration (final step)
  async completeRegistration(data: FinalRegistrationInput) {
    console.log("Completing registration with data:", data);
    const response = await api.post('/users/complete-registration', data);
    return response.data.data;
  },

  // Resend OTP (for registration or login)
  async resendOTP(mobileNumber: string, purpose: 'registration' | 'login') {
    console.log(`Resending OTP for ${purpose} to mobile number:`, mobileNumber);
    const response = await api.post('/users/resend-otp', { mobileNumber, purpose });
    return response.data.data;
  },

  // Send OTP for login
  async sendLoginOTP(data: LoginOTPInput) {
    const response = await api.post('/users/send-login-otp', data);
    return response.data.data;
  },

  // Login beneficiary (verify OTP)
  async loginBeneficiary(data: LoginVerifyInput) {
    const response = await api.post('/users/login', data);
    return response.data.data;
  },

  // Backwards-compatible login(email, password) used by existing AuthContext
  async login(aadhaarNumber: string, mobileNumber: string, otp?: string) {
    // If caller has OTP include it.
    const payload: { aadhaarNumber: string; mobileNumber: string; otp?: string } = { aadhaarNumber, mobileNumber };
    if (typeof otp === 'string') payload.otp = otp;
    const response = await api.post('/users/login', payload);
    return response.data.data;
  },

  // Get current user profile (protected)
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data.data;
  },
};
