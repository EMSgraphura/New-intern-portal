import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, UserCheck, Calendar, History, Briefcase, Mail,
  ChevronDown, LogOut, Upload, Download, Eye, AlertCircle,
  Search, Filter, Clock, X, Info, UserMinus
} from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const WarningLogsPage = () => {
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
      setError("Failed to load warning logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Compile warning logs list
  const warningLogsList = [];
  interns.forEach(intern => {
    const attPercentage = intern.totalMeetings > 0 
      ? ((intern.meetingsAttended / intern.totalMeetings) * 100).toFixed(1) + "%" 
      : "0%";

    if (intern.warningHistory && intern.warningHistory.length > 0) {
      intern.warningHistory.forEach((warn, index) => {
        warningLogsList.push({
          id: `${intern._id}-${index}`,
          internId: intern._id,
          fullName: intern.fullName,
          email: intern.email,
          uniqueId: intern.uniqueId || "N/A",
          domain: intern.domain,
          warningNumber: index + 1,
          date: warn.date,
          reason: warn.reason || "3 consecutive absences marked",
          totalMeetings: intern.totalMeetings || 0,
          meetingsAttended: intern.meetingsAttended || 0,
          attendancePercentage: attPercentage
        });
      });
    } else if (intern.warningCount > 0) {
      for (let i = 0; i < intern.warningCount; i++) {
        warningLogsList.push({
          id: `${intern._id}-legacy-${i}`,
          internId: intern._id,
          fullName: intern.fullName,
          email: intern.email,
          uniqueId: intern.uniqueId || "N/A",
          domain: intern.domain,
          warningNumber: i + 1,
          date: intern.updatedAt || intern.createdAt,
          reason: "Consecutive absences marked",
          totalMeetings: intern.totalMeetings || 0,
          meetingsAttended: intern.meetingsAttended || 0,
          attendancePercentage: attPercentage
        });
      }
    }
  });

  // Sort by date descending
  warningLogsList.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Search Filter
  const filteredWarningLogs = warningLogsList.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.fullName.toLowerCase().includes(query) ||
      log.email.toLowerCase().includes(query) ||
      log.uniqueId.toLowerCase().includes(query) ||
      log.domain.toLowerCase().includes(query) ||
      log.reason.toLowerCase().includes(query)
    );
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWarningLogs = filteredWarningLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredWarningLogs.length / itemsPerPage);

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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    showInternDropdown || ["/HR-Manager-Dashboard/applications", "/HR-Manager-Dashboard/active-interns", "/HR-Manager-Dashboard/manage-planner", "/HR-Manager-Dashboard/warning-logs", "/HR-Manager-Dashboard/termination-appeals"].includes(location.pathname)
                      ? "bg-indigo-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
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
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center uppercase">
                  {storedUser?.fullName?.charAt(0) || "M"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[11px] font-black text-slate-800 truncate max-w-[100px] leading-tight">{storedUser?.fullName || "HR Manager"}</p>
                  <p className="text-[9px] text-indigo-500 font-bold leading-none mt-0.5">{storedUser?.role || "HR Manager"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[12px] font-black text-slate-800 truncate">{storedUser?.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{storedUser?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[9px] font-black uppercase">{storedUser?.role}</span>
                  </div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-black text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── HEADER BANNER ── */}
        <div className="relative bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 overflow-hidden shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/15">
              <AlertCircle size={12} className="text-red-200" /> System Warning Audits
            </div>
            <h2 className="text-3xl font-black tracking-tight">Intern Warning Logs</h2>
            <p className="text-red-100 text-sm max-w-xl">
              Track automated warnings dispatched to interns for persistent absenteeism and verify performance flags.
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl px-6 py-4 border border-white/10 text-center shrink-0">
            <span className="block text-[10px] font-black uppercase tracking-wider text-red-200">Total Warning Logs</span>
            <span className="text-3xl font-black">{warningLogsList.length}</span>
          </div>
        </div>

        {/* ── SEARCH & TOOLS ── */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500" />
            <input
              type="text"
              placeholder="Search warning logs..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 placeholder:text-slate-450"
            />
          </div>
        </div>

        {/* ── DATA TABLE ── */}
        {loading ? (
          <div className="h-[300px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-bold text-sm">{error}</p>
          </div>
        ) : filteredWarningLogs.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-left">
                <tr>
                  <th className="p-4">Intern Details</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Warning Status</th>
                  <th className="p-4 text-center">Meetings (Attended / Total)</th>
                  <th className="p-4 text-center">Attendance %</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedWarningLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-800">{log.fullName}</div>
                      <div className="text-[10px] text-slate-500">{log.email}</div>
                      <div className="text-[10px] font-mono font-bold text-indigo-500 mt-0.5">{log.uniqueId}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-extrabold border border-purple-100">
                        {log.domain}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-100">
                        ⚠️ Warning #{log.warningNumber}
                      </span>
                    </td>
                    <td className="p-4 text-center font-extrabold text-slate-800">
                      <span className="text-emerald-600 font-black">{log.meetingsAttended}</span> / {log.totalMeetings}
                    </td>
                    <td className="p-4 text-center font-black text-rose-600">
                      {log.attendancePercentage}
                    </td>
                    <td className="p-4 font-bold text-slate-600">
                      📅 {new Date(log.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => navigate(`/HR-Dashboard/intern/${log.internId}`)}
                        className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-[10px] flex items-center gap-1 mx-auto"
                        title="View Profile"
                      >
                        <Eye size={12} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredWarningLogs.length)} of {filteredWarningLogs.length} logs
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="text-slate-300 text-4xl mb-3">⚠️</div>
            <h3 className="text-sm font-black text-slate-700">No warning logs found</h3>
            <p className="text-xs text-slate-450 mt-1">There are no warning letters sent to interns matching your search.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default WarningLogsPage;
