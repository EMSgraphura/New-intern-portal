import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ApplicationForm from "./pages/Intern/ApplicationForm";
import HomePage from "./pages/Landing/Home";
import RegisterPage from "./Authentication/RegisterForm";
import LoginPage from "./Authentication/LoginForm";
import HrDashboard from "./pages/HR/HrDashboard"
import ActiveInternsPage from "./pages/HR/ActiveInternsPage";
import InternDetail from "./pages/Intern/InternProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import InternInchargeRegister from "./Authentication/InternInchargeRegister";
import InternInchargeLogin from "./Authentication/InternInchargeLogin";
import InternInchargeDashboard from "./pages/Incharge/InchargeDashboard";
import InternInchargeProfile from "./pages/Incharge/InchargeProfile";
import AttendaceAdminPage from "./pages/Admin/AttendaceAdminPage";
import FeedbackForm from "./pages/Feedback/FeedbackFrom";
import ReviewTeamLogin from "./pages/Feedback/ReviewTeamLogin";
import ReviewTeamDashboard from "./pages/Feedback/ReviewDashboard";
import InternVerificationPortal from "./pages/VerifyPortal/VerificationIntern";
import AttendanceVerificationPage from "./pages/VerifyPortal/AttendanceVerificationPage";
import LeaveApplicationForm from "./pages/Leave/Leavepage";
import AdminLeavesPage from "./pages/Admin/LeaveAdminPage";
import Resignation from "./pages/Resignation/Resignation";
// import ResignationApplicationForm from "./pages/Resignation/ResignationApplicationForm";
import ResignationAdminPage from "./pages/Admin/ResignationAdminPage";
import InchargeResignationPage from "./pages/Incharge/InchargeResignationPage";
import DailyTaskForm from "./pages/DailyTask/DailyTaskForm";
import AdminDailyTasks from "./pages/Admin/AdminDailyTasks";
import InternTasks from "./pages/Incharge/InternTasks";
import InterviewHistory from "./pages/HR/InterviewHistory";
import WeeklyPlanner from "./pages/Public/WeeklyPlanner";
import ManagePlanner from "./pages/HR/ManagePlanner";
import InterviewInvitePage from "./pages/HR/InterviewInvitePage";
import HrManagerDashboard from "./pages/HR/HrManagerDashboard";
import WarningLogsPage from "./pages/HR/WarningLogsPage";
import TerminationAppealsPage from "./pages/HR/TerminationAppealsPage";
import AdminLorPage from "./pages/Admin/AdminLorPage";
import AdminOfferLetterPage from "./pages/Admin/AdminOfferLetterPage";
import AdminLetterheadPage from "./pages/Admin/AdminLetterheadPage";
import AdminAttendanceOverridePage from "./pages/Admin/AdminAttendanceOverridePage";
import NetworkPage from "./pages/Public/Network";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/incharge/intern-tasks" element={<InternTasks />} />
        <Route path="/incharge/manage-planner" element={<ManagePlanner />} />


        <Route path="/Verify/intern" element={<InternVerificationPortal />} />
        <Route path="/verify/attendance" element={<AttendanceVerificationPage />} />
        <Route path="/leave/intern" element={<LeaveApplicationForm />} />
        
        <Route path="/admin/manage-resignations" element={<ResignationAdminPage />} />
        <Route path="/incharge/manage-resignations" element={<InchargeResignationPage />} />

        <Route path="/incharge/manage-resignations" element={<ResignationAdminPage />}/>
        <Route path="/daily-task" element={<DailyTaskForm />} />
         <Route path="/admin/daily-tasks" element={<AdminDailyTasks />} />




        <Route path="/intern-incharge-register" element={<InternInchargeRegister />} />
        <Route path="/resignation" element={<Resignation />} />
        {/* <Route path="/resignation" element={<ResignationApplicationForm />} /> */}




        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/review-team-login" element={<ReviewTeamLogin />} />
        <Route path="/review-team/dashboard" element={<ReviewTeamDashboard />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/intern-incharge-login" element={<InternInchargeLogin />} />


        <Route path="/HR-Dashboard" element={<HrDashboard />} />
        <Route path="/HR-Dashboard/active-interns" element={<ActiveInternsPage />} />
        <Route path="/HR-Dashboard/interview-history" element={<InterviewHistory />} />
        <Route path="/HR-Dashboard/manage-planner" element={<ManagePlanner />} />
        <Route path="/HR-Dashboard/interview-invite" element={<InterviewInvitePage />} />
        <Route path="/HR-Manager-Dashboard" element={<HrManagerDashboard />} />
        <Route path="/HR-Manager-Dashboard/active-interns" element={<ActiveInternsPage />} />
        <Route path="/HR-Manager-Dashboard/interview-history" element={<InterviewHistory />} />
        <Route path="/HR-Manager-Dashboard/manage-planner" element={<ManagePlanner />} />
        <Route path="/HR-Manager-Dashboard/interview-invite" element={<InterviewInvitePage />} />
        <Route path="/HR-Manager-Dashboard/applications" element={<HrDashboard />} />
        <Route path="/HR-Manager-Dashboard/warning-logs" element={<WarningLogsPage />} />
        <Route path="/HR-Manager-Dashboard/termination-appeals" element={<TerminationAppealsPage />} />
        <Route path="/weekly-planner" element={<WeeklyPlanner />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/intern-incharge-dashboard" element={<InternInchargeDashboard />} />


        <Route path="/HR-Dashboard/intern/:id" element={<InternDetail role="HR" />} />
        <Route path="/Admin-Dashboard/incharge/:id" element={<InternInchargeProfile />} />
        <Route path="/Admin-Dashboard/intern/:id" element={<InternDetail role="Admin" />} />
        <Route path="/Admin-Dashboard" element={<AdminDashboard />} />
        <Route path="/Admin-Dashboard/attendance" element={<AttendaceAdminPage />} />
        <Route path="/Admin-Dashboard/leaves" element={<AdminLeavesPage />} />
        <Route path="/Admin-Dashboard/generate-lor" element={<AdminLorPage />} />
        <Route path="/Admin-Dashboard/generate-offer-letter" element={<AdminOfferLetterPage />} />
        <Route path="/Admin-Dashboard/generate-letterhead" element={<AdminLetterheadPage />} />
        <Route path="/Admin-Dashboard/attendance-override" element={<AdminAttendanceOverridePage />} />


        <Route
          path="*"
          element={
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-purple-200 p-6 text-center">
              <h1 className="text-red-600 font-extrabold text-[8vw] md:text-[6rem]">404</h1>
              <h2 className="text-gray-800 font-semibold text-2xl md:text-4xl mt-2">Page Not Found</h2>
              <p className="text-gray-600 text-sm md:text-lg mt-2 max-w-md">
                The page you are looking for does not exist. Go back to the homepage.
              </p>
              <a
                href="/"
                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Go Home
              </a>
            </div>
          }
        />
      </Routes>

    </Router>
  );
}

export default App;
