import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import graphura from '../../../public/Graphura.jpg';

const InternVerificationPortal = () => {
  const [formData, setFormData] = useState({
    uniqueId: '',
    joiningDate: '',
    email: '',
    captcha: ''
  });
  const [internData, setInternData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userIp, setUserIp] = useState("RECORDED");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        if (data && data.ip) {
          setUserIp(data.ip);
          return;
        }
      } catch (err) {
        console.warn("Primary IP fetch failed, trying fallback...", err);
      }

      // Fallback service
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data && data.ip) {
          setUserIp(data.ip);
        }
      } catch (err) {
        console.error("All IP fetch attempts failed:", err);
      }
    };
    fetchIp();
  }, []);

  const canvasRef = useRef(null);

  // Check if mobile and load premium Google Fonts
  useEffect(() => {
    // Dynamic loading of Outfit & Inter fonts for high-quality corporate typography
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      try {
        document.head.removeChild(link);
      } catch (e) {
        // Safe catch
      }
    };
  }, []);

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate random text (uppercase characters only to match input capitalization)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setCaptchaText(text);

    // Corporate blue/indigo linear gradient text for professional look
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#4f46e5');
    gradient.addColorStop(1, '#0284c7');

    // Adjust font size for mobile
    const fontSize = isMobile ? 24 : 28;
    ctx.font = `bold ${fontSize}px Courier New, monospace`;
    ctx.fillStyle = gradient;

    // Add text distortion
    for (let i = 0; i < text.length; i++) {
      const x = 12 + i * (isMobile ? 18 : 22);
      const y = (isMobile ? 26 : 32) + (Math.random() * 6 - 3);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 16 - 8) * Math.PI / 180);
      ctx.fillText(text.charAt(i), 0, 0);
      ctx.restore();
    }

    // Add visual lines/noise (clean, professional grey lines)
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(148, 163, 184, 0.4)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add subtle dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(148, 163, 184, 0.25)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.captcha.trim() !== captchaText) {
      setError('Invalid CAPTCHA code. Please check and try again.');
      setLoading(false);
      generateCaptcha();
      return;
    }

    try {
      const response = await axios.post('/api/intern/verify', formData);
      setInternData(response.data.responseData);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const speakCaptcha = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance();
      const characters = captchaText.split('');

      const spokenCharacters = characters.map(char => {
        if (/[a-z]/.test(char)) {
          return `small ${char}`;
        } else if (/[A-Z]/.test(char)) {
          return `capital ${char}`;
        } else if (/[0-9]/.test(char)) {
          return `${char}`;
        } else {
          return `symbol ${char}`;
        }
      });

      speech.text = `Verification code: ${spokenCharacters.join('... ')}`;
      speech.rate = 0.75;
      speech.pitch = 1.0;
      speech.volume = 1;

      setAudioEnabled(true);

      speech.onend = () => {
        setAudioEnabled(false);
      };

      speech.onerror = () => {
        setAudioEnabled(false);
        setError('Failed to play audio. Please use visual code.');
      };

      window.addEventListener('beforeunload', () => {
        window.speechSynthesis.cancel();
      });

      window.speechSynthesis.speak(speech);
    } else {
      setError('Audio CAPTCHA not supported in your browser.');
    }
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'captcha') {
      val = val.toUpperCase();
    }
    setFormData({
      ...formData,
      [e.target.name]: val
    });
  };

  const toggleRemarks = (monthIndex) => {
    setExpandedRemarks(prev => ({
      ...prev,
      [monthIndex]: !prev[monthIndex]
    }));
  };

  const formatDateToNumeric = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (err) {
      return 'N/A';
    }
  };

  const getOverallPerformance = (performance) => {
    if (!performance || !performance.monthlyPerformance) return 'Not Rated';

    const validMonths = performance.monthlyPerformance.filter(month => month.overallRating > 0);
    if (validMonths.length === 0) return 'Not Rated';

    const avgRating = validMonths.reduce((sum, month) => sum + month.overallRating, 0) / validMonths.length;

    if (avgRating >= 8.5) return 'Excellent';
    if (avgRating >= 7) return 'Good';
    if (avgRating >= 5) return 'Average';
    return 'Poor';
  };

  const printReport = () => {
    window.print();
  };

  useEffect(() => {
    generateCaptcha();
  }, [isMobile]);

  const monthlyPerformance = internData?.performance?.monthlyPerformance || [];
  const overallPerformance = getOverallPerformance(internData?.performance);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 antialiased" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background-color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            border: 4px double #0f172a !important;
            box-shadow: none !important;
            transform-origin: top left;
          }
          #print-area h1 {
            font-size: 14px !important;
            margin-bottom: 2px !important;
          }
          #print-area h4 {
            font-size: 10px !important;
            margin-bottom: 4px !important;
            padding-bottom: 2px !important;
          }
          #print-area p, #print-area span {
            font-size: 9px !important;
            line-height: 1.2 !important;
          }
          #print-area .overflow-x-auto {
            overflow: visible !important;
            width: 100% !important;
          }
          #print-area table {
            width: 100% !important;
            min-width: 100% !important;
            table-layout: auto !important;
            margin-top: 4px !important;
          }
          #print-area th, #print-area td {
            padding: 4px 2px !important;
            font-size: 7.5px !important;
            line-height: 1.1 !important;
          }
          #print-area .mt-8 {
            margin-top: 8px !important;
          }
          #print-area .mt-6 {
            margin-top: 6px !important;
          }
          #print-area .mt-4 {
            margin-top: 4px !important;
          }
          #print-area .pt-3 {
            padding-top: 2px !important;
          }
          #print-area .pb-6 {
            padding-bottom: 4px !important;
          }
          #print-area .gap-6 {
            gap: 8px !important;
          }
          #print-area .gap-4 {
            gap: 6px !important;
          }
          #print-area .p-4 {
            padding: 8px !important;
          }
          #print-area .p-8 {
            padding: 12px !important;
          }
          #print-area .space-y-8 > * + * {
            margin-top: 8px !important;
          }
          #print-area .space-y-4 > * + * {
            margin-top: 4px !important;
          }
          #print-area .space-y-2 > * + * {
            margin-top: 2px !important;
          }
          #print-area tr, #print-area .grid, #print-area section {
            page-break-inside: avoid !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @page {
          size: A4;
          margin: 6mm 8mm 6mm 8mm;
        }
      `}} />
      {/* 🇮🇳 National Tri-color Strip */}
      <div className="w-full h-1 bg-gradient-to-r from-[#ff9933] via-[#ffffff] to-[#128807] shadow-sm relative z-50"></div>

      {/* 🏛️ Bilingual Official Government Header - GRAPHURA GIP BRANDING */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center p-1.5 border border-slate-200 shadow-sm">
              <img src={graphura} alt="Graphura Crest" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="text-left border-l pl-4 border-slate-200">
              <h1 className="text-xs md:text-sm font-black tracking-wider uppercase text-slate-900 flex items-center space-x-2">
                <span>GRAPHURA INDIA PRIVATE LIMITED</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-650 font-bold uppercase tracking-wider">
                Graphura Internship Programme
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden lg:inline-block bg-[#e0f2fe] text-[#0369a1] text-[9px] font-black px-2.5 py-1 rounded border border-[#bae6fd] uppercase tracking-wider">
              ● Only For Active Interns
            </span>
            <div className="text-right text-[10px] text-slate-500 font-bold font-mono">
              IP ADDRESS: {userIp}
            </div>
          </div>
        </div>

        {/* 🧭 Official Navigation Bar */}
        <div className="bg-[#1e3a8a] text-white py-2 px-4 border-t border-blue-900 text-[11px] font-bold uppercase tracking-wider shadow-inner">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex space-x-4">
              <a href="https://internship.graphura.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 cursor-pointer transition-colors">Internship Website</a>
              <span className="text-blue-800">|</span>
              <a href="https://www.linkedin.com/showcase/internship-in-graphura-india-private-limited" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 cursor-pointer transition-colors">Internship Linkedin</a>
              <span className="text-blue-800">|</span>
              <a href="https://internship.graphura.in/term&conditions.html" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 cursor-pointer transition-colors">Guidelines</a>
              <span className="text-blue-800">|</span>
              <a href="https://internship.graphura.in/contact.html" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 cursor-pointer transition-colors">Helpdesk</a>
            </div>
            <div className="font-mono text-amber-300 text-[10.5px]">
              {currentTime.toLocaleDateString('en-GB')} {currentTime.toLocaleTimeString()} IST
            </div>
          </div>
        </div>
      </div>

      <div className={`${internData ? 'max-w-[96%] lg:max-w-[1350px]' : 'max-w-4xl'} mx-auto py-10 px-4 md:px-6 transition-all duration-300`}>

        {/* Verification Form Card - AUTHENTIC GOVERNMENT INTERNSHIP SCHEME (NGIS) */}
        {!internData && (
          <div className="bg-white rounded-xl border border-slate-250 shadow-xl overflow-hidden transition-all duration-300">

            {/* Elegant Corporate Header */}
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] text-white px-6 py-7 text-center relative border-b-4 border-[#ff9933]">
              <span className="inline-block bg-amber-500/25 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded border border-amber-500/30 mb-2.5">
                GRAPHURA INTERNSHIP PROGRAM (GIP-2026)
              </span>
              <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase font-serif">
                INTERN VERIFICATION SYSTEM
              </h2>
              <p className="text-xs text-slate-355 mt-1 max-w-xl mx-auto font-bold uppercase tracking-wider">
                OFFICIAL INTERN RECORDS • REPORTS • CERTIFICATE VERIFICATION
              </p>
            </div>

            <div className="p-6 md:p-10 space-y-6">

              {/* Bilingual Public Notice Banner */}
              <div className="bg-[#fef3c7]/65 border-l-4 border-[#ff9933] p-4 text-[#78350f] text-xs leading-relaxed flex items-start space-x-3.5 rounded">
                <svg className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1">
                  <p className="font-extrabold uppercase tracking-wider text-[11px] text-[#92400e]">
                    IMPORTANT INFORMATION
                  </p>
                  <p className="text-slate-750 font-semibold leading-relaxed">
                    This database is maintained for the verification of GIP interns record, internship reports, domain rating matrix and certification status. All verification requests and access activities are securely monitored and cryptographically tracked for security, compliance, and audit purposes.
                  </p>

                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Unique ID Field */}
                  <div className="space-y-1.5 group">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors group-focus-within:text-[#1e3a8a]">
                      1. Unique ID (GIP Registration ID) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1e3a8a]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="uniqueId"
                        value={formData.uniqueId}
                        onChange={handleChange}
                        maxLength="25"
                        required
                        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all font-mono text-sm"
                        placeholder="e.g. GRAPHURA/26/05/920"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                        {formData.uniqueId.length >= 8 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold shadow-sm">✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Joining Date Field */}
                  <div className="space-y-1.5 group">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors group-focus-within:text-[#1e3a8a]">
                      2. Joining Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1e3a8a]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Email Address Field */}
                  <div className="space-y-1.5 md:col-span-2 group">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors group-focus-within:text-[#1e3a8a]">
                      3. Registered Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1e3a8a]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all font-medium text-sm"
                        placeholder="yourname@domain.com"
                      />
                      <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2">
                        {formData.email && (
                          <span className={`text-xs font-bold ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? '✓ Valid' : '✗ Invalid'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CAPTCHA Verification */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      4. Security Verification Code (CAPTCHA) *
                    </label>
                    <div className="border border-slate-200 bg-slate-50/50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-inner">
                        <canvas
                          ref={canvasRef}
                          width="160"
                          height="44"
                          className="bg-white border border-slate-200 rounded shadow-sm"
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            type="button"
                            onClick={generateCaptcha}
                            className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-655 rounded transition-all shadow-sm"
                            title="Reload Code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={speakCaptcha}
                            disabled={audioEnabled}
                            className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-655 rounded transition-all shadow-sm disabled:opacity-40"
                            title="Speak Code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        name="captcha"
                        value={formData.captcha}
                        onChange={handleChange}
                        required
                        className="w-full py-3 px-4 bg-white border border-slate-300 rounded-lg text-center text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]/20 transition-all font-mono text-base uppercase tracking-widest font-bold"
                        placeholder="Type CAPTCHA"
                        style={{ letterSpacing: '0.25em' }}
                      />
                    </div>
                  </div>

                </div>

                {/* Error Box */}
                {error && (
                  <div className="bg-rose-50 border border-rose-250 text-rose-900 p-4 rounded-lg space-y-1 flex items-start space-x-3">
                    <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-[11px] uppercase tracking-wider text-rose-850">
                        सत्यापन असफल / Verification Failed
                      </p>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#1e3a8a] hover:bg-[#152c6f] text-white py-3 px-6 rounded-lg font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center space-x-2 border-0 shadow hover:shadow-md active:scale-[0.99] transform"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="animate-pulse">Verifying...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>VERIFY INTERN DETAILS</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ uniqueId: '', email: '', joiningDate: '', captcha: '' });
                      setError('');
                      generateCaptcha();
                    }}
                    className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-bold uppercase tracking-wider transition-all border border-slate-300 shadow-sm"
                  >
                    RESET DETAILS
                  </button>
                </div>


                <div className="text-center pt-4 border-t border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Transmissions are cryptographically signed. Technical Support Desk:{' '}
                    <a href="mailto:Hr@graphura.in" className="text-indigo-600 hover:text-indigo-750 hover:underline transition-colors">
                      Hr@graphura.in
                    </a>
                  </p>
                </div>

              </form>
            </div>
          </div>
        )}


        {internData && (
          <div className="space-y-8 animate-fadeIn">

            {/* Scorecard Control Actions */}
            <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Verification Details Generated Successfully
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => {
                    setInternData(null);
                    setError('');
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-350 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Verify Another Unique ID</span>
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      token: internData.attendanceToken
                    });
                    window.open(`/verify/attendance?${params.toString()}`, '_blank');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>View Daily Attendance</span>
                </button>
                <button
                  onClick={printReport}
                  className="px-4.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Internship Report</span>
                </button>
              </div>
            </div>

            {/* Official Government-Style Marksheet Document */}
            <div id="print-area" className="bg-white border-4 border-double border-slate-900 p-4 md:p-8 shadow-xl relative overflow-hidden">

              {/* National Emblem & Letterhead Mock Header */}
              <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
                <div className="flex justify-center mb-2">
                  {/* Formal Emblem Design */}
                  <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center p-1.5 bg-slate-50">
                    <img src={graphura} alt="Emblem" className="w-full h-full object-contain rounded-full" />
                  </div>
                </div>
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                  Graphura India Private Limited
                </h1>
                <p className="text-[10px] md:text-xs font-black text-slate-655 uppercase tracking-widest">
                  Graphura Internship Programme - 2026
                </p>
                <div className="inline-block bg-slate-900 text-white text-[10px] md:text-xs font-black px-4 py-1 uppercase tracking-widest rounded-sm">
                  Official Internship Performance & Evaluation Report
                </div>
                <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">
                  Verification Year: {new Date().getFullYear()} • Computer-Generated Report
                </p>
              </div>

              {/* Marksheet Bio / Roll Details Table */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  I. Intern Details
                </h3>
                <div className="border border-slate-900 overflow-x-auto">
                  <table className="w-full text-xs text-slate-800 border-collapse min-w-[650px]">
                    <tbody>
                      <tr className="border-b border-slate-900">
                        <td className="w-1/4 bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Intern ID / Unique ID</td>
                        <td className="w-1/4 p-2.5 font-black text-slate-900 border-r border-slate-900 font-mono text-[13px]">{internData.uniqueId}</td>
                        <td className="w-1/4 bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Enrollment</td>
                        <td className="w-1/4 p-2.5 font-semibold text-slate-900">Graphura Internship Programme</td>
                      </tr>
                      <tr className="border-b border-slate-900">
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Intern Full Name</td>
                        <td className="p-2.5 font-black text-slate-900 border-r border-slate-900 uppercase">{internData.fullName}</td>
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Domain / Department Name</td>
                        <td className="p-2.5 font-extrabold text-blue-800 border-slate-900 uppercase">{internData.domain}</td>
                      </tr>
                      <tr className="border-b border-slate-900">
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Registered Email ID</td>
                        <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-900">{internData.email}</td>
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Mobile Number</td>
                        <td className="p-2.5 font-semibold text-slate-900">{internData.mobile}</td>
                      </tr>
                      <tr className="border-b border-slate-900">
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Joining Date</td>
                        <td className="p-2.5 font-bold text-slate-900 border-r border-slate-900">{formatDateToNumeric(internData.joiningDate)}</td>
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">Internship Duration</td>
                        <td className="p-2.5 font-extrabold text-slate-900 uppercase">{internData.duration || '6 Months'}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2.5 font-bold border-r border-slate-900 uppercase">University / College / Institute Name</td>
                        <td colSpan="3" className="p-2.5 font-bold text-slate-900" title={internData.college}>{internData.college}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Milestone Subject Wise Scores Table */}
              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  II. Intern Tasks & Professional Competency Evaluation
                </h3>
                <div className="border border-slate-900 overflow-x-auto">
                  <table className="w-full text-xs text-slate-800 border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                        <th className="py-2.5 px-2 border-r border-slate-900 w-12">S.No.</th>
                        <th className="py-2.5 px-2 border-r border-slate-900 text-left">Evaluation Period / Month</th>
                        <th className="py-2.5 px-2 border-r border-slate-900">Tasks Completed</th>
                        <th className="py-2.5 px-2 border-r border-slate-900">Completion %</th>
                        <th className="py-2.5 px-2 border-r border-slate-900">Initiative Grade (Max 10)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900">Communication (Max 10)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900">Behavioral Index (Max 10)</th>
                        <th className="py-2.5 px-2 border-r border-slate-900">Obtained Score (Out of 10)</th>
                        <th className="py-2.5 px-2">Milestone Standing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPerformance.length > 0 ? (
                        monthlyPerformance.map((month, index) => {
                          const hasScore = month.overallRating !== undefined && month.overallRating !== null && month.overallRating !== "" && month.overallRating !== 0;
                          const isPass = hasScore && (month.overallRating >= 5);
                          return (
                            <tr key={index} className="border-b border-slate-900 text-center hover:bg-slate-50/50">
                              <td className="py-2.5 border-r border-slate-900 font-bold font-mono">{index + 1}</td>
                              <td className="py-2.5 px-2 border-r border-slate-900 text-left font-bold uppercase">{month.monthLabel || `Milestone ${index + 1}`}</td>
                              <td className="py-2.5 border-r border-slate-900 font-semibold font-mono">{month.tasksCompleted || 0} / {month.totalTasks || 0}</td>
                              <td className="py-2.5 border-r border-slate-900 font-bold font-mono">{month.completionPercentage || 0}%</td>
                              <td className="py-2.5 border-r border-slate-900 font-semibold font-mono">{month.ratings?.initiative || 0}</td>
                              <td className="py-2.5 border-r border-slate-900 font-semibold font-mono">{month.ratings?.communication || 0}</td>
                              <td className="py-2.5 border-r border-slate-900 font-semibold font-mono">{month.ratings?.behaviour || 0}</td>
                              <td className="py-2.5 border-r border-slate-900 font-black text-slate-900 font-mono bg-slate-50">{hasScore ? month.overallRating : "—"}</td>
                              <td className="py-2.5">
                                {hasScore ? (
                                  <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-sm ${isPass
                                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-300'
                                    : 'text-rose-700 bg-rose-50 border border-rose-300'
                                    }`}>
                                    {isPass ? 'PASS' : 'FAIL'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold font-mono">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="9" className="py-6 text-center text-slate-550 italic font-bold">
                            No milestone grades registered for this candidate Roll Number.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance and Minimum Threshold Validation Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="border border-slate-900 p-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-2 mb-3">
                    III. Engagement & Attendance Summary
                  </h4>
                  <table className="w-full text-xs text-slate-800">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-2 text-slate-600 font-bold uppercase">Total Meetings Scheduled</td>
                        <td className="py-2 text-right font-black font-mono text-slate-955">{internData.totalMeetings || 0}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2 text-slate-600 font-bold uppercase">Total Meetings Attended</td>
                        <td className="py-2 text-right font-black font-mono text-emerald-700">{internData.meetingsAttended || 0}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2 text-slate-600 font-bold uppercase">Leaves Availed</td>
                        <td className="py-2 text-right font-black font-mono text-amber-700">{internData.leavesTaken || 0}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-2 text-slate-600 font-bold uppercase">Minimum Attendance Passing Limit</td>
                        <td className="py-2 text-right font-bold font-mono text-slate-700">75.0%</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-600 font-black uppercase">Attendance Rate Obtained</td>
                        <td className="py-2 text-right font-black font-mono text-[13px] text-blue-800">
                          {internData.totalMeetings > 0
                            ? ((internData.meetingsAttended / internData.totalMeetings) * 100).toFixed(1) + "%"
                            : "100.0%"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-slate-900 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-2 mb-3">
                      IV. Cumulative Performance & Graduation Verdict
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-bold uppercase">Cumulative Performance Rating:</span>
                        <span className="font-black text-slate-900 font-mono">
                          {(monthlyPerformance.reduce((acc, curr) => acc + (curr.overallRating || 0), 0) / Math.max(monthlyPerformance.length, 1)).toFixed(2)} / 10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-bold uppercase">Overall Performance Grade:</span>
                        <span className="font-black text-blue-850 uppercase">{overallPerformance || 'EXCELLENT'}</span>
                      </div>
                      {internData.certificateNumber && (
                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
                          <span className="text-slate-600 font-bold uppercase">Certificate Number:</span>
                          <span className="font-black text-slate-900 font-mono select-all bg-slate-50 px-1.5 py-0.5 border border-slate-200 rounded">
                            {internData.certificateNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Internship Status:</span>
                    <span className={`inline-block border-2 font-black text-xs uppercase px-3.5 py-1 tracking-wider ${internData.status === 'Completed' || internData.status === 'Active'
                      ? internData.certificateStatus === 'issued' || internData.certificateNumber
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-amber-600 bg-amber-600 text-white'
                      : internData.status === 'Terminated'
                        ? 'border-red-700 bg-red-750 text-white'
                        : 'border-slate-900 bg-slate-900 text-white'
                      }`}>
                      {internData.status === 'Completed' || internData.status === 'Active'
                        ? internData.certificateStatus === 'issued' || internData.certificateNumber
                          ? 'CERTIFIED'
                          : 'IN PROCESS'
                        : internData.status === 'Terminated'
                          ? 'TERMINATED'
                          : 'DISQUALIFIED'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Certificate Verification and Issued Seal Section */}
              {internData.certificateStatus === 'issued' && (
                <div className="mt-8 border-2 border-slate-900 p-4 bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 text-blue-850">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          V. Internship Completion Verification Seal
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        This validates that the intern has successfully fulfilled all professional benchmarks. The original
                        Certificate of Internship has been registered securely on the central database server ledger.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="bg-white p-2.5 border border-slate-900">
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Registry Certificate ID</span>
                          <span className="text-xs font-extrabold text-slate-800 font-mono mt-0.5 block">{internData.certificateNumber}</span>
                        </div>
                        <div className="bg-white p-2.5 border border-slate-900">
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Date of Digital Release</span>
                          <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{formatDateToNumeric(internData.certificateIssuedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Official Stamp Box with digital sign simulator */}
                    <div className="border border-slate-900 bg-white p-4 text-center min-w-[210px] self-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border border-slate-850 flex items-center justify-center p-2 mb-2 relative overflow-hidden bg-slate-50/50">
                        {/* Circular Text Emulator Stamp */}
                        <div className="absolute inset-0 border border-indigo-700/20 rounded-full animate-pulse"></div>
                        <svg className="w-8 h-8 text-indigo-700/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="w-full border-t border-slate-900 pt-1.5 mt-1.5">
                        <span className="text-[10px] font-black text-slate-800 uppercase block tracking-wider">Controller of Internship Operations</span>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">GRAPHURA REGISTRY SYSTEMS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimers & Rules Section */}
              <div className="mt-8 border-t border-slate-900 pt-4 space-y-2 text-[9px] md:text-[10px] text-slate-600 leading-relaxed font-medium">
                <p className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Important Internship Disclaimers:
                </p>
                <p>
                  1. <span className="font-bold">Authenticity of Report:</span> This online internship report serves as an official Statement of Performance generated directly from the secured system ledger of the Graphura Internship Program (GIP-2026). Recruiters, institutions, and verification authorities are advised to validate this credential against the official digital verification signature.
                </p>
                <p>
                  2. <span className="font-bold">Passing Standards:</span> A minimum attendance threshold of 75.0% and a minimum cumulative performance score of 5.0 out of 10.0 are mandatory for a candidate to qualify for final internship completion and certificate clearance.
                </p>
                <p>
                  3. <span className="font-bold">Cryptographic Registry Validation:</span> The unique database authenticity signature block displayed within this report confirms that the internship record has been digitally validated and that no unauthorized manual database tampering has been detected.
                </p>
              </div>

              {/* Digital Mock Barcode representation */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex space-x-[1px] h-6 items-center bg-white px-2 py-0.5 border border-slate-300">
                    {/* Visual Barcode bars representation */}
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                    <div className="w-[2px] h-4 bg-slate-950"></div>
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                    <div className="w-[3px] h-4 bg-slate-950"></div>
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                    <div className="w-[2px] h-4 bg-slate-950"></div>
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                    <div className="w-[4px] h-4 bg-slate-950"></div>
                    <div className="w-[2px] h-4 bg-slate-950"></div>
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                    <div className="w-[3px] h-4 bg-slate-950"></div>
                    <div className="w-[1px] h-4 bg-slate-950"></div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    GIP SECURE INTERNSHIP ID: {internData.uniqueId.replace(/\//g, '')}
                  </span>
                </div>

                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-mono">
                  VERIFICATION DATE: {new Date().toLocaleString()}
                </span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default InternVerificationPortal;