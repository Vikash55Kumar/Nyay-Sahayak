import express from 'express';
import { 
  getApplicationStatus,
  getBeneficiaryApplications,
  getApplicationTimeline,
  updateApplicationStatus
} from '../controller/application.controller';
import { submitCasteDiscriminationApplication, verifyAtrocityApplicationForAuthority } from '../controller/caste-discrimination.controller';
import { checkIntercasteMarriage, submitIntercasteMarriageApplication, verifyMarriageCertificate, verifyMarriageDetailsForAuthority } from '../controller/merriage.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Application Management Routes
router.post('/intercaste-marriage', authenticate, submitIntercasteMarriageApplication);
router.post('/atrocity-relief', submitCasteDiscriminationApplication);
router.get('/status/:applicationId', getApplicationStatus);
router.get('/timeline/:applicationId', getApplicationTimeline); // Enhanced tracking
router.get('/my-applications', authenticate, getBeneficiaryApplications);

// Authority Routes for Status Updates
router.put('/authority/update-status/:applicationId', authenticate, updateApplicationStatus);

// Utility Routes for Marriage Verification
router.post('/verify-marriage-certificate', verifyMarriageCertificate);
router.post('/check-intercaste-marriage', authenticate, checkIntercasteMarriage);

// Authority Routes for Marriage Verification
router.post('/authority/verify-marriage-details', verifyMarriageDetailsForAuthority);

// Authority Routes for Atrocity Relief Verification
router.get('/authority/verify-atrocity/:applicationId', verifyAtrocityApplicationForAuthority);

export default router;