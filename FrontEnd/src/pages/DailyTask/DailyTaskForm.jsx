import React from "react";
import axios from "axios";
import Graphura from "../../../public/Graphura.jpg";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CheckCircle, Loader2, User } from "lucide-react";

const DailyTaskForm = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState({});
  const [internId, setInternId] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [hourSpent, setHourSpent] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("In progress")
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState("Daily Update");

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/get-all-tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    if (!internId) {
      setTasks([]);
      return;
    }
    fetchTasks();
  }, [internId]);

  /* 🟢 Auto set today date */
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTaskDate(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (taskType === "Project Update" && !selectedTask?._id) {
      toast.error("Please select a project");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        taskType,
        task: taskType === "Project Update" ? selectedTask?._id : null,
        internId,
        taskTitle:
          taskType === "Project Update"
            ? selectedTask?.title
            : taskType,
        taskDescription,
        hoursSpent: Number(hourSpent),
        taskDate,
        taskStatus,
      };

      const res = await axios.post("/api/daily-tasks", payload);
      toast.success(res.data.message || "Task submitted");
      // reset form
      setTaskDescription("");
      setHourSpent("");
      setTaskDate("");
      setTaskType("Daily Update")
      setTaskStatus("In progress");
      setSelectedTask({});
      setTasks([]);
      setInternId("");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit daily task"
      );
    } finally {
      setLoading(false);
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
            Daily Task Submission - Graphura
          </h1>
          <p className="text-slate-300 mt-1">
            Submit your daily work details accurately. For any queries contact
            your Department Manager
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Intern ID */}
          <div>
            <label className="block text-slate-200 mb-2">
              Intern ID 👤 <span className="text-red-400">*</span>
            </label>
            <input
              name="internId"
              value={internId}
              placeholder="e.g. GRP-INT-2024-021"
              onChange={(e) => setInternId(e.target.value)}
              type="text"
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white"
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-slate-200 mb-2">
              Task Type 📌 <span className="text-red-400">*</span>
            </label>

            <select
              value={taskType}
              onChange={(e) => {
                setTaskType(e.target.value);
                if (e.target.value !== "Project Update") {
                  setSelectedTask({});
                }
              }}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white"
            >
              <option value="Daily Update" className="bg-[#677cb5] text-white">
                Daily Update
              </option>
              <option value="Project Update" className="bg-[#677cb5] text-white">
                Project Update
              </option>
              <option value="Other Update" className="bg-[#677cb5] text-white">
                Other Update
              </option>
            </select>
          </div>

          {taskType === "Project Update" && (
            <div>
              {/* Project Name */}
              <label className="block text-slate-200 mb-2">
                Project Name 🛠️ <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedTask?._id || ""}
                onChange={(e) => {
                  const task = tasks.find(
                    (t) => t._id.toString() === e.target.value
                  );
                  setSelectedTask(task);
                }}
                className="w-full rounded-lg bg-white/10 border border-slate-600 px-4 py-3 text-slate-100"
              >
                <option value="" disabled className="bg-[#677cb5] text-white">
                  Select a project
                </option>

                {tasks.map((task) => (
                  <option
                    key={task._id}
                    value={task._id}
                    className="bg-[#677cb5] text-white"
                  >
                    {task.title}
                  </option>
                ))}
              </select>
              {/* Project Incharge */}
              <div>
                <label className="block text-slate-200 mb-2">
                  Project Incharge 👨‍💼
                </label>
                <input
                  value={selectedTask?.incharge?.fullName || "Select a project"}
                  readOnly
                  className="w-full rounded-lg bg-white/10 border border-white/20
               px-4 py-3 text-slate-300 cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Task Description */}
          <div>
            <label className="block text-slate-200 mb-2">
              Task Description 📝 <span className="text-red-400">*</span>
            </label>
            <textarea
              name="taskDescription"
              value={taskDescription}
              placeholder="Task Update – Description"
              onChange={(e) => setTaskDescription(e.target.value)}
              rows="4"
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white"
            />
          </div>

          {/* Hours + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-200 mb-2">
                Hours Spent <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={hourSpent}
                onChange={(e) => setHourSpent(e.target.value)}
                placeholder="Total hours (e.g. 3.5)"
                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-200 mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={taskDate}
                readOnly
                className="w-full rounded-lg bg-white/10 px-4 py-3 text-slate-300"
              />
            </div>
          </div>

          {/* Task Status */}
          <div>
            <label className="block text-slate-200 mb-4">
              Task Status <span className="text-red-400">*</span>
            </label>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setTaskStatus("In progress")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300
                              hover:scale-105 hover:shadow-xl hover:border-blue-300
                ${taskStatus === "In progress"
                    ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg"
                    : "bg-white/10 border-white/20 text-slate-400"
                  }`}
              >
                <Loader2 className="w-4 h-4" />
                In progress
              </button>

              <button
                type="button"
                onClick={() => setTaskStatus("Completed")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300
                              hover:scale-105 hover:shadow-xl hover:border-green-300
                ${taskStatus === "Completed"
                    ? "bg-green-500/30 border-green-400 text-green-200 shadow"
                    : "bg-green-500/15 border-green-400/40 text-green-200"
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                Completed
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-cyan-500 to-blue-600
                       hover:from-cyan-600 hover:to-blue-700 transition
                       disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Task Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailyTaskForm;
