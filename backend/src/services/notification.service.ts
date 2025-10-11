import { ApiError } from '../utility/ApiError';
import Twilio from 'twilio';
import ApiResponse from '../utility/ApiResponse';
import nodemailer from 'nodemailer';

// Template-based notification system for reusability
interface NotificationTemplate {
  sms: string;
  email: {
    subject: string;
    body: string;
  };
}

interface TemplateData {
  [key: string]: string | number;
}

// Notification Templates
const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  OTP: {
    sms: "Your न्याय सहायक {{purpose}} OTP is: {{otp}}. Valid for 10 minutes. Do not share with anyone. - Ministry of Social Justice & Empowerment",
    email: {
      subject: "न्याय सहायक Portal - {{purpose}} OTP",
      body: "Your {{purpose}} OTP is: {{otp}}. This OTP is valid for 10 minutes only. Please do not share this OTP with anyone for security reasons."
    }
  },
  
  REGISTRATION_SUCCESS: {
    sms: "Welcome to न्याय सहायक, {{userName}}! Registration successful. You can now apply for social justice schemes and relief benefits. - Ministry of Social Justice & Empowerment",
    email: {
      subject: "Welcome to न्याय सहायक Portal - Registration Successful",
      body: "Dear {{userName}}, your registration with न्याय सहायक portal has been completed successfully. You can now login and apply for various social justice schemes and relief benefits available through the Ministry of Social Justice & Empowerment."
    }
  },
  
  PROFILE_VERIFICATION: {
    sms: "Your न्याय सहायक profile has been {{status}} by authorities. {{statusMessage}} - Ministry of Social Justice & Empowerment",
    email: {
      subject: "न्याय सहायक Profile {{status}}",
      body: "Dear Citizen, your profile verification status has been updated to: {{status}}. {{statusMessage}}. You can check your dashboard for more details."
    }
  },
  
  APPLICATION_SUBMITTED: {
    sms: "Application {{applicationId}} submitted successfully for {{applicationType}}. Under review by district authorities. Track progress on न्याय सहायक portal.",
    email: {
      subject: "Application Submitted - {{applicationId}}",
      body: "Your application {{applicationId}} for {{applicationType}} has been submitted successfully. It is currently under review by the district authorities. You can track the progress on the न्याय सहायक portal using your application ID."
    }
  },
  
  APPLICATION_APPROVED: {
    sms: "🎉 Great news! Application {{applicationId}} for {{applicationType}} has been approved by authorities. DBT payment of ₹{{amount}} will be processed shortly to your Aadhaar-linked account.",
    email: {
      subject: "Application Approved - {{applicationId}}",
      body: "Congratulations! Your application {{applicationId}} for {{applicationType}} has been approved by the concerned authorities. The approved amount of ₹{{amount}} will be transferred to your Aadhaar-linked bank account through Direct Benefit Transfer (DBT) within 2-3 working days."
    }
  },
  
  APPLICATION_REJECTED: {
    sms: "Application {{applicationId}} for {{applicationType}} has been rejected. Reason: {{rejectionReason}}. You may reapply after addressing the issues. Check न्याय सहायक portal for details.",
    email: {
      subject: "Application Status Update - {{applicationId}}",
      body: "Your application {{applicationId}} for {{applicationType}} has been rejected. Rejection Reason: {{rejectionReason}}. Please review the feedback and you may submit a fresh application after addressing the mentioned issues."
    }
  },
  
  PAYMENT_INITIATED: {
    sms: "💰 Payment of ₹{{amount}} for application {{applicationId}} has been initiated through DBT. Amount will be credited to your Aadhaar-linked account in 2-3 working days. Ref: {{transactionId}}",
    email: {
      subject: "Payment Initiated - {{applicationId}}",
      body: "Payment of ₹{{amount}} for your approved application {{applicationId}} has been initiated through Direct Benefit Transfer (DBT). The amount will be credited to your Aadhaar-linked bank account within 2-3 working days. Transaction Reference: {{transactionId}}"
    }
  },
  
  PAYMENT_COMPLETED: {
    sms: "✅ Payment of ₹{{amount}} for application {{applicationId}} has been credited to your account successfully. Check your bank statement. Ref: {{transactionId}}",
    email: {
      subject: "Payment Completed - {{applicationId}}",
      body: "The payment of ₹{{amount}} for your application {{applicationId}} has been successfully credited to your Aadhaar-linked bank account. Please check your bank statement for confirmation. Transaction Reference: {{transactionId}}"
    }
  },
  
  DOCUMENT_VERIFICATION: {
    sms: "Document verification {{status}} for application {{applicationId}}. {{message}} Contact district office if you have queries.",
    email: {
      subject: "Document Verification Update - {{applicationId}}",
      body: "Document verification status for your application {{applicationId}} has been updated. Status: {{status}}. {{message}}. If you have any queries, please contact your district collector office."
    }
  },
  
  LOGIN_ALERT: {
    sms: "🔐 Security Alert: Login to न्याय सहायक at {{timestamp}} IST from {{device}}. If this wasn't you, contact support immediately.",
    email: {
      subject: "Security Alert - न्याय सहायक Login",
      body: "A login was detected on your न्याय सहायक account at {{timestamp}} IST from device: {{device}}, IP: {{ipAddress}}. If this login was not made by you, please contact our support team immediately and change your password."
    }
  },
  
  APPOINTMENT_SCHEDULED: {
    sms: "Appointment scheduled for {{date}} at {{time}} for application {{applicationId}}. Venue: {{venue}}. Bring required documents. Contact: {{contactNumber}}",
    email: {
      subject: "Appointment Scheduled - {{applicationId}}",
      body: "An appointment has been scheduled for your application {{applicationId}} on {{date}} at {{time}}. Venue: {{venue}}. Please bring all required documents mentioned in your application. For queries, contact: {{contactNumber}}"
    }
  }
};

