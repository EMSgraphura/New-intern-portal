import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Mail } from "lucide-react";
import { motion } from "framer-motion";
import GraphuraLogo from "/GraphuraLogo.jpg";
import { buildLoginMeta } from "../../utils/loginMeta";

const ReviewTeamLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get("/api/review-team/me", { withCredentials: true });
        if (res.data.member) navigate("/review-team-dashboard");
      } catch { }
    };
    checkLogin();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const loginMeta = await buildLoginMeta();
      const res = await axios.post("/api/review-team/login", { ...formData, loginMeta }, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        localStorage.setItem("reviewTeamToken", res.data.token);
        localStorage.setItem("reviewTeamMember", JSON.stringify(res.data.member));
        setSuccess("Login successful. Redirecting...");
        setTimeout(() => navigate("/review-team/dashboard"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full bg-white border border-purple-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition pr-11";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ebe8f5] p-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'); *{font-family:'Outfit','Inter',sans-serif;}` }} />

      <motion.div
        className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex min-h-[580px]"
        style={{ boxShadow: '0 40px 100px rgba(100,60,180,0.18)' }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden md:flex md:w-[45%] relative flex-col justify-between overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #4c1d95, #5b21b6, #6d28d9)' }}
          initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
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
            <motion.div className="absolute w-20 h-20 rounded-full flex items-center justify-center"
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
            transition={{ delay: 0.4, duration: 0.5 }}>
            <p className="text-white font-bold text-base leading-none tracking-wide">GRAPHURA INDIA PRIVATE LIMITED</p>
            <p className="text-purple-300 text-[11px] font-medium mt-0.5">Graphura Internship Program</p>
          </motion.div>

          {/* Bottom branding */}
          <motion.div className="relative z-10 mt-auto p-8"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}>
            <h2 className="text-white font-semibold text-base leading-snug mb-5" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
              Review intern feedback<br />
              and manage evaluations<br />
              <span className="text-purple-200">on Graphura Portal</span>
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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-1">Review Team Login</h3>
              <p className="text-slate-400 text-sm">Access your intern feedback dashboard</p>
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

              <motion.button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(109,40,217,0.35)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.4 }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(109,40,217,0.55)' }}
                whileTap={{ scale: 0.98 }}>
                {loading ? "Signing in..." : "Log In as Review Team Member"}
              </motion.button>

            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Don't have an account?{" "}
              <Link to="/intern-incharge-register" className="text-purple-600 font-semibold hover:underline">Register here</Link>
            </p>
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ReviewTeamLogin;