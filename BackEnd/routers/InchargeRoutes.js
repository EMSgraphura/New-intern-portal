import express from "express"
import {registerInternIncharge, loginInternIncharge, checkInternInchargeAuth, logoutInternIncharge, DomainWiseInterns, forgotPassword, verifyOtp, resendOtp, resetPassword, InternComments, DeleteComments, markAttendance,ExtendedDays, meetingDateDetails, MeetingData,
    updateInternPerformance,getInternPerformance,LeaveRequests,approvedLeaveStatus,rejectLeaveStatus, appealTermination
} from "../controllers/InternInchargeControllers.js"
import {protectInternIncharge} from "../middlewares/InchargeMiddle.js"

const router = express.Router()

router.post("/intern-incharge/register", registerInternIncharge)
router.post("/incharge/login", loginInternIncharge)
router.post("/incharge/forgot-password", forgotPassword)
router.post("/incharge/verify-otp", verifyOtp)
router.post("/incharge/resend-otp", resendOtp)
router.post("/incharge/reset-password", resetPassword)
router.post("/incharge/attendance", markAttendance)

router.post("/intern-incharge/leaves/:leaveId/approve", protectInternIncharge, approvedLeaveStatus)
router.post("/intern-incharge/leaves/:leaveId/reject", protectInternIncharge, rejectLeaveStatus)


router.post("/intern-incharge/interns/:internId/comments",protectInternIncharge, InternComments)
    
router.put("/intern-incharge/interns/:internId/performance",protectInternIncharge, updateInternPerformance)


router.delete("/intern-incharge/interns/:internId/comments/:commentId",protectInternIncharge, DeleteComments)

router.get("/intern-incharge/pending-leaves", protectInternIncharge, LeaveRequests)
router.get("/intern-incharge/interns/:internId/performance", protectInternIncharge, getInternPerformance )
router.get("/intern-incharge/department-meeting-details", protectInternIncharge, MeetingData )
router.get("/intern-incharge/department-meeting-dates", protectInternIncharge, meetingDateDetails )
router.get("/intern-incharge/check-auth", protectInternIncharge, checkInternInchargeAuth )
router.get("/intern-incharge/assigned-interns", protectInternIncharge, DomainWiseInterns)
router.post("/intern-incharge/logout", protectInternIncharge, logoutInternIncharge)
router.post("/intern-incharge/interns/:id/extend", protectInternIncharge, ExtendedDays)
router.post("/intern-incharge/interns/:id/appeal-termination", protectInternIncharge, appealTermination)



export default router