import { AuditLog } from '../models/auditLog.models';

export class AuditService {
  
  // Simple compatibility methods for prototype
  static async logUserRegistration(userId: any, req: any, metadata: any) {
    console.log('🔍 AUDIT: User registered', { userId, metadata });
    // For prototype, just log to console
  }

  static async logProfileCreation(userId: any, profileId: any, req: any, metadata: any) {
    console.log('🔍 AUDIT: Profile created', { userId, profileId, metadata });
    // For prototype, just log to console
  }

  static async logLogin(userId: any, req: any) {
    console.log('🔍 AUDIT: User login', { userId, ip: req.ip });
    // For prototype, just log to console
  }

  /**
   * Log user authentication events
   */
  static async logAuth(
    userId: string, 
    action: 'LOGIN' | 'LOGOUT' | 'REGISTRATION' | 'PASSWORD_CHANGE',
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'USER_AUTH',
      details: {
        timestamp: new Date(),
        userAgent: details?.userAgent || 'Unknown',
        ipAddress: details?.ipAddress || '127.0.0.1',
        ...details
      }
    });
  }

  /**
   * Log profile operations
   */
  static async logProfile(
    userId: string,
    action: 'PROFILE_CREATED' | 'PROFILE_UPDATED' | 'PROFILE_VERIFIED' | 'DOCUMENTS_UPLOADED',
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'BENEFICIARY_PROFILE',
      details: {
        timestamp: new Date(),
        changes: details?.changes || {},
        previousState: details?.previousState || null,
        newState: details?.newState || null,
        ...details
      }
    });
  }

  /**
   * Log application lifecycle events
   */
  static async logApplication(
    userId: string,
    action: 'APPLICATION_SUBMITTED' | 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' | 'APPLICATION_UPDATED',
    applicationId: string,
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'APPLICATION',
      resourceId: applicationId,
      details: {
        timestamp: new Date(),
        applicationId,
        statusChange: details?.statusChange || null,
        officerRemarks: details?.officerRemarks || null,
        ...details
      }
    });
  }

  /**
   * Log payment transactions
   */
  static async logPayment(
    userId: string,
    action: 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED',
    paymentId: string,
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'PAYMENT',
      resourceId: paymentId,
      details: {
        timestamp: new Date(),
        paymentId,
        amount: details?.amount || 0,
        transactionRef: details?.transactionRef || null,
        bankAccount: details?.bankAccount || null,
        ...details
      }
    });
  }

  /**
   * Log system integrations
   */
  static async logIntegration(
    userId: string,
    action: 'AADHAAR_VERIFICATION' | 'DIGILOCKER_FETCH' | 'CCTNS_QUERY' | 'PFMS_PAYMENT',
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'EXTERNAL_INTEGRATION',
      details: {
        timestamp: new Date(),
        service: details?.service || 'Unknown',
        requestId: details?.requestId || null,
        responseStatus: details?.responseStatus || null,
        responseTime: details?.responseTime || null,
        ...details
      }
    });
  }

  /**
   * Log security events
   */
  static async logSecurity(
    userId: string | null,
    action: 'FAILED_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'DATA_BREACH_ATTEMPT' | 'UNAUTHORIZED_ACCESS',
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId: userId || null,
      action,
      resource: 'SECURITY',
      details: {
        timestamp: new Date(),
        severity: details?.severity || 'MEDIUM',
        ipAddress: details?.ipAddress || '127.0.0.1',
        userAgent: details?.userAgent || 'Unknown',
        attemptedResource: details?.attemptedResource || null,
        ...details
      }
    });
  }

  /**
   * Log admin operations
   */
  static async logAdmin(
    adminUserId: string,
    action: 'USER_ROLE_CHANGED' | 'APPLICATION_REVIEWED' | 'SYSTEM_CONFIG_UPDATED' | 'BULK_OPERATION',
    targetUserId?: string,
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId: adminUserId,
      action,
      resource: 'ADMIN_OPERATION',
      resourceId: targetUserId || null,
      details: {
        timestamp: new Date(),
        targetUserId,
        operationType: details?.operationType || null,
        bulkCount: details?.bulkCount || null,
        configChanges: details?.configChanges || null,
        ...details
      }
    });
  }

  /**
   * Log document operations
   */
  static async logDocument(
    userId: string,
    action: 'DOCUMENT_UPLOADED' | 'DOCUMENT_VERIFIED' | 'DOCUMENT_REJECTED' | 'DOCUMENT_DELETED',
    documentType: string,
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'DOCUMENT',
      details: {
        timestamp: new Date(),
        documentType,
        fileName: details?.fileName || null,
        fileSize: details?.fileSize || null,
        uploadSource: details?.uploadSource || 'MANUAL',
        verificationStatus: details?.verificationStatus || null,
        ...details
      }
    });
  }

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Get audit logs for an application
   */
  static async getApplicationAuditLogs(applicationId: string): Promise<any[]> {
    return AuditLog.find({
      resource: 'APPLICATION',
      resourceId: applicationId
    })
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Get security logs
   */
  static async getSecurityLogs(
    limit: number = 100,
    severity?: string
  ): Promise<any[]> {
    const filter: any = { resource: 'SECURITY' };
    if (severity) {
      filter['details.severity'] = severity;
    }

    return AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
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
            resource: '$resource'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.resource',
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

    return AuditLog.aggregate(pipeline);
  }

  /**
   * Clean old audit logs (older than retention period)
   */
  static async cleanOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount || 0;
  }

  /**
   * Search audit logs
   */
  static async searchLogs(
    searchParams: {
      userId?: string;
      action?: string;
      resource?: string;
      fromDate?: Date;
      toDate?: Date;
      ipAddress?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const filter: any = {};

    if (searchParams.userId) filter.userId = searchParams.userId;
    if (searchParams.action) filter.action = new RegExp(searchParams.action, 'i');
    if (searchParams.resource) filter.resource = searchParams.resource;
    if (searchParams.ipAddress) filter['details.ipAddress'] = searchParams.ipAddress;
    
    if (searchParams.fromDate || searchParams.toDate) {
      filter.timestamp = {};
      if (searchParams.fromDate) filter.timestamp.$gte = searchParams.fromDate;
      if (searchParams.toDate) filter.timestamp.$lte = searchParams.toDate;
    }

    return AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  /**
   * Log blockchain transaction
   */
  static async logBlockchain(
    userId: string,
    action: 'BLOCKCHAIN_RECORD_CREATED' | 'BLOCKCHAIN_VERIFICATION' | 'SMART_CONTRACT_EXECUTED',
    details?: any
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      resource: 'BLOCKCHAIN',
      details: {
        timestamp: new Date(),
        blockHash: details?.blockHash || null,
        transactionHash: details?.transactionHash || null,
        contractAddress: details?.contractAddress || null,
        gasUsed: details?.gasUsed || null,
        ...details
      }
    });
  }
}