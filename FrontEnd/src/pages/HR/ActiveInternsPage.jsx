import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Mail, AlertTriangle, UserMinus, Check, Search, Filter, X,
  RefreshCw, Send, Sparkles, Calendar, Hash, Phone,
  Building, List, Grid, Info, UserCheck, ChevronDown, LogOut, Briefcase, History, Upload, Download, Users, Clock
} from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const ActiveInternsPage = () => {
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

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Controls & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [inactiveComment, setInactiveComment] = useState("");

  useEffect(() => {
    if (!storedUser || (storedUser.role !== "Admin" && storedUser.role !== "HR Manager" && storedUser.role !== "HR")) {
      navigate("/login");
      return;
    }
    fetchActiveInterns();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, domainFilter, viewMode]);

  const fetchActiveInterns = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/hr/interns", {
        params: { status: "Active" },
        withCredentials: true,
      });
      setInterns(data.interns || []);
      setSelectedIds([]); // Clear selection
    } catch (err) {
      console.error("Error fetching active interns:", err);
      setError("Failed to retrieve active candidates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique domains dynamically for filter dropdown (with safe checks)
  const domains = ["All", ...new Set(interns.map(i => i && i.domain).filter(Boolean))];

  // Filter interns based on search query & domain selection (completely crash-proofed)
  const filteredInterns = interns.filter((intern) => {
    if (!intern || !intern.fullName || !intern.email) return false;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (intern.fullName || "").toLowerCase().includes(query) ||
      (intern.email || "").toLowerCase().includes(query) ||
      (intern.uniqueId && String(intern.uniqueId).toLowerCase().includes(query)) ||
      (intern.college && String(intern.college).toLowerCase().includes(query));

    const matchesDomain = domainFilter === "All" || intern.domain === domainFilter;

    return matchesSearch && matchesDomain;
  });

  // Selection handlers
  const handleSelectAll = () => {
    // Determine paginated set of active IDs
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageInterns = filteredInterns.slice(startIndex, endIndex);

    const allPageIds = pageInterns.map((i) => i._id);
    const allSelectedOnPage = allPageIds.every(id => selectedIds.includes(id));

    if (allSelectedOnPage) {
      setSelectedIds(selectedIds.filter(id => !allPageIds.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...allPageIds])]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Domain badge colors
  const getDomainStyle = (domain) => {
    const d = domain?.toLowerCase() || "";
    if (d.includes("stack") || d.includes("developer") || d.includes("development")) {
      return "bg-purple-50 border-purple-200 text-purple-700";
    }
    if (d.includes("design") || d.includes("ui") || d.includes("ux")) {
      return "bg-pink-50 border-pink-200 text-pink-700";
    }
    if (d.includes("marketing") || d.includes("social") || d.includes("media")) {
      return "bg-amber-50 border-amber-200 text-amber-700";
    }
    return "bg-indigo-50 border-indigo-200 text-indigo-700";
  };

  // Bulk deactivation
  const handleBulkInactiveSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await axios.post(
        "/api/hr/interns/bulk-inactive",
        {
          internIds: selectedIds,
          comment: inactiveComment || "Bulk marked as Inactive by HR Manager"
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setActionSuccess(`Successfully deactivated ${selectedIds.length} candidate(s)!`);
        setTimeout(() => {
          setShowInactiveModal(false);
          setInactiveComment("");
          setActionSuccess("");
          fetchActiveInterns();
        }, 2200);
      }
    } catch (err) {
      console.error("Bulk Inactive Error:", err);
      setActionError(err.response?.data?.error || "Failed to update candidates.");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Email
  const handleBulkEmailSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await axios.post(
        "/api/hr/interns/bulk-email",
        {
          internIds: selectedIds,
          subject: emailSubject,
          htmlContent: emailBody,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setActionSuccess(`Broadcast completed successfully! Emails sent via Brevo SMTP.`);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSubject("");
          setEmailBody("");
          setActionSuccess("");
          setSelectedIds([]);
        }, 2200);
      }
    } catch (err) {
      console.error("Bulk Email Error:", err);
      setActionError(err.response?.data?.error || "Failed to send emails via Brevo.");
    } finally {
      setActionLoading(false);
    }
  };

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

        {/* Filters and Stats Bar (Identical to Interview History) */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">

            {/* Search Input */}
            <div className="relative w-full sm:w-80 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-650" />
              <input
                type="text"
                placeholder="Search name, email, credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm font-semibold text-slate-800"
              />
            </div>

            {/* Dynamic Domain Dropdown */}
            <div className="relative w-full sm:w-64">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer appearance-none shadow-sm font-bold text-slate-700"
              >
                {domains.map(d => (
                  <option key={d} value={d}>Department: {d}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchActiveInterns}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm shrink-0"
              title="Refresh Registry"
            >
              <RefreshCw size={15} />
            </button>

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

          {/* Quick Registry Metrics */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <Info size={16} className="text-indigo-500" />
              <span>Total View: {filteredInterns.length} Active Interns</span>
            </div>
          </div>
        </div>

        {/* Database Content mapping */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-650 mb-4"></div>
            <p className="text-slate-500 font-semibold text-sm">Compiling Active Intern Manifest...</p>
          </div>
        ) : error ? (
          <div className="p-12 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-4">
            <div className="inline-block p-4 bg-rose-100 rounded-full text-rose-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <p className="text-slate-700 font-bold max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchActiveInterns}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
            >
              Reload Database
            </button>
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-350">
              <Search size={32} />
            </div>
            <h3 className="text-slate-800 font-black text-lg tracking-tight">No Active Records Found</h3>
            <p className="text-slate-550 text-sm mt-1 max-w-sm mx-auto">Try refining your keyword queries or choose another department filter.</p>
            <button
              onClick={() => { setSearchQuery(""); setDomainFilter("All"); }}
              className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedInterns = filteredInterns.slice(startIndex, endIndex);
              const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);

              // Check if all paginated set are selected
              const allPageIds = paginatedInterns.map(i => i._id);
              const allSelectedOnPage = allPageIds.every(id => selectedIds.includes(id));

              return (
                <>
                  {viewMode === "list" ? (
                    /* Elegant Table List Layout - Matching Interview History */
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                              <th className="px-6 py-4 w-12 text-center">
                                <button
                                  onClick={handleSelectAll}
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${allSelectedOnPage
                                    ? "bg-indigo-650 border-indigo-600 text-white"
                                    : "border-slate-300 bg-white hover:border-slate-400"
                                    }`}
                                >
                                  {allSelectedOnPage && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                                </button>
                              </th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Unique ID</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Domain Department</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Joining Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedInterns.map((intern) => {
                              const isSelected = selectedIds.includes(intern._id);
                              const badgeStyle = getDomainStyle(intern.domain);

                              return (
                                <tr
                                  key={intern._id}
                                  className={`group hover:bg-slate-50/40 transition-colors cursor-pointer ${isSelected ? "bg-indigo-50/20" : ""
                                    }`}
                                  onClick={() => handleSelectOne(intern._id)}
                                >
                                  {/* Selection Checkbox */}
                                  <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleSelectOne(intern._id)}
                                      className={`w-5 h-5 rounded border flex items-center justify-center mx-auto transition-all ${isSelected
                                        ? "bg-indigo-650 border-indigo-600 text-white"
                                        : "border-slate-300 bg-white hover:border-slate-400"
                                        }`}
                                    >
                                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                                    </button>
                                  </td>

                                  {/* Unique ID Hash */}
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    {intern.uniqueId ? (
                                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                        <Hash className="w-2.5 h-2.5" />
                                        {intern.uniqueId}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                    )}
                                  </td>

                                  {/* Full Name & Avatar */}
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-150 flex items-center justify-center font-black text-slate-600 border border-slate-200 text-xs shrink-0 bg-slate-100">
                                        {intern.fullName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-650 transition-colors">
                                          {intern.fullName}
                                        </span>
                                        {intern.warningCount > 0 && (
                                          <div className="mt-1 flex items-center gap-1 bg-red-50 border border-red-100 text-red-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-extrabold w-fit">
                                            <span>⚠️ Warnings: {intern.warningCount}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Contacts Info */}
                                  <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                                      <div className="flex items-center gap-1.5">
                                        <Mail size={12} className="opacity-40" />
                                        <span className="font-semibold text-slate-700">{intern.email}</span>
                                      </div>
                                      {intern.mobile && (
                                        <div className="flex items-center gap-1.5">
                                          <Phone size={12} className="opacity-40" />
                                          <span className="text-slate-500 font-semibold">{intern.mobile}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Domain department badge */}
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`inline-block px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                                      {intern.domain}
                                    </span>
                                  </td>

                                  {/* Duration */}
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-xs font-semibold text-slate-500">{intern.duration}</span>
                                  </td>

                                  {/* Joining Date aligned on Right */}
                                  <td className="px-6 py-5 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                                      <Calendar size={12} className="text-slate-400" />
                                      {intern.joiningDate && !isNaN(new Date(intern.joiningDate).getTime()) ? (
                                        new Date(intern.joiningDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric"
                                        })
                                      ) : (
                                        intern.joiningDate || "Pending"
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Elegant Card Grid Layout - Matching Interview History card grids */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedInterns.map((intern) => {
                        const isSelected = selectedIds.includes(intern._id);
                        const badgeStyle = getDomainStyle(intern.domain);

                        return (
                          <div
                            key={intern._id}
                            onClick={() => handleSelectOne(intern._id)}
                            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${isSelected
                              ? "border-indigo-500 ring-2 ring-indigo-50 bg-indigo-50/5"
                              : "border-slate-200 hover:shadow-md hover:border-indigo-200"
                              }`}
                          >
                            <div className="p-6 flex-1 relative">
                              {/* Absolute Checkbox anchor */}
                              <div className="absolute top-6 right-6">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOne(intern._id);
                                  }}
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                    ? "bg-indigo-650 border-indigo-600 text-white"
                                    : "border-slate-300 bg-white hover:border-slate-400"
                                    }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                                </button>
                              </div>

                              {/* Card Domain Header */}
                              <div className="flex justify-between items-start mb-6">
                                <span className={`px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                                  {intern.domain}
                                </span>
                                {intern.uniqueId && (
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-0.5">
                                    <Hash size={10} className="text-slate-400" />
                                    {intern.uniqueId}
                                  </span>
                                )}
                              </div>

                              {/* Profile Name info */}
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-xs shrink-0">
                                  {intern.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-bold text-slate-800 truncate leading-snug">{intern.fullName}</h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="block text-[10px] text-slate-450 font-bold bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-max">
                                      Duration: {intern.duration}
                                    </span>
                                    {intern.warningCount > 0 && (
                                      <span className="inline-flex items-center gap-1 bg-red-50 border border-red-100 text-red-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-extrabold">
                                        ⚠️ Warnings: {intern.warningCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Candidate metadata cards */}
                              <div className="space-y-3 pt-5 border-t border-slate-100">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                                  <Mail size={15} className="text-slate-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Email Address</p>
                                    <p className="text-xs font-semibold text-slate-700 truncate" title={intern.email}>{intern.email}</p>
                                  </div>
                                </div>
                                {intern.mobile && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                                    <Phone size={15} className="text-slate-400 shrink-0" />
                                    <div>
                                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Contact Phone</p>
                                      <p className="text-xs font-semibold text-slate-700">{intern.mobile}</p>
                                    </div>
                                  </div>
                                )}
                                {intern.college && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                                    <Building size={15} className="text-slate-400 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">College / University</p>
                                      <p className="text-xs font-semibold text-slate-700 truncate" title={intern.college}>{intern.college}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Joining Details */}
                            <div className="w-full py-3.5 bg-slate-50 text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest border-t border-slate-200 flex items-center justify-center gap-2">
                              <Calendar size={13} className="text-slate-450" />
                              Joined: {intern.joiningDate && !isNaN(new Date(intern.joiningDate).getTime()) ? (
                                new Date(intern.joiningDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              ) : (
                                intern.joiningDate || "No Joining Date"
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Premium Indigo Pagination (Identical to Interview History pagination) */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm no-print">
                      <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">
                        Showing <span className="text-slate-800 font-extrabold">{startIndex + 1}</span> to{" "}
                        <span className="text-slate-800 font-extrabold">
                          {Math.min(endIndex, filteredInterns.length)}
                        </span>{" "}
                        of <span className="text-slate-800 font-extrabold">{filteredInterns.length}</span> interns
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-650 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
                                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-100"
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
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-650 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}

      </div>

      {/* MacOS inspired selection overlay bar docked at screen bottom */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xl animate-bounce-in">
          <div className="backdrop-blur-xl bg-white/95 border border-slate-200/90 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm border border-indigo-100">
                {selectedIds.length}
              </div>
              <div>
                <span className="block text-xs font-black text-slate-800">Selected Members</span>
                <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Execute bulk operations</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActionError("");
                  setActionSuccess("");
                  setShowEmailModal(true);
                }}
                className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-indigo-100 active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </button>

              <button
                onClick={() => {
                  setActionError("");
                  setActionSuccess("");
                  setShowInactiveModal(true);
                }}
                className="px-4.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl font-bold text-xs transition-all duration-300 flex items-center gap-1.5 active:scale-95"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Deactivate
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in relative">

            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-slate-50 text-slate-800 flex justify-between items-center border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">Broadcast HTML Email</h3>
                  <span className="block text-[10px] text-slate-500 font-semibold">Delivered individually via Brevo SMTP</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setActionError("");
                  setActionSuccess("");
                }}
                className="text-slate-450 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBulkEmailSubmit} className="p-6 space-y-4">

              {actionError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <span className="shrink-0 text-base">✅</span>
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Dynamic Variables Guide Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <h4 className="font-black uppercase tracking-wider text-[10px] text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  Dynamic Personalization Tokens
                </h4>
                <p className="text-slate-500 leading-relaxed font-semibold">
                  These tokens will map dynamically for each recipient to allow personalized broadcasts:
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px]">
                  <span className="bg-white border border-slate-250 px-2 py-1 rounded text-slate-700 font-black">{"{{fullName}}"}</span>
                  <span className="bg-white border border-slate-250 px-2 py-1 rounded text-slate-700 font-black">{"{{uniqueId}}"}</span>
                  <span className="bg-white border border-slate-250 px-2 py-1 rounded text-slate-700 font-black">{"{{domain}}"}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Email Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Updates & Deliverables - {{domain}}"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 bg-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* HTML Content */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  HTML Body Content
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Dear {{fullName}},\n\nWe wanted to reach out regarding...\n\nBest regards,\nGraphura Team"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-650 bg-white min-h-[160px] font-mono outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-5 py-3 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Broadcast ({selectedIds.length})
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Bulk Inactive Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">

            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-50 to-slate-50 text-slate-800 flex justify-between items-center border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">Deactivate Roster Status</h3>
                  <span className="block text-[10px] text-slate-500">Transition membership to Inactive</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInactiveModal(false);
                  setActionError("");
                  setActionSuccess("");
                }}
                className="text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBulkInactiveSubmit} className="p-6 space-y-4">

              {actionError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-2 font-sans">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold rounded-2xl flex items-center gap-2 font-sans">
                  <span className="shrink-0 text-base">✅</span>
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="p-4 bg-rose-50 border border-rose-200/50 rounded-2xl text-xs text-rose-700 space-y-1.5 leading-relaxed font-semibold">
                <span className="block font-black uppercase tracking-wider text-[10px] text-rose-500">⚠️ critical status deactivation</span>
                <p>This will change the database status of the <strong className="text-slate-900 font-extrabold">{selectedIds.length}</strong> selected candidate(s) to <strong className="text-slate-900 font-extrabold">"Inactive"</strong> immediately. It registers an entry in the candidate audit log.</p>
              </div>

              {/* Status Update Comment */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Audit Comment / Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain reason for status deactivation (e.g., Completed internship duration)..."
                  value={inactiveComment}
                  onChange={(e) => setInactiveComment(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 bg-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-5 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-md shadow-rose-200 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserMinus size={15} />
                      Confirm Deactivation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInactiveModal(false);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl font-bold text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Global CSS Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        .font-sans, font-['Outfit',sans-serif] {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: translate(-50%, 100px); opacity: 0; }
          60% { transform: translate(-50%, -10px); opacity: 0.9; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .bg-indigo-650 {
          background-color: #4f46e5;
        }
        .bg-indigo-650:hover {
          background-color: #4338ca;
        }
        .px-4.5 {
          padding-left: 1.125rem;
          padding-right: 1.125rem;
        }
      `}</style>

    </div>
  );
};

export default ActiveInternsPage;
