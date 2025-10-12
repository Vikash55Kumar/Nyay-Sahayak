import { Request, Response } from 'express';
import { MarriageApplication } from '../models/unified-application.models';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { MockDataService } from '../services/mockData.service';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notification.service';
import ApiResponse from '../utility/ApiResponse';
import { ApiError } from '../utility/ApiError';
import { asyncHandler } from '../utility/asyncHandler';
import { User } from '../models/user.models';

interface AuthRequest extends Request {
    user?: {
        id: string;
        aadhaarNumber: string;
        role: string;
    };
}

// Submit Intercaste Marriage Application
export const submitIntercasteMarriageApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Get authenticated user
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const {
    marriageRegistrationId,
    spouseName,
    spouseCategory,
    spouseAadhaarNumber,
    supportingDocuments,
    applicationReason
  } = req.body;

  // Validate required fields
  if (!marriageRegistrationId || !spouseName || !spouseCategory || !spouseAadhaarNumber) {
    throw new ApiError(400, "Marriage registration ID, spouse details are required");
  }

  // Validate required documents
  if (!supportingDocuments || supportingDocuments.length === 0) {
    throw new ApiError(400, "Supporting documents are required including marriage certificate, spouse's Aadhaar card, and spouse's caste certificate");
  }

  // Check if marriage certificate is uploaded
  const hasMarriageCertificate = supportingDocuments.some((doc: any) => 
    doc.type && doc.type.toLowerCase().includes('marriage')
  );
  
  if (!hasMarriageCertificate) {
    throw new ApiError(400, "Marriage certificate is mandatory for intercaste marriage application");
  }

  // Verify beneficiary exists
  const beneficiary = await BeneficiaryProfile.findOne({ userId })
    .populate('userId', 'aadhaarNumber mobileNumber');
  
  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary profile not found");
  }

  // Check if applicant is SC/ST (eligible for intercaste marriage scheme)
  if (!beneficiary.casteDetails?.category || !['SC', 'ST'].includes(beneficiary.casteDetails.category)) {
    throw new ApiError(400, "Only SC/ST applicants are eligible for intercaste marriage financial assistance");
  }

  // Check if spouse category is different from applicant (intercaste requirement)
  if (beneficiary.casteDetails.category === spouseCategory) {
    throw new ApiError(400, "This is not an intercaste marriage. Spouse must belong to a different caste category");
  }

  const beneficiaryUser = beneficiary.userId as any;

  // Generate unique application ID
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  const applicationId = `MAR_${year}_${random}`;
  
  // Create marriage application using the dedicated model
  const application = new MarriageApplication({
    applicationId,
    beneficiaryId: beneficiary._id,
    applicationType: 'INTERCASTE_MARRIAGE',
    marriageDetails: {
      marriageRegistrationId,
      marriageDate: new Date(), // Will be updated during authority verification
      registrationAuthority: "To be verified by authority",
      spouseDetails: {
        name: spouseName,
        category: spouseCategory,
        aadhaarNumber: spouseAadhaarNumber
      },
      verificationStatus: 'PENDING'
    },
    documentsUploaded: supportingDocuments ? supportingDocuments.map((doc: any) => ({
      documentType: doc.type || 'Supporting Document',
      fileName: doc.fileName || 'document.pdf',
      fileUrl: doc.url || doc.fileUrl,
      uploadedAt: new Date(),
      verificationStatus: 'PENDING'
    })) : [],
    applicationStatus: 'SUBMITTED',
    submittedAt: new Date(),
    applicationReason: applicationReason || 'Financial assistance for intercaste marriage'
  });

  await application.save();

  // Update beneficiary profile with new application
  beneficiary.applications.push(application._id);
  await beneficiary.save();

  // Log audit
  await AuditService.logApplicationSubmission(
    beneficiaryUser._id,
    application._id,
    req,
    {
      type: 'INTERCASTE_MARRIAGE',
      applicationNumber: application.applicationId,
      spouseName: spouseName,
      marriageRegistrationId: marriageRegistrationId,
      spouseCategory: spouseCategory,
      documentsCount: supportingDocuments?.length || 0
    }
  );

  // Send notification
  try {
    await (NotificationService as any).sendSMSImmediate(
      beneficiaryUser.mobileNumber,
      `आपका अंतर्जातीय विवाह आवेदन ${application.applicationId} सफलतापूर्वक जमा हुआ है। स्थिति जांचने के लिए पोर्टल देखें।`
    );
  } catch (error) {
    console.log('SMS notification failed:', error);
  }

  res.status(201).json(
    new ApiResponse(201, {
      applicationId: application.applicationId,
      status: 'SUBMITTED',
      message: 'Intercaste marriage application submitted successfully'
    }, "Application submitted successfully")
  );
});

