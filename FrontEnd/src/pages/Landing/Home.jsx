import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Award, Briefcase, Users, CheckCircle, ShieldCheck, Cpu, ArrowRight, Activity, Terminal, Brain, GraduationCap, Award as CertificateIcon, Rocket, Network, Menu, X, Calendar, FileText, Send, Compass } from "lucide-react";
import GraphuraLogo from "/GraphuraLogo.jpg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const HomePage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentApps, setRecentApps] = useState([
    { fullName: "Jyoti Sharma", domain: "UI/UX Designing", status: "Applied" },
    { fullName: "Karan Singh", domain: "MERN Stack Development", status: "Selected" },
    { fullName: "Aarav Sharma", domain: "Front-end Developer", status: "Active" },
  ]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);

    // Fetch live recent applications from the unauthenticated public endpoint
    const fetchRecentApplications = async () => {
      try {
        const response = await axios.get("/api/application-status");
        if (response.data.success && response.data.recentApplications && response.data.recentApplications.length > 0) {
          setRecentApps(response.data.recentApplications);
        }
      } catch (err) {
        console.error("Error fetching recent applications:", err);
      }
    };
    fetchRecentApplications();

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const benefits = [
    { icon: <Terminal className="text-purple-600" size={22} />, title: "Hands-on Projects", desc: "Real-world tasks that level up your portfolio and practical skills in the tech industry." },
    { icon: <Brain className="text-purple-600" size={22} />, title: "Skill Development", desc: "Master modern tools, technologies, and teamwork — essential to become industry-ready." },
    { icon: <GraduationCap className="text-purple-600" size={22} />, title: "Expert Mentorship", desc: "Learn from experienced professionals who guide you through challenges and career decisions." },
    { icon: <CertificateIcon className="text-purple-600" size={22} />, title: "Verified Certificate", desc: "Receive an authenticated internship certificate validating your contribution and learning." },
    { icon: <Rocket className="text-purple-600" size={22} />, title: "Career Opportunities", desc: "Top performers get pre-placement offers, letters of recommendation, and extended roles." },
    { icon: <Network className="text-purple-600" size={22} />, title: "Professional Network", desc: "Connect with peers, mentors, and industry experts — expanding your professional reach." },
  ];

  const processSteps = [
    { step: "01", title: "Create Your Profile", desc: "Register and set up your internship profile with domain preferences and details." },
    { step: "02", title: "Get Shortlisted", desc: "Our team reviews applications and maps you to mentors and domain incharges." },
    { step: "03", title: "Work on Real Projects", desc: "Execute practical tasks, collaborate with teams, and build industry-grade experience." },
    { step: "04", title: "Earn Certificate & Growth", desc: "Complete milestones, receive verified certification, and unlock career opportunities." },
  ];

  const stats = [
    { number: "500+", label: "Active Interns", sub: "Learning with us", color: "#7c3aed", icon: <Users className="text-purple-600" size={20} /> },
    { number: "50+", label: "Expert Mentors", sub: "Guiding every step", color: "#6d28d9", icon: <Briefcase className="text-purple-600" size={20} /> },
    { number: "95%", label: "Success Rate", sub: "Certified / Placed", color: "#5b21b6", icon: <Award className="text-purple-600" size={20} /> },
    { number: "15+", label: "Departments", sub: "Across all domains", color: "#4c1d95", icon: <Cpu className="text-purple-600" size={20} /> },
  ];

  const testimonials = [
    { name: "Aarav Sharma", role: "Frontend Intern", quote: "Graphura gave me real project ownership. My confidence and portfolio both improved in weeks." },
    { name: "Priya Mehta", role: "Data & AI Intern", quote: "Mentorship quality is top-notch. Feedback cycles were fast and helped me grow like a pro." },
    { name: "Rohit Verma", role: "Digital Marketing Intern", quote: "Clear workflows, supportive mentors, and measurable progress — this internship felt premium." },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5ff] relative overflow-x-hidden" style={{ fontFamily: "'Outfit','Inter',sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap'); *{font-family:'Outfit','Inter',sans-serif;}` }} />

      {/* Mouse-follow radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{ background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.06), transparent 70%)` }} />

      {/* Background blobs */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c4b5fd, #7c3aed)', filter: 'blur(100px)' }} />
      <div className="fixed top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ddd6fe, #8b5cf6)', filter: 'blur(100px)' }} />
      <div className="fixed -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ede9fe, #6d28d9)', filter: 'blur(100px)' }} />

      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-purple-100/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-16 sm:h-20">

          {/* Professional Brand Branding Identity */}
          <div className="flex items-center select-none">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 text-sm tracking-wider">GRAPHURA INDIA PRIVATE LIMITED</span>
                <span className="px-1.5 py-0.5 text-[8px] font-black bg-purple-100 text-purple-700 rounded-md tracking-widest uppercase">Internship</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Create Bold. Edit Smart. Design Loud.</p>
            </div>
          </div>

          {/* Desktop Center Navigation Menu (Frosted Sliding Underlines + Lucide Icons) */}
          <div className="hidden lg:flex items-center gap-7">
            <Link to="/weekly-planner" className="relative text-xs sm:text-sm font-extrabold text-slate-500 hover:text-purple-600 transition duration-300 py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left flex items-center gap-1.5">
              <Calendar size={13} className="text-purple-500" /> Planner
            </Link>
            <Link to="/leave/intern" className="relative text-xs sm:text-sm font-extrabold text-slate-500 hover:text-purple-600 transition duration-300 py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left flex items-center gap-1.5">
              <FileText size={13} className="text-purple-500" /> Leave
            </Link>
            <Link to="/Verify/intern" className="relative text-xs sm:text-sm font-extrabold text-slate-500 hover:text-purple-600 transition duration-300 py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-purple-500" /> Verification
            </Link>
            <Link to="/feedback" className="relative text-xs sm:text-sm font-extrabold text-slate-500 hover:text-purple-600 transition duration-300 py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left flex items-center gap-1.5">
              <Send size={13} className="text-purple-500" /> Feedback
            </Link>
            <Link to="/network" className="relative text-xs sm:text-sm font-extrabold text-slate-500 hover:text-purple-600 transition duration-300 py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left flex items-center gap-1.5">
              <Compass size={13} className="text-purple-500" /> Talent Map
            </Link>
          </div>

          {/* Desktop Right Side CTA Action Elements */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login"
              className="px-4 py-2.5 text-xs sm:text-sm font-extrabold text-purple-700 border-2 border-purple-100 hover:border-purple-200 rounded-xl hover:bg-purple-50/50 transition duration-300">
              Login
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 14px rgba(109,40,217,0.3)' }}>
              Register
            </Link>
          </div>

          {/* Mobile Navigation Trigger Button Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-xl border border-purple-100/50"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* Dynamic Mobile Menu Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-purple-100/80 overflow-hidden shadow-inner"
            >
              <div className="px-6 py-5 flex flex-col gap-3 font-semibold text-slate-600">
                <Link
                  to="/weekly-planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-300 text-sm font-extrabold hover:text-purple-700"
                >
                  <Calendar size={15} className="text-purple-500" /> Weekly Planner
                </Link>
                <Link
                  to="/leave/intern"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-300 text-sm font-extrabold hover:text-purple-700"
                >
                  <FileText size={15} className="text-purple-500" /> Apply Leave
                </Link>
                <Link
                  to="/Verify/intern"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-300 text-sm font-extrabold hover:text-purple-700"
                >
                  <ShieldCheck size={15} className="text-purple-500" /> Verify Internship
                </Link>
                <Link
                  to="/feedback"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-300 text-sm font-extrabold hover:text-purple-700"
                >
                  <Send size={15} className="text-purple-500" /> Submit Feedback
                </Link>
                <Link
                  to="/network"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-300 text-sm font-extrabold hover:text-purple-700"
                >
                  <Compass size={15} className="text-purple-500" /> Talent Network Map
                </Link>

                <div className="h-[1px] bg-slate-100 my-2" />

                <div className="flex gap-3 mt-1">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 border-2 border-purple-100 hover:border-purple-200 text-purple-700 font-extrabold text-xs rounded-xl transition">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-white font-extrabold text-xs rounded-xl transition" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                    Register
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>

      {/* ── SPLIT HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-12 lg:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Text & Content */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center">
            <motion.div {...fadeUp(0)} className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full tracking-wider uppercase">
                <ShieldCheck size={12} /> Graphura Internship Program
              </span>
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              Launch Your Career<br />
              With{" "}
              <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Real Experience
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="text-slate-500 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              A premium, secure internship portal designed for dynamic task tracking, quick applications, structured reviews, and institutional progress tracking.
            </motion.p>

            {/* CTA Group */}
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3 items-center mb-8">
              <Link to="/apply">
                <motion.div className="px-6 py-3.5 text-white text-sm font-bold rounded-xl cursor-pointer flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 14px rgba(109,40,217,0.35)' }}
                  whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(109,40,217,0.45)' }}
                  whileTap={{ scale: 0.97 }}>
                  Apply for Internship <ArrowRight size={16} />
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div className="px-6 py-3.5 text-purple-700 text-sm font-bold rounded-xl border border-purple-200 bg-white cursor-pointer"
                  whileHover={{ scale: 1.03, borderColor: '#7c3aed' }}
                  whileTap={{ scale: 0.97 }}>
                  Staff Login
                </motion.div>
              </Link>
              <Link to="/review-team-login">
                <motion.div className="px-6 py-3.5 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 bg-white cursor-pointer"
                  whileHover={{ scale: 1.03, borderColor: '#7c3aed', color: '#7c3aed' }}
                  whileTap={{ scale: 0.97 }}>
                  Review Team
                </motion.div>
              </Link>
            </motion.div>

            {/* Quick checkmarks to fill space */}
            <motion.div {...fadeUp(0.35)} className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 border-t border-purple-100 pt-6">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-purple-600" /> Active 2026 Cohort Intake</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-purple-600" /> Secure OTP Password Reset</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-purple-600" /> verified digital certification</span>
            </motion.div>
          </div>

          {/* Right Column: Dynamic System Illustration Card (Fills Blank Space) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div
              className="w-full max-w-md rounded-3xl border border-purple-100 bg-white/70 backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden"
              style={{ boxShadow: '0 30px 70px rgba(100,50,200,0.12)' }}
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Card top details */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1"><Activity size={10} /> Live System Status</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md">V2.4</span>
              </div>

              {/* Dynamic simulated dashboard rows */}
              <div className="space-y-4">

                {recentApps.map((app, index) => {
                  const initials = app.fullName
                    ? app.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                    : "IN";

                  let badgeClass = "bg-amber-50 text-amber-700 border border-amber-100";
                  let statusText = "Applied";
                  if (app.status === "Selected" || app.status === "Active") {
                    badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                    statusText = app.status;
                  } else if (app.status === "Rejected" || app.status === "Terminated") {
                    badgeClass = "bg-red-50 text-red-700 border border-red-100";
                    statusText = app.status;
                  } else {
                    statusText = "Applied";
                  }

                  return (
                    <div key={app._id || index} className="p-3.5 bg-white border border-purple-100/50 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center font-bold text-purple-600 text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{app.fullName}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{app.domain}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}

                {/* Live progress stats inside mockup */}
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border border-purple-100/30 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500">Weekly Planner Submissions</span>
                    <span className="text-xs font-black text-purple-700">88% Completion</span>
                  </div>
                  <div className="w-full bg-purple-100/50 h-2 rounded-full overflow-hidden">
                    <motion.div className="bg-purple-600 h-full rounded-full"
                      initial={{ width: 0 }} animate={{ width: '88%' }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }} />
                  </div>
                </div>

              </div>

              {/* Decorative floating widgets to layer screen depth */}
              <motion.div className="absolute -right-8 -top-8 w-20 h-20 bg-purple-100/40 rounded-full blur-xl pointer-events-none" />
              <motion.div className="absolute -left-8 -bottom-8 w-20 h-20 bg-indigo-100/40 rounded-full blur-xl pointer-events-none" />
            </motion.div>

            {/* Tiny floating micro-badge */}
            <motion.div
              className="absolute -top-4 -right-2 bg-white border border-purple-100 shadow-xl rounded-2xl p-3 flex items-center gap-2.5 z-20"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">⭐</div>
              <div>
                <p className="text-[10px] font-black text-slate-800">100% Secure</p>
                <p className="text-[8px] text-slate-400 font-medium">OTP Verification</p>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Intern Incharge Action banner */}
        <motion.div {...fadeUp(0.4)}
          className="mt-16 max-w-4xl mx-auto rounded-3xl border border-purple-100/80 bg-white/80 backdrop-blur-xl shadow-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Portal Access Control</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">Are you an Intern Incharge or Review Team Member?</h3>
            <p className="text-xs text-slate-400 mt-0.5">Log in or create your official account to evaluate candidates.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/intern-incharge-login">
              <motion.div className="px-5 py-2.5 text-white text-xs font-bold rounded-xl cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Incharge Login
              </motion.div>
            </Link>
            <Link to="/intern-incharge-register">
              <motion.div className="px-5 py-2.5 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 bg-white cursor-pointer"
                whileHover={{ scale: 1.03, borderColor: '#7c3aed' }} whileTap={{ scale: 0.97 }}>
                Register as Member
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(0.08 * i)}
              className="bg-white border border-purple-100/80 rounded-2xl p-5 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-xl shrink-0">{s.icon}</div>
              <div>
                <div className="text-2xl sm:text-3xl font-black mb-0.5" style={{ color: s.color }}>{s.number}</div>
                <div className="text-xs font-bold text-slate-700">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full tracking-widest uppercase mb-4">What Interns Gain</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Everything You Need to Grow</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">A journey that blends learning, practical exposure, and personal growth — built for ambitious individuals.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const cardContent = (
              <>
                <div className="p-3 bg-purple-50 rounded-xl w-fit mb-4 group-hover:bg-purple-100/80 transition-colors duration-300">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                  {b.title} {b.title === "Professional Network" && <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black uppercase">Live Map</span>}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </>
            );

            if (b.title === "Professional Network") {
              return (
                <Link to="/network" key={i}>
                  <motion.div {...fadeUp(0.05 * i)}
                    className="bg-white border border-purple-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                    {cardContent}
                  </motion.div>
                </Link>
              );
            }

            return (
              <motion.div key={i} {...fadeUp(0.05 * i)}
                className="bg-white border border-purple-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                {cardContent}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── PROCESS SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full tracking-widest uppercase mb-4">Process Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">How It Works</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">A clean, guided, outcome-focused journey from application to achievement.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((item, i) => (
            <motion.div key={i} {...fadeUp(0.06 * i)}
              className="relative bg-white border border-purple-100/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-black mb-3" style={{ color: '#ede9fe' }}>{item.step}</div>
              <div className="absolute top-6 left-6 text-sm font-black" style={{ color: '#7c3aed' }}>{item.step}</div>
              <h4 className="font-bold text-slate-800 mb-2 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full tracking-widest uppercase mb-4">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">What Interns Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} {...fadeUp(0.08 * i)}
              className="bg-white border border-purple-100/60 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-2xl mb-4 font-serif text-purple-300">“</div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{t.quote}</p>
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                <p className="text-xs text-purple-500 font-semibold mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST BADGES SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <motion.div {...fadeUp(0)}
          className="bg-white border border-purple-100/80 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">System Verification Badges</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Verified Certificates", "Industry Mentors", "Real-Time Progress", "Structured Reviews", "Domain Expertise", "Career Support"].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/50">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-purple-100/80 bg-white text-center py-8 px-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-slate-700 text-sm">Graphura India Private Limited</span>
        </div>
        <p className="text-xs text-slate-400">© 2025 All rights reserved.</p>
        <p className="text-xs text-slate-400 mt-1">Building the future of internship management, one connection at a time.</p>
      </footer>

    </div>
  );
};

export default HomePage;
