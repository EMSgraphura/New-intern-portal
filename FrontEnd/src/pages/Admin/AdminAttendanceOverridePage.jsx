import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Calendar, User, Save, Check, RefreshCw, AlertCircle, CalendarRange } from "lucide-react";

const AdminAttendanceOverridePage = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Override Form states
  const [overrideDate, setOverrideDate] = useState(new Date().toISOString().split("T")[0]);
  const [overrideStatus, setOverrideStatus] = useState("Present");
  const [remarks, setRemarks] = useState("Overridden by Admin");
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State to track if attendance is already marked
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);

  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
      return;
    }
    fetchInterns();
  }, []);

  // Check if attendance exists when selected intern or date changes
  useEffect(() => {
    if (selectedIntern && overrideDate) {
      checkExistingAttendance();
    } else {
      setExistingAttendance(null);
    }
  }, [selectedIntern, overrideDate]);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/interns", {
        withCredentials: true,
      });
      const list = data.interns || [];
      const eligible = list.filter(
        (intern) => intern.status === "Active" || intern.status === "Inactive" || intern.status === "Completed"
      );
      setInterns(eligible);
    } catch (err) {
      console.error("Error fetching interns for attendance override:", err);
      setMessage({ type: "error", text: "Failed to load interns list." });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAttendance = async () => {
    try {
      setCheckingAttendance(true);
      setMessage({ type: "", text: "" });
      const { data } = await axios.get(
        `/api/admin/attendance/check?internId=${selectedIntern._id}&date=${overrideDate}`,
        { withCredentials: true }
      );
      if (data.success && data.exists) {
        setExistingAttendance(data.attendance);
        setOverrideStatus(data.attendance.status);
        setRemarks(data.attendance.remarks || "Overridden by Admin");
      } else {
        setExistingAttendance(null);
        setOverrideStatus("Present");
        setRemarks("Overridden by Admin");
      }
    } catch (err) {
      console.error("Error checking existing attendance:", err);
    } finally {
      setCheckingAttendance(false);
    }
  };

  const filteredInterns = interns.filter((intern) => {
    const term = searchTerm.toLowerCase();
    return (
      intern.fullName.toLowerCase().includes(term) ||
      intern.email.toLowerCase().includes(term) ||
      (intern.uniqueId && intern.uniqueId.toLowerCase().includes(term)) ||
      (intern.domain && intern.domain.toLowerCase().includes(term))
    );
  });

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setMessage({ type: "", text: "" });
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntern) {
      setMessage({ type: "error", text: "Please select an intern first." });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      const response = await axios.post(
        "/api/admin/attendance/override",
        {
          internId: selectedIntern._id,
          date: overrideDate,
          status: overrideStatus,
          remarks: remarks
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const successMsg = existingAttendance 
          ? `Successfully updated attendance status to ${overrideStatus} for ${selectedIntern.fullName} on ${overrideDate}.`
          : `Successfully marked new attendance status as ${overrideStatus} for ${selectedIntern.fullName} on ${overrideDate}.`;
        
        setMessage({
          type: "success",
          text: successMsg
        });
        
        // Refresh local intern data stats
        fetchInterns();
        
        // Refresh check for current date
        checkExistingAttendance();
        
        // Update currently selected intern view with new stats if available
        if (response.data.attendance) {
          setSelectedIntern(prev => {
            const updated = { ...prev };
            if (overrideStatus === "Present") {
              updated.meetingsAttended = (updated.meetingsAttended || 0) + 1;
            } else if (overrideStatus === "Leave") {
              updated.leavesTaken = (updated.leavesTaken || 0) + 1;
            }
            updated.totalMeetings = (updated.totalMeetings || 0) + 1;
            return updated;
          });
        }
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to save attendance." });
      }
    } catch (err) {
      console.error("Error submitting attendance override:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "An error occurred while saving attendance."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 antialiased" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Floating Navbar Style */}
        <div className="backdrop-blur-md bg-white/90 sticky top-4 z-[50] rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 p-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/Admin-Dashboard")}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-200/80 shadow-sm"
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange size={16} className="text-emerald-600 animate-pulse" />
                <h1 className="text-sm font-black text-slate-800 tracking-wider uppercase" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>ATTENDANCE OVERRIDE SYSTEM</h1>
              </div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                Super Administration Panel &bull; Graphura India
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-700 leading-none" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{storedUser?.fullName || "System Admin"}</p>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-1" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Super Admin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Left Block: Intern Selection & Roster (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 overflow-hidden">
            <h2 className="text-xs font-extrabold text-slate-700 tracking-widest uppercase mb-4 flex items-center gap-2" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
              <User size={14} className="text-blue-500" />
              1. Select Intern
            </h2>

            {/* Search Input Bar */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, unique ID, email or domain..."
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Interns Roster List */}
            <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <RefreshCw size={24} className="animate-spin text-emerald-500" />
                  <p className="text-xs font-semibold" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Loading eligible interns...</p>
                </div>
              ) : filteredInterns.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-semibold" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>No matching interns found.</p>
                </div>
              ) : (
                filteredInterns.map((intern) => {
                  const isSelected = selectedIntern?._id === intern._id;
                  return (
                    <div
                      key={intern._id}
                      onClick={() => handleSelectIntern(intern)}
                      className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? "bg-emerald-50/50 border-emerald-500/40 shadow-sm"
                          : "bg-white border-slate-200/80 hover:bg-slate-50/70 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{intern.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{intern.email}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          intern.status === "Active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : intern.status === "Completed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-650"
                        }`} style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                          {intern.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold border-t border-slate-100 pt-2 mt-1">
                        <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                          {intern.domain}
                        </span>
                        <span style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>ID: {intern.uniqueId || "N/A"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Block: Override Panel (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Selected Intern Profile Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 select-none">
              <h2 className="text-xs font-extrabold text-slate-700 tracking-widest uppercase mb-4 flex items-center gap-2" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                <Calendar size={14} className="text-emerald-500" />
                Intern Summary
              </h2>

              {selectedIntern ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Full Name</p>
                    <p className="text-xs font-black text-slate-800" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{selectedIntern.fullName}</p>
                    
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-3" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Domain / Department</p>
                    <p className="text-xs font-bold text-slate-700" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{selectedIntern.domain}</p>
                  </div>
                  
                  <div className="bg-slate-50/50 rounded-xl border border-slate-200/60 p-3 grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col justify-center">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Meetings</p>
                      <p className="text-base font-black text-slate-800" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{selectedIntern.totalMeetings || 0}</p>
                    </div>
                    <div className="flex flex-col justify-center border-x border-slate-200/85">
                      <p className="text-[8px] text-emerald-600 font-black uppercase tracking-wider" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Attended</p>
                      <p className="text-base font-black text-emerald-700" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{selectedIntern.meetingsAttended || 0}</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[8px] text-amber-600 font-black uppercase tracking-wider" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>Leaves</p>
                      <p className="text-base font-black text-amber-700" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>{selectedIntern.leavesTaken || 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-xs font-semibold flex items-center justify-center gap-1.5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    <AlertCircle size={14} />
                    Select an intern from the left panel to review stats.
                  </p>
                </div>
              )}
            </div>

            {/* Override Controls Form Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-xs font-extrabold text-slate-700 tracking-widest uppercase mb-5 flex items-center gap-2" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                <Save size={14} className="text-emerald-500" />
                {existingAttendance ? "2. Modify Existing Attendance Record" : "2. Configure Attendance Action"}
              </h2>

              {/* Dynamic Warning Alert Banner based on existing record */}
              {checkingAttendance ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-200/50" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  <RefreshCw size={12} className="animate-spin text-emerald-500" />
                  Checking existing attendance records...
                </div>
              ) : existingAttendance ? (
                <div className="mb-4 bg-amber-50/60 border border-amber-250 text-amber-800 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">⚠️ Existing Attendance Record Detected</p>
                    <p className="text-[11px] text-amber-750 font-semibold mt-0.5 leading-normal">
                      Attendance for this intern is already marked as <span className="font-black uppercase tracking-wider underline">{existingAttendance.status}</span> on this date. You cannot mark a new duplicate record, but you can change the status of the existing record below.
                    </p>
                  </div>
                </div>
              ) : selectedIntern ? (
                <div className="mb-4 bg-emerald-50/60 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">✨ New Attendance Record</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 leading-normal">
                      No existing attendance record was found for this date. You are marking a new clean record.
                    </p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleOverrideSubmit} className="space-y-4">
                
                {/* Date Selection */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    Select Target Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={13} />
                    </span>
                    <input
                      type="date"
                      required
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Status Options Toggles */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    Select Attendance Status
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { status: "Present", color: "border-green-500/40 text-green-700 bg-green-50/50", dot: "bg-green-500" },
                      { status: "Absent", color: "border-red-500/40 text-red-700 bg-red-50/50", dot: "bg-red-500" },
                      { status: "Leave", color: "border-amber-500/40 text-amber-700 bg-amber-50/50", dot: "bg-amber-500" }
                    ].map((opt) => {
                      const isActive = overrideStatus === opt.status;
                      return (
                        <button
                          key={opt.status}
                          type="button"
                          onClick={() => setOverrideStatus(opt.status)}
                          style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            isActive
                              ? `${opt.color} ring-2 ring-emerald-500/10 font-bold border-2`
                              : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50/80 font-semibold"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`}></span>
                          <span className="text-xs">{opt.status}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Remarks Text Area */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    Override Reason / Remarks
                  </label>
                  <textarea
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter reason (e.g. Approved medical leave, Technical glitch, etc.)"
                    style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Submitting Toast Messages */}
                {message.text && (
                  <div className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                    message.type === "success"
                      ? "bg-green-50/60 border-green-200 text-green-800"
                      : "bg-red-50/60 border-red-200 text-red-800"
                  }`} style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                    {message.type === "success" ? <Check size={16} className="text-green-600 mt-0.5 shrink-0" /> : <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />}
                    <p className="leading-normal">{message.text}</p>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedIntern || checkingAttendance}
                  style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                  className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${
                    !selectedIntern || checkingAttendance
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : submitting
                      ? "bg-slate-50 border-slate-200 text-slate-500 cursor-wait"
                      : "bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 hover:scale-[1.01]"
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : existingAttendance ? (
                    <>
                      <Save size={14} />
                      Modify Existing Attendance Status
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Mark New Attendance Status
                    </>
                  )}
                </button>

              </form>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminAttendanceOverridePage;