export class NotificationService {
  
  // Check if mock mode is enabled
  private static isMockMode(): boolean {
    return process.env.NOTIFICATION_MOCK_SMS === 'true';
  }

  // Provider initialization
  private static getEmailTransporter() {
    const user = process.env.NODE_MAIL;
    const pass = process.env.NODE_APP_KEY;
    if (!user || !pass) return null;

    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  private static getTwilioClient() {
    // Skip Twilio in mock mode
    if (this.isMockMode()) return null;
    
    const sid = process.env.TWILIO_SMS_SID;
    const token = process.env.TWILIO_SMS_AUTH_TOKEN;
    if (!sid || !token) return null;
    
    return Twilio(sid, token);
  }

  // Template replacement utility
  private static replaceTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  }

  // Core notification sender with template support (NO DB STORAGE)
  private static async sendNotification(
    templateName: string,
    mobileNumber: string,
    templateData: TemplateData,
    options: {
      sendSMS?: boolean;
      sendEmail?: boolean;
      email?: string;
    } = {}
  ): Promise<ApiResponse<{ sent: string[] }>> {
    const { sendSMS = true, sendEmail = false, email } = options;
    const template = NOTIFICATION_TEMPLATES[templateName];
    
    if (!template) {
      throw new ApiError(400, `Template '${templateName}' not found`);
    }

    const sent: string[] = [];

    try {
      // Send SMS immediately - NO DATABASE STORAGE
      if (sendSMS) {
        const smsMessage = this.replaceTemplate(template.sms, templateData);
        await this.sendSMSImmediate(mobileNumber, smsMessage);
        sent.push('SMS');
      }

      // Send Email immediately - NO DATABASE STORAGE
      if (sendEmail && email) {
        const emailSubject = this.replaceTemplate(template.email.subject, templateData);
        const emailBody = this.replaceTemplate(template.email.body, templateData);
        await this.sendEmailImmediate(email, emailSubject, emailBody);
        sent.push('EMAIL');
      }

      return new ApiResponse(200, { sent }, `Notification sent via: ${sent.join(', ')}`);
      
    } catch (error) {
      throw new ApiError(500, `Failed to send ${templateName} notification: ${error}`);
    }
  }

  // ==== HIGH-LEVEL NOTIFICATION METHODS (Easy to use) ====

  // OTP Notifications (immediate send only)
  static async sendOTP(
    mobileNumber: string, 
    otp: string, 
    purpose: string = 'verification',
    sendEmail: boolean = false,
    email?: string
  ): Promise<ApiResponse<{ sent: string[] }>> {
    console.log(`🔐 OTP sent to ${mobileNumber.replace(/(\d{3})\d*(\d{3})/, '$1***$2')}`);
    
    return this.sendNotification('OTP', mobileNumber, { otp, purpose }, {
      sendSMS: true,
      sendEmail: sendEmail,
      email: email
    });
  }

  // Registration Success
  static async sendRegistrationSuccess(
    mobileNumber: string, 
    userName: string,
    sendEmail: boolean = false,
    email?: string
  ): Promise<ApiResponse<{ sent: string[] }>> {
    return this.sendNotification('REGISTRATION_SUCCESS', mobileNumber, { userName }, {
      sendSMS: true,
      sendEmail: sendEmail,
      email: email
    });
  }

  // Profile Verification Updates
  static async sendProfileVerification(
    mobileNumber: string,
    status: 'VERIFIED' | 'PENDING' | 'REJECTED',
    sendEmail: boolean = false,
    email?: string
  ): Promise<ApiResponse<{ sent: string[] }>> {
    const statusMessages = {
      'VERIFIED': 'You can now submit applications for relief schemes.',
      'PENDING': 'Your profile is under verification by authorities.',
      'REJECTED': 'Please check your dashboard and resubmit required documents.'
    };

    return this.sendNotification('PROFILE_VERIFICATION', mobileNumber, {
      status: status.toLowerCase(),
      statusMessage: statusMessages[status]
    }, {
      sendSMS: true,
      sendEmail: sendEmail,
      email: email
    });
  }

