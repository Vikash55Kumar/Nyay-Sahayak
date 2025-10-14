import { Request, Response } from 'express';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { MockDataService } from '../services/mockData.service';
import ApiResponse from '../utility/ApiResponse';
import { ApiError } from '../utility/ApiError';
import { asyncHandler } from '../utility/asyncHandler';
import { CasteDiscriminationApplication, Application } from '../models/unified-application.models';
import { AuditService } from '../services/audit.service';
import { User } from '../models/user.models';
interface AuthRequest extends Request {
    user?: {
        id: string;
        aadhaarNumber: string;
        role: string;
    };
}
// Submit Atrocity Relief Application
export const submitCasteDiscriminationApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated.");
  }

  const authUser = await User.findById(userId);
  if (!authUser) {
    throw new ApiError(404, "User not found.");
  }
  const {
    firNumber,
    policeStation,
    district,
    dateOfIncident,
    incidentDescription,
    sectionsApplied,
    supportingDocuments,
    applicationReason
  } = req.body;

  // Validate required fields
  if (!firNumber || !policeStation || !district || !dateOfIncident || !incidentDescription) {
    throw new ApiError(400, "FIR details (number, police station, district, date, description) are required");
  }

  // Verify beneficiary exists
  const beneficiary = await BeneficiaryProfile.findOne({ userId })
    .populate('userId', 'aadhaarNumber mobileNumber');

  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary profile not found");
  }

  const beneficiaryId = beneficiary._id;
  const beneficiaryUser = beneficiary.userId as any;

  // Do NOT auto-verify or auto-approve. Only save submitted application for authority review.
  // Only basic FIR details are saved, verificationStatus is 'PENDING'.
  // Generate application id similar to other flows
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  const applicationId = `ATR_${year}_${random}`;

  const application = new CasteDiscriminationApplication({
    applicationId,
    beneficiaryId: beneficiaryId,
    applicationType: 'ATROCITY_RELIEF',
    firDetails: {
      firNumber,
      policeStation,
      district,
      dateOfIncident: new Date(dateOfIncident),
      incidentDescription,
      sectionsApplied,
      verificationStatus: 'PENDING' // Authority will verify
    },
    documentsUploaded: supportingDocuments ? supportingDocuments.map((doc: any) => ({
      documentType: doc.type || 'Supporting Document',
      fileName: doc.fileName || 'document.pdf',
      // fallback fileUrl if client only sends filename metadata
      fileUrl: doc.url || doc.fileUrl || `/meta/${encodeURIComponent(String(doc.fileName || 'document.pdf'))}`,
      uploadedAt: new Date(),
      verificationStatus: 'PENDING'
    })) : [],
    applicationStatus: 'SUBMITTED',
    submittedAt: new Date(),
    applicationReason: applicationReason || 'Compensation for FIR incident'
  });

  await application.save();

  // Log audit for submission only, no verification
  await AuditService.logApplicationSubmission(
    beneficiaryUser._id,
    application._id,
    req,
    {
      type: 'ATROCITY_RELIEF',
      applicationNumber: application.applicationId,
      firNumber,
      firVerified: false,
      victimVerified: false,
      caseStatus: 'PENDING',
      compensationEligible: false,
      autoApproved: false,
      approvedAmount: undefined,
      documentsCount: supportingDocuments?.length || 0,
      verificationSource: 'PENDING_AUTHORITY'
    }
  );

  // Notification: inform user of submission only
  try {
    let notificationMessage = `आपका अत्याचार राहत आवेदन ${application.applicationId} सफलतापूर्वक जमा हुआ है। FIR: ${firNumber}। आवेदन की समीक्षा प्राधिकरण द्वारा की जाएगी। स्थिति जांचने के लिए पोर्टल देखें।`;
    await (require('../services/notification.service').NotificationService as any).sendSMSImmediate(
      beneficiaryUser.mobileNumber,
      notificationMessage
    );
  } catch (error) {
    console.log('SMS notification failed:', error);
  }

  res.status(201).json(
    new ApiResponse(201, {
      applicationId: application.applicationId,
      firNumber,
      status: 'SUBMITTED',
      verificationDetails: {
        firVerified: false,
        victimVerified: false,
        caseFound: false,
        compensationEligible: false,
        compensationStage: null,
        autoProcessed: false
      },
      approvedAmount: undefined,
      caseDetails: null,
      message: 'Application submitted successfully. Authority will verify and process your application.'
    }, "Application submitted. Awaiting authority verification.")
  );
});

