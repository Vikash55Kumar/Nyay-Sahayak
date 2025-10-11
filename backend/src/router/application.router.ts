import express from 'express';
import { 
  submitIntercasteMarriageApplication,
  getApplicationStatus,
  getBeneficiaryApplications,
  verifyMarriageCertificate,
  checkIntercasteMarriage
} from '../controller/application.controller';
import { submitAtrocityReliefApplication } from '../controller/atrocity.controller';

const router = express.Router();

// Application Management Routes
router.post('/intercaste-marriage', submitIntercasteMarriageApplication);
router.post('/atrocity-relief', submitAtrocityReliefApplication);
router.get('/status/:applicationId', getApplicationStatus);
router.get('/my-applications', getBeneficiaryApplications);

// Utility Routes for Marriage Verification
router.post('/verify-marriage-certificate', verifyMarriageCertificate);
router.post('/check-intercaste-marriage', checkIntercasteMarriage);

export default router;