// Verify Marriage Certificate (utility endpoint)
export const verifyMarriageCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { marriageRegistrationId } = req.body;
  
  if (!marriageRegistrationId) {
    throw new ApiError(400, "Marriage registration ID is required");
  }

  const marriageData = MockDataService.getMarriageCertificate(marriageRegistrationId);
  
  if (!marriageData.success) {
    throw new ApiError(404, marriageData.message);
  }

  res.status(200).json(
    new ApiResponse(200, marriageData.data, "Marriage certificate verified successfully")
  );
});

// Check if Marriage is Intercaste
export const checkIntercasteMarriage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

  const { marriageRegistrationId } = req.body;
  
  if (!marriageRegistrationId) {
    throw new ApiError(400, "Marriage registration ID is required");
  }

  // Get beneficiary details
  const beneficiary = await BeneficiaryProfile.findOne({ userId })
    .populate('userId', 'aadhaarNumber mobileNumber');
    
  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary profile not found");
  }

  const user = beneficiary.userId as any;

  const verification = MockDataService.verifyIntercasteMarriage(
    marriageRegistrationId,
    user.aadhaarNumber
  );

  res.status(200).json(
    new ApiResponse(200, verification, "Marriage verification completed")
  );
});

// Authority function to verify marriage details during review
export const verifyMarriageDetailsForAuthority = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId, marriageRegistrationId, applicantAadhaar } = req.body;
  
  if (!applicationId || !marriageRegistrationId || !applicantAadhaar) {
    throw new ApiError(400, "Application ID, marriage registration ID, and applicant Aadhaar are required");
  }

  // Find the application
  const application = await MarriageApplication.findOne({ applicationId });
  
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // Verify marriage certificate using mock service
  const marriageData = MockDataService.getMarriageCertificate(marriageRegistrationId);
  
  if (!marriageData.success) {
    return res.status(200).json(
      new ApiResponse(200, {
        verified: false,
        message: "Marriage certificate not found",
        applicationId,
        verificationStatus: 'INVALID'
      }, "Marriage certificate verification completed")
    );
  }

  // Verify if marriage is intercaste
  const intercasteVerification = MockDataService.verifyIntercasteMarriage(
    marriageRegistrationId,
    applicantAadhaar
  );

  if (!intercasteVerification.success) {
    return res.status(200).json(
      new ApiResponse(200, {
        verified: false,
        message: intercasteVerification.message,
        applicationId,
        verificationStatus: 'INVALID'
      }, "Marriage verification completed")
    );
  }

  // Check if it's actually an intercaste marriage
  if (!intercasteVerification.isIntercaste) {
    return res.status(200).json(
      new ApiResponse(200, {
        verified: false,
        message: "This is not an intercaste marriage. Both spouses belong to the same category.",
        applicationId,
        verificationStatus: 'NOT_INTERCASTE',
        marriageDetails: intercasteVerification.marriageDetails
      }, "Marriage verification completed")
    );
  }

  // Update application with verified details
  application.marriageDetails.marriageDate = new Date(intercasteVerification.marriageDetails?.marriageDate);
  application.marriageDetails.registrationAuthority = intercasteVerification.marriageDetails?.registrationAuthority || "Unknown";
  application.marriageDetails.verificationStatus = 'VERIFIED';
  
  await application.save();

  res.status(200).json(
    new ApiResponse(200, {
      verified: true,
      message: "Marriage certificate verified successfully",
      applicationId,
      verificationStatus: 'VERIFIED',
      isIntercaste: true,
      marriageDetails: {
        marriageRegistrationId,
        marriageDate: intercasteVerification.marriageDetails?.marriageDate,
        registrationAuthority: intercasteVerification.marriageDetails?.registrationAuthority,
        applicant: intercasteVerification.marriageDetails?.applicant,
        spouse: intercasteVerification.marriageDetails?.spouse
      }
    }, "Marriage verification completed successfully")
  );
});