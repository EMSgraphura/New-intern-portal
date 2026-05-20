import React, { useState, useEffect } from "react";
import { X, Search, CheckCircle, Clock, Folder, XCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AllTasksPreview = ({ isOpen, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [refreshing, setRefreshing] = useState(false);
    const [editingDeadlineId, setEditingDeadlineId] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/get-tasks");
            console.log(res);
            setTasks(res.data.tasks || []);
        } catch (err) {
            console.error("Fetch Tasks Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeadlineChange = async (taskId, newDeadline) => {

        // ✅ find existing task
        const currentTask = tasks.find(t => t._id === taskId);

        // compare only date part (important)
        const oldDate = currentTask?.deadline?.slice(0, 10);

        // ✅ if same date → skip API call
        if (oldDate === newDeadline) {
            setEditingDeadlineId(null);
            return;
        }

        try {
            await axios.patch(`/api/${taskId}/deadline`, {
                deadline: newDeadline,
            });

            setTasks(prev =>
                prev.map(t =>
                    t._id === taskId ? { ...t, deadline: newDeadline } : t
                )
            );

            setEditingDeadlineId(null);
            toast.success("Deadline updated");

        } catch (err) {
            console.error(err);
            toast.error("Failed to update deadline");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);
    useEffect(() => {
        setSelectedIds([]);
    }, [search, status]);

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
            status === "All" || task.status === status;

        return matchesSearch && matchesStatus;
    });

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
            setSelectedIds(filteredTasks.map((t) => t._id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm("Delete selected tasks?")) return;

        try {
            await axios.post("/api/tasks/bulk-delete", {
                ids: selectedIds,
            });

            setTasks((prev) => prev.filter((t) => !selectedIds.includes(t._id)));
            setSelectedIds([]);
            toast.success("Selected tasks deleted");
        } catch (err) {
            toast.error("Failed to delete tasks");
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.patch(`/api/tasks/${taskId}/status`, {
                status: newStatus,
            });

            setTasks((prev) =>
                prev.map((t) =>
                    t._id === taskId ? { ...t, status: newStatus } : t
                )
            );
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed flex items-center justify-center inset-0 bg-black/50 backdrop-blur-sm z-50">
            <div className="w-full max-w-5xl h-[95vh] p-6 bg-gray-50 rounded-2xl relative overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 rounded-lg
                     text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                    <X size={22} />
                </button>
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm flex flex-col gap-5 items-center justify-between">
                    <div className="w-full flex flex-col items-start justify-start">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Intern Task Management
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Manage and track intern daily tasks
                        </p>
                    </div>
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Total */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl cursor-pointer">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Folder size={16} className="text-blue-600" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Total
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {tasks.length}
                                    </p>
                                </div>
                            </div>

                            {/* In Progress */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl cursor-pointer">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock size={16} className="text-yellow-600" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        In Progress
                                    </p>
                                    <p className="text-sm font-bold text-yellow-700">
                                        {tasks.filter(t => t.status === "In Progress").length}
                                    </p>
                                </div>
                            </div>

                            {/* Completed */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl cursor-pointer">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={16} className="text-green-600" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Completed
                                    </p>
                                    <p className="text-sm font-bold text-green-700">
                                        {tasks.filter(t => t.status === "Completed").length}
                                    </p>
                                </div>
                            </div>

                        </div>
                        <div className="flex items-center gap-3">
                            {/* Refresh Button */}
                            <button
                                onClick={() => {
                                    setRefreshing(true);
                                    window.location.reload();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100
               rounded-xl transition cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <RefreshCw
                                        size={16}
                                        className={`text-green-600 ${refreshing ? "animate-spin" : ""}`}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-green-700">
                                    Refresh
                                </span>
                            </button>

                            {/* Delete Selected Button */}
                            <button
                                disabled={selectedIds.length === 0}
                                onClick={handleBulkDelete}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition
      ${selectedIds.length === 0
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-red-400 hover:bg-red-500 text-red-50 cursor-pointer"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center
        ${selectedIds.length === 0 ? "bg-gray-200" : "bg-red-300"}`}
                                >
                                    <XCircle
                                        size={16}
                                        className={`${selectedIds.length === 0 ? "text-gray-400" : "text-red-600"}`}
                                    />
                                </div>
                                <span className="text-sm font-semibold">
                                    Delete Selected
                                </span>
                            </button>

                        </div>
                    </div>
                </div>
                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-end">

                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by task title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="w-full md:w-64">
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   cursor-pointer transition"
                            >
                                <option value="All">All Status</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {filteredTasks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No interns data available
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Task</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Incharge</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Deadline</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filteredTasks.length > 0 &&
                                                    selectedIds.length === filteredTasks.length
                                                }
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 accent-blue-500 cursor-pointer"
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No tasks found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTasks.map((task) => (
                                            <tr
                                                key={task._id}
                                                className="border-b border-gray-300 hover:bg-gray-50 transition"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {task.title}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-700">
                                                            {task.incharge?.fullName || "—"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {task.incharge?.email}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">

                                                    {editingDeadlineId === task._id ? (

                                                        <input
                                                            type="date"
                                                            defaultValue={task.deadline?.slice(0, 10)}
                                                            autoFocus
                                                            onBlur={(e) =>
                                                                handleDeadlineChange(task._id, e.target.value)
                                                            }
                                                            className="border rounded px-2 py-1 focus:outline-red-500"
                                                        />

                                                    ) : (
                                                        <span
                                                            onClick={() => setEditingDeadlineId(task._id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-200 text-red-500 hover:bg-red-300 hover:shadow-sm transition cursor-pointer font-medium text-sm"
                                                            title="Click to edit deadline"
                                                        >
                                                            {new Date(task.deadline).toDateString()}
                                                            
                                                        </span>
                                                    )}

                                                </td>

                                                <td className="px-6 py-4">
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(task._id, e.target.value)
                                                        }
                                                        className={`h-8 px-3 rounded-full text-xs font-semibold cursor-pointer
                                                        border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-1
                                                        ${task.status === "Completed"
                                                                ? "bg-green-100 text-green-700 focus:ring-green-300"
                                                                : "bg-yellow-100 text-yellow-700 focus:ring-yellow-300"
                                                            }`}
                                                    >
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(task._id)}
                                                        onChange={() => toggleSelect(task._id)}
                                                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllTasksPreview;