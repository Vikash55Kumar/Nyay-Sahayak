import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { MockDataService } from '../services/mockData.service';
import ApiResponse from '../utility/ApiResponse';
import { ApiError } from '../utility/ApiError';
import { asyncHandler } from '../utility/asyncHandler';
import { CasteDiscriminationApplication, Application } from '../models/unified-application.models';
import { AuditService } from '../services/audit.service';

// Submit Atrocity Relief Application
export const submitCasteDiscriminationApplication = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, "Authorization token required");
  }

  const token = authHeader.substring(7);
  let decoded: any;
  
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  if (!decoded || decoded.role !== 'session') {
    throw new ApiError(401, "Valid session token required");
  }

  const { beneficiaryId } = decoded;
  
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
  const beneficiary = await BeneficiaryProfile.findOne({ userId: beneficiaryId })
    .populate('userId', 'aadhaarNumber mobileNumber');
  
  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary profile not found");
  }

  const user = beneficiary.userId as any;

  // STEP 1: Verify FIR in CCTNS Database
  console.log('🔍 STEP 1: Verifying FIR in CCTNS...');
  const firVerification = MockDataService.verifyFIRInCCTNS(firNumber, policeStation, district);
  
  if (!firVerification.success || !firVerification.data) {
    throw new ApiError(400, `FIR Verification Failed: ${firVerification.message}`);
  }

  // STEP 2: Verify beneficiary is the victim in FIR
  console.log('🔍 STEP 2: Verifying beneficiary as victim...');
  const victimVerification = MockDataService.verifyVictimInFIR(firNumber, user.aadhaarNumber);
  
  if (!victimVerification.success || !victimVerification.isVictim) {
    throw new ApiError(400, `Victim Verification Failed: ${victimVerification.message}`);
  }

  // STEP 3: Get case status and compensation eligibility from eCourt
  console.log('🔍 STEP 3: Checking eCourt case status...');
  const caseStatus = MockDataService.getCaseStatusFromeCourt(firNumber);
  const compensationDetails = MockDataService.getCompensationDetails(firNumber);

  // STEP 4: Determine application status based on verification
  let applicationStatus: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' = 'SUBMITTED';
  let approvedAmount: number | undefined;
  
  if (compensationDetails.success && compensationDetails.eligible) {
    // Auto-approve if all verifications pass and compensation is due
    applicationStatus = 'APPROVED';
    approvedAmount = compensationDetails.amount;
  }

  // Create atrocity relief application with verified data
  const application = new CasteDiscriminationApplication({
    beneficiaryId,
    applicationType: 'ATROCITY_RELIEF',
    firDetails: {
      firNumber: firVerification.data.firNumber,
      policeStation: firVerification.data.policeStation,
      district: firVerification.data.district,
      dateOfIncident: new Date(firVerification.data.dateOfIncident),
      incidentDescription: incidentDescription || firVerification.data.incidentType,
      sectionsApplied: firVerification.data.sectionsApplied,
      verificationStatus: 'VERIFIED' // Auto-verified through CCTNS
    },
    documentsUploaded: supportingDocuments ? supportingDocuments.map((doc: any) => ({
      documentType: doc.type || 'Supporting Document',
      fileName: doc.fileName || 'document.pdf',
      fileUrl: doc.url || doc.fileUrl,
      uploadedAt: new Date(),
      verificationStatus: 'PENDING'
    })) : [],
    applicationStatus,
    approvedAmount,
    submittedAt: new Date(),
    reviewedAt: applicationStatus === 'APPROVED' ? new Date() : undefined,
    applicationReason: applicationReason || `Compensation for ${firVerification.data.incidentType}`
  });

  await application.save();

  // Log comprehensive audit with verification details
  await AuditService.logApplicationSubmission(
    beneficiaryId,
    application._id,
    req,
    {
      type: 'ATROCITY_RELIEF',
      applicationNumber: application.applicationId,
      firNumber,
      firVerified: firVerification.success,
      victimVerified: victimVerification.isVictim,
      caseStatus: caseStatus.success ? caseStatus.data?.caseStage : 'Not Found',
      compensationEligible: compensationDetails.eligible,
      autoApproved: applicationStatus === 'APPROVED',
      approvedAmount,
      documentsCount: supportingDocuments?.length || 0,
      verificationSource: 'CCTNS_AUTO'
    }
  );

  // Enhanced notification with verification status
  try {
    let notificationMessage = `आपका अत्याचार राहत आवेदन ${application.applicationId} सफलतापूर्वक जमा हुआ है।`;
    
    if (applicationStatus === 'APPROVED') {
      notificationMessage += ` FIR सत्यापित। ₹${approvedAmount} की राशि स्वीकृत।`;
    } else {
      notificationMessage += ` FIR: ${firNumber}। समीक्षाधीन।`;
    }
    
    notificationMessage += ` स्थिति जांचने के लिए पोर्टल देखें।`;

    await (require('../services/notification.service').NotificationService as any).sendSMSImmediate(
      user.mobileNumber,
      notificationMessage
    );
  } catch (error) {
    console.log('SMS notification failed:', error);
  }

  res.status(201).json(
    new ApiResponse(201, {
      applicationId: application.applicationId,
      firNumber,
      status: applicationStatus,
      verificationDetails: {
        firVerified: true,
        victimVerified: true,
        caseFound: caseStatus.success,
        compensationEligible: compensationDetails.eligible,
        compensationStage: compensationDetails.stage,
        autoProcessed: applicationStatus === 'APPROVED'
      },
      approvedAmount: applicationStatus === 'APPROVED' ? approvedAmount : undefined,
      caseDetails: caseStatus.success ? {
        caseNumber: caseStatus.data?.caseNumber,
        courtName: caseStatus.data?.courtName,
        caseStage: caseStatus.data?.caseStage,
        nextHearing: caseStatus.data?.nextHearingDate
      } : null,
      message: applicationStatus === 'APPROVED' ? 
        'Application auto-approved after successful verification' : 
        'Application submitted successfully with verified FIR'
    }, "Smart verification completed successfully")
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