// InternshipForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Graphura from "../../../public/Graphura.jpg"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { FingerprintProvider, useVisitorData } from '@fingerprint/react';
import { ShieldCheck, CheckCircle, Check, ArrowRight, ArrowLeft, Send, AlertCircle, Instagram, Linkedin, Globe } from "lucide-react";


// Verhoeff algorithm arrays for Aadhar validation
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

function isValidAadhar(aadhar) {
  if (!/^\d{12}$/.test(aadhar)) return false;
  if (/^(\d)\1{11}$/.test(aadhar)) return false; // reject all same digits

  let c = 0;
  const reversedArray = aadhar.split('').map(Number).reverse();

  for (let i = 0; i < reversedArray.length; i++) {
    c = d[c][p[i % 8][reversedArray[i]]];
  }
  return c === 0;
}

const maskAadhar = (aadhar) => {
  if (!aadhar) return "";
  return aadhar.replace(/.(?=.{4})/g, "*");
};

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    dob: "",
    gender: "",
    apaarId: "",
    aadharNumber: "",
    currentAddress: "",
    currentState: "",
    currentCity: "",
    currentPinCode: "",
    permanentAddress: "",
    permanentState: "",
    permanentCity: "",
    permanentPinCode: "",
    latitude: null,
    longitude: null,
    ipAddress: "",
    college: "",
    course: "",
    TpoName: "",
    TpoEmail: "",
    TpoNumber: "",
    educationLevel: "",
    domain: "",
    contactMethod: "",
    resumeFile: null,
    duration: "",
    prevInternship: "",
    prevInternshipDesc: "",
    alternateMobile: "",
    parentName: "",
    parentNumber: "",
    parentEmail: "",
    parentAltNumber: "",
    declaration: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showResumeMsg, setShowResumeMsg] = useState(false);
  const [step, setStep] = useState(1);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isAadharFocused, setIsAadharFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [academicSupportType, setAcademicSupportType] = useState("");

  useEffect(() => {
    // SEO Meta Tags
    document.title = "Graphura | Internship Application Portal";

    // Inject Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Join Graphura's professional internship program. Apply for roles in Sales, Marketing, AI, MERN Stack, and more. Kickstart your career with industry experts.");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "Join Graphura's professional internship program. Apply for roles in Sales, Marketing, AI, MERN Stack, and more. Kickstart your career with industry experts.";
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      metaKeywords.content = "Internship, Graphura, Career, MERN Stack, AI Intelligence, Sales & Marketing, Professional Training";
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
  }, []);

  const { data: fingerprintData } = useVisitorData();

  const getLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, latitude, longitude }));

          try {
            // Fetch REAL IPv4 Address with fallback
            let ip = "";
            try {
              const ipRes = await fetch("https://api4.ipify.org?format=json");
              const ipData = await ipRes.json();
              ip = ipData.ip;
            } catch (e1) {
              try {
                const ipRes = await fetch("https://ipapi.co/json/");
                const ipData = await ipRes.json();
                ip = ipData.ip;
              } catch (e2) {
                console.error("All IP services failed");
              }
            }

            // Fetch Address Details
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();

            if (data.address) {
              setFormData(prev => ({
                ...prev,
                ipAddress: ip || "Detection Failed",
                currentState: data.address.state || "",
                currentCity: data.address.city || data.address.town || data.address.village || "",
                currentPinCode: data.address.postcode || "",
              }));
            }
          } catch (err) {
            console.error("Geocoding error:", err);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
        }
      );
    }
  };

  useEffect(() => {
    if (step === 3 && !formData.latitude) {
      getLocation();
    }
  }, [step]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, success]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      // Phone number validation: numbers only and max 10 digits
      if (name.toLowerCase().includes("mobile") || name.toLowerCase().includes("number")) {
        // Exempt Aadhar if needed, but the user specifically asked for "Phone number वाले coulm"
        // Let's specifically target phone fields
        const phoneFields = ["mobile", "alternateMobile", "parentNumber", "parentAltNumber", "TpoNumber"];
        if (phoneFields.includes(name)) {
          const onlyNums = value.replace(/\D/g, "");
          if (onlyNums.length <= 10) {
            setFormData({ ...formData, [name]: onlyNums });
          }
          return;
        }
      }
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    axios.get("/api/application-status").then((res) => {
      setIsOpen(res.data.isApplicationOpen);
      setLoading(false);
    });
  }, []);

  const validateStep = (currentStep) => {
    const newErrors = {};
    let requiredFields = [];

    if (currentStep === 1) {
      if (!isGoogleAuthenticated) {
        newErrors.googleAuth = "Please verify your email via Google first.";
      }
    } else if (currentStep === 2) {
      requiredFields = ["fullName", "mobile", "dob", "gender", "aadharNumber"];
      if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
        newErrors.mobile = "Mobile number must be 10 digits.";
      }
      if (formData.aadharNumber && !isValidAadhar(formData.aadharNumber)) {
        newErrors.aadharNumber = "Invalid Aadhar Number (verification failed).";
      }
      if (formData.dob) {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dob = "Minimum age required is 18 years.";
        }
      }
    } else if (currentStep === 3) {
      requiredFields = ["currentAddress", "currentState", "currentCity", "currentPinCode", "permanentAddress", "permanentState", "permanentCity", "permanentPinCode"];
    } else if (currentStep === 4) {
      requiredFields = ["college", "course", "educationLevel"];

      if (!academicSupportType) {
        newErrors.academicSupport = "Please select either TPO or Parent details.";
      } else if (academicSupportType === "TPO") {
        if (!formData.TpoName?.trim()) newErrors.TpoName = "Required.";
        if (!formData.TpoEmail?.trim()) newErrors.TpoEmail = "Required.";
        if (!formData.TpoNumber?.trim()) newErrors.TpoNumber = "Required.";
      } else if (academicSupportType === "Parent") {
        if (!formData.parentName?.trim()) newErrors.parentName = "Required.";
        if (!formData.parentNumber?.trim()) newErrors.parentNumber = "Required.";
        if (!formData.parentEmail?.trim()) newErrors.parentEmail = "Required.";

        if (formData.parentNumber && !/^\d{10}$/.test(formData.parentNumber)) {
          newErrors.parentNumber = "Must be 10 digits.";
        }
        if (formData.parentAltNumber && !/^\d{10}$/.test(formData.parentAltNumber)) {
          newErrors.parentAltNumber = "Must be 10 digits.";
        }
      }

      if (formData.apaarId && !/^\d{12}$/.test(formData.apaarId)) {
        newErrors.apaarId = "APAAR ID must be 12 digits.";
      }
    } else if (currentStep === 5) {
      requiredFields = ["domain", "contactMethod", "resumeFile", "duration", "prevInternship"];
      if (formData.prevInternship === "Yes" && !formData.prevInternshipDesc?.trim()) {
        newErrors.prevInternshipDesc = "Experience description required.";
      }
      if (!formData.declaration) {
        newErrors.declaration = "You must accept the declaration to proceed.";
      }
    }



    requiredFields.forEach((field) => {
      if (field === "resumeFile") {
        if (!formData.resumeFile) {
          newErrors.resumeFile = "Required.";
        }
      } else if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        newErrors[field] = "Required.";
      }
    });

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setError("Please fix the highlighted errors.");
      return false;
    }
    return true;
  };

  const FieldError = ({ name }) => {
    if (!formErrors[name]) return null;
    return <p className="text-[10px] text-red-400 mt-1 animate-fade-in flex items-center gap-1 font-bold"><AlertCircle size={10} /> {formErrors[name]}</p>;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateStep(5)) {
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formPayload.append(key, formData[key]);
        }
      });

      // Append fingerprint requestId if available
      if (fingerprintData?.requestId) {
        formPayload.append('fingerprintRequestId', fingerprintData.requestId);
      }

      const response = await axios.post('/api/createIntern', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      setSuccess("Application submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit application. Please try again.";
      setError(errorMessage);
      if (errorMessage === "Application already applied") {
        alert("Error: Application already applied");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 font-['Inter']">
        <div className="max-w-4xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col md:flex-row">
          {/* Left Side: Summary & Process */}
          <div className="md:w-1/3 bg-blue-600/10 p-10 border-r border-white/10">
            <div className="flex flex-col h-full">
              <div className="mb-10">
                <img src={Graphura} alt="Graphura" className="h-12 w-12 rounded-lg mb-4" />
                <h2 className="text-xl font-bold text-white font-['Outfit']">Application Summary</h2>
              </div>

              <div className="space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-blue-500/20"></div>

                {[
                  { label: "Application Received", sub: "Done", icon: CheckCircle, active: true },
                  { label: "Profile Review", sub: "In Progress", icon: Globe, active: false },
                  { label: "Interview Round", sub: "Pending", icon: Globe, active: false },
                  { label: "Final Selection", sub: "Pending", icon: Globe, active: false }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-gray-500'}`}>
                      {item.active ? <Check size={14} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${item.active ? 'text-white' : 'text-gray-500'}`}>{item.label}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400/60 font-bold">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-bold">Applied for</p>
                  <p className="text-blue-300 font-bold text-lg">{formData.domain || "Internship Program"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Main Message */}
          <div className="md:w-2/3 p-10 sm:p-14 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <ShieldCheck size={14} />
              Submission Successful
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-[1.05] font-['Outfit'] tracking-tight">
              Thank you for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">applying!</span>
            </h1>

            <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-10">
              <p>
                We’ve received your internship application and our HR team will review your details.
                You can expect to hear back from us within the next <span className="text-white font-bold underline decoration-blue-500 decoration-2 underline-offset-4">7 working days</span>.
              </p>
              <p className="text-sm tracking-wide opacity-80">
                In the meantime, feel free to connect with us on social media or explore more about us on our website.
              </p>
            </div>

            <div className="flex flex-wrap gap-5 mb-12">
              {[
                { icon: Instagram, label: "Instagram", url: "https://instagram.com/graphura.in", color: "hover:bg-pink-600 hover:shadow-pink-500/20", textColor: "hover:text-white" },
                { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/company/graphura-india-private-limited", color: "hover:bg-blue-700 hover:shadow-blue-600/20", textColor: "hover:text-white" },
                { icon: Globe, label: "Website", url: "https://graphura.in", color: "hover:bg-teal-600 hover:shadow-teal-500/20", textColor: "hover:text-white" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 transition-all duration-300 shadow-lg ${social.color} ${social.textColor} hover:-translate-y-1`}
                >
                  <social.icon size={20} />
                  <span className="text-sm font-bold">{social.label}</span>
                </a>
              ))}
            </div>

            <button
              onClick={() => window.location.href = "https://internship.graphura.in"}
              className="w-full sm:w-auto relative group inline-flex items-center justify-center px-12 py-4 font-black text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl hover:from-blue-500 hover:to-blue-700 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative uppercase tracking-[0.2em] text-xs">Back to Home</span>
              <ArrowRight size={18} className="relative ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-blue-900 text-center p-8">
        <img src={Graphura} alt="Graphura Logo" className="h-24 w-24 mb-6 rounded-full shadow-lg" />
        <h1 className="text-4xl font-bold text-blue-300 mb-4">Applications Closed</h1>
        <p className="text-gray-300 sm:text-lg text-sm sm:max-w-2xl w-full">
          Thank you for your interest! The internship application form is currently closed.
          <br />
          <span className="sm:text-sm text-s">We encourage you to apply in our next batch.</span>
        </p>

        <p className="text-gray-400 mt-2 text-sm">
          Please check back later or contact us at{" "}
          <a href="mailto:hr@graphura.in" className="text-blue-400 underline">
            hr@graphura.in
          </a>
        </p>
      </div>
    );
  }
  else {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-blue-900 sm:p-6 p-2">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-5xl bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl sm:p-8 p-4 space-y-8 border-t-8 border-blue-800"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src={Graphura}
                alt="Graphura Logo"
                className="h-18 w-auto rounded-full shadow-lg"

              />
            </div>

            {/* Title and Subtitle */}
            <div className="text-center space-y-2">
              <h1 className="sm:text-4xl text-2xl font-bold bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Application Form - Graphura
              </h1>
              <p className="text-gray-300 sm:text-sm text-xs leading-relaxed">
                Join our team - Fill out all required fields to submit your application. For more details: <a href="mailto:hr@graphura.in" className="underline text-blue-200 hover:text-blue-300 transition-colors">hr@graphura.in</a>, +91 7378021327
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 px-2 sm:px-10">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-5 transform -translate-y-1/2 w-full h-1 bg-gray-700 -z-10 rounded-full"></div>
                <div className="absolute left-0 top-5 transform -translate-y-1/2 h-1 bg-blue-500 -z-10 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                {[
                  { num: 1, label: "Identity Verification" },
                  { num: 2, label: "Personal Details" },
                  { num: 3, label: "Address" },
                  { num: 4, label: "Academic Details" },
                  { num: 5, label: "Internship Details" }
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-lg transition-all duration-300 ${step >= s.num ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
                      {step > s.num ? <Check size={16} /> : s.num}
                    </div>
                    <span className={`text-[8px] sm:text-xs mt-2 font-bold text-center leading-tight ${step >= s.num ? 'text-blue-300' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {step === 1 && (
              <fieldset className="border border-white/30 p-8 rounded-xl bg-white/5 animate-fade-in text-center space-y-6">
                <legend className="text-xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-2 px-2">
                  Step 1: Verification & Compliance
                </legend>
                <div className="py-10 space-y-4">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4 border border-blue-500/30">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Security First</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">Please authenticate with your Google account to ensure a secure and authenticated application submission.</p>

                  <div className="flex justify-center pt-6">
                    {!isGoogleAuthenticated ? (
                      <div className="transform hover:scale-105 transition-transform">
                        <GoogleLogin
                          onSuccess={credentialResponse => {
                            const decoded = jwtDecode(credentialResponse.credential);
                            setIsGoogleAuthenticated(true);
                            setFormData(prev => ({
                              ...prev,
                              email: decoded.email,
                              fullName: decoded.name
                            }));
                            setError("");
                            setStep(2); // Auto-advance to next step
                          }}
                          onError={() => setError("Google Login Failed")}
                          useOneTap
                          theme="filled_blue"
                          shape="pill"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 px-8 py-4 rounded-2xl text-green-400 font-bold shadow-lg shadow-green-500/10">
                          <CheckCircle size={28} />
                          <span className="text-lg">Authenticated: {formData.email}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">You can now proceed to the next step.</p>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="border border-white/30 p-6 rounded-xl bg-white/5 animate-fade-in">
                <legend className="text-xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-2 px-2">
                  Step 2: Personal Details
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-blue-400">Verified Email Address</label>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 w-full flex items-center gap-2">
                      <CheckCircle size={16} />
                      {formData.email}
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-white">Full Name <span className="text-red-500">*</span></label>
                    <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.fullName ? 'border-red-500' : 'border-white/30'} text-white w-full`} required placeholder="Enter your full name" />
                    <FieldError name="fullName" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-white">Verified Email Address</label>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
                      <CheckCircle size={18} className="text-blue-400" />
                      <span className="font-medium">{formData.email}</span>
                      <span className="ml-auto text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">Verified</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="mobile" className="block text-sm font-medium text-white">Mobile Number <span className="text-red-500">*</span></label>
                    <input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.mobile ? 'border-red-500' : 'border-white/30'} text-white w-full`} required placeholder="10-digit number" />
                    <FieldError name="mobile" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="alternateMobile" className="block text-sm font-medium text-white">Alternate Mobile Number</label>
                    <input id="alternateMobile" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.alternateMobile ? 'border-red-500' : 'border-white/30'} text-white w-full`} placeholder="Optional" />
                    <FieldError name="alternateMobile" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="dob" className="block text-sm font-medium text-white">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                      className={`p-3 rounded-xl bg-white/10 border ${formErrors.dob ? 'border-red-500' : 'border-white/30'} text-white w-full`}
                      required
                    />
                    <FieldError name="dob" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gender" className="block text-sm font-medium text-white">Gender <span className="text-red-500">*</span></label>
                    <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.gender ? 'border-red-500' : 'border-white/30'} text-white w-full`} required>
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <FieldError name="gender" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="aadharNumber" className="block text-sm font-medium text-white">Aadhaar Number <span className="text-red-500">*</span></label>
                    <input id="aadharNumber" name="aadharNumber" value={isAadharFocused ? formData.aadharNumber : maskAadhar(formData.aadharNumber)} onFocus={() => setIsAadharFocused(true)} onBlur={() => setIsAadharFocused(false)} onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })} className={`p-3 rounded-xl bg-white/10 border ${formErrors.aadharNumber ? 'border-red-500' : 'border-white/30'} text-white w-full font-mono tracking-widest text-lg`} required placeholder="12-digit number" />
                    <FieldError name="aadharNumber" />
                  </div>
                </div>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="border border-white/30 p-6 rounded-xl bg-white/5 animate-fade-in">
                <legend className="text-xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-2 px-2">
                  Step 3: Address Details
                </legend>

                <div className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-blue-300 font-medium mb-4 flex items-center gap-2">
                      📍 Current Location Details
                      {isLocating && <span className="text-xs text-gray-400 animate-pulse">(Detecting...)</span>}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="currentAddress" className="block text-sm font-medium text-white">Full Address <span className="text-red-500">*</span></label>
                        <input id="currentAddress" name="currentAddress" value={formData.currentAddress} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.currentAddress ? 'border-red-500' : 'border-white/30'} text-white w-full`} required placeholder="House no, Street, Area" />
                        <FieldError name="currentAddress" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-white">State (Auto) <span className="text-red-500">*</span></label>
                        <input value={formData.currentState} readOnly className={`p-3 rounded-xl bg-white/5 border ${formErrors.currentState ? 'border-red-500' : 'border-white/20'} text-gray-400 w-full cursor-not-allowed`} placeholder="Detecting..." />
                        <FieldError name="currentState" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-white">Pin Code (Auto) <span className="text-red-500">*</span></label>
                        <input value={formData.currentPinCode} readOnly className={`p-3 rounded-xl bg-white/5 border ${formErrors.currentPinCode ? 'border-red-500' : 'border-white/20'} text-gray-400 w-full cursor-not-allowed`} placeholder="Detecting..." />
                        <FieldError name="currentPinCode" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-white">City (Auto) <span className="text-red-500">*</span></label>
                        <input value={formData.currentCity} readOnly className={`p-3 rounded-xl bg-white/5 border ${formErrors.currentCity ? 'border-red-500' : 'border-white/20'} text-gray-400 w-full cursor-not-allowed`} placeholder="Detecting..." />
                        <FieldError name="currentCity" />
                      </div>
                      <div className="sm:col-span-2 grid grid-cols-3 gap-2 mt-2">
                        <div className="p-2 rounded-lg bg-black/40 text-[10px] text-blue-400 font-mono text-center border border-blue-500/10">Lat: {formData.latitude || '---'}</div>
                        <div className="p-2 rounded-lg bg-black/40 text-[10px] text-blue-400 font-mono text-center border border-blue-500/10">Lon: {formData.longitude || '---'}</div>
                        <div className="p-2 rounded-lg bg-black/40 text-[10px] text-blue-400 font-mono text-center border border-blue-500/10">IP: {formData.ipAddress || '---'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-blue-300 font-medium">🏠 Permanent Address</h3>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, permanentAddress: prev.currentAddress, permanentState: prev.currentState, permanentCity: prev.currentCity, permanentPinCode: prev.currentPinCode }))} className="text-xs text-blue-400 hover:underline px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">Same as current</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-white">Full Address <span className="text-red-500">*</span></label>
                        <input name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.permanentAddress ? 'border-red-500' : 'border-white/30'} text-white w-full`} required />
                        <FieldError name="permanentAddress" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-white">State <span className="text-red-500">*</span></label>
                        <input name="permanentState" value={formData.permanentState} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.permanentState ? 'border-red-500' : 'border-white/30'} text-white w-full`} required />
                        <FieldError name="permanentState" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-white">Pin Code <span className="text-red-500">*</span></label>
                        <input name="permanentPinCode" value={formData.permanentPinCode} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.permanentPinCode ? 'border-red-500' : 'border-white/30'} text-white w-full`} required />
                        <FieldError name="permanentPinCode" />
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {step === 4 && (
              <fieldset className="border border-white/30 p-6 rounded-xl bg-white/5 animate-fade-in">
                <legend className="text-xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-2 px-2">
                  Step 4: Educational Details
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-white">College/University <span className="text-red-500">*</span></label>
                    <input name="college" value={formData.college} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.college ? 'border-red-500' : 'border-white/30'} text-white w-full`} required />
                    <FieldError name="college" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white">Course Name <span className="text-red-500">*</span></label>
                    <input name="course" value={formData.course} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.course ? 'border-red-500' : 'border-white/30'} text-white w-full`} required />
                    <FieldError name="course" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white">Education Level <span className="text-red-500">*</span></label>
                    <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.educationLevel ? 'border-red-500' : 'border-white/30'} text-white w-full`} required>
                      <option value="">Select Level</option>
                      <option>Undergraduate</option>
                      <option>Postgraduate</option>
                      <option>Intermediate</option>
                      <option>Diploma</option>
                    </select>
                    <FieldError name="educationLevel" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-white">APAAR ID <span className="text-gray-400 text-xs ml-1">(Optional)</span></label>
                    <input name="apaarId" value={formData.apaarId} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.apaarId ? 'border-red-500' : 'border-white/30'} text-white w-full font-mono`} placeholder="12-digit number" />
                    <FieldError name="apaarId" />
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10">
                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-4 text-center tracking-widest bg-blue-500/5 py-1 rounded">Provide Academic Support Details (Any One)<span className="text-red-500">*</span></p>

                  {/* Support Selection Toggle */}
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setAcademicSupportType("TPO")}
                      className={`flex-1 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 font-bold ${academicSupportType === "TPO" ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      <ShieldCheck size={18} />
                      TPO Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setAcademicSupportType("Parent")}
                      className={`flex-1 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 font-bold ${academicSupportType === "Parent" ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      <CheckCircle size={18} />
                      Parent Details
                    </button>
                  </div>

                  <div className="min-h-[150px] transition-all duration-500">
                    {academicSupportType === "TPO" && (
                      <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 space-y-3 animate-fade-in">
                        <h4 className="text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">🏫 Training & Placement Office</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <input name="TpoName" value={formData.TpoName} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.TpoName ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="TPO Name" />
                            <FieldError name="TpoName" />
                          </div>
                          <div>
                            <input name="TpoEmail" value={formData.TpoEmail} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.TpoEmail ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="TPO Email" />
                            <FieldError name="TpoEmail" />
                          </div>
                          <div>
                            <input name="TpoNumber" value={formData.TpoNumber} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.TpoNumber ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="TPO Contact Number" />
                            <FieldError name="TpoNumber" />
                          </div>
                        </div>
                      </div>
                    )}

                    {academicSupportType === "Parent" && (
                      <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 space-y-3 animate-fade-in">
                        <h4 className="text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">👨‍👩‍👧 Parent / Guardian Contact</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <input name="parentName" value={formData.parentName} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.parentName ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="Parent Name" />
                            <FieldError name="parentName" />
                          </div>
                          <div>
                            <input name="parentNumber" value={formData.parentNumber} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.parentNumber ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="Parent Contact Number" />
                            <FieldError name="parentNumber" />
                          </div>
                          <div>
                            <input name="parentAltNumber" value={formData.parentAltNumber} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.parentAltNumber ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="Parent Alternate Mobile Number" />
                            <FieldError name="parentAltNumber" />
                          </div>
                          <div className="sm:col-span-2">
                            <input name="parentEmail" value={formData.parentEmail} onChange={handleChange} type="email" className={`p-3 rounded-xl bg-white/10 border ${formErrors.parentEmail ? 'border-red-500' : 'border-white/20'} text-white w-full text-sm`} placeholder="Parent Email ID" />
                            <FieldError name="parentEmail" />
                          </div>
                        </div>
                      </div>
                    )}

                    {!academicSupportType && (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-500 italic text-sm">
                        Select one of the options above to provide contact details.
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            )}

            {step === 5 && (
              <fieldset className="border border-white/30 p-6 rounded-xl bg-white/5 animate-fade-in">
                <legend className="text-xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-2 px-2">
                  Step 5: Internship Details
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-white">Domain <span className="text-red-500">*</span></label>
                    <select name="domain" value={formData.domain} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.domain ? 'border-red-500' : 'border-white/30'} text-white w-full`} required>
                      <option value="">Select Domain</option>
                      <option>Sales & Marketing</option>
                      <option>Data & AI Intelligence</option>
                      <option>Human Resources</option>
                      <option>Social Media Management</option>
                      <option>Graphic Design</option>
                      <option>Digital Marketing</option>
                      <option>Video Editing</option>
                      <option>Full Stack Development</option>
                      <option>MERN Stack Development</option>
                      <option>Email and Outreaching</option>
                      <option>Content Writing</option>
                      <option>Content Creator</option>
                      <option>UI/UX Designing</option>
                      <option>Front-end Developer</option>
                      <option>Back-end Developer</option>
                    </select>
                    <FieldError name="domain" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white">Duration <span className="text-red-500">*</span></label>
                    <select name="duration" value={formData.duration} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.duration ? 'border-red-500' : 'border-white/30'} text-white w-full`} required>
                      <option value="">Select Duration</option>
                      <option>3 Months</option>
                      <option>4 Months</option>
                      <option>6 Months</option>
                      <option>8 Months</option>
                    </select>
                    <FieldError name="duration" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white">Contact Method <span className="text-red-500">*</span></label>
                    <select name="contactMethod" value={formData.contactMethod} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.contactMethod ? 'border-red-500' : 'border-white/30'} text-white w-full`} required>
                      <option value="">Select Method</option>
                      <option>Phone Call</option>
                      <option>WhatsApp Message</option>
                      <option>Both (Phone Call & WhatsApp Message)</option>
                    </select>
                    <FieldError name="contactMethod" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-white">Have you done any internship before? <span className="text-red-500">*</span></label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input type="radio" name="prevInternship" value="Yes" checked={formData.prevInternship === "Yes"} onChange={handleChange} className="w-4 h-4 text-blue-500" />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input type="radio" name="prevInternship" value="No" checked={formData.prevInternship === "No"} onChange={handleChange} className="w-4 h-4 text-blue-500" />
                        No
                      </label>
                    </div>
                    <FieldError name="prevInternship" />
                  </div>

                  {formData.prevInternship === "Yes" && (
                    <div className="space-y-1 sm:col-span-2 animate-fade-in">
                      <label className="block text-sm font-medium text-white">Internship Description / Role <span className="text-red-500">*</span></label>
                      <textarea name="prevInternshipDesc" value={formData.prevInternshipDesc} onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.prevInternshipDesc ? 'border-red-500' : 'border-white/30'} text-white w-full h-24`} placeholder="Tell us about your previous internship experience..." required />
                      <FieldError name="prevInternshipDesc" />
                    </div>
                  )}

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-white">Resume/CV (PDF/Image) <span className="text-red-500">*</span></label>
                    <input type="file" name="resumeFile" accept=".pdf,image/*" onChange={handleChange} className={`p-3 rounded-xl bg-white/10 border ${formErrors.resumeFile ? 'border-red-500' : 'border-white/30'} text-white w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`} required />
                    <FieldError name="resumeFile" />
                    <p className="text-[10px] text-blue-300 mt-1 italic">🔔 File will be securely uploaded to our drive. Max size: 5MB.</p>
                  </div>

                  <div className={`sm:col-span-2 mt-6 p-4 bg-blue-500/10 border ${formErrors.declaration ? 'border-red-500' : 'border-blue-500/30'} rounded-2xl`}>
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id="declaration"
                        checked={formData.declaration}
                        onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                        className="mt-1 w-6 h-6 rounded border-white/30 text-blue-500 focus:ring-blue-500/50 bg-white/10 cursor-pointer"
                        required
                      />
                      <label htmlFor="declaration" className="text-[10px] sm:text-xs text-gray-300 leading-relaxed cursor-pointer select-none">
                        I hereby declare that all the information provided by me in this application is true and correct to the best of my knowledge and belief. I understand that any false information may lead to the rejection of my application and termination of my internship if selected.
                      </label>
                    </div>
                    <FieldError name="declaration" />
                  </div>
                </div>
              </fieldset>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-x-1"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg transform hover:translate-x-1"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/20 border border-green-400 text-green-200 p-4 rounded-xl text-center animate-fade-in mt-4">
                {success}
              </div>
            )}
          </form>

          <style dangerouslySetInnerHTML={{
            __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        select option {
          background-color: rgba(255, 255, 255, 0.1);
          color: black;
        }
        select option:hover,
        select option:focus {
          background-color: rgba(59, 130, 246, 0.2);
          color: black;
        }
        select option:checked {
          background-color: rgba(59, 130, 246, 0.2);
          color: black;
        }
      ` }} />
        </div>
      </GoogleOAuthProvider>
    );
  }
}

const ApplicationFormWithFingerprint = () => {
  return (
    <FingerprintProvider apiKey={import.meta.env.VITE_FINGERPRINT_PUBLIC_KEY} region="ap">
      <ApplicationForm />
    </FingerprintProvider>
  );
};

export default ApplicationFormWithFingerprint;
