import { AuditLog } from '../models/auditLog.models';
import { ITargetResource } from '../types/audit.types';
import mongoose from 'mongoose';

export class AuditService {
  
  /**
   * Core method to log audit events with proper schema mapping
   */
  private static async logEvent(
    action: string,
    performedBy: mongoose.Types.ObjectId,
    targetResource: ITargetResource,
    ipAddress: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      return await AuditLog.create({
        action,
        performedBy,
        targetResource,
        ipAddress,
        userAgent,
        metadata: metadata || {}
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  /**
   * Log user registration
   */
  static async logUserRegistration(
    userId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'USER_REGISTERED',
      userId,
      { type: 'USER', id: userId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        registrationMethod: metadata?.method || 'AADHAAR_OTP',
        verificationStatus: metadata?.verified || false,
        ...metadata
      }
    );
  }

  /**
   * Log user login
   */
  static async logLogin(
    userId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'USER_LOGIN',
      userId,
      { type: 'USER', id: userId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        loginMethod: metadata?.method || 'OTP',
        deviceInfo: metadata?.device,
        ...metadata
      }
    );
  }

  /**
   * Log beneficiary profile creation
   */
  static async logProfileCreation(
    userId: mongoose.Types.ObjectId,
    profileId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'PROFILE_CREATED',
      userId,
      { type: 'BENEFICIARY_PROFILE', id: profileId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        profileData: metadata?.profileData,
        documentsCount: metadata?.documentsCount || 0,
        ...metadata
      }
    );
  }

