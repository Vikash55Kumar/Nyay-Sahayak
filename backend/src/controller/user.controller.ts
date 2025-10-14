import { Request, Response } from 'express';
import { asyncHandler } from '../utility/asyncHandler';
import { ApiError } from '../utility/ApiError';
import ApiResponse from '../utility/ApiResponse';
import { generateToken, verifyToken } from '../utility/jwt';
import { User } from '../models/user.models';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { MockDataService } from '../services/mockData.service';
import { NotificationService } from '../services/notification.service';
import { OTPService } from '../services/otp.service';
import { AuditService } from '../services/audit.service';

// Types
interface InitiateRegistrationInput {
    aadhaarNumber: string;
    mobileNumber: string;
}

interface VerifyOTPInput {
    aadhaarNumber: string;
    mobileNumber: string;
    otp: string;
}

interface CompleteCasteVerificationInput {
    userId: string;
    verificationMethod: 'DIGILOCKER' | 'MANUAL_UPLOAD';
    casteData?: {
        caste: string;
        category: 'SC' | 'ST';
        certificateNumber?: string;
        issuingAuthority?: string;
        issueDate?: string;
    };
    documentUrl?: string; // For manual upload
}

interface AuthRequest extends Request {
    user?: {
        id: string;
        aadhaarNumber: string;
        role: string;
    };
}

// Step 1: Initiate Registration - Send OTP
const initiateRegistration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { aadhaarNumber, mobileNumber }: InitiateRegistrationInput = req.body;
    console.log("Initiating registration with data:", { aadhaarNumber, mobileNumber });
    // Validation
    if (!aadhaarNumber || !mobileNumber) {
        throw new ApiError(400, "Aadhaar number and mobile number are required.");
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new ApiError(400, "Invalid Aadhaar number format.");
    }

    // Validate mobile format (Indian mobile number - 10 digits starting with 6,7,8,9)
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
        throw new ApiError(400, "Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ aadhaarNumber });
    if (existingUser) {
        throw new ApiError(409, "User with this Aadhaar number already exists.");
    }

    // Check if Aadhaar number exists and mobile is linked (Real-world validation)
    const aadhaarValidation = MockDataService.verifyAadhaarAndMobile(aadhaarNumber, mobileNumber);
    if (!aadhaarValidation.success) {
        if (aadhaarValidation.message === "Aadhaar number not found") {
            throw new ApiError(404, "Aadhaar number not found in government database.");
        } else if (aadhaarValidation.message === "Mobile number does not match with Aadhaar records") {
            throw new ApiError(400, "Mobile number is not linked with this Aadhaar number.");
        }
        throw new ApiError(400, aadhaarValidation.message);
    }

    // Generate and send OTP
    const otp = OTPService.generateAndStore('registration', mobileNumber);
    
    // Queue OTP SMS
    await NotificationService.sendOTP(mobileNumber, otp, 'registration');

    res.status(200).json(
        new ApiResponse(200, {}, "Aadhar OTP sent to registered mobile number")
    );
});

// Step 2: Verify OTP and Store Aadhaar Data (Temporary Session)
const verifyOTPAndGetAadhaarData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { aadhaarNumber, mobileNumber, otp }: VerifyOTPInput = req.body;

    // Validation
    if (!aadhaarNumber || !mobileNumber || !otp) {
        throw new ApiError(400, "Aadhaar number, mobile number, and OTP are required.");
    }

    // Verify OTP
    const otpResult = OTPService.verify('registration', mobileNumber, otp);
    
    if (!otpResult.success) {
        throw new ApiError(401, otpResult.message);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ aadhaarNumber });
    if (existingUser) {
        throw new ApiError(409, "User with this Aadhaar number already exists.");
    }

    // Get Aadhaar data from mock service
    const aadhaarResponse = MockDataService.getAadhaarData(aadhaarNumber);
    if (!aadhaarResponse || aadhaarResponse.code !== 200) {
        throw new ApiError(404, "Unable to fetch Aadhaar details.");
    }

    const aadhaarData = aadhaarResponse.data;

    // Generate temporary session token for next steps
    const tempToken = generateToken({
        id: 'temp_session',
        aadhaarNumber: aadhaarNumber,
        role: 'TEMP_REGISTRATION'
    });

    // Store session data in memory/cache (for demo, we'll include in response)
    const sessionData = {
        aadhaarData,
        mobileNumber,
        step: 'AADHAAR_VERIFIED',
        tempToken
    };

    res.status(200).json(
        new ApiResponse(200, {
            sessionToken: tempToken,
            aadhaarData: {
                fullName: aadhaarData.name,
                dob: aadhaarData.dateOfBirth,
                gender: aadhaarData.gender === 'M' ? 'Male' : aadhaarData.gender === 'F' ? 'Female' : 'Other',
                address: {
                    careOf: aadhaarData.address.careOf || 'Not Available',
                    street: aadhaarData.address.house || aadhaarData.address.street || 'Not Available',
                    village: aadhaarData.address.locality || aadhaarData.address.village || 'Not Available',
                    postOffice: aadhaarData.address.postOffice || 'Not Available',
                    district: aadhaarData.address.district || 'Not Available',
                    state: aadhaarData.address.state || 'Not Available',
                    pincode: aadhaarData.address.pin || '000000',
                    country: aadhaarData.address.country || 'India'
                },
                photoUrl: aadhaarData.photo
            },
        }, "Aadhaar verification successful. Please complete caste verification to proceed.")
    );
});

