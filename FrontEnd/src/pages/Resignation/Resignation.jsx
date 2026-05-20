import React, { useState } from "react";
import axios from "axios";
import Graphura from "../../../public/Graphura.jpg";
import { useNavigate } from "react-router-dom";

const Resignation = () => {
  const navigate = useNavigate();

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const addDays = (dateStr, days) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const today = getToday();

  const [formData, setFormData] = useState({
    internId: "",
    resignationType: "",
    resignationRequestDate: today,
    lastWorkingDate: addDays(today, 15),
    tasksCompleted: false,
    evidence: null,
    reason: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
            ? files[0]
            : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitStatus.message) setSubmitStatus({ type: "", message: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.internId.trim()) newErrors.internId = "Intern ID is required";

    if (!formData.resignationType)
      newErrors.resignationType = "Please select reason for Resignation";

    if (formData.tasksCompleted !== true) {
      newErrors.tasksCompleted =
        "You must complete all tasks before submitting resignation";
    }
    if (!formData.evidence)
      newErrors.evidence = "Valid evidence submission is required";
    if (!formData.reason.trim() || formData.reason.length < 10)
      newErrors.reason = "Reason must be at least 10 characters long";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );

      const res = await axios.post("/api/intern/resignation", data);

      setSubmitStatus({
        type: "success",
        message: res.data.message || "🎉 Resignation submitted successfully!",
      });

      const today = getToday();
      setFormData({
        internId: "",
        resignationType: "",
        resignationRequestDate: today,
        lastWorkingDate: addDays(today, 15),
        tasksCompleted: false,
        evidence: null,
        reason: "",
        status: "Pending",
      });
      setErrors({});
      navigate("/feedback");
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "❌ Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#020617] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-10">
          <img
            src={Graphura}
            alt="Graphura Logo"
            className="mx-auto mb-4 w-24 h-24 rounded-full bg-white p-1 shadow-xl"
          />
          <h1 className="text-3xl font-bold text-cyan-400">
            Graphura India Private Limited
          </h1>
          <p className="text-slate-300 mt-1">
            Fill out all required fields to submit your Resignation. For more details: <a href="mailto:hr@graphura.in" className="underline text-blue-200 hover:text-blue-300 transition-colors">hr@graphura.in</a>, +91 7378021327
          </p>
        </div>

        {/* Status */}
        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-xl ${submitStatus.type === "success"
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
              }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Intern ID */}
          <div>
            <label className="block text-slate-200 mb-2">
              Intern ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="internId"
              placeholder="e.g. GRP-INT-2024-021"
              value={formData.internId}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white"
            />
            {errors.internId && (
              <p className="text-red-400 text-sm">{errors.internId}</p>
            )}
          </div>
          <div>
            <label className="block text-slate-200 mb-2">
              Reason For Resignation <span className="text-red-400">*</span>
            </label>

            <select
              name="resignationType"
              value={formData.resignationType}
              onChange={handleChange}
              className="
     w-full rounded-lg
    bg-white/10
    text-white
    border border-white/20
    px-4 py-3
    focus:outline-none
    focus:ring-2
    focus:ring-cyan-400
  "
            >
              <option value="" disabled className="bg-[#020617] text-slate-400">
                Select Resignation Type...
              </option>
              <option className="bg-[#ffffff] text-black" value="Personal Reasons">
                Personal Reasons
              </option>

              <option className="bg-[#ffffff] text-black" value="Academic Workload"> Academic Workload</option>
              <option className="bg-[#ffffff] text-black" value="Higher Studies"> Higher Studies</option>

              <option className="bg-[#ffffff] text-black" value="Job Opportunity
">
                Job Opportunity

              </option>

              <option className="bg-[#ffffff] text-black" value="Health Issues">
                Health Issues
              </option>

              <option className="bg-[#ffffff] text-black" value="Performance Issues">
                Performance Issues
              </option>

              <option className="bg-[#ffffff] text-black" value="Work Environment">
                Work Environment
              </option>
            </select>

            {errors.resignationType && (
              <p className="text-red-400 text-sm mt-1">
                {errors.resignationType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-200 mb-2">
              Resignation Request Date
            </label>
            <input
              type="date"
              name="resignationRequestDate"
              value={formData.resignationRequestDate}
              readOnly
              className="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-3 text-slate-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-200 mb-2">
              Last Working Date (Auto-calculated)
            </label>

            <input
              type="date"
              name="lastWorkingDate"
              value={formData.lastWorkingDate}
              readOnly
              className="w-full rounded-lg bg-white/5 border border-white/20 px-4 py-3 text-slate-300 cursor-not-allowed"
            />
          </div>

          {/* Tasks Completed (Yes / No) */}
          <div>
            <label className="block text-slate-200 mb-2">
              Have you completed all tasks allotted by your Team Leader?{" "}
              <span className="text-red-400">*</span>
            </label>

            <div className="flex gap-6 mt-2">
              {/* YES */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="tasksCompleted"
                  value="yes"
                  checked={formData.tasksCompleted === true}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, tasksCompleted: true }))
                  }
                  className="accent-cyan-400"
                />
                Yes
              </label>

              {/* NO */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="tasksCompleted"
                  value="no"
                  checked={formData.tasksCompleted === false}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, tasksCompleted: false }))
                  }
                  className="accent-cyan-400"
                />
                No
              </label>
            </div>

            {errors.tasksCompleted && (
              <p className="text-red-400 text-sm mt-1">
                {errors.tasksCompleted}
              </p>
            )}
          </div>


          {/* Evidence */}
          <div>
            <label className="block text-slate-200 mb-2">
              Valid Evidence Submission(Only Image) <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              name="evidence"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-slate-300 file:bg-cyan-500 file:text-white file:px-6 file:py-2 file:rounded-lg"
            />
            {errors.evidence && (
              <p className="text-red-400 text-sm">{errors.evidence}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-200 mb-2">
              Reason for Resignation <span className="text-red-400">*</span>
            </label>
            <textarea
              rows="4"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide a detailed reason (minimum 30 characters)..."
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white"
            />
            {errors.reason && (
              <p className="text-red-400 text-sm">{errors.reason}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Resignation"}
          </button>
        </form>

        {/* Policy Section */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-cyan-400 font-semibold mb-3">
            📄 Resignation Policy Guidelines
          </h3>
          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
            <li>All assigned tasks and responsibilities must be completed before applying.</li>
            <li>
              Valid supporting evidence is mandatory; applications without evidence will not be processed.
            </li>
            <li>
              Submission of false or misleading evidence will attract a
              <b className="text-red-400"> Rs. 500</b> penalty.
            </li>
            <li>
              All submissions are subject to verification, and approval is not guaranteed.
            </li>
            <li>
              Further disciplinary or legal action may be taken by
              <b> Graphura India Private Limited</b>.
            </li>
            <li>
              All submitted documents must be officially issued and duly stamped by the concerned/authorized authority.
            </li>
            <li>
              Each document must clearly mention the full name, designation, and handwritten signature of the authorized signatory.
            </li>
            <li>
              The official email ID and contact number of the Training & Placement Officer (TPO) / issuing authority are mandatory for verification purposes.
            </li>
            <li>
              Until the candidate receives an official
              <b> “Successful Completion”</b> confirmation email from
              <b> Graphura India Private Limited</b>, they are required to continue fulfilling all assigned duties, responsibilities, and work commitments without exception.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Resignation;
