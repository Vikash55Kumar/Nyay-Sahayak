import mongoose from 'mongoose';
import { Application } from '../models/unified-application.models';
import { PaymentTransaction } from '../models/paymentTransaction.models';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { BeneficiaryProfile } from '../models/beneficiaryProfile.models';
import { IStatusUpdateRequest, IApplicationTimeline, ApplicationStatusUpdate } from '../types/service.types';
import { IBaseApplication } from '../types/application.types';

export class ApplicationTrackingService {
  
  // Comprehensive status update with notifications
  static async updateApplicationStatus(update: ApplicationStatusUpdate, req?: any): Promise<void> {
    const { applicationId, newStatus, remarks, officerId, amount, transactionId } = update;
    
    // Find application and beneficiary
    const application = await Application.findOne({ applicationId })
      .populate('beneficiaryId', 'aadhaarData.fullName userId')
      .populate({
        path: 'beneficiaryId',
        populate: {
          path: 'userId',
          select: 'mobileNumber aadhaarNumber'
        }
      });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const oldStatus = application.applicationStatus;
    const beneficiaryUserId = (application.beneficiaryId as any).userId._id;
    const performedById = officerId ? new mongoose.Types.ObjectId(officerId) : beneficiaryUserId;
    
    // Update application status
    application.applicationStatus = newStatus as any;
    if (remarks) application.rejectionReason = remarks;
    if (officerId) application.assignedOfficer = officerId as any;
    if (amount) application.approvedAmount = amount;
    
    // Set timestamps based on status
    switch (newStatus) {
      case 'UNDER_REVIEW':
        // Log application review start
        if (req) {
          await AuditService.logApplicationReview(
            performedById,
            application._id,
            req,
            {
              previousStatus: oldStatus,
              newStatus,
              comments: remarks,
              role: officerId ? 'REVIEWER' : 'SYSTEM'
            }
          );
        }
        break;
      case 'APPROVED':
        application.reviewedAt = new Date();
        // Log application approval
        if (req) {
          await AuditService.logApplicationApproval(
            performedById,
            application._id,
            req,
            {
              amount,
              comments: remarks,
              role: officerId ? 'APPROVER' : 'SYSTEM',
              nextSteps: amount ? 'Payment Processing' : 'Application Complete'
            }
          );
        }
        break;
      case 'REJECTED':
        application.reviewedAt = new Date();
        // Log application rejection
        if (req) {
          await AuditService.logApplicationRejection(
            performedById,
            application._id,
            req,
            {
              reason: remarks || 'No reason provided',
              comments: remarks,
              role: officerId ? 'REVIEWER' : 'SYSTEM',
              canReapply: true
            }
          );
        }
        break;
      case 'PAYMENT_INITIATED':
        // Create payment transaction record
        if (amount && transactionId) {
          await this.initiatePaymentTransaction(application, amount, transactionId, req);
        }
        break;
      case 'COMPLETED':
        // Payment completed - this would be logged by payment service
        break;
    }

    await application.save();

    // Send notifications based on status
    await this.sendStatusNotification(application, oldStatus, newStatus, { remarks, amount, transactionId });
    
    console.log(`📊 Status Updated: ${applicationId} from ${oldStatus} to ${newStatus}`);
  }

  // Create payment transaction when payment is initiated
  private static async initiatePaymentTransaction(
    application: any, 
    amount: number, 
    transactionId: string,
    req?: any
  ): Promise<void> {
    const beneficiary = application.beneficiaryId;
    const user = beneficiary.userId;
    
    const payment = new PaymentTransaction({
      applicationId: application._id,
      beneficiaryId: beneficiary._id,
      beneficiaryAadhaar: user.aadhaarNumber,
      transactionId,
      amount,
      paymentStatus: 'INITIATED',
      initiatedAt: new Date()
    });

    await payment.save();
    
    // Log payment initiation
    if (req) {
      await AuditService.logPaymentInitiation(
        user._id,
        payment._id,
        req,
        {
          amount,
          transactionId,
          aadhaar: user.aadhaarNumber,
          applicationId: application.applicationId
        }
      );
    }
    
    console.log(`💰 Payment Transaction Created: ${transactionId} for ₹${amount}`);
  }

