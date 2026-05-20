import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GraphuraLogo from "/GraphuraLogo.jpg";
import { buildLoginMeta } from "../utils/loginMeta";

const InternInchargeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const generateCaptcha = () => {
    setCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
    setUserCaptcha("");
  };

  useEffect(() => { generateCaptcha(); }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/intern-incharge/check-auth", { withCredentials: true });
        if (res.status === 200 && res.data.user) navigate("/intern-incharge-dashboard");
      } catch {}
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userCaptcha !== captcha) {
      setError("Captcha verification failed. Please try again.");
      generateCaptcha(); return;
    }
    setLoading(true); setError(""); setSuccess("");
    try {
      const loginMeta = await buildLoginMeta();
      const res = await axios.post("/api/incharge/login", { ...formData, loginMeta }, {
        headers: { "Content-Type": "application/json" }, withCredentials: true,
      });
      if (res.status === 200) {
        const { user } = res.data;
        setSuccess("Login successful. Redirecting...");
        localStorage.setItem("internIncharge", JSON.stringify(user));
        setTimeout(() => navigate("/intern-incharge-dashboard"), 1000);
      }
    } catch (err) {
      if (err.response?.status === 401) setError("Invalid email or password.");
      else if (err.response?.status === 403) setError("Account is inactive. Contact administrator.");
      else setError(err.response?.data?.message || "Login failed. Please try again.");
      generateCaptcha();
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault(); setForgotPasswordLoading(true); setError("");
    try {
      const res = await axios.post("/api/incharge/forgot-password", { email: forgotPasswordEmail });
      if (res.status === 200) { setOtpSent(true); setCountdown(60); setSuccess("OTP sent to your email."); }
    } catch (err) { setError(err.response?.data?.message || "Failed to send OTP."); }
    finally { setForgotPasswordLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setForgotPasswordLoading(true); setError("");
    try {
      const res = await axios.post("/api/incharge/verify-otp", { email: forgotPasswordEmail, otp });
      if (res.status === 200) { setOtpVerified(true); setSuccess("OTP verified. Set your new password."); }
    } catch (err) { setError(err.response?.data?.message || "Invalid OTP."); }
    finally { setForgotPasswordLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    setForgotPasswordLoading(true); setError("");
    try {
      const res = await axios.post("/api/incharge/reset-password", { email: forgotPasswordEmail, otp, newPassword });
      if (res.status === 200) { setSuccess("Password reset! You can now log in."); setTimeout(resetForgotPasswordStates, 2000); }
    } catch (err) { setError(err.response?.data?.message || "Failed to reset password."); }
    finally { setForgotPasswordLoading(false); }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setForgotPasswordLoading(true);
    try {
      const res = await axios.post("/api/incharge/resend-otp", { email: forgotPasswordEmail });
      if (res.status === 200) { setCountdown(60); setSuccess("OTP resent."); }
    } catch (err) { setError(err.response?.data?.message || "Failed to resend OTP."); }
    finally { setForgotPasswordLoading(false); }
  };

  const resetForgotPasswordStates = () => {
    setShowForgotPassword(false); setForgotPasswordEmail(""); setOtp("");
    setNewPassword(""); setConfirmPassword(""); setOtpSent(false);
    setOtpVerified(false); setCountdown(0); setError(""); setSuccess("");
  };

  const inputCls = "w-full bg-white border border-purple-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition pr-11";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ebe8f5] p-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Outfit', 'Inter', sans-serif; }
      `}} />

      <motion.div
        className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex min-h-[600px]"
        style={{ boxShadow: '0 40px 100px rgba(100,60,180,0.18)' }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden md:flex md:w-[45%] relative flex-col justify-between overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #4c1d95, #5b21b6, #6d28d9)' }}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated blobs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="absolute w-80 h-80 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle at 50% 50%, #a78bfa, #6d28d9)' }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute w-72 h-72 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle at 40% 40%, #c4b5fd, #7c3aed)' }}
              animate={{ rotate: 360, scale: [1, 1.06, 1] }}
              transition={{ rotate: { duration: 22, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }} />
            <motion.div className="absolute w-60 h-60 rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle at 60% 35%, #ddd6fe, #8b5cf6)' }}
              animate={{ rotate: -360, scale: [1, 0.94, 1] }}
              transition={{ rotate: { duration: 16, repeat: Infinity, ease: "linear" }, scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }} />
            <motion.div className="absolute w-48 h-48 rounded-full opacity-55"
              style={{ background: 'radial-gradient(circle at 50% 55%, #ede9fe, #7c3aed)' }}
              animate={{ scale: [1, 1.1, 0.96, 1], rotate: [0, 20, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute w-36 h-36 rounded-full opacity-70"
              style={{ background: 'radial-gradient(circle at 45% 45%, #f5f3ff, #a78bfa)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.65, 0.85, 0.65] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
            {/* Graphura logo center */}
            <motion.div
              className="absolute w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 0 30px rgba(196,181,253,0.5)' }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85], boxShadow: ['0 0 20px rgba(196,181,253,0.4)', '0 0 40px rgba(196,181,253,0.8)', '0 0 20px rgba(196,181,253,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
              <img src={GraphuraLogo} alt="Graphura" className="w-12 h-12 object-contain rounded-full brightness-200 contrast-50" />
            </motion.div>
            {/* Floating orbs */}
            <motion.div className="absolute w-10 h-10 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #e9d5ff, transparent)', top: '18%', right: '18%' }}
              animate={{ y: [-8, 8, -8], x: [4, -4, 4], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute w-14 h-14 rounded-full opacity-25"
              style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)', bottom: '20%', left: '16%' }}
              animate={{ y: [6, -10, 6], x: [-5, 5, -5], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
          </div>

          {/* Top company name */}
          <motion.div className="relative z-10 p-8"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}>
            <p className="text-white font-bold text-base leading-none tracking-wide">GRAPHURA INDIA PRIVATE LIMITED</p>
            <p className="text-purple-300 text-[11px] font-medium mt-0.5">Graphura Internship Program</p>
          </motion.div>

          {/* Bottom branding */}
          <motion.div className="relative z-10 mt-auto p-8"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}>
            <h2 className="text-white font-semibold text-base leading-snug mb-5" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
              Manage your assigned<br />
              interns end-to-end with<br />
              <span className="text-purple-200">Graphura Portal</span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/" className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition backdrop-blur-sm block">Home</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login" className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition backdrop-blur-sm block">HR / Admin Login</Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="flex-1 bg-white flex flex-col justify-center px-8 sm:px-12 py-10"
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {!showForgotPassword ? (
              <motion.div key="login"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Intern Incharge Login</h3>
                  <p className="text-slate-400 text-sm">Access your intern management dashboard</p>
                </div>

                {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}
                {success && <div className="mb-5 px-4 py-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-semibold">✓ {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <div className="relative">
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="your@email.com" className={inputCls} required disabled={loading} />
                      <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.4 }}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="••••••••••" className={inputCls} required disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.4 }}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Security Code</label>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 border border-purple-100 bg-purple-50 rounded-xl py-2.5 px-4 text-center font-mono font-bold text-base tracking-[0.35em] text-purple-700 select-none">
                        {captcha}
                      </div>
                      <button type="button" onClick={generateCaptcha}
                        className="p-2.5 border border-purple-100 rounded-xl bg-purple-50 text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <input type="text" value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value.replace(/\D/g, ""))}
                      placeholder="Type the code above"
                      className={inputCls + " text-center font-mono tracking-widest"}
                      maxLength={4} required disabled={loading} />
                  </motion.div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setShowForgotPassword(true); setError(""); setSuccess(""); }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-semibold hover:underline transition">
                      Forgot Password?
                    </button>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-60 mt-1"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(109,40,217,0.35)' }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.54, duration: 0.4 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(109,40,217,0.55)' }}
                    whileTap={{ scale: 0.98 }}>
                    {loading ? "Logging in..." : "Login as Intern Incharge"}
                  </motion.button>

                </form>

                <p className="mt-6 text-center text-xs text-slate-400">
                  Don't have an account?{" "}
                  <Link to="/intern-incharge-register" className="text-purple-600 font-semibold hover:underline">Register here</Link>
                </p>
              </motion.div>

            ) : (
              <motion.div key="forgot"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>

                <button onClick={resetForgotPasswordStates}
                  className="text-xs text-purple-500 hover:text-purple-700 font-semibold mb-6 flex items-center gap-1 transition">
                  ← Back to Login
                </button>
                <div className="mb-7">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h3>
                  <p className="text-slate-400 text-sm">
                    {!otpSent ? "Enter your registered email to receive an OTP."
                      : !otpVerified ? "Enter the OTP sent to your email."
                      : "Create a new secure password."}
                  </p>
                </div>

                {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}
                {success && <div className="mb-5 px-4 py-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-semibold">✓ {success}</div>}

                {!otpSent && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Registered Email</label>
                      <div className="relative">
                        <input type="email" value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          placeholder="your@email.com" className={inputCls} required disabled={forgotPasswordLoading} />
                        <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                    <motion.button type="submit" disabled={forgotPasswordLoading}
                      className="w-full py-3.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(109,40,217,0.35)' }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {forgotPasswordLoading ? "Sending..." : "Send OTP"}
                    </motion.button>
                  </form>
                )}

                {otpSent && !otpVerified && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-600">One-Time Password</label>
                        <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || forgotPasswordLoading}
                          className="text-xs text-purple-600 font-semibold hover:underline disabled:opacity-50">
                          {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
                        </button>
                      </div>
                      <input type="text" value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="0  0  0  0  0  0" maxLength={6}
                        className={inputCls + " text-center font-mono text-lg tracking-widest"}
                        required disabled={forgotPasswordLoading} />
                    </div>
                    <motion.button type="submit" disabled={forgotPasswordLoading || otp.length !== 6}
                      className="w-full py-3.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(109,40,217,0.35)' }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {forgotPasswordLoading ? "Verifying..." : "Verify OTP"}
                    </motion.button>
                  </form>
                )}

                {otpVerified && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                      <div className="relative">
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters" className={inputCls} required minLength={6} disabled={forgotPasswordLoading} />
                        <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password" className={inputCls} required minLength={6} disabled={forgotPasswordLoading} />
                        <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                    <motion.button type="submit" disabled={forgotPasswordLoading}
                      className="w-full py-3.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {forgotPasswordLoading ? "Saving..." : "Save New Password"}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default InternInchargeLogin;