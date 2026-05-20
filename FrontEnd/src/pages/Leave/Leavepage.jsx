import React, { useState } from 'react';
import axios from 'axios';
import Graphura from "../../../public/Graphura.jpg";

const LeaveApplicationForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    internId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    reason: '',
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Classifications with official translations and codes (English Only)
  const leaveReasons = [
    { value: 'Sick/Medical Leave', code: 'ML-01', description: 'Under medical recommendation or health issues' },
    { value: 'Casual Leave (CL)', code: 'CL-02', description: 'Urgent personal matters or sudden duties' },
    { value: 'Earned Leave', code: 'EL-03', description: 'Pre-approved accrued vacation or personal leave' },
    { value: 'Maternity/Paternity Leave', code: 'PL-04', description: 'Parental care provision and child support' },
    { value: 'Bereavement Leave', code: 'BL-05', description: 'Loss of an immediate family member' },
    { value: 'Extraordinary Leave (EOL)', code: 'EOL-06', description: 'Special unlisted emergency and critical circumstances' }
  ];

  // Calculate total days between start and end date
  const calculateTotalDays = (start, end) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return dayDiff > 0 ? dayDiff : 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      };

      // Recalculate total days if start or end date changes
      if (name === 'startDate' || name === 'endDate') {
        updatedData.totalDays = calculateTotalDays(
          name === 'startDate' ? value : prev.startDate,
          name === 'endDate' ? value : prev.endDate
        );

        // Check for 48-hour notice requirement
        if (updatedData.startDate) {
          const startDate = new Date(updatedData.startDate);
          const now = new Date();
          const hoursDiff = (startDate - now) / (1000 * 60 * 60);

          if (hoursDiff < 48 && hoursDiff > 0) {
            setShowNotice(true);
            setNoticeMessage('⚠️ NOTICE: Standard compliance requires leave registration at least 48 hours prior to commencement.');
          } else {
            setShowNotice(false);
          }
        }
      }

      return updatedData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  // Direct classification selection handler
  const handleClassificationSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      leaveType: value
    }));

    if (errors.leaveType) {
      setErrors(prev => ({
        ...prev,
        leaveType: ''
      }));
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    if (!formData.internId.trim()) newErrors.internId = 'Intern ID is required';
    if (!formData.leaveType) newErrors.leaveType = 'Please select a leave classification';
    if (!formData.startDate) newErrors.startDate = 'Commencement date is required';
    if (!formData.endDate) newErrors.endDate = 'Termination date is required';
    if (formData.totalDays <= 0) newErrors.totalDays = 'End date must be on or after start date';
    if (!formData.reason.trim()) newErrors.reason = 'Justification statement is required';
    if (formData.reason.trim().length < 10) newErrors.reason = 'Justification must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle backend error responses
  const handleBackendError = (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          if (data.error === "All fields are required") {
            setSubmitStatus({
              type: 'error',
              message: '❌ ERROR: ALL REGISTERED FIELDS ARE MANDATORY.'
            });
          } else if (data.error === "Invalid date format") {
            setSubmitStatus({
              type: 'error',
              message: '❌ ERROR: INVALID DATE CONSTRAINTS.'
            });
          } else if (data.error === "End date must be after start date") {
            setSubmitStatus({
              type: 'error',
              message: '❌ ERROR: TERMINATION DATE DEVIATION.'
            });
          } else if (data.error === "You already have a leave request in this date range") {
            setSubmitStatus({
              type: 'error',
              message: '❌ ERROR: ACTIVE LEAVE RECORD IN THIS RANGE.'
            });
          } else {
            setSubmitStatus({
              type: 'error',
              message: `❌ ERROR: ${data.error || 'VALIDATION EXCEPTION.'}`
            });
          }
          break;

        case 404:
          setSubmitStatus({
            type: 'error',
            message: '❌ ERROR: INTERN UNIQUE ID NOT REGISTERED.'
          });
          break;

        case 500:
          setSubmitStatus({
            type: 'error',
            message: '❌ ERROR: SERVER EXCEPTION. TRY LATER.'
          });
          break;

        default:
          setSubmitStatus({
            type: 'error',
            message: `❌ ERROR: ${data.error || 'CONTACT SYSTEM ADMINISTRATION'}`
          });
      }
    } else if (error.request) {
      setSubmitStatus({
        type: 'error',
        message: '❌ ERROR: CONNECTION TIMEOUT.'
      });
    } else {
      setSubmitStatus({
        type: 'error',
        message: `❌ APPLICATION EXCEPTION: ${error.message}`
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: '❌ ERROR: PLEASE CORRECT DEVIATIONS.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await axios.post('/api/intern/leaves', formData);

      if (response.status === 201) {
        setSubmitStatus({
          type: 'success',
          message: '🎉 SUCCESS: LEAVE REQUEST REGISTERED SUCCESSFULLY.'
        });

        // Reset form
        setFormData({
          internId: '',
          leaveType: '',
          startDate: '',
          endDate: '',
          totalDays: 0,
          reason: '',
          status: 'Pending'
        });
        setShowNotice(false);
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);
      handleBackendError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] py-10 px-4 md:px-8 relative antialiased gip-portal-font">

      {/* Dynamic CSS Injector to Guarantee Outfit Font Inheritance Across All Inputs */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .gip-portal-font,
        .gip-portal-font input,
        .gip-portal-font select,
        .gip-portal-font textarea,
        .gip-portal-font button {
          font-family: 'Outfit', 'Inter', sans-serif !important;
        }
      `}} />

      {/* National Identity Top Accent */}
      <div className="absolute top-0 left-0 w-full h-[5px] bg-[#1e3a8a] z-50"></div>

      <div className="max-w-[1250px] mx-auto space-y-6 transition-all duration-300">

        {/* Sleek Enterprise Portal Header Bar */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-lg border border-slate-200 flex items-center justify-center p-1 bg-slate-50 shadow-inner">
              <img src={Graphura} alt="National Emblem" className="w-full h-full object-contain rounded" />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-extrabold uppercase text-slate-900 tracking-wider">
                GRAPHURA INDIA PRIVATE LIMITED
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Online Leave Management Portal • Graphura Internship Program
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider font-mono">
              System Status: Secure & Online
            </span>
          </div>
        </div>

        {/* Main Columns Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Main Application Panel (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-250/60 shadow-sm rounded-xl p-6 md:p-8 space-y-6">

              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Apply For Leave</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out all required fields to submit your Leave Application.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Intern ID Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      Intern Unique ID <span className="text-rose-600 font-bold">*</span>
                    </label>

                  </div>
                  <input
                    type="text"
                    name="internId"
                    value={formData.internId}
                    onChange={handleChange}
                    placeholder="e.g. GIP/2026/XXXX"
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-3 text-xs font-bold tracking-wider text-slate-900 focus:outline-none transition-all placeholder-slate-400 uppercase"
                  />
                  {errors.internId && (
                    <p className="text-rose-650 text-[10px] font-semibold tracking-wide">⚠️ {errors.internId}</p>
                  )}
                </div>

                {/* Modern Classification Dropdown List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      Select Leave Type <span className="text-rose-650 font-bold">*</span>
                    </label>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CATEGORY LOGS</span>
                  </div>

                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none transition-all cursor-pointer uppercase"
                  >
                    <option value="" disabled className="text-slate-400 font-bold">-- Choose Leave Category --</option>
                    {leaveReasons.map((reason) => (
                      <option key={reason.value} value={reason.value} className="text-slate-900 font-bold">
                        {reason.code} - {reason.value.toUpperCase()} ({reason.description})
                      </option>
                    ))}
                  </select>

                  {errors.leaveType && (
                    <p className="text-rose-655 text-[10px] font-semibold tracking-wide">⚠️ {errors.leaveType}</p>
                  )}
                </div>

                {/* Symmetrical Date selection grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* From Date */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800">
                      From Date <span className="text-rose-650 font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                    {errors.startDate && (
                      <p className="text-rose-655 text-[10px] font-semibold tracking-wide">⚠️ {errors.startDate}</p>
                    )}
                  </div>

                  {/* To Date */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800">
                      To Date <span className="text-rose-650 font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                    {errors.endDate && (
                      <p className="text-rose-655 text-[10px] font-semibold tracking-wide">⚠️ {errors.endDate}</p>
                    )}
                  </div>

                </div>

                {/* Warnings / Calculations display panel */}
                {(errors.totalDays || showNotice || formData.totalDays > 0) && (
                  <div className="space-y-2">
                    {errors.totalDays && (
                      <p className="text-rose-655 text-[10px] font-semibold tracking-wide">⚠️ {errors.totalDays}</p>
                    )}
                    {showNotice && (
                      <div className="bg-amber-50/80 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider rounded-lg p-3.5 leading-relaxed">
                        {noticeMessage}
                      </div>
                    )}
                    {formData.totalDays > 0 && (
                      <div className="bg-blue-50/20 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          Calculated Absence Period:
                        </span>
                        <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded">
                          {formData.totalDays} {formData.totalDays === 1 ? 'DAY' : 'DAYS'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Justification reason box */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      Reason for Leave<span className="text-rose-650 font-bold">*</span>
                    </label>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">30 CHARS MIN</span>
                  </div>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Please provide a detailed reason (minimum 30 characters)..."
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-450 focus:outline-none transition-all leading-relaxed resize-none font-medium"
                  />
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>MINIMUM REQUIREMENT: 30 CHARACTERS</span>
                    <span>{formData.reason.length} CHARS CAPTURED</span>
                  </div>
                  {errors.reason && (
                    <p className="text-rose-655 text-[10px] font-semibold tracking-wide">⚠️ {errors.reason}</p>
                  )}
                </div>

                {/* Application feedback toasts */}
                {submitStatus.message && (
                  <div
                    className={`p-3.5 rounded-lg text-xs font-black text-center uppercase tracking-widest border ${submitStatus.type === "error"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                {/* Primary Lodge button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#1e3a8a] hover:bg-[#1d3557] text-white font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm rounded-lg flex items-center justify-center space-x-2 border border-blue-900"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>SUBMITING...</span>
                    </>
                  ) : (
                    <span>SUBMIT LEAVE APPLICATION</span>
                  )}
                </button>

              </form>

            </div>
          </div>

          {/* Right Sidebar Guidelines & Helpdesk Panel (Right 1/3) */}
          <div className="space-y-6">

            {/* Regulatory Instructions Board */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider pb-2.5 border-b border-slate-100 flex items-center gap-2">
                <span>📌 Portal Guidelines</span>
              </h3>

              <div className="space-y-4 text-[10.5px] text-slate-600 leading-relaxed font-semibold">
                <div className="border-b border-slate-55 pb-2">
                  <span className="text-slate-900 block font-bold uppercase mb-0.5">1. Applicability</span>
                  This leave policy is applicable only to internship candidates.
                </div>
                <div className="border-b border-slate-55 pb-2">
                  <span className="text-slate-900 block font-bold uppercase mb-0.5">2. Accuracy</span>
                  All leave requests must be submitted with accurate details.
                </div>
                <div className="border-b border-slate-55 pb-2">
                  <span className="text-slate-900 block font-bold uppercase mb-0.5">3. Veracity</span>
                  False or misleading information may lead to rejection or disciplinary action.
                </div>
                <div className="border-b border-slate-55 pb-2">
                  <span className="text-slate-900 block font-bold uppercase mb-0.5">4. Audit & Verification</span>
                  Submitted leave requests are subject to verification and approval.
                </div>
                <div>
                  <span className="text-slate-900 block font-bold uppercase mb-0.5">5. Sole Authority</span>
                  Final approval or rejection rests solely with management.
                </div>
              </div>
            </div>

            {/* Helpline support Desk */}
            <div className="bg-[#1e293b] text-white rounded-xl p-5 space-y-4 shadow-sm border border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-sky-400">
                📞 Helpdesk Support
              </h4>
              <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">
                For systemic errors, database corrections, or immediate approval queries, please contact GIP support desks:
              </p>
              <div className="space-y-2 text-[10px] font-bold uppercase">
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[8px] font-bold tracking-widest mb-0.5">SUPPORT EMAIL</span>
                  <a href="mailto:hr@graphura.in" className="text-sky-355 hover:underline">hr@graphura.in</a>
                </div>
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[8px] font-bold tracking-widest mb-0.5">HELPLINE TELEPHONY</span>
                  +91 7378021327
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default LeaveApplicationForm;