  // Send appropriate notifications based on status change
  private static async sendStatusNotification(
    application: any,
    oldStatus: string,
    newStatus: string,
    details: { remarks?: string; amount?: number; transactionId?: string }
  ): Promise<void> {
    const beneficiary = application.beneficiaryId;
    const user = beneficiary.userId;
    const beneficiaryName = beneficiary.aadhaarData.fullName;
    const mobileNumber = user.mobileNumber;

    try {
      switch (newStatus) {
        case 'UNDER_REVIEW':
          await NotificationService.sendApplicationUpdate(
            mobileNumber,
            'SUBMITTED',
            { 
              schemeName: application.applicationType
            }
          );
          break;

        case 'APPROVED':
          await NotificationService.sendApplicationUpdate(
            mobileNumber,
            'APPROVED',
            { 
              schemeName: application.applicationType,
              amount: details.amount || application.approvedAmount || 0
            }
          );
          break;

        case 'REJECTED':
          await NotificationService.sendApplicationUpdate(
            mobileNumber,
            'REJECTED',
            { 
              schemeName: application.applicationType,
              rejectionReason: details.remarks || 'Not specified'
            }
          );
          break;

        case 'PAYMENT_INITIATED':
          await NotificationService.sendApplicationUpdate(
            mobileNumber,
            'PAYMENT_INITIATED',
            { 
              schemeName: application.applicationType,
              amount: details.amount || application.approvedAmount || 0,
              transactionId: details.transactionId || 'TXN_' + Date.now()
            }
          );
          break;

        case 'COMPLETED':
          await NotificationService.sendApplicationUpdate(
            mobileNumber,
            'PAYMENT_COMPLETED',
            { 
              schemeName: application.applicationType,
              amount: details.amount || application.approvedAmount || 0,
              transactionId: details.transactionId || 'TXN_' + Date.now()
            }
          );
          break;
      }
    } catch (error) {
      console.warn('⚠️ Notification failed (non-critical):', error);
    }
  }

  // Get comprehensive application timeline
  static async getApplicationTimeline(applicationId: string): Promise<any> {
    const application = await Application.findOne({ applicationId })
      .populate('beneficiaryId', 'aadhaarData.fullName')
      .populate('assignedOfficer', 'name designation');

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // Get payment transactions if any
    const payments = await PaymentTransaction.find({ applicationId: application._id })
      .sort({ initiatedAt: -1 });

    // Build timeline
    const timeline = [
      {
        stage: 'Application Submitted',
        status: 'COMPLETED',
        date: application.submittedAt || application.createdAt,
        description: 'Application submitted by beneficiary'
      }
    ];

    if (application.applicationStatus !== 'SUBMITTED') {
      timeline.push({
        stage: 'Under Review',
        status: 'COMPLETED',
        date: application.submittedAt || application.createdAt,
        description: 'Application under review by authorities'
      });
    }

    if (['APPROVED', 'REJECTED', 'PAYMENT_INITIATED', 'COMPLETED'].includes(application.applicationStatus)) {
      timeline.push({
        stage: application.applicationStatus === 'REJECTED' ? 'Application Rejected' : 'Application Approved',
        status: 'COMPLETED',
        date: application.reviewedAt || new Date(),
        description: application.applicationStatus === 'REJECTED' 
          ? `Rejected: ${application.rejectionReason || 'No reason specified'}`
          : `Approved for ₹${application.approvedAmount || 0}`
      });
    }

    if (['PAYMENT_INITIATED', 'COMPLETED'].includes(application.applicationStatus)) {
      const paymentInitiated = payments.find(p => p.paymentStatus === 'INITIATED' || p.paymentStatus === 'PROCESSING');
      if (paymentInitiated) {
        timeline.push({
          stage: 'Payment Initiated',
          status: 'COMPLETED',
          date: paymentInitiated.initiatedAt,
          description: `DBT payment of ₹${paymentInitiated.amount} initiated. Ref: ${paymentInitiated.transactionId}`
        });
      }
    }

    if (application.applicationStatus === 'COMPLETED') {
      const paymentCompleted = payments.find(p => p.paymentStatus === 'SUCCESS');
      if (paymentCompleted) {
        timeline.push({
          stage: 'Payment Completed',
          status: 'COMPLETED',
          date: paymentCompleted.completedAt || new Date(),
          description: `₹${paymentCompleted.amount} credited to Aadhaar-linked account`
        });
      }
    }

    return {
      applicationId,
      currentStatus: application.applicationStatus,
      timeline,
      beneficiaryName: (application.beneficiaryId as any)?.aadhaarData?.fullName,
      assignedOfficer: application.assignedOfficer ? {
        name: (application.assignedOfficer as any).name,
        designation: (application.assignedOfficer as any).designation
      } : null,
      approvedAmount: application.approvedAmount,
      payments: payments.map(p => ({
        transactionId: p.transactionId,
        amount: p.amount,
        status: p.paymentStatus,
        initiatedAt: p.initiatedAt,
        completedAt: p.completedAt
      }))
    };
  }

