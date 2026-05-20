import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Building2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import GraphuraLogo from "/GraphuraLogo.jpg";

const TeamMemberRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    mobile: "", department: "", gender: "", address: "",
    city: "", state: "", pinCode: "", Secret_Key: "",
    role: "InternIncharge",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const departments = [
    "Sales & Marketing", "Data Science & Analytics", "Human Resources",
    "Social Media Management", "Graphic Design", "Digital Marketing",
    "Video Editing", "Full Stack Development", "MERN Stack Development",
    "Email and Outreaching", "Content Creator", "Content Writing",
    "UI/UX Designing", "Front-end Developer", "Back-end Developer",
  ];

  const roles = [
    { value: "InternIncharge", label: "Intern Incharge" },
    { value: "ReviewTeam", label: "Review Team Member" },
  ];

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return false; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return false; }
    if (!formData.mobile.match(/^[0-9]{10}$/)) { setError("Enter a valid 10-digit mobile number."); return false; }
    if (formData.pinCode && !formData.pinCode.match(/^[1-9][0-9]{5}$/)) { setError("Enter a valid 6-digit pin code."); return false; }
    if (formData.role === "InternIncharge" && !formData.department) { setError("Please select a department."); return false; }
    if (!formData.Secret_Key) { setError("Secret Key is required."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (!validateForm()) { setLoading(false); return; }
    try {
      let submitData, endpoint;
      if (formData.role === "InternIncharge") {
        endpoint = "/api/intern-incharge/register";
        submitData = { ...formData, department: [formData.department] };
      } else {
        endpoint = "/api/review-team/register";
        submitData = { ...formData };
      }
      const res = await axios.post(endpoint, submitData, { headers: { "Content-Type": "application/json" } });
      if (res.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate(formData.role === "InternIncharge" ? "/intern-incharge-login" : "/review-team-login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition pr-10";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  const s = (i) => ({
    initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 },
    transition: { delay: 0.22 + i * 0.055, duration: 0.35 },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ebe8f5] p-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'); *{font-family:'Outfit','Inter',sans-serif;}` }} />

      <motion.div
        className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex min-h-[640px]"
        style={{ boxShadow: '0 40px 100px rgba(100,60,180,0.18)' }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden md:flex md:w-[36%] relative flex-col justify-between overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #4c1d95, #5b21b6, #6d28d9)' }}
          initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated blobs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="absolute w-72 h-72 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle at 50% 50%, #a78bfa, #6d28d9)' }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute w-64 h-64 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle at 40% 40%, #c4b5fd, #7c3aed)' }}
              animate={{ rotate: 360, scale: [1, 1.06, 1] }}
              transition={{ rotate: { duration: 22, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }} />
            <motion.div className="absolute w-52 h-52 rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle at 60% 35%, #ddd6fe, #8b5cf6)' }}
              animate={{ rotate: -360, scale: [1, 0.94, 1] }}
              transition={{ rotate: { duration: 16, repeat: Infinity, ease: "linear" }, scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }} />
            <motion.div className="absolute w-40 h-40 rounded-full opacity-55"
              style={{ background: 'radial-gradient(circle at 50% 55%, #ede9fe, #7c3aed)' }}
              animate={{ scale: [1, 1.1, 0.96, 1], rotate: [0, 20, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute w-28 h-28 rounded-full opacity-70"
              style={{ background: 'radial-gradient(circle at 45% 45%, #f5f3ff, #a78bfa)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.65, 0.85, 0.65] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
            {/* Graphura logo center */}
            <motion.div className="absolute w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 0 30px rgba(196,181,253,0.5)' }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85], boxShadow: ['0 0 20px rgba(196,181,253,0.4)', '0 0 40px rgba(196,181,253,0.8)', '0 0 20px rgba(196,181,253,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
              <img src={GraphuraLogo} alt="Graphura" className="w-10 h-10 object-contain rounded-full brightness-200 contrast-50" />
            </motion.div>
            {/* Floating orbs */}
            <motion.div className="absolute w-8 h-8 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #e9d5ff, transparent)', top: '18%', right: '18%' }}
              animate={{ y: [-8, 8, -8], x: [4, -4, 4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute w-12 h-12 rounded-full opacity-25"
              style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)', bottom: '20%', left: '16%' }}
              animate={{ y: [6, -10, 6], x: [-5, 5, -5] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
          </div>

          {/* Top company name */}
          <motion.div className="relative z-10 p-7"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}>
            <p className="text-white font-bold text-sm leading-none tracking-wide">GRAPHURA INDIA PRIVATE LIMITED</p>
            <p className="text-purple-300 text-[11px] font-medium mt-0.5">Graphura Internship Program</p>
          </motion.div>

          {/* Bottom branding */}
          <motion.div className="relative z-10 mt-auto p-7"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}>
            <h2 className="text-white font-semibold text-sm leading-snug mb-4" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
              Join as an Intern Incharge<br />
              or Review Team Member<br />
              <span className="text-purple-200">on Graphura Portal</span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/intern-incharge-login" className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition backdrop-blur-sm block">Login</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/" className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition backdrop-blur-sm block">Home</Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="flex-1 bg-white flex flex-col px-8 sm:px-10 py-7 overflow-y-auto"
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-1">Register as Team Member</h3>
              <p className="text-slate-400 text-sm">Create your account to manage interns or review applications</p>
            </div>

            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}
            {success && <div className="mb-4 px-4 py-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-semibold">✓ Registration successful! Redirecting to login...</div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Role Selection */}
              <motion.div {...s(0)}>
                <label className={labelCls}>Register As <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <label key={role.value}
                      className={`flex items-center gap-2.5 p-3 border-2 rounded-xl cursor-pointer transition text-xs font-semibold ${formData.role === role.value ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-600 hover:border-purple-300"}`}>
                      <input type="radio" name="role" value={role.value} checked={formData.role === role.value}
                        onChange={handleChange} className="sr-only" disabled={loading} />
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.role === role.value ? "border-purple-500" : "border-slate-300"}`}>
                        {formData.role === role.value && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                      </div>
                      {role.label}
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Row: Full Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div {...s(1)}>
                  <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                      placeholder="Your full name" className={inputCls} required disabled={loading} />
                    <User size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </motion.div>
                <motion.div {...s(2)}>
                  <label className={labelCls}>Email Address <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="you@email.com" className={inputCls} required disabled={loading} />
                    <Mail size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </motion.div>
              </div>

              {/* Row: Mobile + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div {...s(3)}>
                  <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                      placeholder="10-digit number" className={inputCls} required maxLength={10} disabled={loading} />
                    <Phone size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </motion.div>
                <motion.div {...s(4)}>
                  <label className={labelCls}>Gender <span className="text-red-400">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className={inputCls} required disabled={loading}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </motion.div>
              </div>

              {/* Department (InternIncharge only) */}
              {formData.role === "InternIncharge" && (
                <motion.div {...s(5)}>
                  <label className={labelCls}>Department <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select name="department" value={formData.department} onChange={handleChange}
                      className={inputCls} required disabled={loading}>
                      <option value="">Select Department</option>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Building2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">More departments can be assigned by admin later</p>
                </motion.div>
              )}

              {/* Row: Password + Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div {...s(6)}>
                  <label className={labelCls}>Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="Min. 6 characters" className={inputCls} required disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </motion.div>
                <motion.div {...s(7)}>
                  <label className={labelCls}>Confirm Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Repeat password" className={inputCls} required disabled={loading} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Secret Key */}
              <motion.div {...s(8)}>
                <label className={labelCls}>Secret Key <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type={showSecretKey ? "text" : "password"} name="Secret_Key"
                    value={formData.Secret_Key} onChange={handleChange}
                    placeholder="Contact admin to get your secret key"
                    className={inputCls} required disabled={loading} />
                  <button type="button" onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                    {showSecretKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </motion.div>

              {/* Row: Address + City + State + Pincode */}
              <motion.div {...s(9)}>
                <label className={labelCls}>Address</label>
                <div className="relative">
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    placeholder="Enter your address" className={inputCls} disabled={loading} />
                  <MapPin size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-4">
                <motion.div {...s(10)}>
                  <label className={labelCls}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    placeholder="City" className={inputCls.replace("pr-10", "")} disabled={loading} />
                </motion.div>
                <motion.div {...s(11)}>
                  <label className={labelCls}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange}
                    placeholder="State" className={inputCls.replace("pr-10", "")} disabled={loading} />
                </motion.div>
                <motion.div {...s(12)}>
                  <label className={labelCls}>Pin Code</label>
                  <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange}
                    placeholder="6-digit" className={inputCls.replace("pr-10", "")} maxLength={6} disabled={loading} />
                </motion.div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(109,40,217,0.35)' }}
                {...s(13)}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(109,40,217,0.55)' }}
                whileTap={{ scale: 0.98 }}>
                {loading ? "Creating account..." : `Register as ${formData.role === "InternIncharge" ? "Intern Incharge" : "Review Team Member"}`}
              </motion.button>

            </form>

            <p className="mt-5 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link to={formData.role === "InternIncharge" ? "/intern-incharge-login" : "/review-team-login"}
                className="text-purple-600 font-semibold hover:underline">Login here</Link>
            </p>
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default TeamMemberRegister;