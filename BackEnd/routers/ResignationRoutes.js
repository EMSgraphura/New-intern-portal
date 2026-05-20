import express from "express";
import { submitResignation, acceptResignation, rejectResignation, sendPenaltyEmail } from "../controllers/ResignationController.js";
import upload from "../middlewares/CloudinaryMiddleware.js";
import { bulkDeleteResignations } from "../controllers/ResignationController.js";
import { verifyToken } from "../middlewares/AuthVerify.js";

const router = express.Router();

router.post("/intern/resignation", upload.single("evidence"), submitResignation);
router.put("/intern/resignation/accept/:resignationId", verifyToken, acceptResignation);
router.put("/intern/resignation/reject/:resignationId", verifyToken, rejectResignation);
router.post("/resignation/penalty/:resignationId", verifyToken, sendPenaltyEmail);
router.post("/admin/resignations/delete-many", verifyToken, bulkDeleteResignations);

export default router;