  // Get all applications with enhanced tracking info
  static async getAllApplicationsWithTracking(
    filters: {
      status?: string;
      applicationType?: string;
      beneficiaryId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<any> {
    const query: any = {};
    
    if (filters.status) query.applicationStatus = filters.status;
    if (filters.applicationType) query.applicationType = filters.applicationType;
    if (filters.beneficiaryId) query.beneficiaryId = filters.beneficiaryId;
    if (filters.dateFrom || filters.dateTo) {
      query.submittedAt = {};
      if (filters.dateFrom) query.submittedAt.$gte = filters.dateFrom;
      if (filters.dateTo) query.submittedAt.$lte = filters.dateTo;
    }

    const applications = await Application.find(query)
      .populate('beneficiaryId', 'aadhaarData.fullName userId')
      .populate('assignedOfficer', 'name designation')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(offset);

    return applications.map(app => ({
      applicationId: app.applicationId,
      applicationType: app.applicationType,
      status: app.applicationStatus,
      beneficiaryName: (app.beneficiaryId as any)?.aadhaarData?.fullName,
      submittedAt: app.submittedAt,
      approvedAmount: app.approvedAmount,
      assignedOfficer: app.assignedOfficer ? {
        name: (app.assignedOfficer as any).name,
        designation: (app.assignedOfficer as any).designation
      } : null,
      lastUpdated: app.updatedAt
    }));
  }

  // Authority workflow helper - update with proper flow
  static async authorityUpdateStatus(
    applicationId: string,
    action: 'APPROVE' | 'REJECT' | 'INITIATE_PAYMENT' | 'COMPLETE_PAYMENT',
    officerId: string,
    details: {
      remarks?: string;
      amount?: number;
      transactionId?: string;
    } = {}
  ): Promise<void> {
    let newStatus: string;
    let amount: number | undefined;
    
    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        amount = details.amount;
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        break;
      case 'INITIATE_PAYMENT':
        newStatus = 'PAYMENT_INITIATED';
        amount = details.amount;
        break;
      case 'COMPLETE_PAYMENT':
        newStatus = 'COMPLETED';
        amount = details.amount;
        break;
      default:
        throw new Error('Invalid action');
    }

    await this.updateApplicationStatus({
      applicationId,
      oldStatus: '', // Will be fetched in updateApplicationStatus
      newStatus,
      remarks: details.remarks,
      officerId,
      amount,
      transactionId: details.transactionId
    });
  }
}