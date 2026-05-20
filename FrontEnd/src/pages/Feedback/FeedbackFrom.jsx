// components/FeedbackForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import GraphuraLogo from "../../../public/Graphura.jpg";
import {
  User,
  Briefcase,
  MessageCircle,
  Image,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Video,
  ArrowRight,
  ArrowLeft,
  Check,
  Lightbulb,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  Laptop,
  Flag
} from 'lucide-react';

const FeedbackForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    uniqueId: '',
    fullName: '',
    managerName: '',
    mobileNumber: '',
    email: '',
    state: '',
    city: '',
    domain: '',
    duration: '',
    startMonth: '',
    endMonth: '',
    feedbackText: '',
    photo: null,
    video: null
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [internData, setInternData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const animatedTexts = [
    "Share Your Journey",
    "Inspire Others",
    "Build Your Legacy",
    "Shape The Future"
  ];

  // Steps with Lucide icons
  const steps = [
    { number: 1, label: 'Identity', icon: User },
    { number: 2, label: 'Tenure', icon: Briefcase },
    { number: 3, label: 'Feedback', icon: MessageCircle },
    { number: 4, label: 'Media', icon: Image }
  ];

  // Typing animation effect
  useEffect(() => {
    const currentText = animatedTexts[currentWordIndex];
    let timeout;

    if (typingText.length < currentText.length) {
      timeout = setTimeout(() => {
        setTypingText(currentText.slice(0, typingText.length + 1));
      }, 80);
    } else {
      timeout = setTimeout(() => {
        setTypingText('');
        setCurrentWordIndex((prev) => (prev + 1) % animatedTexts.length);
      }, 2500);
    }

    return () => clearTimeout(timeout);
  }, [typingText, currentWordIndex]);

  // Search intern by unique ID
  const searchInternByUniqueId = async (uniqueId) => {
    if (!uniqueId.trim()) {
      setSearchError('Please enter a Unique ID');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const encodedId = encodeURIComponent(uniqueId);
      const response = await axios.get(`/api/interns/${encodedId}`);

      if (response.data.success && response.data.intern) {
        const intern = response.data.intern;
        setInternData(intern);

        // Auto-fill form data from API response
        setFormData(prev => ({
          ...prev,
          fullName: intern.fullName || '',
          managerName: intern.managerName || '',
          mobileNumber: intern.mobileNumber || '',
          email: intern.email || '',
          state: intern.state || '',
          city: intern.city || '',
          domain: intern.domain || '',
          duration: intern.duration || '',
          startMonth: intern.startMonth || '',
          endMonth: intern.endMonth || ''
        }));

        setSearchError('');
      } else {
        setSearchError(response.data.message || 'No completed intern found with this Unique ID');
        setInternData(null);
      }
    } catch (error) {
      console.error('Error searching intern:', error);
      if (error.response?.status === 404) {
        setSearchError('No completed intern found with this Unique ID');
      } else if (error.response?.data?.message) {
        setSearchError(error.response.data.message);
      } else {
        setSearchError('Error searching for intern. Please try again.');
      }
      setInternData(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Manual search function
  const handleManualSearch = () => {
    if (formData.uniqueId.trim()) {
      searchInternByUniqueId(formData.uniqueId);
    }
  };

  // Handle unique ID input with debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.uniqueId && formData.uniqueId.length >= 3) {
        searchInternByUniqueId(formData.uniqueId);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.uniqueId]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'uniqueId' || name === 'feedbackText') {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle file uploads without compression
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (!file) return;

    if (name === 'photo') {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG)');
        e.target.value = '';
        return;
      }
      if (file.size > 1 * 1024 * 1024) { // 1MB
        alert('Photo size should be less than 1MB');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

    } else if (name === 'video') {
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file (MP4, MOV, AVI)');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('Video size should be less than 10MB');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  // Clear file previews
  const clearFilePreview = (type) => {
    if (type === 'photo') {
      setPhotoPreview(null);
      setFormData(prev => ({ ...prev, photo: null }));
      const fileInput = document.getElementById('photo');
      if (fileInput) fileInput.value = '';
    } else if (type === 'video') {
      setVideoPreview(null);
      setFormData(prev => ({ ...prev, video: null }));
      const fileInput = document.getElementById('video');
      if (fileInput) fileInput.value = '';
    }
  };

  // Navigation
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.photo || !formData.video) {
      alert('Please upload both photo and video files');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'photo' || key === 'video') {
          if (formData[key]) {
            submitData.append(key, formData[key]);
          }
        } else {
          submitData.append(key, formData[key] || '');
        }
      });

      const response = await axios.post('/api/feedback', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      let errorMessage = 'There was an error submitting your feedback. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your file sizes and try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setInternData(null);
    setSearchError('');
    setFormData(prev => ({
      ...prev,
      uniqueId: '',
      fullName: '',
      managerName: '',
      mobileNumber: '',
      email: '',
      state: '',
      city: '',
      domain: '',
      duration: '',
      startMonth: '',
      endMonth: ''
    }));
  };

  // Step 1: Intern Information
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-wider">
          Intern Identity & Credentials
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Please provide your valid Unique Intern ID to synchronize records.</p>
      </div>

      <div className="space-y-4">
        {/* Unique ID Search Section */}
        <div className="space-y-2">
          <label htmlFor="uniqueId" className="block text-[11px] font-black uppercase tracking-wider text-slate-800">
            Unique Intern ID <span className="text-rose-600 font-bold">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                id="uniqueId"
                name="uniqueId"
                value={formData.uniqueId}
                onChange={handleInputChange}
                placeholder="e.g. GIP/2026/XXXX"
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-3 text-xs font-mono font-bold tracking-wider text-slate-900 focus:outline-none transition-all placeholder-slate-400 uppercase"
                required
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleManualSearch}
              disabled={searchLoading || !formData.uniqueId}
              className="bg-[#1e3a8a] hover:bg-[#1d3557] disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2 border border-blue-900 disabled:border-slate-200 disabled:cursor-not-allowed"
            >
              <Search size={14} />
              <span>Search Registry</span>
            </button>
          </div>

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg text-xs font-semibold"
            >
              <AlertCircle size={15} />
              <span>{searchError}</span>
            </motion.div>
          )}

          {internData && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-800 text-xs font-extrabold uppercase tracking-wide">
                  <CheckCircle size={16} />
                  <span>Registry Credentials Synced Successfully</span>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-emerald-700 hover:text-emerald-900 transition-colors p-1"
                  title="Clear & Search Again"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[11px] text-emerald-800 font-semibold uppercase">
                <div><span className="text-emerald-600 block text-[9px] font-bold">FULL NAME</span> {internData.fullName}</div>
                <div><span className="text-emerald-600 block text-[9px] font-bold">DOMAIN</span> {internData.domain}</div>
                <div>
                  <span className="text-emerald-600 block text-[9px] font-bold">TENURE DURATION</span>
                  {internData.duration} Months {internData.extendedDays ? `+ ${internData.extendedDays} Days` : ""}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Personal Details (Locked if searched) */}
        <div className="bg-slate-50/40 border border-slate-200/80 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <User size={15} />
            <span>Intern Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">TPO / Manager Name</label>
              <input
                type="text"
                name="managerName"
                value={formData.managerName}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Contact Details (Locked if searched) */}
        <div className="bg-slate-50/40 border border-slate-200/80 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Mail size={15} />
            <span>Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Email Address</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={nextStep}
          disabled={!formData.uniqueId || !formData.fullName || !formData.email}
          className="bg-[#1e3a8a] hover:bg-[#1d3557] disabled:bg-slate-200 text-white disabled:text-slate-400 px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2 border border-blue-900 disabled:border-slate-200 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <span>Continue</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );

  // Step 2: Internship Details
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-wider">
          Internship Parameters & Tenure
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Summary of domain specialization and tenure metrics logged.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50/40 border border-slate-200/80 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Briefcase size={15} />
            <span>Specialization & Metrics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Domain Spezialization</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Total Duration (Months)</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Commencement Date</label>
              <input
                type="text"
                name="startMonth"
                value={formData.startMonth}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700">Conclusion Date</label>
              <input
                type="text"
                name="endMonth"
                value={formData.endMonth}
                disabled
                className="w-full bg-slate-100 border border-slate-250 text-slate-600 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {internData && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Registry Progress Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold uppercase text-slate-700">
              <div><span className="text-slate-500 block text-[9px] font-bold">SYSTEM STATUS</span> {internData.status}</div>
              <div><span className="text-slate-500 block text-[9px] font-bold">EXTENDED DAYS REPORTED</span> {internData.extendedDays || 0} Days</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100 gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!formData.domain || !formData.duration}
          className="bg-[#1e3a8a] hover:bg-[#1d3557] disabled:bg-slate-200 text-white disabled:text-slate-400 px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2 border border-blue-900 disabled:border-slate-200 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <span>Continue</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );

  // Step 3: Feedback
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-wider">
          Experience Narrative
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Share your key achievements, learning highlights, and suggestions.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="feedbackText" className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Your Feedback Narrative <span className="text-rose-650 font-bold">*</span>
            </label>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">50 CHARS MIN</span>
          </div>
          <textarea
            id="feedbackText"
            name="feedbackText"
            rows="6"
            value={formData.feedbackText}
            onChange={handleInputChange}
            placeholder="Share your structured feedback, technical stacks learned, soft-skills gained, and generic feedback..."
            className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-450 focus:outline-none transition-all leading-relaxed resize-none font-medium"
            required
          />
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>MINIMUM REQUIREMENT: 50 CHARACTERS</span>
            <span>{formData.feedbackText.length} CHARS CAPTURED</span>
          </div>
        </div>

        {formData.feedbackText.length > 0 && formData.feedbackText.length < 50 && (
          <p className="text-rose-655 text-[10px] font-semibold tracking-wide">
            ⚠️ Feedback must be at least 50 characters long.
          </p>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100 gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={formData.feedbackText.trim().length < 50}
          className="bg-[#1e3a8a] hover:bg-[#1d3557] disabled:bg-slate-200 text-white disabled:text-slate-400 px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2 border border-blue-900 disabled:border-slate-200 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <span>Continue</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );

  // Step 4: Upload Media
  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-wider">
          Verify Media Attachments
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Please attach a professional headshot and a brief testimonial video.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Photo Upload Zone */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Intern Profile Photo <span className="text-rose-650 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="photo"
                className="block border-2 border-dashed border-slate-250 hover:border-blue-600 rounded-lg p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all"
              >
                <Upload className="text-[#1e3a8a] mb-2 mx-auto" size={20} />
                <p className="text-slate-800 font-bold text-xs">
                  {formData.photo ? formData.photo.name : 'Upload Intern Photo'}
                </p>
                <p className="text-[9.5px] text-slate-500 mt-1">PNG, JPG, JPEG (Max 1MB)</p>
              </label>
            </div>

            {photoPreview && formData.photo && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-2 bg-slate-55 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <span>Photo Attachment Preview ({(formData.photo.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" onClick={() => clearFilePreview('photo')} className="text-rose-600 hover:text-rose-800">
                    <X size={14} />
                  </button>
                </div>
                <img src={photoPreview} alt="Profile headshot preview" className="w-full h-36 object-cover bg-slate-50" />
              </div>
            )}
          </div>

          {/* Video Testimonial Upload Zone */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Testimonial Video <span className="text-rose-655 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="video"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="video"
                className="block border-2 border-dashed border-slate-250 hover:border-blue-600 rounded-lg p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all"
              >
                <Video className="text-[#1e3a8a] mb-2 mx-auto" size={20} />
                <p className="text-slate-800 font-bold text-xs">
                  {formData.video ? formData.video.name : 'Upload Testimonial Video'}
                </p>
                <p className="text-[9.5px] text-slate-500 mt-1">MP4, MOV (Max 10MB)</p>
              </label>
            </div>

            {videoPreview && formData.video && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-2 bg-slate-55 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <span>Video Attachment Preview ({(formData.video.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button type="button" onClick={() => clearFilePreview('video')} className="text-rose-600 hover:text-rose-800">
                    <X size={14} />
                  </button>
                </div>
                <video src={videoPreview} className="w-full h-36 bg-black object-contain" controls />
              </div>
            )}
          </div>
        </div>

        {/* Upload tips block */}
        <div className="bg-blue-50/20 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
          <Lightbulb size={16} className="text-blue-700 mt-0.5 shrink-0" />
          <div className="text-[10px] text-slate-650 leading-relaxed font-semibold uppercase">
            <span className="text-[#1e3a8a] font-bold block mb-1">Testimonial Specifications & Requirements:</span>
            • PHOTO: Ensure high resolution headshot with bright professional lighting.<br/>
            • TESTIMONIAL VIDEO: 1-2 Minute overview representing core takeaways, learning curves, and mentors support.
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100 gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !formData.photo || !formData.video}
          className="bg-[#1e3a8a] hover:bg-[#1d3557] disabled:bg-slate-200 text-white disabled:text-slate-400 px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center space-x-2 border border-blue-900 disabled:border-slate-200 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading Feedback...</span>
            </>
          ) : (
            <>
              <span>Submit Feedback Statement</span>
              <Check size={14} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  // Success Screen
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10 space-y-6"
    >
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle size={32} className="text-emerald-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wider">
          Feedback Registered Successfully
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Thank you for sharing your internship testimonial. Your record has been secured in the Graphura database.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setSubmitted(false);
          setCurrentStep(1);
          setFormData({
            uniqueId: '',
            fullName: '',
            managerName: '',
            mobileNumber: '',
            email: '',
            state: '',
            city: '',
            domain: '',
            duration: '',
            startMonth: '',
            endMonth: '',
            feedbackText: '',
            photo: null,
            video: null
          });
          setInternData(null);
          setSearchError('');
          setPhotoPreview(null);
          setVideoPreview(null);
        }}
        className="bg-[#1e3a8a] hover:bg-[#1d3557] text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm border border-blue-900"
      >
        Submit Another Statement
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] py-10 px-4 md:px-8 relative antialiased gip-feedback-font">
      
      {/* Font Family Configurator */}
      <style dangerouslySetInnerHTML={{__html: `
        .gip-feedback-font,
        .gip-feedback-font input,
        .gip-feedback-font select,
        .gip-feedback-font textarea,
        .gip-feedback-font button {
          font-family: 'Outfit', 'Inter', sans-serif !important;
        }
      `}} />

      {/* Top Identity bar */}
      <div className="absolute top-0 left-0 w-full h-[5px] bg-[#1e3a8a] z-50"></div>

      <div className="max-w-[950px] mx-auto space-y-6 transition-all duration-300">
        
        {/* Main Form Page Container - Modern Web Portal Layout */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          
          {/* Executive Header Banner */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg border border-slate-700/50 flex items-center justify-center p-1 bg-white/10 shadow-inner shrink-0">
                <img src={GraphuraLogo} alt="Graphura" className="w-full h-full object-contain rounded brightness-100 contrast-125" />
              </div>
              <div>
                <h1 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#93c5fd]">
                  Graphura Internship Program (GIP)
                </h1>
                <p className="text-sm md:text-base font-extrabold tracking-wide uppercase text-white mt-0.5">
                  Official Feedback Registry Portal
                </p>
                <div className="h-5 overflow-hidden mt-1 text-[11px] text-slate-350 font-bold uppercase tracking-wider">
                  <span>{typingText} |</span>
                </div>
              </div>
            </div>

            {/* Stepper Status Indicators */}
            {!submitted && (
              <div className="flex items-center space-x-2 shrink-0 md:border-l md:border-slate-800 md:pl-6">
                {steps.map((step, idx) => {
                  const IconComponent = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  return (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                          title={step.label}
                        >
                          {isCompleted ? <Check size={12} /> : <IconComponent size={12} />}
                        </div>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`h-[1px] w-4 sm:w-6 ${currentStep > step.number ? 'bg-emerald-600' : 'bg-slate-800'}`}></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Content body */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderSuccess()}
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                </form>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FeedbackForm;