import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export const CreateTask = ({ isOpen, onClose, fetchTasks }) => {
    const [title, setTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/api/create-task", {
                title,
                deadline,
            });
            fetchTasks();
            onClose();
            setTitle("");
            setDeadline("");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl relative px-6 py-10">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-lg
                     text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                    <X size={22} />
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Create Task
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Project Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:border-green-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Deadline
                        </label>
                        <input
                            type="date"
                            required
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:border-green-400 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl border border-gray-300
                         text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-xl bg-green-600
                         text-white font-medium hover:bg-green-700 cursor-pointer"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};