  // Application Status Updates
  static async sendApplicationUpdate(
    mobileNumber: string,
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED',
    additionalData: {
      schemeName?: string;
      amount?: number;
      rejectionReason?: string;
      transactionId?: string;
    } = {},
    sendEmail: boolean = false,
    email?: string
  ): Promise<ApiResponse<{ sent: string[] }>> {
    const templateMap = {
      'SUBMITTED': 'APPLICATION_SUBMITTED',
      'APPROVED': 'APPLICATION_APPROVED', 
      'REJECTED': 'APPLICATION_REJECTED',
      'PAYMENT_INITIATED': 'PAYMENT_INITIATED',
      'PAYMENT_COMPLETED': 'PAYMENT_COMPLETED'
    };

    const templateName = templateMap[status];
    const templateData = {
      schemeName: additionalData.schemeName || 'Social Justice Scheme',
      amount: additionalData.amount || 0,
      rejectionReason: additionalData.rejectionReason || 'Not specified',
      transactionId: additionalData.transactionId || 'TXN' + Date.now()
    };

    return this.sendNotification(templateName, mobileNumber, templateData, {
      sendSMS: true,
      sendEmail: sendEmail,
      email: email
    });
  }

  // Document Verification Updates
  static async sendDocumentVerification(
    mobileNumber: string,
    status: 'VERIFIED' | 'PENDING' | 'REJECTED',
    message: string = '',
    sendEmail: boolean = false,
    email?: string
  ): Promise<ApiResponse<{ sent: string[] }>> {
    return this.sendNotification('DOCUMENT_VERIFICATION', mobileNumber, {
      status: status.toLowerCase(),
      message: message || 'Please check your dashboard for details.'
    }, {
      sendSMS: true,
      sendEmail: sendEmail,
      email: email
    });
  }

  // Login Security Alerts (immediate send only)
  static async sendLoginAlert(
    mobileNumber: string,
    userAgent: string,
    ipAddress: string,
    sendEmail: boolean = false,
    email?: string
  ): Promise<ApiResponse<{ sent: string[] }>> {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    return this.sendNotification('LOGIN_ALERT', mobileNumber, {
      timestamp,
      device: userAgent.substring(0, 50),
      ipAddress
    }, {
      sendSMS: true,
      sendEmail: sendEmail,
      email: email
    });
  }

  // Send SMS immediately
  private static async sendSMSImmediate(to: string, message: string): Promise<void> {
    // Mock mode for development/testing
    if (this.isMockMode()) {
      console.log('🔧 [MOCK SMS] Would send to:', to);
      console.log('📱 [MOCK SMS] Message:', message);
      console.log('📱 [MOCK SMS] ✅ Mock SMS sent successfully');
      return; // Success without actually sending
    }

    const client = this.getTwilioClient();
    if (!client) throw new Error('SMS service not configured');
    
    const from = process.env.TWILIO_SMS_PHONE_NUMBER;
    if (!from) throw new Error('SMS sender number not configured');

    // Format phone number for India (+91)
    let formattedTo = to;
    if (!to.startsWith('+')) {
      // If it's a 10-digit Indian number, add +91
      if (to.match(/^[6-9]\d{9}$/)) {
        formattedTo = `+91${to}`;
      } else {
        throw new Error('Invalid phone number format');
      }
    }

    console.log(`📱 Sending SMS to: ${formattedTo}`);
    await client.messages.create({ body: message, from, to: formattedTo });
  }

  // Send Email immediately with government template
  private static async sendEmailImmediate(to: string, subject: string, content: string): Promise<void> {
    const transporter = this.getEmailTransporter();
    if (!transporter) throw new Error('Email service not configured');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; font-family: Arial, sans-serif; line-height: 1.6; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .govt-seal { color: #FF6B35; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🏛️ न्याय सहायक पोर्टल</h2>
          <p>Ministry of Social Justice & Empowerment, Government of India</p>
        </div>
        <div class="content">
          <p>Dear Citizen,</p>
          <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          <p style="margin-top: 20px;">
            <strong>Best Regards,</strong><br/>
            <span class="govt-seal">न्याय सहायक Support Team</span><br/>
            Ministry of Social Justice & Empowerment<br/>
            Government of India
          </p>
        </div>
        <div class="footer">
          <p>📧 This is an automated message. Please do not reply.</p>
          <p>🌐 Visit: <a href="https://socialjustice.gov.in">Ministry Website</a></p>
          <p>© Government of India | समय सत्यं</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"न्याय सहायक Portal" <${process.env.NODE_MAIL}>`,
      to,
      subject,
      text: content,
      html: htmlContent
    });
  }

  // Send custom notification with any template
  static async sendCustomNotification(
    templateName: string,
    mobileNumber: string,
    templateData: TemplateData,
    options: {
      sendSMS?: boolean;
      sendEmail?: boolean;
      email?: string;
    } = {}
  ): Promise<ApiResponse<{ sent: string[] }>> {
    return this.sendNotification(templateName, mobileNumber, templateData, options);
  }
}