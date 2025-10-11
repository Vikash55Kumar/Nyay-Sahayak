import { Router } from "express";
import { 
    initiateRegistration,
    verifyOTPAndGetAadhaarData,
    fetchCasteFromDigiLocker,
    completeRegistration,
    sendLoginOTP,
    resendOTP,
    loginBeneficiary,
    getUserProfile
} from "../controller/user.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes - Registration Flow (Step by Step)
router.post("/initiate-registration", initiateRegistration);
router.post("/verify-otp-get-aadhaar", verifyOTPAndGetAadhaarData);
router.post("/fetch-caste-digilocker", fetchCasteFromDigiLocker);
router.post("/complete-registration", completeRegistration);
router.post("/resend-otp", resendOTP);

// Public routes - Login Flow
router.post("/send-login-otp", sendLoginOTP);
router.post("/login", loginBeneficiary);

// Protected routes (require authentication)
router.get("/profile", authenticate, getUserProfile);

router.get('/active', (req, res) => {
  res.send('active');
});

export default router;

