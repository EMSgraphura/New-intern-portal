import React, { useState, useEffect } from "react";
import axios from "axios";
import GraphuraLogo from "/GraphuraLogo.jpg";
import {
  Calendar, Clock, ChevronRight, ChevronLeft,
  Layout, List, Grid, Search, Users,
  RefreshCw, Sparkles, Bell
} from "lucide-react";

const DEPT_COLORS = {
  "Sales & Marketing": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-400" },
  "Data & AI Intelligence": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
  "Human Resources": { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", dot: "bg-pink-400" },
  "Social Media Management": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-400" },
  "Graphic Design": { bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700", dot: "bg-fuchsia-400" },
  "Digital Marketing": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-400" },
  "Video Editing": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-400" },
  "Full Stack Development": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-400" },
  "MERN Stack Development": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
  "UI/UX Designing": { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-400" },
  "Front-end Developer": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-400" },
  "Back-end Developer": { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", dot: "bg-teal-400" },
  "Content Writing": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
  "Finance & Accounts": { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700", dot: "bg-lime-400" },
  "default": { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
};

const getDeptStyle = (dept) => DEPT_COLORS[dept] || DEPT_COLORS["default"];

const WeeklyPlanner = () => {
  const [planner, setPlanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => { fetchPlanner(); }, []);

  const fetchPlanner = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/planner");
      setPlanner(response.data);
    } catch (error) {
      console.error("Error fetching planner:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const { start, end } = getWeekRange(currentWeek);

  const filteredPlanner = planner.filter(item => {
    const itemDate = new Date(item.date);
    const inRange = itemDate >= start && itemDate <= end;
    const matchesSearch =
      (item.agenda || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || item.department === selectedDept;
    return inRange && matchesSearch && matchesDept;
  });

  const departments = ["All", ...new Set(planner.map(item => item.department).filter(Boolean))];

  const changeWeek = (offset) => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + offset);
    setCurrentWeek(next);
  };

  const isToday = (dateStr) =>
    new Date(dateStr).toLocaleDateString() === new Date().toLocaleDateString();

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return (
    <div
      className="min-h-screen bg-[#f7f5ff] antialiased"
      style={{ fontFamily: "'Outfit','Inter',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit','Inter',sans-serif; }
        .glass { background: rgba(255,255,255,0.72); backdrop-filter: blur(18px); }
        .card-hover { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 48px -12px rgba(109,40,217,0.13); }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .input-ring:focus { box-shadow: 0 0 0 3px rgba(124,58,237,0.15); border-color: #7c3aed; outline: none; }
      `}</style>

      {/* Background blobs */}
      <div className="fixed -top-40 -left-32 w-[520px] h-[520px] rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #c4b5fd, #7c3aed)", filter: "blur(90px)" }} />
      <div className="fixed top-1/2 -right-48 w-[480px] h-[480px] rounded-full pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, #ddd6fe, #8b5cf6)", filter: "blur(90px)" }} />

      {/* ── Sticky Navbar ── */}
      <nav className="sticky top-0 z-50 w-full glass border-b border-purple-100/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <img
              src={GraphuraLogo}
              alt="Graphura"
              className="h-9 w-auto object-contain"
            />
            <div className="h-6 w-px bg-purple-100" />
            <div>
              <p className="font-extrabold text-slate-800 text-sm tracking-wide leading-none">Weekly Planner</p>
              <p className="text-[9px] text-purple-500 font-bold tracking-widest uppercase mt-0.5">Graphura Meetings Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-purple-50/80 p-1 rounded-xl border border-purple-100">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow text-purple-600" : "text-slate-400 hover:text-purple-500"}`}
                title="List View"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow text-purple-600" : "text-slate-400 hover:text-purple-500"}`}
                title="Grid View"
              >
                <Grid size={15} />
              </button>
            </div>

            <button onClick={fetchPlanner} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition" title="Refresh">
              <RefreshCw size={16} />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest hidden sm:inline">Live</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 sm:px-10 py-10">

        {/* ── Hero Header ── */}
        <div className="mb-10 fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-[10px] font-extrabold text-purple-500 uppercase tracking-widest">Department Meetings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            Week of{" "}
            <span style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Browse and filter your upcoming department meetings.</p>
        </div>

        {/* ── Controls Row ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 fade-in">
          {/* Search — left side */}
          <div className="relative w-full lg:w-72 group">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search meeting or department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-100 rounded-xl text-sm shadow-sm input-ring transition-all"
            />
          </div>

          {/* Right side controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-end">
            {/* Department filter */}
            <div className="relative w-full sm:w-64 group">
              <Layout size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-100 rounded-xl text-sm shadow-sm input-ring appearance-none cursor-pointer transition-all"
              >
                <option value="All">All Departments</option>
                <option value="Sales & Marketing">Sales &amp; Marketing</option>
                <option value="Data & AI Intelligence">Data &amp; AI Intelligence</option>
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
                <option value="Finance & Accounts">Finance &amp; Accounts</option>
                <option value="Legal Department">Legal Department</option>
                <option value="Product Management">Product Management</option>
                <option value="Business Development">Business Development</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="General / All Departments">General / All Departments</option>
              </select>
            </div>

            {/* Week navigator */}
            <div className="flex items-center gap-1 bg-white border border-purple-100 p-1 rounded-xl shadow-sm flex-shrink-0">
              <button onClick={() => changeWeek(-7)} className="p-2 hover:bg-purple-50 rounded-lg text-slate-500 transition">
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentWeek(new Date())}
                className="px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-purple-600 hover:text-purple-800 transition"
              >
                Today
              </button>
              <button onClick={() => changeWeek(7)} className="p-2 hover:bg-purple-50 rounded-lg text-slate-500 transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="h-80 glass border border-purple-100 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400 tracking-wide">Loading meetings...</p>
          </div>

        ) : filteredPlanner.length === 0 ? (
          <div className="glass border border-purple-100/80 border-dashed rounded-2xl py-24 text-center shadow-sm fade-in">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-purple-300">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">No meetings this week</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1.5">Nothing is scheduled yet. Check back later or browse another week.</p>
          </div>

        ) : viewMode === "list" ? (
          /* ── List View ── */
          <div className="glass border border-purple-100/80 rounded-2xl overflow-hidden shadow-sm fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-100/80 bg-purple-50/40">
                  {["Date & Day", "Department", "Time", "Agenda", "Scheduled By"].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {filteredPlanner.map(item => {
                  const ds = getDeptStyle(item.department);
                  const today = isToday(item.date);
                  return (
                    <tr key={item._id} className={`group transition-colors hover:bg-purple-50/30 ${today ? "bg-purple-50/20" : ""}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {today && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse inline-block" />}
                          <p className="text-sm font-extrabold text-slate-800">{formatDate(item.date)}</p>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${today ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                            {item.day?.slice(0, 3)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${ds.bg} ${ds.border} ${ds.text}`}>
                          {item.department}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={13} className="opacity-50" />
                          <span className="text-xs font-bold">{item.meetingTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700 max-w-md group-hover:text-slate-900 transition-colors">{item.agenda}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-extrabold text-purple-700">
                            {item.createdBy?.fullName?.charAt(0) || "H"}
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">{item.createdBy?.fullName || "HR"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        ) : (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 fade-in">
            {filteredPlanner.map((item, i) => {
              const ds = getDeptStyle(item.department);
              const today = isToday(item.date);
              return (
                <div
                  key={item._id}
                  className={`card-hover glass border rounded-2xl p-5 relative overflow-hidden ${today ? "border-purple-300 shadow-lg shadow-purple-100" : "border-purple-100/80 shadow-sm"}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Today badge */}
                  {today && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 bg-purple-600 text-white text-[8px] font-extrabold rounded-full uppercase tracking-wider">Today</span>
                  )}

                  {/* Decorative gradient top bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${ds.dot}`} />

                  <div className="mt-2 mb-4">
                    <p className={`text-[10px] font-extrabold uppercase tracking-widest ${today ? "text-purple-500" : "text-slate-400"}`}>
                      {item.day}
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 mt-0.5">{formatDate(item.date)}</h3>
                  </div>

                  <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg border mb-3 ${ds.bg} ${ds.border} ${ds.text}`}>
                    {item.department}
                  </span>

                  <p className="text-sm font-semibold text-slate-700 leading-snug line-clamp-2 mb-5 min-h-[40px]">{item.agenda}</p>

                  <div className="border-t border-purple-50 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={13} className="opacity-50" />
                      <span className="text-xs font-extrabold">{item.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[9px] font-extrabold text-purple-700">
                        {item.createdBy?.fullName?.charAt(0) || "H"}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{item.createdBy?.fullName?.split(" ")[0] || "HR"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Stats footer strip ── */}
        {!loading && filteredPlanner.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold text-slate-500 fade-in">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-100 rounded-full shadow-sm">
              <Calendar size={12} className="text-purple-400" /> {filteredPlanner.length} meeting{filteredPlanner.length !== 1 ? "s" : ""} this week
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-100 rounded-full shadow-sm">
              <Users size={12} className="text-purple-400" /> {new Set(filteredPlanner.map(m => m.department)).size} department{new Set(filteredPlanner.map(m => m.department)).size !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── Notice Banner ── */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-5 px-7 py-6 rounded-2xl shadow-lg fade-in"
          style={{ background: "linear-gradient(135deg, #3b0764, #5b21b6, #7c3aed)" }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bell size={20} className="text-purple-200" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">Important Notice</p>
              <p className="text-purple-200 text-xs mt-0.5">Please be present 5 minutes before the scheduled meeting time.</p>
            </div>
          </div>
          <a
            href="mailto:hr@graphura.in"
            className="px-6 py-2.5 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-extrabold rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            Contact HR Team
          </a>
        </div>

      </main>
    </div>
  );
};

export default WeeklyPlanner;
