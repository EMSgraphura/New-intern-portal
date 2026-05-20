import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Link as LinkIcon, Mail, UserCheck, Check, AlertCircle, Users, Briefcase, History, ChevronDown, LogOut, Upload, Download, Search, X, UserMinus } from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const InterviewInvitePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const basePath = storedUser?.role === "HR Manager" ? "/HR-Manager-Dashboard" : "/HR-Dashboard";

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMails, setSendingMails] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [interviewDetails, setInterviewDetails] = useState({
    domain: "",
    date: "",
    time: "",
    meetingLink: "",
    selectedEmails: []
  });

  const [candidateSearch, setCandidateSearch] = useState("");

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
    if (!storedUser || (storedUser.role !== "Admin" && storedUser.role !== "HR Manager")) {
      navigate("/login");
      return;
    }
    fetchAppliedInterns();
  }, []);

  const fetchAppliedInterns = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/hr/interns", {
        params: { status: "Applied" },
        withCredentials: true,
      });
      setInterns(data.interns || []);
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvites = async (e) => {
    e.preventDefault();
    if (!interviewDetails.selectedEmails.length || !interviewDetails.date || !interviewDetails.time || !interviewDetails.meetingLink) {
      setError("Please fill all fields and select at least one candidate.");
      return;
    }

    // Time boundary validation: Only 10:00 AM to 9:00 PM (10:00 to 21:00)
    const timeVal = interviewDetails.time;
    if (timeVal) {
      const [hours, minutes] = timeVal.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      const minMinutes = 10 * 60; // 10:00 AM
      const maxMinutes = 21 * 60; // 9:00 PM
      if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
        setError("Interview time must be between 10:00 AM and 09:00 PM.");
        return;
      }
    }

    setSendingMails(true);
    setError("");
    setSuccessMsg("");

    try {
      await axios.post("/api/hr/send-interview-mail", {
        emails: interviewDetails.selectedEmails,
        interviewDate: interviewDetails.date,
        interviewTime: interviewDetails.time,
        meetingLink: interviewDetails.meetingLink,
        domain: interviewDetails.domain
      }, { withCredentials: true });

      setSuccessMsg("🎉 Interview invitations sent successfully!");
      // Reset state
      setInterviewDetails({ domain: "", date: "", time: "", meetingLink: "", selectedEmails: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send mails");
    } finally {
      setSendingMails(false);
    }
  };

  const domains = [...new Set(interns.map(i => i.domain))].filter(Boolean);
  const eligibleInterns = interns.filter(i => i.domain === interviewDetails.domain && i.status === "Applied");
  const filteredEligibleInterns = eligibleInterns.filter(intern => {
    const query = candidateSearch.toLowerCase();
    return (
      (intern.fullName || "").toLowerCase().includes(query) ||
      (intern.email || "").toLowerCase().includes(query) ||
      (intern.college || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-screen w-screen bg-[#fafafa] font-['Outfit',sans-serif] antialiased text-slate-800 flex flex-col overflow-hidden p-4 md:p-6 pb-2">
      <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col overflow-hidden space-y-4">

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

        {/* Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Side: Form Controls */}
          <div className="w-full md:w-1/2 bg-white border-r border-slate-200 p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-650 rounded-full text-xs font-bold mb-3 border border-indigo-100">
                  <Mail size={12} /> Email Campaign
                </div>
                <h2 className="text-2xl font-black text-slate-900">Send Interview Invites</h2>
                <p className="text-slate-500 text-sm mt-1">Configure meeting link, timings and domain. Shortlisted candidate list will load automatically.</p>
              </div>

              {/* Notification Badges */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Something went wrong</h4>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <Check className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800">Success</h4>
                    <p className="text-xs text-emerald-600 mt-0.5">{successMsg}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-650"></div>
                  <p className="text-slate-500 text-sm mt-4 font-semibold">Fetching candidate list...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Domain Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <UserCheck size={14} className="text-indigo-500" /> Target Domain
                    </label>
                    <select
                      value={interviewDetails.domain}
                      onChange={(e) => {
                        const domain = e.target.value;
                        const domainInterns = interns.filter(i => i.domain === domain && i.status === "Applied");
                        setInterviewDetails({
                          ...interviewDetails,
                          domain,
                          selectedEmails: domainInterns.map(i => i.email)
                        });
                        setCandidateSearch("");
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                    >
                      <option value="">Choose a Domain</option>
                      {domains.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Date Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-500" /> Date
                      </label>
                      <input
                        type="date"
                        value={interviewDetails.date}
                        onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>

                    {/* Time Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Clock size={14} className="text-indigo-500" /> Time <span className="text-[9px] text-slate-400 font-black lowercase">(10:00 AM - 09:00 PM)</span>
                      </label>
                      <input
                        type="time"
                        min="10:00"
                        max="21:00"
                        value={interviewDetails.time}
                        onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Meeting Link Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <LinkIcon size={14} className="text-indigo-500" /> Meeting URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/xyz-abc-123"
                      value={interviewDetails.meetingLink}
                      onChange={(e) => setInterviewDetails({ ...interviewDetails, meetingLink: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex gap-4">
              <button
                onClick={() => navigate(basePath)}
                className="flex-1 px-5 py-3 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-855 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={sendingMails || !interviewDetails.domain || !interviewDetails.selectedEmails.length}
                className="flex-[2] px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {sendingMails ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send {interviewDetails.selectedEmails.length} Invites
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Candidates List */}
          <div className="w-full md:w-1/2 bg-slate-50 p-6 lg:p-10 flex flex-col overflow-hidden">
            {interviewDetails.domain ? (
              <div className="h-full flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-black text-slate-900">Candidates Available</h3>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded text-xs">
                      {filteredEligibleInterns.length} / {eligibleInterns.length} Applied
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const visibleEmails = filteredEligibleInterns.map(i => i.email);
                      const allVisibleSelected = visibleEmails.every(email => interviewDetails.selectedEmails.includes(email));

                      let newEmails;
                      if (allVisibleSelected) {
                        newEmails = interviewDetails.selectedEmails.filter(email => !visibleEmails.includes(email));
                      } else {
                        newEmails = [...new Set([...interviewDetails.selectedEmails, ...visibleEmails])];
                      }

                      setInterviewDetails({
                        ...interviewDetails,
                        selectedEmails: newEmails
                      });
                    }}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                  >
                    {filteredEligibleInterns.length > 0 && filteredEligibleInterns.every(i => interviewDetails.selectedEmails.includes(i.email)) ? "Deselect All Candidates" : "Select All Candidates"}
                  </button>
                </div>

                {/* Candidates Search Input */}
                <div className="relative mb-6 shrink-0 group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
                  <input
                    type="text"
                    placeholder="Search candidate name, email, college..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                  />
                  {candidateSearch && (
                    <button
                      type="button"
                      onClick={() => setCandidateSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-full transition-all"
                      title="Clear Search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {filteredEligibleInterns.map((intern) => {
                    const isChecked = interviewDetails.selectedEmails.includes(intern.email);
                    return (
                      <label
                        key={intern._id}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${isChecked
                          ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                          : "bg-white border-slate-200/80 hover:bg-slate-100"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const emails = e.target.checked
                              ? [...interviewDetails.selectedEmails, intern.email]
                              : interviewDetails.selectedEmails.filter(m => m !== intern.email);
                            setInterviewDetails({ ...interviewDetails, selectedEmails: emails });
                          }}
                          className="w-5 h-5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{intern.fullName}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{intern.email}</p>
                          {intern.college && (
                            <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded mt-2">
                              🏫 {intern.college}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}

                  {filteredEligibleInterns.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <p className="text-sm italic">
                        {candidateSearch ? `No candidates found matching "${candidateSearch}"` : `No pending applications found for this domain.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 bg-white rounded-3xl p-8">
                <Users size={48} className="text-slate-300 animate-pulse mb-3" />
                <h4 className="text-slate-700 font-bold">No Domain Selected</h4>
                <p className="text-xs text-slate-500 text-center mt-1 max-w-xs">Select a domain from the left panel to load the pending candidate roster.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
};

export default InterviewInvitePage;
