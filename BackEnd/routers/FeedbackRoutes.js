import express from "express"
import { getInternDetails, submitFeedback} from "../controllers/FeedbackController.js"
import upload from "../middlewares/CloudinaryMiddleware.js"


const router = express.Router();


router.get("/interns/:uniqueId", getInternDetails)
router.post("/feedback", upload.fields([{ name: "photo", maxCount: 1 }, { name: "video", maxCount: 1 }]), submitFeedback)


export default router