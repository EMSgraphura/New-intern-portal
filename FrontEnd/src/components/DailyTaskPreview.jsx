import React from "react";
import {
    X,
    Clock,
    Calendar,
    FileText,
    User,
    Hash,
    ListChecks,
} from "lucide-react";

const DailyTaskPreview = ({ isOpen, onClose, tasks, internId }) => {
    if (!isOpen) return null;

    const internTasks = tasks
        .filter((t) => t.internId === internId)
        .sort((a, b) => new Date(b.taskDate) - new Date(a.taskDate));

    const intern = internTasks[0]?.intern;
    const totalTasks = internTasks.length;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative py-4 overflow-hidden max-h-[94vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute z-20 top-1 right-1 p-2 rounded-lg text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                    <X size={21} />
                </button>
                {/* ===== HAER (FIXED) ===== */}
                <div className="px-8 py-3 space-y-4 relative shrink-0 border-gray-200">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <span className="bg-violet-300/50 p-3 rounded-xl border border-violet-300">
                                <ListChecks size={22} />
                            </span>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Daily Task History
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5
              rounded-xl border border-gray-200 shadow-sm">
                            <span className="bg-blue-300/50 p-2 rounded-lg border border-blue-300">
                                <FileText size={16} />
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                                Total Tasks:
                            </span>
                            <span className="text-lg font-bold text-gray-800">
                                {totalTasks}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== BODY (SCROLLABLE) ====== */}
                <div className="px-8 py-4 space-y-4 overflow-y-auto flex-1">

                    {/* INTERN INFO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl p-4 border border-gray-200 shadow
              flex items-center gap-4 hover:scale-[1.01] transition-all cursor-pointer">
                            <span className="bg-emerald-300/50 p-3 rounded-xl border border-emerald-300">
                                <User size={18} />
                            </span>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    Intern Name
                                </p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {intern?.fullName || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl p-4 border border-gray-200 shadow
              flex items-center gap-4 hover:scale-[1.01] transition-all cursor-pointer">
                            <span className="bg-amber-300/50 p-3 rounded-xl border border-amber-300">
                                <Hash size={18} />
                            </span>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    Intern ID
                                </p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {internId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TASK LIST */}
                    {internTasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">
                            No tasks found for this intern
                        </p>
                    ) : (
                        internTasks.map((task) => (
                            <div
                                key={task._id}
                                className="border border-gray-200 rounded-2xl p-6 bg-white
                hover:scale-[1.01] transition shadow-sm space-y-5 cursor-pointer"
                            >
                                {/* TOP ROW */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-3 text-lg">
                                        <span className="bg-violet-300/50 p-3 rounded-xl border border-violet-300">
                                            <FileText size={18} />
                                        </span>
                                        {task.taskTitle}
                                    </h3>

                                    <span
                                        className={`px-4 py-1.5 text-xs font-semibold rounded-full border
                      ${task.taskStatus === "Completed"
                                                ? "bg-green-100 text-green-800 border-green-200"
                                                : "bg-amber-100 text-amber-800 border-amber-200"
                                            }`}
                                    >
                                        {task.taskStatus}
                                    </span>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4
                  text-sm text-gray-700 leading-relaxed">
                                    {task.taskDescription}
                                </div>

                                {/* META INFO */}
                                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                                    <span className="flex items-center gap-3">
                                        <span className="bg-blue-300/50 p-2 rounded-lg border border-blue-300">
                                            <Clock size={14} />
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            {task.hoursSpent} hours
                                        </span>
                                    </span>

                                    <span className="flex items-center gap-3">
                                        <span className="bg-purple-300/50 p-2 rounded-lg border border-purple-300">
                                            <Calendar size={14} />
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            {new Date(task.taskDate).toLocaleDateString()}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyTaskPreview;