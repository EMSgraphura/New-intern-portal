import express from 'express';
import { registerUser , loginUser, checkAuth, forgotPassword, verifyOtp, resetPassword, resendOtp} from '../controllers/AuthController.js';
import {verifyToken} from '../middlewares/AuthVerify.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp',verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);


router.get("/check-auth", verifyToken, checkAuth);

import Resignation from "../models/ResignationDB.js";

router.post("/resignation", async (req, res) => {
  try {
    const resignation = new Resignation(req.body);
    await resignation.save();
    res.status(201).json({ message: "Resignation submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;



