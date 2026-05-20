import express from 'express';
import multer from 'multer';
import { createIntern, getApplicationStatus, verifyIntern, verifyAttendanceToken, LeaveApplication, getInternIncharge, getInternCities } from '../controllers/InternControllers.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/createIntern', upload.single('resumeFile'), createIntern);
router.post('/intern/leaves', LeaveApplication);
router.post('/intern/verify', verifyIntern);
router.post('/intern/verify-attendance-token', verifyAttendanceToken);
router.get('/application-status', getApplicationStatus);
router.post("/intern/incharge", getInternIncharge);
router.get('/public/intern-cities', getInternCities);

export default router;