  /**
   * Log profile verification
   */
  static async logProfileVerification(
    performedBy: mongoose.Types.ObjectId,
    profileId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'PROFILE_VERIFIED',
      performedBy,
      { type: 'BENEFICIARY_PROFILE', id: profileId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        verificationStatus: metadata?.status || 'VERIFIED',
        verifierRole: metadata?.role,
        remarks: metadata?.remarks,
        ...metadata
      }
    );
  }

  /**
   * Log application submission
   */
  static async logApplicationSubmission(
    userId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'APPLICATION_SUBMITTED',
      userId,
      { type: 'APPLICATION', id: applicationId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        applicationType: metadata?.type,
        applicationNumber: metadata?.applicationNumber,
        documentsAttached: metadata?.documentsCount || 0,
        ...metadata
      }
    );
  }

  /**
   * Log application review
   */
  static async logApplicationReview(
    reviewerId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'APPLICATION_REVIEWED',
      reviewerId,
      { type: 'APPLICATION', id: applicationId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        previousStatus: metadata?.previousStatus,
        newStatus: metadata?.newStatus,
        reviewComments: metadata?.comments,
        reviewerRole: metadata?.role,
        ...metadata
      }
    );
  }

  /**
   * Log application approval
   */
  static async logApplicationApproval(
    approverId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'APPLICATION_APPROVED',
      approverId,
      { type: 'APPLICATION', id: applicationId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        approvedAmount: metadata?.amount,
        approvalComments: metadata?.comments,
        approverRole: metadata?.role,
        nextSteps: metadata?.nextSteps,
        ...metadata
      }
    );
  }

  /**
   * Log application rejection
   */
  static async logApplicationRejection(
    rejectorId: mongoose.Types.ObjectId,
    applicationId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'APPLICATION_REJECTED',
      rejectorId,
      { type: 'APPLICATION', id: applicationId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        rejectionReason: metadata?.reason,
        rejectionComments: metadata?.comments,
        rejectorRole: metadata?.role,
        canReapply: metadata?.canReapply || false,
        ...metadata
      }
    );
  }

  /**
   * Log payment initiation
   */
  static async logPaymentInitiation(
    initiatorId: mongoose.Types.ObjectId,
    paymentId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'PAYMENT_INITIATED',
      initiatorId,
      { type: 'PAYMENT', id: paymentId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        amount: metadata?.amount,
        transactionId: metadata?.transactionId,
        beneficiaryAadhaar: metadata?.aadhaar ? '****' + metadata.aadhaar.slice(-4) : undefined,
        paymentMethod: 'DBT',
        ...metadata
      }
    );
  }

  /**
   * Log payment completion
   */
  static async logPaymentCompletion(
    systemUserId: mongoose.Types.ObjectId,
    paymentId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'PAYMENT_COMPLETED',
      systemUserId,
      { type: 'PAYMENT', id: paymentId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        finalAmount: metadata?.amount,
        transactionReference: metadata?.transactionRef,
        pfmsResponse: metadata?.pfmsResponse,
        completionTime: metadata?.completionTime,
        ...metadata
      }
    );
  }

  /**
   * Log payment failure
   */
  static async logPaymentFailure(
    systemUserId: mongoose.Types.ObjectId,
    paymentId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'PAYMENT_FAILED',
      systemUserId,
      { type: 'PAYMENT', id: paymentId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        failureReason: metadata?.reason,
        pfmsError: metadata?.pfmsError,
        retryCount: metadata?.retryCount || 0,
        willRetry: metadata?.willRetry || false,
        ...metadata
      }
    );
  }

  /**
   * Log document upload
   */
  static async logDocumentUpload(
    userId: mongoose.Types.ObjectId,
    targetResourceType: 'APPLICATION' | 'BENEFICIARY_PROFILE',
    targetResourceId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'DOCUMENT_UPLOADED',
      userId,
      { type: targetResourceType, id: targetResourceId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        fileName: metadata?.fileName,
        fileSize: metadata?.fileSize,
        documentType: metadata?.documentType,
        mimeType: metadata?.mimeType,
        uploadSource: metadata?.source || 'WEB',
        ...metadata
      }
    );
  }

  /**
   * Log document verification
   */
  static async logDocumentVerification(
    verifierId: mongoose.Types.ObjectId,
    targetResourceType: 'APPLICATION' | 'BENEFICIARY_PROFILE',
    targetResourceId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'DOCUMENT_VERIFIED',
      verifierId,
      { type: targetResourceType, id: targetResourceId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        documentType: metadata?.documentType,
        verificationStatus: metadata?.status || 'VERIFIED',
        verificationComments: metadata?.comments,
        verifierRole: metadata?.role,
        ...metadata
      }
    );
  }

  /**
   * Log notification sent
   */
  static async logNotificationSent(
    systemUserId: mongoose.Types.ObjectId,
    targetUserId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'NOTIFICATION_SENT',
      systemUserId,
      { type: 'USER', id: targetUserId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        notificationType: metadata?.type,
        channel: metadata?.channel || 'SMS',
        messageContent: metadata?.message ? metadata.message.substring(0, 100) + '...' : undefined,
        deliveryStatus: metadata?.status,
        ...metadata
      }
    );
  }

  /**
   * Log role assignment
   */
  static async logRoleAssignment(
    adminId: mongoose.Types.ObjectId,
    targetUserId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'ROLE_ASSIGNED',
      adminId,
      { type: 'USER', id: targetUserId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        previousRole: metadata?.previousRole,
        newRole: metadata?.newRole,
        assignmentReason: metadata?.reason,
        adminRole: metadata?.adminRole,
        ...metadata
      }
    );
  }

  /**
   * Log role revocation
   */
  static async logRoleRevocation(
    adminId: mongoose.Types.ObjectId,
    targetUserId: mongoose.Types.ObjectId,
    req: any,
    metadata?: any
  ): Promise<void> {
    await this.logEvent(
      'ROLE_REVOKED',
      adminId,
      { type: 'USER', id: targetUserId },
      req.ip || '127.0.0.1',
      req.get('User-Agent'),
      {
        revokedRole: metadata?.revokedRole,
        revocationReason: metadata?.reason,
        adminRole: metadata?.adminRole,
        effectiveDate: metadata?.effectiveDate,
        ...metadata
      }
    );
  }

  /**
   * Get user activity logs
   */
  static async getUserActivity(
    userId: mongoose.Types.ObjectId,
    limit: number = 50,
    skip: number = 0
  ): Promise<any[]> {
    return await (AuditLog as any).getUserActivity(userId, limit, skip);
  }

  /**
   * Get resource history
   */
  static async getResourceHistory(
    resourceType: 'APPLICATION' | 'PAYMENT' | 'USER' | 'BENEFICIARY_PROFILE',
    resourceId: mongoose.Types.ObjectId,
    limit: number = 20
  ): Promise<any[]> {
    return await (AuditLog as any).getResourceHistory(resourceType, resourceId, limit);
  }

  /**
   * Get application audit trail
   */
  static async getApplicationAuditTrail(applicationId: mongoose.Types.ObjectId): Promise<any[]> {
    return await AuditLog.find({
      'targetResource.type': 'APPLICATION',
      'targetResource.id': applicationId
    })
      .sort({ timestamp: -1 })
      .populate('performedBy', 'aadhaarNumber role mobileNumber')
      .lean();
  }

  /**
   * Get payment audit trail
   */
  static async getPaymentAuditTrail(paymentId: mongoose.Types.ObjectId): Promise<any[]> {
    return await AuditLog.find({
      'targetResource.type': 'PAYMENT',
      'targetResource.id': paymentId
    })
      .sort({ timestamp: -1 })
      .populate('performedBy', 'aadhaarNumber role')
      .lean();
  }

  /**
   * Get security logs for monitoring
   */
  static async getSecurityLogs(
    fromDate: Date,
    toDate: Date,
    limit: number = 100
  ): Promise<any[]> {
    return await AuditLog.find({
      action: { $in: ['USER_LOGIN', 'APPLICATION_SUBMITTED', 'PAYMENT_INITIATED'] },
      timestamp: { $gte: fromDate, $lte: toDate }
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('performedBy', 'aadhaarNumber role')
      .lean();
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(fromDate: Date, toDate: Date): Promise<any> {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: fromDate, $lte: toDate }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            resourceType: '$targetResource.type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.resourceType',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ];

    return await AuditLog.aggregate(pipeline);
  }

  /**
   * Search audit logs with filters
   */
  static async searchLogs(
    filters: {
      userId?: mongoose.Types.ObjectId;
      action?: string;
      resourceType?: string;
      fromDate?: Date;
      toDate?: Date;
      ipAddress?: string;
    },
    limit: number = 50,
    skip: number = 0
  ): Promise<any[]> {
    const query: any = {};

    if (filters.userId) query.performedBy = filters.userId;
    if (filters.action) query.action = new RegExp(filters.action, 'i');
    if (filters.resourceType) query['targetResource.type'] = filters.resourceType;
    if (filters.ipAddress) query.ipAddress = filters.ipAddress;
    
    if (filters.fromDate || filters.toDate) {
      query.timestamp = {};
      if (filters.fromDate) query.timestamp.$gte = filters.fromDate;
      if (filters.toDate) query.timestamp.$lte = filters.toDate;
    }

    return await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate('performedBy', 'aadhaarNumber role mobileNumber')
      .lean();
  }

  /**
   * Clean old audit logs (for maintenance)
   */
  static async cleanOldLogs(retentionDays: number = 2555): Promise<number> { // 7 years default
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount || 0;
  }
}