// Step 3: Fetch Caste Certificate from DigiLocker (Temporary Session)
const fetchCasteFromDigiLocker = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sessionToken, aadhaarNumber } = req.body;

    if (!sessionToken || !aadhaarNumber) {
        throw new ApiError(400, "Session token and Aadhaar number are required.");
    }

    // Validate session token (decode JWT and check role)
    try {
        const decoded = verifyToken(sessionToken);
        if (decoded.role !== 'TEMP_REGISTRATION') {
            throw new ApiError(401, "Invalid session token - not a registration session.");
        }
        // Optionally verify aadhaar number matches
        if (decoded.aadhaarNumber !== aadhaarNumber) {
            throw new ApiError(401, "Session token doesn't match Aadhaar number.");
        }
    } catch (error) {
        throw new ApiError(401, "Invalid or expired session token.");
    }

    // Mock DigiLocker fetch (Simulating Rajasthan Government DigiLocker API)
    // NOTE: In production, this would be a real DigiLocker API call for Rajasthan state
    const casteData = MockDataService.getCasteCertificate(aadhaarNumber);

    if (!casteData.success || !casteData.data) {
        res.status(404).json(
            new ApiResponse(404, {
                digiLockerAvailable: false,
                registrationStatus: 'AADHAAR_VERIFIED',
                nextStep: "MANUAL_CASTE_UPLOAD",
                message: "Caste certificate not found in DigiLocker for Rajasthan state"
            }, "Caste certificate not available in DigiLocker. Please upload manually.")
        );
        return;
    }

    const document = casteData.data;
    
    // CRITICAL: DigiLocker validation - Only accept SC/ST for this scheme
    // In real implementation, this would validate against Rajasthan Revenue Department certificates
    if (!['SC', 'ST'].includes(document.category)) {
        res.status(400).json(
            new ApiResponse(400, {
                digiLockerAvailable: true,
                certificateFound: true,
                category: document.category,
                eligibilityStatus: 'NOT_ELIGIBLE',
                message: "Only SC/ST categories are eligible for this scheme"
            }, `Certificate found but category '${document.category}' is not eligible. Only SC/ST beneficiaries can register for this scheme.`)
        );
        return;
    }

    // TRUSTED SOURCE: DigiLocker certificate from Rajasthan Revenue Department
    // Auto-verify and proceed to final registration - Only store essential information
    const casteDetails = {
        caste: document.caste,
        category: document.category as 'SC' | 'ST',
        verificationStatus: 'VERIFIED', // DigiLocker documents are government-issued and pre-verified
        verificationMethod: 'DIGILOCKER'
    };

    res.status(200).json(
        new ApiResponse(200, {
            casteDetails,
            registrationStatus: 'CASTE_VERIFIED',
            nextStep: "COMPLETE_REGISTRATION",
            progress: {
                currentStep: 3,
                totalSteps: 3,
                stepName: "Complete Registration"
            },
            source: "DigiLocker - Rajasthan Revenue Department",
            verificationStatus: "AUTOMATIC_VERIFIED",
            eligibilityConfirmed: true
        }, `Caste certificate verified from DigiLocker. Category: ${document.category}. Ready to complete registration.`)
    );
});

