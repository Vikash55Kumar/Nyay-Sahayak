import { Request, Response } from 'express';
import { Application} from '../models/unified-application.models';
import ApiResponse from '../utility/ApiResponse';
import { ApiError } from '../utility/ApiError';
import { asyncHandler } from '../utility/asyncHandler';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { ApplicationTrackingService } from '../services/applicationTracking.service';
import { AuditService } from '../services/audit.service';

interface AuthRequest extends Request {
    user?: {
        id: string;
        aadhaarNumber: string;
        role: string;
    };
}
// Get Application Status
export const getApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  
  // Use unified Application model to find any type of application
  const application = await Application.findOne({ applicationId })
    .populate('beneficiaryId', 'aadhaarData.fullName')
    .populate('assignedOfficer', 'name designation')
    .select('applicationId applicationType applicationStatus submittedAt updatedAt rejectionReason assignedOfficer beneficiaryId');

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // Return optimized response with only essential status information
  const statusInfo = {
    applicationId: application.applicationId,
    applicationType: application.applicationType,
    status: application.applicationStatus,
    submissionDate: application.submittedAt,
    lastUpdated: application.updatedAt,
    remarks: application.rejectionReason,
    beneficiaryName: (application.beneficiaryId as any)?.aadhaarData?.fullName,
    assignedOfficer: (application.assignedOfficer as any) ? {
      name: (application.assignedOfficer as any).name,
      designation: (application.assignedOfficer as any).designation
    } : null
  };

  res.status(200).json(
    new ApiResponse(200, statusInfo, "Application status retrieved successfully")
  );
});

// Get Beneficiary Applications
export const getBeneficiaryApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
      throw new ApiError(401, "User not authenticated.");
  }

  const beneficiary = await BeneficiaryProfile.findOne({ userId });

  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary profile not found");
  }

  // Use unified Application model to get all applications with optimized fields
  const allApplications = await Application.findByBeneficiary(beneficiary._id)
    .populate('assignedOfficer', 'name designation')
    .select('applicationId applicationType applicationStatus submittedAt updatedAt rejectionReason assignedOfficer');

  // Return optimized response with only essential information
  const optimizedApplications = allApplications.map(app => ({
    applicationId: app.applicationId,
    applicationType: app.applicationType,
    status: app.applicationStatus,
    submissionDate: app.submittedAt,
    lastUpdated: app.updatedAt,
    remarks: app.rejectionReason,
    assignedOfficer: (app.assignedOfficer as any) ? {
      name: (app.assignedOfficer as any).name,
      designation: (app.assignedOfficer as any).designation
    } : null
  }));

  res.status(200).json(
    new ApiResponse(200, optimizedApplications, "Applications retrieved successfully")
  );
});

// Get Detailed Application Timeline (Enhanced Tracking)
export const getApplicationTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    throw new ApiError(400, "Application ID is required");
  }

  try {
    const timeline = await ApplicationTrackingService.getApplicationTimeline(applicationId);
    
    res.status(200).json(
      new ApiResponse(200, timeline, "Application timeline retrieved successfully")
    );
  } catch (error: any) {
    if (error.message.includes('not found')) {
      throw new ApiError(404, error.message);
    }
    throw new ApiError(500, "Failed to retrieve application timeline");
  }
});

// Authority: Update Application Status (Enhanced)
export const updateApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  const { action, remarks, amount, transactionId } = req.body;
  const officerId = req.user?.id;

  if (!applicationId || !action || !officerId) {
    throw new ApiError(400, "Application ID, action, and officer authentication required");
  }

  if (!['APPROVE', 'REJECT', 'INITIATE_PAYMENT', 'COMPLETE_PAYMENT'].includes(action)) {
    throw new ApiError(400, "Invalid action. Must be APPROVE, REJECT, INITIATE_PAYMENT, or COMPLETE_PAYMENT");
  }

  try {
    await ApplicationTrackingService.authorityUpdateStatus(
      applicationId,
      action,
      officerId,
      { remarks, amount, transactionId }
    );

    res.status(200).json(
      new ApiResponse(200, {
        applicationId,
        action,
        updatedAt: new Date()
      }, `Application ${action.toLowerCase()} successfully`)
    );
  } catch (error: any) {
    throw new ApiError(500, `Failed to ${action.toLowerCase()} application: ${error.message}`);
  }
});

