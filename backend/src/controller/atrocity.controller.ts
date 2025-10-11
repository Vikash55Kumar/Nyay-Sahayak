import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AtrocityApplication } from '../models/atrocity.models';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { MockDataService } from '../services/mockData.service';
import ApiResponse from '../utility/ApiResponse';
import { ApiError } from '../utility/ApiError';
import { asyncHandler } from '../utility/asyncHandler';

// Submit Atrocity Relief Application
export const submitAtrocityReliefApplication = asyncHandler(async (req: Request, res: Response) => {
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

  // TODO: Add FIR verification logic with MockDataService
  // For now, we'll assume FIR is valid

  // Create atrocity relief application
  const application = new AtrocityApplication({
    beneficiaryId,
    firDetails: {
      firNumber,
      policeStation,
      district,
      dateOfIncident: new Date(dateOfIncident),
      incidentDescription,
      sectionsApplied: sectionsApplied || [],
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
    applicationReason: applicationReason || 'Compensation for atrocity incident'
  });

  await application.save();

  // Log audit
  console.log('🔍 AUDIT: Atrocity application submitted', { 
    beneficiaryId, 
    applicationId: application.applicationId, 
    firNumber,
    applicationType: 'ATROCITY_RELIEF' 
  });

  // Send notification
  try {
    await (require('../services/notification.service').NotificationService as any).sendSMSImmediate(
      user.mobileNumber,
      `आपका अत्याचार राहत आवेदन ${application.applicationId} सफलतापूर्वक जमा हुआ है। FIR: ${firNumber}। स्थिति जांचने के लिए पोर्टल देखें।`
    );
  } catch (error) {
    console.log('SMS notification failed:', error);
  }

  res.status(201).json(
    new ApiResponse(201, {
      applicationId: application.applicationId,
      firNumber,
      status: 'SUBMITTED',
      message: 'Atrocity relief application submitted successfully'
    }, "Application submitted successfully")
  );
});