// Step 4: Complete Final Registration (Create User and Profile with Caste Verification)
const completeRegistration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sessionToken, aadhaarNumber, mobileNumber, aadhaarData, personalDetails, casteDetails, documentUrl, bankDetails } = req.body;

    if (!sessionToken || !aadhaarNumber || !mobileNumber || !aadhaarData) {
        throw new ApiError(400, "Session token, Aadhaar number, mobile number, and Aadhaar data are required.");
    }

    // Check if this is DigiLocker verification (with casteDetails) or manual upload (with casteDetails + documentUrl)
    const isDigiLockerVerification = casteDetails && casteDetails.verificationMethod === 'DIGILOCKER';
    const isManualUpload = casteDetails && casteDetails.verificationMethod === 'MANUAL_UPLOAD' && documentUrl;

    if (!isDigiLockerVerification && !isManualUpload) {
        throw new ApiError(400, "Either DigiLocker caste details or manual upload caste details with document URL is required.");
    }

    // Validate session token (decode JWT and check role)
    try {
        const decoded = verifyToken(sessionToken);
        if (decoded.role !== 'TEMP_REGISTRATION') {
            throw new ApiError(401, "Invalid session token - not a registration session.");
        }
        // Optionally verify aadhaar number matches
        if (decoded.aadhaarNumber !== aadhaarNumber) {
            throw new ApiError(401, "Session token doesn't match Aadhaar number.");
        }
    } catch (error) {
        throw new ApiError(401, "Invalid or expired session token.");
    }

    // Final check - ensure user doesn't exist
    const existingUser = await User.findOne({ aadhaarNumber });
    if (existingUser) {
        throw new ApiError(409, "User with this Aadhaar number already exists.");
    }

    // If bankDetails details are provided, perform basic validation
    if (bankDetails) {
        // Expecting bankDetails to contain accountHolder, accountNumber, confirmAccountNumber, bankDetailsName, branchName, ifsc
        if (bankDetails.accountNumber && bankDetails.confirmAccountNumber && bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
            throw new ApiError(400, "Bank account numbers do not match. Please verify account number and confirmation.");
        }
    }

    let user: any;
    let beneficiaryProfile: any;
    let isAutoVerified = false;
    let finalCasteDetails: any;

    // ATOMIC OPERATION START - Create User and Profile Together
    try {
        // Determine verification method and status
        if (isDigiLockerVerification) {
            // DigiLocker verification (already verified) - use provided caste details
            finalCasteDetails = casteDetails;
            isAutoVerified = casteDetails.verificationStatus === 'VERIFIED';
        } else {
            // Manual upload - use provided caste details but mark as pending verification
            finalCasteDetails = {
                caste: casteDetails.caste,
                category: casteDetails.category,
                verificationStatus: 'PENDING', // Manual uploads require authority verification
                verificationMethod: 'MANUAL_UPLOAD'
            };
            isAutoVerified = false;
        }

        const accountStatus = isAutoVerified ? 'VERIFIED' : 'PENDING_VERIFICATION';

        // Create User with appropriate verification status
        user = new User({
            aadhaarNumber,
            mobileNumber,
            role: 'BENEFICIARY',
            isVerified: isAutoVerified // Only auto-verify for DigiLocker certificates
        });

        await user.save();
        console.log('✅ User created successfully:', user._id, '| Status:', accountStatus);

        // Create Beneficiary Profile with appropriate status. Prefer manual personalDetails when provided.
        beneficiaryProfile = new BeneficiaryProfile({
            userId: user._id,
            aadhaarData: {
                uid: MockDataService.maskAadhaar(aadhaarNumber),
                fullName: aadhaarData.fullName,
                dob: MockDataService.parseDate(aadhaarData.dob),
                gender: aadhaarData.gender,
                fatherName: (personalDetails && personalDetails.fatherName) ? personalDetails.fatherName : aadhaarData.fatherName,
                motherName: (personalDetails && personalDetails.motherName) ? personalDetails.motherName : aadhaarData.motherName,
                email: (personalDetails && personalDetails.email) ? personalDetails.email : aadhaarData.email,
                address: aadhaarData.address,
                photoUrl: aadhaarData.photoUrl
            },
            casteDetails: {
                caste: finalCasteDetails.caste,
                category: finalCasteDetails.category,
                certificateNumber: finalCasteDetails.certificateNumber,
                issuingAuthority: finalCasteDetails.issuingAuthority,
                issueDate: finalCasteDetails.issueDate,
                verificationStatus: finalCasteDetails.verificationStatus
            },
            bankDetails: bankDetails ? {
                accountHolder: bankDetails.accountHolder,
                bankName: bankDetails.bankName,
                branchName: bankDetails.branchName,
                accountNumber: bankDetails.accountNumber,
                ifsc: bankDetails.ifsc
            } : undefined,
            profileStatus: isAutoVerified ? 'VERIFIED' : 'SUBMITTED' // SUBMITTED = pending authority verification
        });

        await beneficiaryProfile.save();
        console.log('✅ Beneficiary profile created successfully:', beneficiaryProfile._id, '| Profile Status:', beneficiaryProfile.profileStatus);

    } catch (error) {
        console.error('❌ Registration failed:', error);
        
        // ROLLBACK: Delete user if profile creation failed
        if (user && user._id) {
            try {
                await User.deleteOne({ _id: user._id });
                console.log('🔄 Rolled back user creation due to profile failure');
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError);
            }
        }
        
        throw new ApiError(500, "Registration failed. Please try again.");
    }

    // Log registration - Only after successful creation
    try {
        await AuditService.logUserRegistration(user._id, req, {
            aadhaarMasked: MockDataService.maskAadhaar(aadhaarNumber),
            registrationMethod: 'AADHAAR_OTP',
            casteVerificationMethod: finalCasteDetails.verificationMethod
        });

        await AuditService.logProfileCreation(user._id, beneficiaryProfile._id, req, {
            aadhaarDataSource: 'MOCK_EKYC',
            casteVerificationMethod: finalCasteDetails.verificationMethod
        });
    } catch (auditError) {
        console.warn('⚠️ Audit logging failed (non-critical):', auditError);
        // Don't rollback for audit failures
    }

    // Generate final JWT token
    const token = generateToken({
        id: user._id.toString(),
        aadhaarNumber: user.aadhaarNumber,
        role: user.role
    });

    // Send registration success notification
    try {
        await NotificationService.sendRegistrationSuccess(mobileNumber, aadhaarData.fullName);
        
        if (isAutoVerified) {
            await NotificationService.sendProfileVerification(mobileNumber, 'VERIFIED');
        } else {
            await NotificationService.sendProfileVerification(mobileNumber, 'PENDING');
        }
    } catch (notificationError) {
        console.warn('⚠️ Notification failed (non-critical):', notificationError);
        // Don't rollback for notification failures
    }

    res.status(201).json(
        new ApiResponse(201, {
            user: {
                id: user._id,
                aadhaarNumber: MockDataService.maskAadhaar(user.aadhaarNumber),
                mobileNumber: user.mobileNumber,
                role: user.role,
                isVerified: user.isVerified
            },
            profile: {
                id: beneficiaryProfile._id,
                fullName: beneficiaryProfile.aadhaarData.fullName,
                address: beneficiaryProfile.aadhaarData.address,
                casteDetails: beneficiaryProfile.casteDetails,
                bankDetails: beneficiaryProfile.bankDetails || null,
                profileStatus: beneficiaryProfile.profileStatus
            },
            token,
            registrationStatus: 'COMPLETED',
            accountStatus: user.isVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
            verificationMethod: isDigiLockerVerification ? 'DIGILOCKER' : 'MANUAL_UPLOAD',
            message: user.isVerified 
                ? "Registration completed successfully! Your account is verified and active. You can now apply for schemes." 
                : "Registration completed successfully! Your document is pending verification by Rajasthan authorities. You will be notified once verification is complete."
        }, user.isVerified 
            ? "Registration completed with auto-verification via DigiLocker!" 
            : "Registration completed - pending authority verification!")
    );
});

