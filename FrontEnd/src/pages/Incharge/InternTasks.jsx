import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"
import AllTasksPreview from "../../components/AllTasksPreview";
import {
  Inbox,
  Mail,
  Plus,
  Workflow,
  Phone,
  Clock,
  File,
  Search,
  RefreshCcw,
  XCircle,
  User,
} from "lucide-react";
import DailyTaskPreview from "../../components/DailyTaskPreview";
import { CreateTask } from "../../components/CreateTaskIncharge";

export default function InternTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterDomain, setFilterDomain] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [selectInternId, setSelectInternId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openTaskPreview, setOpenTaskPreview] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map((t) => t.internId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Delete selected tasks?")) return;

    try {
      await axios.post("/api/daily-tasks/bulk-delete", {
        ids: selectedIds,
      });

      setTasks((prev) => prev.filter((t) => !selectedIds.includes(t.internId)));
      setSelectedIds([]);
      toast.success("Selected tasks deleted");
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  useEffect(() => {
    fetchInchargeTasks();
  }, []);
  useEffect(() => {
    setSelectedIds([]);
  }, [search, filterDomain, filterStatus, sortOrder]);

  const fetchInchargeTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/incharge/daily-tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= COUNTS ================= */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.taskStatus === "Completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (t) => t.taskStatus === "In progress"
  ).length;

  /* ================= FILTER LOGIC ================= */
  const latestTasksPerIntern = Object.values(
    tasks.reduce((acc, task) => {
      const existing = acc[task.internId];

      if (
        !existing ||
        new Date(task.taskDate) > new Date(existing.taskDate)
      ) {
        acc[task.internId] = task;
      }

      return acc;
    }, {})
  );
  const filteredTasks = latestTasksPerIntern
    .filter((t) => {
      const q = search.toLowerCase();

      const matchesSearch =
        t.internId?.toLowerCase().includes(q) ||
        t.taskTitle?.toLowerCase().includes(q) ||
        t.intern?.fullName?.toLowerCase().includes(q);

      const matchesDomain =
        !filterDomain || t?.intern?.domain === filterDomain;

      const matchesStatus =
        !filterStatus || t.taskStatus === filterStatus;

      const matchesDuration =
        !filterDuration ||
        t?.intern?.duration?.includes(filterDuration);

      return (
        matchesSearch &&
        matchesDomain &&
        matchesStatus &&
        matchesDuration
      );
    })
    .sort((a, b) => {
      const d1 = new Date(a.taskDate);
      const d2 = new Date(b.taskDate);
      return sortOrder === "asc" ? d1 - d2 : d2 - d1;
    });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Daily Task Management
          </h1>
          <p className="text-gray-500">
            Reviewing {tasks.length} intern submissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInchargeTasks}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
          <button
            className="flex items-center gap-2 px-4 h-11 rounded-xl
                                bg-gradient-to-r from-red-500 via-red-600 to-orange-500
          
                                text-white font-medium shadow hover:opacity-90 transition cursor-pointer"
            onClick={() => setOpenCreateTask(true)}
          >
            <Plus className="text-gray-200" />Add Tasks
          </button>
          <button
            className="flex items-center gap-2 px-4 h-11 rounded-xl
                                bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-800
          
                                text-white font-medium shadow hover:opacity-90 transition cursor-pointer"
            onClick={() => setOpenTaskPreview(true)}
          >
            <Workflow className="text-gray-200" />All Tasks
          </button>
          <AllTasksPreview
            isOpen={openTaskPreview}
            onClose={() => setOpenTaskPreview(false)}
          />
          <button
            disabled={selectedIds.length === 0}
            onClick={handleBulkDelete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold
    ${selectedIds.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"}`}
          >
            <XCircle size={18} />
            Delete Selected
          </button>
          <CreateTask
            isOpen={openCreateTask}
            onClose={() => setOpenCreateTask(false)}
            fetchTasks={fetchInchargeTasks}
          />
        </div>
      </div>

      {/* ================= TASK STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* TOTAL */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">
              Total Tasks
            </p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {totalTasks}
            </h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
            <File size={26} className="text-white" />
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">
              In Progress
            </p>
            <h2 className="text-3xl font-bold text-yellow-600 mt-2">
              {inProgressTasks}
            </h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center">
            <Clock size={26} className="text-white" />
          </div>
        </div>

        {/* COMPLETED */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">
              Completed
            </p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {completedTasks}
            </h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center">
            <Inbox size={26} className="text-white" />
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <label className="text-md text-gray-500 font-semibold mb-4 block">
          Search & Filters
        </label>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* SEARCH */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search by Intern ID or Project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300/50
                         bg-gray-50 focus:bg-white focus:border-2 focus:border-green-300 outline-none"
            />
          </div>

          {/* SORT */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300/50 bg-gray-50
                       focus:bg-white focus:border-2 focus:border-green-300 outline-none"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* DOMAIN */}
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300/50 bg-gray-50
                       focus:bg-white focus:border-2 focus:border-green-300 outline-none"
          >
            <option value="">All Domains</option>
            {[
              "Sales & Marketing",
              "Data & AI Intelligence",
              "Human Resources",
              "Social Media Management",
              "Graphic Design",
              "Digital Marketing",
              "Video Editing",
              "Full Stack Development",
              "MERN Stack Development",
              "Email and Outreaching",
              "Content Writing",
              "Content Creator",
              "UI/UX Designing",
              "Front-end Developer",
              "Back-end Developer",
            ].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* STATUS */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300/50 bg-gray-50
                       focus:bg-white focus:border-2 focus:border-green-300 outline-none"
          >
            <option value="">All Status</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-gray-500">
            <Inbox size={32} className="mb-3 text-gray-400" />
            No daily tasks found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Intern</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Project & Deadline</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Task Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">View</th>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={
                        filteredTasks.length > 0 &&
                        selectedIds.length === filteredTasks.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task?.internId} className="hover:bg-gray-50">

                    {/* INTERN */}
                    <td className="px-6 py-5">
                      <div className="flex gap-4">
                        <div className="w-11 h-11 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {task?.intern?.fullName || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {task?.internId}
                          </p>
                          {task?.intern?.domain && (
                            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs
                                             bg-blue-100 text-blue-700 border border-blue-200">
                              {task?.intern?.domain}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-5 text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail size={16} /> {task?.intern?.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} /> {task?.intern?.mobile}
                      </div>
                    </td>
                    {/* PROJECT */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="font-semibold text-gray-800">
                          {task?.taskTitle}
                        </span>
                        <span className="inline-flex items-center gap-2 w-fit
                     px-4 py-2 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Clock size={12} />
                          {new Date(task?.task?.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold
                                       bg-green-100 text-green-800 border border-green-200">
                        {task?.taskStatus}
                      </span>
                    </td>

                    {/* HOURS */}
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold
                                       bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit">
                        <Clock size={14} /> {task?.hoursSpent}h
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {new Date(task?.taskDate).toLocaleDateString()}
                    </td>

                    {/* VIEW */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setSelectInternId(task?.internId)}
                        className="p-3 bg-amber-100 rounded-xl border border-amber-400 hover:scale-105 transition cursor-pointer"
                      >
                        <File size={18} className="text-amber-700" />
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(task?.internId)}
                        onChange={() => toggleSelect(task?.internId)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <DailyTaskPreview
                      isOpen={!!selectInternId}
                      onClose={() => setSelectInternId(null)}
                      tasks={tasks}
                      internId={selectInternId}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}