// Authority Verification for Atrocity Relief Applications
export const verifyAtrocityApplicationForAuthority = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  
  if (!applicationId) {
    throw new ApiError(400, "Application ID is required");
  }

  // Find the application
  const application = await Application.findOne({ applicationId })
    .populate('beneficiaryId', 'aadhaarData.fullName casteDetails')
    .populate('assignedOfficer', 'name designation');

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.applicationType !== 'ATROCITY_RELIEF') {
    throw new ApiError(400, "Invalid application type for atrocity relief verification");
  }

  const casteApp = application as any; // Cast to access firDetails
  const firDetails = casteApp.firDetails;

  // Comprehensive verification for authority review
  const verificationResults = {
    applicationDetails: {
      applicationId: application.applicationId,
      applicationType: application.applicationType,
      status: application.applicationStatus,
      submittedAt: application.submittedAt,
      beneficiaryName: (application.beneficiaryId as any)?.aadhaarData?.fullName,
      beneficiaryCategory: (application.beneficiaryId as any)?.casteDetails?.category
    },
    firVerification: null as any,
    victimVerification: null as any,
    caseStatus: null as any,
    compensationDetails: null as any,
    documentVerification: {
      totalDocuments: application.documentsUploaded.length,
      verifiedDocuments: application.documentsUploaded.filter(doc => doc.verificationStatus === 'VERIFIED').length,
      pendingDocuments: application.documentsUploaded.filter(doc => doc.verificationStatus === 'PENDING').length
    },
    overallVerificationStatus: 'PENDING' as string,
    recommendations: [] as string[]
  };

  try {
    // Re-verify FIR in CCTNS
    verificationResults.firVerification = MockDataService.verifyFIRInCCTNS(
      firDetails.firNumber, 
      firDetails.policeStation, 
      firDetails.district
    );

    if (verificationResults.firVerification.success) {
      // Verify victim details
      const beneficiary = application.beneficiaryId as any;
      const userAadhaar = beneficiary.userId?.aadhaarNumber || 'NOT_FOUND';
      
      verificationResults.victimVerification = MockDataService.verifyVictimInFIR(
        firDetails.firNumber, 
        userAadhaar
      );

      // Get current case status
      verificationResults.caseStatus = MockDataService.getCaseStatusFromeCourt(firDetails.firNumber);
      
      // Get compensation details
      verificationResults.compensationDetails = MockDataService.getCompensationDetails(firDetails.firNumber);

      // Generate recommendations
      if (verificationResults.firVerification.success && 
          verificationResults.victimVerification.isVictim && 
          verificationResults.compensationDetails.eligible) {
        verificationResults.overallVerificationStatus = 'VERIFIED';
        verificationResults.recommendations.push('Application is fully verified and eligible for compensation');
        verificationResults.recommendations.push(`Recommended amount: ₹${verificationResults.compensationDetails.amount}`);
        
        if (verificationResults.caseStatus.success) {
          verificationResults.recommendations.push(`Case stage: ${verificationResults.caseStatus.data.caseStage}`);
        }
      } else {
        verificationResults.overallVerificationStatus = 'ISSUES_FOUND';
        
        if (!verificationResults.firVerification.success) {
          verificationResults.recommendations.push('FIR verification failed - check FIR details');
        }
        
        if (!verificationResults.victimVerification.isVictim) {
          verificationResults.recommendations.push('Beneficiary is not listed as victim in FIR');
        }
        
        if (!verificationResults.compensationDetails.eligible) {
          verificationResults.recommendations.push('Not eligible for compensation at current case stage');
        }
      }

    } else {
      verificationResults.overallVerificationStatus = 'FIR_INVALID';
      verificationResults.recommendations.push('FIR could not be verified in CCTNS system');
    }

  } catch (error) {
    verificationResults.overallVerificationStatus = 'VERIFICATION_ERROR';
    verificationResults.recommendations.push('Error occurred during verification process');
  }

  res.status(200).json(
    new ApiResponse(200, verificationResults, "Authority verification completed")
  );
});