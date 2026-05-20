import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, UserCheck, Calendar, History, Briefcase, Mail,
  ChevronDown, LogOut, Upload, Download, Eye, AlertCircle,
  Search, Filter, Clock, X, Info, UserMinus, AlertTriangle, CheckCircle
} from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const TerminationAppealsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const basePath = storedUser?.role === "HR Manager" ? "/HR-Manager-Dashboard" : "/HR-Dashboard";

  // State Management
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dropdowns
  const [showRecruitmentDropdown, setShowRecruitmentDropdown] = useState(false);
  const [showInterviewDropdown, setShowInterviewDropdown] = useState(false);
  const [showInternDropdown, setShowInternDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const recruitmentDropdownRef = useRef(null);
  const interviewDropdownRef = useRef(null);
  const internDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Click away listeners for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (recruitmentDropdownRef.current && !recruitmentDropdownRef.current.contains(event.target)) {
        setShowRecruitmentDropdown(false);
      }
      if (interviewDropdownRef.current && !interviewDropdownRef.current.contains(event.target)) {
        setShowInterviewDropdown(false);
      }
      if (internDropdownRef.current && !internDropdownRef.current.contains(event.target)) {
        setShowInternDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    if (!storedUser || (storedUser.role !== "Admin" && storedUser.role !== "HR Manager")) {
      navigate("/login");
      return;
    }
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/hr/interns", { withCredentials: true });
      setInterns(data.interns || []);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load termination appeals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTermination = async (internId) => {
    if (!window.confirm("Are you absolutely sure you want to approve this termination? This will terminate the intern's internship immediately.")) return;

    try {
      setLoading(true);
      const res = await axios.post(`/api/admin/interns/${internId}/approve-termination`, {}, { withCredentials: true });
      if (res.status === 200) {
        alert("✅ Intern terminated successfully!");
        fetchInterns();
      }
    } catch (err) {
      console.error("Error approving termination:", err);
      alert(err.response?.data?.message || "Failed to approve termination appeal");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTerminationAppeal = async (internId) => {
    if (!window.confirm("Are you sure you want to reject this termination appeal? The intern will remain active in the system.")) return;

    try {
      setLoading(true);
      const res = await axios.post(`/api/admin/interns/${internId}/reject-termination`, {}, { withCredentials: true });
      if (res.status === 200) {
        alert("✅ Appeal rejected. Intern status restored to active.");
        fetchInterns();
      }
    } catch (err) {
      console.error("Error rejecting appeal:", err);
      alert(err.response?.data?.message || "Failed to reject termination appeal");
    } finally {
      setLoading(false);
    }
  };

  // Compile termination appeals list
  const appealsList = interns.filter(intern => intern.terminationAppeal === true);

  // Search Filter
  const filteredAppeals = appealsList.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.fullName.toLowerCase().includes(query) ||
      log.email.toLowerCase().includes(query) ||
      (log.uniqueId && log.uniqueId.toLowerCase().includes(query)) ||
      log.domain.toLowerCase().includes(query) ||
      (log.terminationAppealReason && log.terminationAppealReason.toLowerCase().includes(query))
    );
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppeals = filteredAppeals.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#fafafa] font-['Outfit',sans-serif] text-slate-900 antialiased p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ── NAVBAR ── */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-5 py-3 no-print relative z-40 overflow-visible">
          {/* Rainbow top line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-rose-500 rounded-t-2xl" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="p-1.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shadow-inner">
                <img src={Graphura} alt="Logo" className="h-7 object-contain" />
              </div>
              <div className="hidden lg:block">
                <p className="text-[13px] font-black text-slate-800 tracking-tight leading-none">IMS Portal</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">HR Manager</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 shrink-0 hidden sm:block" />

            {/* Nav pills */}
            <nav className="flex flex-wrap items-center gap-1 sm:gap-0.5">
              {/* Dashboard */}
              <button
                onClick={() => navigate(basePath)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  location.pathname === basePath
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>

              {/* Intern Action */}
              <div className="relative" ref={internDropdownRef}>
                <button
                  onClick={() => { setShowInternDropdown(!showInternDropdown); setShowInterviewDropdown(false); setShowRecruitmentDropdown(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 bg-indigo-500 text-white shadow-md`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Intern Action
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                </button>
                {showInternDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                    <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Intern Management</p>
                    {[
                      { label: "All Applications", path: "/HR-Manager-Dashboard/applications", icon: <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> },
                      { label: "Active Interns",   path: "/HR-Manager-Dashboard/active-interns", icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> },
                      { label: "Planner",          path: "/HR-Manager-Dashboard/manage-planner", icon: <Calendar className="w-3.5 h-3.5 text-sky-400" /> },
                      { label: "Warning Logs",     path: "/HR-Manager-Dashboard/warning-logs",   icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" /> },
                      { label: "Termination Appeals", path: "/HR-Manager-Dashboard/termination-appeals", icon: <UserMinus className="w-3.5 h-3.5 text-rose-500" /> },
                    ].map(({ label, path, icon }) => (
                      <button key={path} onClick={() => { setShowInternDropdown(false); navigate(path); }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${location.pathname === path ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}>
                        {icon}{label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Interview Action */}
              <div className="relative" ref={interviewDropdownRef}>
                <button
                  onClick={() => { setShowInterviewDropdown(!showInterviewDropdown); setShowInternDropdown(false); setShowRecruitmentDropdown(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    showInterviewDropdown || ["/HR-Manager-Dashboard/interview-invite","/HR-Manager-Dashboard/interview-history"].includes(location.pathname)
                      ? "bg-purple-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Interview Action
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                </button>
                {showInterviewDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                    <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Interview</p>
                    {[
                      { label: "Send Interview Invites", path: "/HR-Manager-Dashboard/interview-invite",  icon: <Mail className="w-3.5 h-3.5 text-purple-400" /> },
                      { label: "Schedule Interview",     path: "/HR-Manager-Dashboard/interview-history", icon: <History className="w-3.5 h-3.5 text-violet-400" /> },
                    ].map(({ label, path, icon }) => (
                      <button key={path} onClick={() => { setShowInterviewDropdown(false); navigate(path); }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${location.pathname === path ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}>
                        {icon}{label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recruitment Tools */}
              <div className="relative" ref={recruitmentDropdownRef}>
                <button
                  onClick={() => { setShowRecruitmentDropdown(!showRecruitmentDropdown); setShowInternDropdown(false); setShowInterviewDropdown(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    showRecruitmentDropdown
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Recruitment Tools
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                </button>
                {showRecruitmentDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                    <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Campaign Actions</p>
                    <button onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerImport: true } }); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-orange-400" />Import Excel Database
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Exports</p>
                    <button onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerExport: true } }); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />Export Interns Data
                    </button>
                    <button onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerCustomExport: true } }); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                      <Download className="w-3.5 h-3.5 text-indigo-400" />Custom Excel Export
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Profile Dropdown */}
            <div className="shrink-0 relative sm:ml-auto" ref={profileDropdownRef}>
              <button
                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowInternDropdown(false); setShowInterviewDropdown(false); setShowRecruitmentDropdown(false); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-black uppercase shadow-sm">
                  {storedUser?.fullName?.slice(0, 2) || "HR"}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[11px] font-black text-slate-800 leading-none">{storedUser?.fullName || "HR Manager"}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{storedUser?.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-black text-slate-800 leading-tight">{storedUser?.fullName}</p>
                    <p className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">{storedUser?.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── HEADER TITLE & STATS ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserMinus className="w-6 h-6 text-red-500" />
              Termination Appeals
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Review and act on intern termination appeals submitted by department incharges.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-800 font-extrabold text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
              Pending Appeals: {appealsList.length}
            </span>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search appeals by name, email, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-bold transition-all duration-200 bg-slate-50/50"
            />
          </div>
        </div>

        {/* ── MAIN TABLE CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-slate-400">Loading termination appeals...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        ) : paginatedAppeals.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Intern Details</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Department & Warnings</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Meetings Info</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Appeal Details</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {paginatedAppeals.map((intern) => {
                    const attPercentage = intern.totalMeetings > 0 
                      ? ((intern.meetingsAttended / intern.totalMeetings) * 100).toFixed(1) + "%" 
                      : "0%";

                    return (
                      <tr key={intern._id} className="hover:bg-slate-50/25 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-800 text-xs">{intern.fullName}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {intern.uniqueId || "N/A"}</div>
                          <div className="text-[10px] font-bold text-slate-400">{intern.email}</div>
                          <div className="text-[10px] font-bold text-slate-400">📞 {intern.mobile || "N/A"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-[9px] font-black uppercase">
                            {intern.domain}
                          </span>
                          <div className="text-[10px] font-bold text-amber-600 mt-1">
                            ⚠️ Warnings: {intern.warningCount || 0}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-black text-emerald-600">{intern.meetingsAttended || 0}</span>
                          <span className="text-xs font-bold text-slate-400"> / {intern.totalMeetings || 0}</span>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">Rate: {attPercentage}</div>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <div className="text-[10px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed break-words">
                            {intern.terminationAppealReason || "No reason specified."}
                          </div>
                          {intern.terminationAppealDate && (
                            <div className="text-[9px] text-slate-400 mt-1">
                              Date: {new Date(intern.terminationAppealDate).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveTermination(intern._id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 text-[10px] font-black shadow-md shadow-red-100 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectTerminationAppeal(intern._id)}
                              className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 text-[10px] font-black shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50/75 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAppeals.length)} of {filteredAppeals.length} entries
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    &larr; Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "text-slate-600 bg-white hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-slate-300 text-6xl mb-4">🛡️</div>
            <h3 className="text-base font-black text-slate-700 mb-1">No Pending Appeals</h3>
            <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto">There are currently no pending appeals for intern termination submitted by any Incharges.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminationAppealsPage;
