import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Trash2, Edit3, Calendar, Clock, Layout, ArrowLeft, Save, X, Search, Filter, Info, ShieldCheck, UserCheck, Briefcase, History, ChevronDown, LogOut, Upload, Download, Mail, Users, AlertTriangle, UserMinus } from "lucide-react";
import Graphura from "../../../public/GraphuraLogo.jpg";

const ManagePlanner = () => {
  const [planner, setPlanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    department: "",
    meetingTime: "",
    agenda: "Weekly Sync",
    repeat: "none", // none, daily, alternate, custom
    selectedDays: [] // ["Monday", "Wednesday", etc.]
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  const isInchargePath = location.pathname.startsWith("/incharge");
  const storedUser = isInchargePath
    ? JSON.parse(localStorage.getItem("internIncharge"))
    : JSON.parse(localStorage.getItem("user"));
  
  let basePath = "/HR-Dashboard";
  if (isInchargePath) {
    basePath = "/intern-incharge-dashboard";
  } else if (storedUser?.role === "HR Manager") {
    basePath = "/HR-Manager-Dashboard";
  } else if (storedUser?.role === "Admin") {
    basePath = "/Admin-Dashboard";
  }

  const allDepartments = [
    "Sales & Marketing",
    "Data & AI Intelligence",
    "Human Resources",
    "Social Media Management",
    "Graphic Design",
    "Digital Marketing",
    "Video Editing",
    "Full Stack Development",
    "MERN Stack Development",
    "Email and Outreaching",
    "Content Writing",
    "Content Creator",
    "UI/UX Designing",
    "Front-end Developer",
    "Back-end Developer",
    "IT Department",
    "Finance & Accounts",
    "Legal Department",
    "Product Management",
    "Business Development",
    "Cyber Security",
    "Cloud Computing",
    "General / All Departments"
  ];

  const isSpecialUser = storedUser?.role === "Admin" || storedUser?.role === "HR Manager" || storedUser?.role === "HR";

  const isDeptAssigned = (dept) => {
    if (isSpecialUser) return true;
    const assignedDepts = Array.isArray(storedUser?.department) ? storedUser.department : [];
    
    return assignedDepts.some(assignedDept => {
      const normAssigned = assignedDept.toLowerCase().trim();
      const normDept = dept.toLowerCase().trim();
      if (normAssigned === normDept) return true;
      
      // Handle the "Data Science & Analytics" vs "Data & AI Intelligence" mismatch
      if (
        (normAssigned.includes("data science") || normAssigned.includes("analytics") || normAssigned.includes("ai")) &&
        (normDept.includes("data science") || normDept.includes("analytics") || normDept.includes("ai"))
      ) {
        return true;
      }
      return false;
    });
  };

  const allowedDepartments = allDepartments.filter(dept => isDeptAssigned(dept));
  const assignedDepts = Array.isArray(storedUser?.department) ? storedUser.department : [];
  const normalizedAssignedDepts = assignedDepts.map(d => {
    const norm = d.toLowerCase().trim();
    if (norm.includes("data science") || norm.includes("analytics") || norm.includes("ai")) {
      return "Data & AI Intelligence";
    }
    return d;
  });

  const displayDepartments = isSpecialUser
    ? allDepartments
    : (allowedDepartments.length > 0 ? allowedDepartments : normalizedAssignedDepts);

  const canManage = (item) => {
    if (isSpecialUser) return true;
    return isDeptAssigned(item.department);
  };

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
      if (storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") {
        await axios.post("/api/intern-incharge/logout", {}, { withCredentials: true });
      } else {
        await axios.post("/api/logout", {}, { withCredentials: true });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('internIncharge');
      if (storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") {
        navigate("/intern-incharge-login", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  };

  useEffect(() => {
    if (isInchargePath) {
      if (!storedUser || (storedUser.role !== "InternHead" && storedUser.role !== "InternIncharge")) {
        navigate("/intern-incharge-login");
        return;
      }
    } else {
      if (!storedUser || (storedUser.role !== "Admin" && storedUser.role !== "HR Manager" && storedUser.role !== "HR")) {
        navigate("/login");
        return;
      }
    }
    fetchPlanner();
  }, [location.pathname]);

  const fetchPlanner = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/planner");
      setPlanner(response.data);
    } catch (err) {
      setError("Failed to fetch planner entries");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await axios.put(`/api/planner/${editingEntry._id}`, formData, { withCredentials: true });
      } else {
        if (formData.repeat === "none") {
          await axios.post("/api/planner", formData, { withCredentials: true });
        } else {
          const entries = [];
          const startDate = new Date(formData.date);
          const count = formData.repeat === "custom" ? 14 : (formData.repeat === "daily" ? 7 : 14);
          const step = formData.repeat === "daily" ? 1 : 2;

          for (let i = 0; i < count; i += (formData.repeat === "custom" ? 1 : step)) {
            const nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + i);
            const dayName = nextDate.toLocaleDateString("en-US", { weekday: "long" });

            if (formData.repeat === "custom") {
              if (formData.selectedDays.includes(dayName)) {
                entries.push({
                  ...formData,
                  date: nextDate.toISOString().split('T')[0]
                });
              }
            } else {
              entries.push({
                ...formData,
                date: nextDate.toISOString().split('T')[0]
              });
            }
          }
          if (entries.length === 0) return alert("No dates matched your selection.");
          await axios.post("/api/planner", { entries }, { withCredentials: true });
        }
      }
      setIsModalOpen(false);
      setEditingEntry(null);
      setFormData({ date: "", department: "", meetingTime: "", agenda: "Weekly Sync", repeat: "none", selectedDays: [] });
      fetchPlanner();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`/api/planner/${id}`, { withCredentials: true });
      fetchPlanner();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date.split('T')[0],
      department: entry.department,
      meetingTime: entry.meetingTime,
      agenda: entry.agenda,
      repeat: "none",
      selectedDays: []
    });
    setIsModalOpen(true);
  };

  const filteredPlanner = planner.filter(item => {
    const matchesSearch = (item.agenda || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === "All" || item.department === selectedDeptFilter;
    const matchesDate = !selectedDateFilter || (item.date && item.date.split('T')[0] === selectedDateFilter);
    return matchesSearch && matchesDept && matchesDate;
  });

  const departments = ["All", ...new Set(planner.map(item => item.department))];

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
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {(storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") ? "Intern Incharge" : (storedUser?.role || "HR Manager")}
                </p>
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
                  <p className="text-[11px] font-black text-slate-800 truncate max-w-[100px] leading-tight">{storedUser?.fullName || ((storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") ? "Intern Incharge" : "HR Manager")}</p>
                  <p className="text-[9px] text-indigo-500 font-bold leading-none mt-0.5">{(storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") ? "Intern Incharge" : (storedUser?.role || "HR Manager")}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-[100]">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[12px] font-black text-slate-800 truncate">{storedUser?.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{storedUser?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[9px] font-black uppercase">{(storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") ? "Intern Incharge" : storedUser?.role}</span>
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

        {/* Schedule Title Block with Add/View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              Meetings Schedule Hub
              <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-150 shadow-sm shadow-indigo-50/50">
                {(storedUser?.role === "InternHead" || storedUser?.role === "InternIncharge") ? "Incharge Control" : "HR Manager Control"}
              </span>
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">Manage, edit, schedule and broadcast recurring department meetings across the organization.</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate("/weekly-planner")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-650 transition-all rounded-xl text-xs font-bold shadow-sm"
            >
              <Layout size={15} /> Public Calendar
            </button>
            <button
              onClick={() => {
                setEditingEntry(null);
                setFormData({ date: "", department: "", meetingTime: "", agenda: "Weekly Sync", repeat: "none", selectedDays: [] });
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 active:scale-95"
            >
              <Plus size={15} /> Add Schedule
            </button>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none cursor-pointer appearance-none shadow-sm"
              >
                <option value="All">All Departments</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Data & AI Intelligence">Data & AI Intelligence</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="MERN Stack Development">MERN Stack Development</option>
                <option value="Email and Outreaching">Email and Outreaching</option>
                <option value="Content Writing">Content Writing</option>
                <option value="Content Creator">Content Creator</option>
                <option value="UI/UX Designing">UI/UX Designing</option>
                <option value="Front-end Developer">Front-end Developer</option>
                <option value="Back-end Developer">Back-end Developer</option>
                <option value="IT Department">IT Department</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Legal Department">Legal Department</option>
                <option value="Product Management">Product Management</option>
                <option value="Business Development">Business Development</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="General / All Departments">General / All Departments</option>
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

          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <Info size={14} className="text-indigo-400" />
            <span>Total Meetings: {filteredPlanner.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Agenda</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlanner.map((item) => (
                    <tr key={item._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="text-sm font-bold text-slate-900">{item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (item.date || "Unknown Date")}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{item.day}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          {item.department}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock size={14} className="opacity-40" />
                          <span className="text-xs font-bold">{item.meetingTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-600 max-w-xl line-clamp-1">{item.agenda}</p>
                      </td>
                      <td className="px-6 py-5">
                        {canManage(item) && (
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPlanner.length === 0 && (
              <div className="py-24 text-center bg-slate-50/30">
                <Calendar size={48} className="mx-auto mb-4 text-slate-200" strokeWidth={1.5} />
                <p className="text-slate-400 font-bold text-sm tracking-tight">No matching schedules found</p>
                <p className="text-slate-300 text-xs mt-1">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Modern SaaS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingEntry ? "Update Schedule" : "New Meeting"}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Fill in the details to broadcast this meeting.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Time</label>
                    <input
                      type="text"
                      name="meetingTime"
                      placeholder="e.g. 11:00 AM"
                      value={formData.meetingTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Department</label>
                  <div className="relative">
                    <Layout size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Select Domain...</option>
                      {displayDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingEntry && (
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recurrence Policy</label>
                      <select
                        name="repeat"
                        value={formData.repeat}
                        onChange={handleInputChange}
                        className="w-full px-0 bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer text-sm"
                      >
                        <option value="none">One-time entry</option>
                        <option value="daily">Daily for 1 week</option>
                        <option value="alternate">Every alternate day (14 days)</option>
                        <option value="custom">Custom selection</option>
                      </select>
                    </div>

                    {formData.repeat === "custom" && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border ${formData.selectedDays.includes(day)
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                              : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300"
                              }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Agenda</label>
                  <textarea
                    name="agenda"
                    rows="3"
                    placeholder="Briefly describe the purpose of this sync..."
                    value={formData.agenda}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> {editingEntry ? "Sync Changes" : "Create Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlanner;
