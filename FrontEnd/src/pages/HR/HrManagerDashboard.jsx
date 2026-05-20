import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, UserCheck, Calendar, History, Briefcase, Mail,
  ChevronDown, LogOut, Upload, Download, TrendingUp, Award,
  Activity, BarChart2, Shield, Plus, X, Search, Filter,
  MessageSquare, BookOpen, Clock, AlertCircle, UserMinus
} from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const HrManagerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // State Management
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown menus
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
    try {
      const { data } = await axios.get("/api/hr/interns", { withCredentials: true });
      setInterns(data.interns || []);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Precomputed Executive Analytics Metrics
  const totalRoster = interns.length;
  const activeInterns = interns.filter(i => i.status === "Selected").length;
  const ongoingAudits = interns.filter(i => i.status === "Shortlisted" || i.status === "Applied").length;
  const rejectedCount = interns.filter(i => i.status === "Rejected").length;

  // Domain Distribution Calculations
  const domainCounts = interns.reduce((acc, curr) => {
    if (curr.domain) {
      acc[curr.domain] = (acc[curr.domain] || 0) + 1;
    }
    return acc;
  }, {});

  const domainData = Object.entries(domainCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Take top 5 domains

  const maxDomainVal = domainData.length > 0 ? Math.max(...domainData.map(d => d.value)) : 1;

  // Performance breakdown
  const performanceCounts = interns.reduce((acc, curr) => {
    if (curr.performance) {
      acc[curr.performance] = (acc[curr.performance] || 0) + 1;
    }
    return acc;
  }, { Excellent: 0, Good: 0, Average: 0, Poor: 0 });

  return (
    <div className="min-h-screen bg-[#fafafa] font-['Outfit',sans-serif] text-slate-900 antialiased p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Modern Premium Navbar */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-4 py-2.5 no-print relative z-40">
          {/* Top Decorative Color Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-rose-500 rounded-t-2xl"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-0.5">

            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-xl border border-indigo-100/50 flex items-center justify-center shrink-0">
                <img src={Graphura} alt="Graphura Logo" className="h-6 object-contain" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                  IMS Portal
                  <span className="text-[8px] font-black uppercase bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-1.5 py-0.5 rounded">V2.0</span>
                </h1>
              </div>
            </div>

            {/* Center: Navigation — NO overflow-x-auto so dropdowns work */}
            <nav className="flex flex-wrap items-center gap-1 sm:gap-0.5">
              {/* Dashboard */}
              <button
                onClick={() => navigate("/HR-Manager-Dashboard")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                  location.pathname === "/HR-Manager-Dashboard"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>

              {/* Intern Action Dropdown */}
              <div className="relative" ref={internDropdownRef}>
                <button
                  onClick={() => {
                    setShowInternDropdown(!showInternDropdown);
                    setShowInterviewDropdown(false);
                    setShowRecruitmentDropdown(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1 whitespace-nowrap ${
                    showInternDropdown
                      ? "bg-indigo-100 text-indigo-700"
                      : ["/HR-Manager-Dashboard/applications", "/HR-Manager-Dashboard/active-interns", "/HR-Manager-Dashboard/manage-planner", "/HR-Manager-Dashboard/warning-logs", "/HR-Manager-Dashboard/termination-appeals"].includes(location.pathname)
                        ? "bg-indigo-50 text-indigo-700 font-extrabold"
                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Intern Action
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showInternDropdown ? "rotate-180" : ""}`} />
                </button>

                {showInternDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100] text-left">
                    <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Intern Campaigns</div>
                    <button
                      onClick={() => { setShowInternDropdown(false); navigate("/HR-Manager-Dashboard/applications"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/applications" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"}`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />All Applications
                    </button>
                    <button
                      onClick={() => { setShowInternDropdown(false); navigate("/HR-Manager-Dashboard/active-interns"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/active-interns" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"}`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />Active Interns
                    </button>
                    <button
                      onClick={() => { setShowInternDropdown(false); navigate("/HR-Manager-Dashboard/manage-planner"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/manage-planner" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"}`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />Planner
                    </button>
                    <button
                      onClick={() => { setShowInternDropdown(false); navigate("/HR-Manager-Dashboard/warning-logs"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/warning-logs" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"}`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />Warning Logs
                    </button>
                    <button
                      onClick={() => { setShowInternDropdown(false); navigate("/HR-Manager-Dashboard/termination-appeals"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/termination-appeals" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"}`}
                    >
                      <UserMinus className="w-3.5 h-3.5 text-rose-500 shrink-0" />Termination Appeals
                    </button>
                  </div>
                )}
              </div>

              {/* Interview Action Dropdown */}
              <div className="relative" ref={interviewDropdownRef}>
                <button
                  onClick={() => {
                    setShowInterviewDropdown(!showInterviewDropdown);
                    setShowInternDropdown(false);
                    setShowRecruitmentDropdown(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1 whitespace-nowrap ${
                    showInterviewDropdown
                      ? "bg-purple-100 text-purple-700"
                      : ["/HR-Manager-Dashboard/interview-invite", "/HR-Manager-Dashboard/interview-history"].includes(location.pathname)
                        ? "bg-purple-50 text-purple-700 font-extrabold"
                        : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Interview Action
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showInterviewDropdown ? "rotate-180" : ""}`} />
                </button>

                {showInterviewDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100] text-left">
                    <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Interview Actions</div>
                    <button
                      onClick={() => { setShowInterviewDropdown(false); navigate("/HR-Manager-Dashboard/interview-invite"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/interview-invite" ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-purple-600"}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />Send Interview Invites
                    </button>
                    <button
                      onClick={() => { setShowInterviewDropdown(false); navigate("/HR-Manager-Dashboard/interview-history"); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${location.pathname === "/HR-Manager-Dashboard/interview-history" ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50 hover:text-purple-600"}`}
                    >
                      <History className="w-3.5 h-3.5 text-indigo-500 shrink-0" />Schedule Interview
                    </button>
                  </div>
                )}
              </div>

              {/* Recruitment Dropdown */}
              <div className="relative" ref={recruitmentDropdownRef}>
                <button
                  onClick={() => {
                    setShowRecruitmentDropdown(!showRecruitmentDropdown);
                    setShowInternDropdown(false);
                    setShowInterviewDropdown(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1 whitespace-nowrap ${
                    showRecruitmentDropdown
                      ? "bg-amber-100 text-amber-700"
                      : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  Recruitment Tools
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showRecruitmentDropdown ? "rotate-180" : ""}`} />
                </button>

                {showRecruitmentDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100] text-left">
                    <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Campaign Actions</div>
                    <button
                      onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerImport: true } }); }}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-orange-500 shrink-0" />Import Excel Database
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Reports & Exports</div>
                    <button
                      onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerExport: true } }); }}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0" />Export Interns Data
                    </button>
                    <button
                      onClick={() => { setShowRecruitmentDropdown(false); navigate("/HR-Manager-Dashboard/applications", { state: { triggerCustomExport: true } }); }}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold text-indigo-700 hover:bg-slate-50 hover:text-indigo-800 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500 shrink-0" />Custom Excel Export
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: SaaS Profile Dropdown */}
            <div className="flex items-center gap-3 shrink-0 sm:ml-auto" ref={profileDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 rounded-full border border-slate-200 transition-all select-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center uppercase shadow-sm">
                    {storedUser?.fullName ? storedUser.fullName.charAt(0) : "M"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-[11px] font-black text-slate-700 truncate max-w-[120px] leading-tight">
                      {storedUser?.fullName || "HR Manager"}
                    </span>
                    <span className="block text-[9px] font-bold text-indigo-500 leading-none mt-0.5">
                      {storedUser?.role || "HR Manager"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in text-left">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="block text-xs font-black text-slate-800 truncate">{storedUser?.fullName}</span>
                      <span className="block text-[10px] font-bold text-slate-400 truncate mt-0.5">{storedUser?.email}</span>
                    </div>

                    <div className="px-4 py-1 text-[9px] font-black uppercase text-slate-400 mt-2">Authority</div>
                    <div className="px-4 pb-2">
                      <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 rounded text-[9px] font-black uppercase border border-indigo-150">
                        {storedUser?.role || "HR Manager"}
                      </span>
                    </div>

                    <div className="h-px bg-slate-150 my-1.5"></div>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* Manager Portal Greeting Banner */}
        <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-xl shadow-slate-900/10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-transparent pointer-events-none"></div>

          <div className="space-y-2 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/15">
              <Shield size={12} className="text-blue-400" /> HR Manager
            </div>
            <h2 className="text-3xl font-black tracking-tight">Welcome, {storedUser?.fullName || "HR Manager"}</h2>
            <p className="text-slate-350 text-sm max-w-xl">
              Audit intern Applications, coordinate recruitments, dispatch interview calls, and review key organizational performance indicators in real time.
            </p>
          </div>

          <div className="flex gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigate("/HR-Manager-Dashboard/applications")}
              className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
            >
              View All Applications
            </button>
          </div>
        </div>

        {/* High-Level SaaS Metrics Roster */}
        {loading ? (
          <div className="h-[200px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Metric 1 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 relative z-10">
                <Users size={24} />
              </div>
              <div className="relative z-10">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Candidates</span>
                <span className="block text-3xl font-black text-slate-800 mt-1">{totalRoster}</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 relative z-10">
                <UserCheck size={24} />
              </div>
              <div className="relative z-10">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Active Interns</span>
                <span className="block text-3xl font-black text-slate-800 mt-1">{activeInterns}</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 relative z-10">
                <Activity size={24} />
              </div>
              <div className="relative z-10">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Interviews</span>
                <span className="block text-3xl font-black text-slate-800 mt-1">{ongoingAudits}</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 relative z-10">
                <AlertCircle size={24} />
              </div>
              <div className="relative z-10">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected Interns</span>
                <span className="block text-3xl font-black text-slate-800 mt-1">{rejectedCount}</span>
              </div>
            </div>

          </div>
        )}

        {/* Shortcuts & Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Executive Analytics: Domain Distribution Chart */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Intern Enrolments</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Top domains by headcount</p>
                </div>
                <BarChart2 className="text-blue-500" size={20} />
              </div>

              {loading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {domainData.map((d, index) => {
                    const colors = [
                      "from-blue-500 to-cyan-400",
                      "from-indigo-500 to-purple-500",
                      "from-emerald-500 to-teal-400",
                      "from-amber-500 to-orange-400",
                      "from-pink-500 to-rose-500"
                    ];
                    const percent = Math.round((d.value / maxDomainVal) * 100);
                    return (
                      <div key={d.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600 truncate max-w-[180px]">{d.name}</span>
                          <span className="text-slate-800">{d.value} Interns</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {domainData.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm italic">
                      No domain data found. Import interns to generate chart.
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/HR-Manager-Dashboard/active-interns")}
              className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-200 flex items-center justify-center gap-2"
            >
              View Active Interns <TrendingUp size={14} />
            </button>
          </div>

          {/* Quick Shortcuts Cards Grid */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">Portal Shortcuts</h3>
              <div className="grid grid-cols-2 gap-4">

                {/* Shortcut 1 */}
                <button
                  onClick={() => navigate("/HR-Manager-Dashboard/active-interns")}
                  className="p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-left hover:scale-[1.02] transition-all group"
                >
                  <UserCheck className="text-emerald-600 group-hover:scale-110 transition-transform mb-3" size={20} />
                  <span className="block text-xs font-black text-slate-800">Active Interns</span>
                  <span className="block text-[10px] text-emerald-600 font-bold mt-1">View Active Interns</span>
                </button>

                {/* Shortcut 2 */}
                <button
                  onClick={() => navigate("/HR-Manager-Dashboard/manage-planner")}
                  className="p-4 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-left hover:scale-[1.02] transition-all group"
                >
                  <Calendar className="text-indigo-600 group-hover:scale-110 transition-transform mb-3" size={20} />
                  <span className="block text-xs font-black text-slate-800">Intern Planner</span>
                  <span className="block text-[10px] text-indigo-600 font-bold mt-1">Plan Intern Meetings</span>
                </button>

                {/* Shortcut 3 */}
                <button
                  onClick={() => navigate("/HR-Manager-Dashboard/interview-invite")}
                  className="p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 text-left hover:scale-[1.02] transition-all group"
                >
                  <Mail className="text-blue-600 group-hover:scale-110 transition-transform mb-3" size={20} />
                  <span className="block text-xs font-black text-slate-800">Interview Invite</span>
                  <span className="block text-[10px] text-blue-600 font-bold mt-1">Send Interview Invites</span>
                </button>

                {/* Shortcut 4 */}
                <button
                  onClick={() => navigate("/HR-Manager-Dashboard/interview-history")}
                  className="p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 text-left hover:scale-[1.02] transition-all group"
                >
                  <History className="text-purple-600 group-hover:scale-110 transition-transform mb-3" size={20} />
                  <span className="block text-xs font-black text-slate-800">Interview History</span>
                  <span className="block text-[10px] text-purple-600 font-bold mt-1">View Interview History</span>
                </button>

              </div>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">Bulk Actions:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/HR-Dashboard", { state: { triggerImport: true } })}
                  className="text-indigo-600 font-black hover:text-indigo-700 flex items-center gap-1"
                >
                  <Upload size={12} /> Import
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => navigate("/HR-Dashboard", { state: { triggerExport: true } })}
                  className="text-emerald-600 font-black hover:text-emerald-700 flex items-center gap-1"
                >
                  <Download size={12} /> Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Action Overview Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-855 tracking-tight flex items-center gap-2">
                <Award className="text-indigo-650" size={20} /> Intern Achievements Audit
              </h3>
              <p className="text-xs text-slate-400">High-level overview of active performances</p>
            </div>
            <button
              onClick={() => navigate("/HR-Dashboard")}
              className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
            >
              View Full List <ChevronDown className="-rotate-90" size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">

            {/* Stat Ring 1 */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-sm font-black text-slate-800 bg-white">
                {performanceCounts.Excellent}
              </div>
              <h4 className="text-xs font-black text-slate-700 mt-3">Excellent Ratings</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Top-tier contributors</p>
            </div>

            {/* Stat Ring 2 */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-sm font-black text-slate-800 bg-white">
                {performanceCounts.Good}
              </div>
              <h4 className="text-xs font-black text-slate-700 mt-3">Good Ratings</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Consistent contributors</p>
            </div>

            {/* Stat Ring 3 */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-yellow-500 flex items-center justify-center text-sm font-black text-slate-800 bg-white">
                {performanceCounts.Average}
              </div>
              <h4 className="text-xs font-black text-slate-700 mt-3">Average Ratings</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Steady progress</p>
            </div>

            {/* Stat Ring 4 */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center text-sm font-black text-slate-800 bg-white">
                {performanceCounts.Poor}
              </div>
              <h4 className="text-xs font-black text-slate-700 mt-3">Needs Action</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Requires audit reviews</p>
            </div>

          </div>
        </div>

      </div>



    </div>
  );
};

export default HrManagerDashboard;