// Login for beneficiaries (Aadhaar + OTP)
const loginBeneficiary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { aadhaarNumber, mobileNumber, otp } = req.body;

    if (!aadhaarNumber || !mobileNumber || !otp) {
        throw new ApiError(400, "Aadhaar number, mobile number, and OTP are required.");
    }

    // Validate formats
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new ApiError(400, "Invalid Aadhaar number format.");
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
        throw new ApiError(400, "Invalid mobile number format.");
    }

    // Verify OTP
    const otpResult = OTPService.verify('login', mobileNumber, otp);
    
    if (!otpResult.success) {
        throw new ApiError(401, otpResult.message);
    }

    // Find user
    const user = await User.findOne({ aadhaarNumber, mobileNumber });
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get profile
    const profile = await BeneficiaryProfile.findOne({ userId: user._id }).populate('applications');

    // Log login
    await AuditService.logLogin(user._id, req);

    // Generate token
    const token = generateToken({
        id: user._id.toString(),
        aadhaarNumber: user.aadhaarNumber,
        role: user.role
    });

    res.status(200).json(
        new ApiResponse(200, {
            user: {
                id: user._id,
                aadhaarNumber: MockDataService.maskAadhaar(user.aadhaarNumber),
                mobileNumber: user.mobileNumber,
                role: user.role,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            },
            profile: profile ? {
                id: profile._id,
                fullName: profile.aadhaarData.fullName,
                profileStatus: profile.profileStatus,
                casteDetails: profile.casteDetails,
                applications: profile.applications
            } : null,
            token
        }, "Login successful")
    );
});

