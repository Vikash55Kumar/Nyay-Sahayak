import { ApiError } from "../utility/ApiError";
import ApiResponse from "../utility/ApiResponse";

export class OTPService {
  private static otpStorage: Map<string, { 
    otp: string; 
    expires: number; 
    purpose: string;
    mobileNumber: string;
    attempts: number;
    createdAt: number;
  }> = new Map();

  private static readonly MAX_ATTEMPTS = 3;
  private static readonly OTP_VALIDITY = 10 * 60 * 1000;

  static generateAndStore(purpose: string, mobileNumber: string): string {
    // Create unique key: purpose:mobileNumber
    const key = `${purpose}:${mobileNumber}`;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expires = now + this.OTP_VALIDITY;

    // Clear any existing OTP for the same purpose and mobile
    if (this.otpStorage.has(key)) {
      this.otpStorage.delete(key);
    }

    // Store OTP with metadata
    this.otpStorage.set(key, {
      otp,
      expires,
      purpose,
      mobileNumber,
      attempts: 0,
      createdAt: now
    });
    
    // Auto cleanup after expiry
    setTimeout(() => {
      this.otpStorage.delete(key);
    }, this.OTP_VALIDITY);

    console.log(`🔐 OTP generated for ${purpose}:${mobileNumber} - ${otp}`);
    return otp;
  }

  // Verify OTP
  static verify(purpose: string, mobileNumber: string, inputOtp: string): ApiResponse<{ attemptsLeft?: number }> {
    const key = `${purpose}:${mobileNumber}`;
    const stored = this.otpStorage.get(key);
    
    if (!stored) {
      throw new ApiError(404, 'OTP not found or expired. Please request a new OTP.');
    }

    // Check if OTP has expired
    if (Date.now() > stored.expires) {
      this.otpStorage.delete(key);
      throw new ApiError(410, 'OTP has expired. Please request a new OTP.');
    }

    // Increment attempt count
    stored.attempts += 1;

    // Check if maximum attempts exceeded
    if (stored.attempts > this.MAX_ATTEMPTS) {
      this.otpStorage.delete(key);
      throw new ApiError(429, 'Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Check OTP match
    if (stored.otp !== inputOtp) {
      const attemptsLeft = this.MAX_ATTEMPTS - stored.attempts;
      return new ApiResponse(400, { attemptsLeft }, `Invalid OTP. ${attemptsLeft} attempts remaining.`);
    }

    // OTP verified successfully
    this.otpStorage.delete(key);
    console.log(`✅ OTP verified successfully for ${purpose}:${mobileNumber}`);
    
    return new ApiResponse(200, {}, 'OTP verified successfully.');
  }

  // Check if OTP exists for a specific purpose and mobile
  static hasActiveOTP(purpose: string, mobileNumber: string): boolean {
    const key = `${purpose}:${mobileNumber}`;
    const stored = this.otpStorage.get(key);
    
    if (!stored) return false;
    
    // Check if not expired
    return Date.now() <= stored.expires;
  }

   // Get remaining time for OTP in seconds
  static getRemainingTime(purpose: string, mobileNumber: string): number {
    const key = `${purpose}:${mobileNumber}`;
    const stored = this.otpStorage.get(key);
    
    if (!stored) return 0;
    
    const remaining = stored.expires - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

   // Resend OTP (only if enough time has passed)
  static resendOTP(purpose: string, mobileNumber: string): ApiResponse<{ otp?: string; waitTime?: number }> {
    const key = `${purpose}:${mobileNumber}`;
    const stored = this.otpStorage.get(key);
    
    if (stored) {
      // Check if minimum wait time has passed (30 seconds)
      const timeSinceCreation = Date.now() - stored.createdAt;
      const minWaitTime = 30 * 1000; // 30 seconds
      
      if (timeSinceCreation < minWaitTime) {
        const waitTime = Math.ceil((minWaitTime - timeSinceCreation) / 1000);
        return new ApiResponse(429, { waitTime }, `Please wait ${waitTime} seconds before requesting a new OTP.`);
      }
    }

    // Generate new OTP
    const newOTP = this.generateAndStore(purpose, mobileNumber);
    return new ApiResponse(200, { otp: newOTP }, 'New OTP sent successfully.');
  }

   // Clear expired OTPs
  static clearExpired(): void {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [key, value] of this.otpStorage.entries()) {
      if (now > value.expires) {
        this.otpStorage.delete(key);
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired OTPs`);
    }
  }
}