import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, History, Calendar, Clock, Link as LinkIcon, Search, Filter, User, List, Grid, Info, X, ChevronDown, LogOut, Briefcase, UserCheck, Upload, Download, Mail, Users, AlertTriangle, UserMinus } from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const InterviewHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [inviteCounts, setInviteCounts] = useState({});
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, domainFilter, selectedDateFilter, viewMode]);

  const [selectedCandidates, setSelectedCandidates] = useState(null);
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const basePath = storedUser?.role === "HR Manager" ? "/HR-Manager-Dashboard" : "/HR-Dashboard";

  // Menu Dropdown States
  const [showRecruitmentDropdown, setShowRecruitmentDropdown] = useState(false);
  const [showInterviewDropdown, setShowInterviewDropdown] = useState(false);
  const [showInternDropdown, setShowInternDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const recruitmentDropdownRef = useRef(null);
  const interviewDropdownRef = useRef(null);
  const internDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

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
    if (!storedUser || (storedUser.role !== "Admin" && storedUser.role !== "HR Manager" && storedUser.role !== "HR")) {
      navigate("/login");
      return;
    }
    fetchHistory();
  }, []);

  const calculateInviteCounts = (historyData) => {
    const counts = {};
    historyData.forEach(item => {
      item.candidates.forEach(c => {
        counts[c.email] = (counts[c.email] || 0) + 1;
      });
    });
    setInviteCounts(counts);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/hr/interview-history", { withCredentials: true });
      setHistory(response.data.history);
      calculateInviteCounts(response.data.history);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch interview history");
    } finally {
      setLoading(false);
    }
  };

  const getValidUrl = (url) => {
    if (!url) return "#";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.sender?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidates?.some(c => c.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDomain = domainFilter === "All" || item.domain === domainFilter;
    const matchesDate = !selectedDateFilter || 
      (item.createdAt && item.createdAt.split('T')[0] === selectedDateFilter) ||
      (item.interviewDate && item.interviewDate === selectedDateFilter);

    return matchesSearch && matchesDomain && matchesDate;
  });

  const domains = ["All", ...new Set(history.map(item => item.domain))];

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
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>

              {storedUser?.role === "HR Manager" ? (
                <>
                  {/* Intern Action */}
                  <div className="relative" ref={internDropdownRef}>
                    <button
                      onClick={() => { setShowInternDropdown(!showInternDropdown); setShowInterviewDropdown(false); setShowRecruitmentDropdown(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                        showInternDropdown || ["/HR-Manager-Dashboard/applications","/HR-Manager-Dashboard/active-interns","/HR-Manager-Dashboard/manage-planner","/HR-Manager-Dashboard/warning-logs", "/HR-Manager-Dashboard/termination-appeals"].includes(location.pathname)
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Intern Action
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showInternDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showInternDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                        <p className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">Intern Management</p>
                        {[
                          { label: "All Applications", path: "/HR-Manager-Dashboard/applications", icon: <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> },
                          { label: "Active Interns",   path: "/HR-Manager-Dashboard/active-interns", icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> },
                          { label: "Planner",          path: "/HR-Manager-Dashboard/manage-planner", icon: <Calendar className="w-3.5 h-3.5 text-sky-400" /> },
                          { label: "Warning Logs",     path: "/HR-Manager-Dashboard/warning-logs",   icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> },
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
                          ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Interview Action
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showInterviewDropdown ? "rotate-180" : ""}`} />
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
                          ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Recruitment Tools
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showRecruitmentDropdown ? "rotate-180" : ""}`} />
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
                </>
              ) : (
                <>
                  {/* Public Planner */}
                  <button
                    onClick={() => navigate("/weekly-planner")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                      location.pathname === "/weekly-planner"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Public Planner
                  </button>
                </>
              )}
            </nav>

            {/* Profile */}
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

        {/* Filters and Stats */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
              <input
                type="text"
                placeholder="Search emails, senders, domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer appearance-none shadow-sm"
              >
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Date-wise Search/Filter Option */}
            <div className="relative w-full sm:w-56 group">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none" />
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm cursor-pointer text-slate-700 font-bold"
              />
              {selectedDateFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-full transition-all"
                  title="Clear Date"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* View Mode Toggle Pill inside Filters row */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 shrink-0 shadow-inner">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "list" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <List size={13} /> List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "grid" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Grid size={13} /> Grid
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <Info size={16} className="text-indigo-400" />
            <span>Total Interview Sent: {history.length}</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading history records...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
            <p className="font-bold mb-2">Error fetching data</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedHistory = filteredHistory.slice(startIndex, endIndex);
              const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

              return (
                <>
                  {viewMode === "list" ? (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sent Date</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Domain</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Interview Date & Time</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Candidates</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sent By</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Meeting Link</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedHistory.map((item) => (
                              <tr key={item._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <p className="text-sm font-bold text-slate-900">{item.createdAt && !isNaN(new Date(item.createdAt).getTime()) ? new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}</p>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                    {item.domain}
                                  </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex flex-col gap-1 text-slate-700">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar size={12} className="opacity-40" />
                                      <span className="text-xs font-bold">{item.interviewDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock size={12} className="opacity-40" />
                                      <span className="text-xs font-bold text-slate-500">{item.interviewTime}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedCandidates(item.candidates)}>
                                  <div className="flex items-center gap-2 group/tooltip relative">
                                    <div className="flex -space-x-2 overflow-hidden">
                                      {item.candidates.slice(0, 3).map((c, i) => (
                                        <div 
                                          key={i} 
                                          className={`inline-block h-8 w-8 rounded-full ring-2 flex items-center justify-center text-[10px] font-bold ${
                                            c.status === "Failed"
                                              ? "ring-rose-400 bg-rose-50 text-rose-750"
                                              : "ring-white bg-slate-100 text-slate-650"
                                          }`} 
                                          title={`${c.name || c.email} (${c.status || "Sent"})`}
                                        >
                                          {c.name && c.name !== "Unknown Candidate" ? c.name.charAt(0).toUpperCase() : c.email.charAt(0).toUpperCase()}
                                        </div>
                                      ))}
                                      {item.candidates.length > 3 && (
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                          +{item.candidates.length - 3}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                      {item.candidates.length} Total (View)
                                      {item.candidates.some(c => c.status === "Failed") && (
                                        <span className="inline-block px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[9px] font-extrabold uppercase animate-pulse">
                                          Failed
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0 text-[10px] font-black">
                                      {item.sender?.fullName?.charAt(0) || <User size={12} />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{item.sender?.fullName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                  <a
                                    href={getValidUrl(item.meetingLink)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                                  >
                                    <LinkIcon size={12} /> Join
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedHistory.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col">
                          <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-6">
                              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                {item.domain}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {item.createdAt && !isNaN(new Date(item.createdAt).getTime()) ? new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}
                              </span>
                            </div>

                            <div className="space-y-3 mb-6">
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Calendar size={16} className="text-slate-400" />
                                <div>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Date</p>
                                  <p className="text-xs font-bold text-slate-700">{item.interviewDate}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Clock size={16} className="text-slate-400" />
                                <div>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Time</p>
                                  <p className="text-xs font-bold text-slate-700">{item.interviewTime}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6 p-2 bg-indigo-50/30 rounded-xl border border-indigo-50/50">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                                {item.sender?.fullName?.charAt(0) || <User size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Sent By</p>
                                <p className="text-xs font-bold text-slate-800 truncate">{item.sender?.fullName}</p>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 cursor-pointer hover:text-indigo-600 transition-colors flex justify-between items-center" onClick={() => setSelectedCandidates(item.candidates)}>
                                <span>Candidates ({item.candidates.length})</span>
                                <span className="text-[9px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">View All</span>
                              </p>
                              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {item.candidates.map((c, i) => (
                                  <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                                      <span className="font-bold text-slate-700 truncate">{c.name || "Unknown Candidate"}</span>
                                      <span className="text-[9px] text-slate-500 truncate">{c.email}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end shrink-0">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                        c.status === "Failed"
                                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                                          : "bg-emerald-100 text-emerald-700 border border-emerald-250/20"
                                      }`}>
                                        {c.status || "Sent"}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-400">
                                        {inviteCounts[c.email]}x
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <a
                            href={getValidUrl(item.meetingLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all text-center text-slate-500 font-bold text-xs uppercase tracking-widest border-t border-slate-200 flex items-center justify-center gap-2 group-hover/link:bg-indigo-600"
                          >
                            <LinkIcon size={14} /> Join Link
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Premium Indigo Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm no-print">
                      <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">
                        Showing <span className="text-slate-800 font-extrabold">{startIndex + 1}</span> to{" "}
                        <span className="text-slate-800 font-extrabold">
                          {Math.min(endIndex, filteredHistory.length)}
                        </span>{" "}
                        of <span className="text-slate-800 font-extrabold">{filteredHistory.length}</span> batches
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                          &larr; Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-1 text-slate-400 text-xs sm:text-sm">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${currentPage === page
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                  : "text-slate-600 bg-white hover:bg-slate-50 border border-slate-200"
                                  }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {filteredHistory.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={32} />
                </div>
                <p className="text-slate-800 font-black text-lg tracking-tight">No records found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria or domain filter.</p>
                <button
                  onClick={() => { setSearchTerm(""); setDomainFilter("All"); setSelectedDateFilter(""); }}
                  className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Candidates Modal */}
      {selectedCandidates && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800">Candidates List</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Showing {selectedCandidates.length} candidates for this batch</p>
              </div>
              <button onClick={() => setSelectedCandidates(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
              {selectedCandidates.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                    {c.name && c.name !== "Unknown Candidate" ? c.name.charAt(0).toUpperCase() : c.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{c.name || "Unknown Candidate"}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      c.status === "Failed"
                        ? "bg-rose-100 text-rose-700 border border-rose-250/25"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-250/20"
                    }`}>
                      {c.status || "Sent"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      Invited {inviteCounts[c.email]}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setSelectedCandidates(null)} className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm">
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default InterviewHistory;