// Send OTP for login
const sendLoginOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { aadhaarNumber, mobileNumber } = req.body;

    if (!aadhaarNumber || !mobileNumber) {
        throw new ApiError(400, "Aadhaar number and mobile number are required.");
    }

    // Validate formats first
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new ApiError(400, "Invalid Aadhaar number format.");
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
        throw new ApiError(400, "Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.");
    }

    // Check if user exists with exact Aadhaar and mobile combination
    const user = await User.findOne({ aadhaarNumber, mobileNumber });
    if (!user) {
        // Additional validation: Check if Aadhaar exists but mobile doesn't match
        const userWithAadhaar = await User.findOne({ aadhaarNumber });
        if (userWithAadhaar) {
            throw new ApiError(400, "Mobile number does not match with registered Aadhaar number.");
        }
        throw new ApiError(404, "User not found with provided Aadhaar and mobile number combination.");
    }

    // Generate and send OTP
    const otp = OTPService.generateAndStore('login', mobileNumber);
    
    await NotificationService.sendOTP(mobileNumber, otp, 'login');

    res.status(200).json(
        new ApiResponse(200, {}, "Login OTP sent successfully")
    );
});

// Resend OTP for registration or login
const resendOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { mobileNumber, purpose } = req.body; // purpose: 'registration' or 'login'

    if (!mobileNumber || !purpose) {
        throw new ApiError(400, "Mobile number and purpose are required.");
    }

    if (!['registration', 'login'].includes(purpose)) {
        throw new ApiError(400, "Purpose must be 'registration' or 'login'.");
    }

    // For login, check if user exists
    if (purpose === 'login') {
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            throw new ApiError(404, "User not found with this mobile number.");
        }
    }

    // Try to resend OTP
    const resendResult = OTPService.resendOTP(purpose, mobileNumber);
    
    if (!resendResult.success) {
        throw new ApiError(429, resendResult.message);
    }

    // Send new OTP via SMS
    await NotificationService.sendOTP(mobileNumber, resendResult.data.otp!, purpose);

    res.status(200).json(
        new ApiResponse(200, {}, "OTP resent successfully")
    );
});

// Get user profile
const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const profile = await BeneficiaryProfile.findOne({ userId }).populate('applications');

    res.status(200).json(
        new ApiResponse(200, {
            user: {
                id: user._id,
                aadhaarNumber: MockDataService.maskAadhaar(user.aadhaarNumber),
                mobileNumber: user.mobileNumber,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            profile: profile ? {
                id: profile._id,
                fullName: profile.aadhaarData.fullName,
                fatherName: profile.aadhaarData.fatherName,
                motherName: profile.aadhaarData.motherName,
                email: profile.aadhaarData.email,
                dob: profile.aadhaarData.dob,
                gender: profile.aadhaarData.gender,
                address: profile.aadhaarData.address,
                casteDetails: profile.casteDetails,
                bankDetails: profile.bankDetails,
                profileStatus: profile.profileStatus,
                applications: profile.applications,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
            } : null
        }, "User profile retrieved successfully")
    );
});

export {
    initiateRegistration,
    verifyOTPAndGetAadhaarData,
    fetchCasteFromDigiLocker,
    completeRegistration,
    sendLoginOTP,
    resendOTP,
    loginBeneficiary,
    getUserProfile
};