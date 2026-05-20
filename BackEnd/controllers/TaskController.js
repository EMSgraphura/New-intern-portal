import Tasks from "../models/Tasks.js";
import DailyTask from "../models/DailyTask.js";
import InternHead from "../models/InternHead.js";

export const createTask = async (req, res) => {
    try {
        const { title, deadline } = req.body;

        // Basic validation
        if (!title || !deadline) {
            return res.status(400).json({
                success: false,
                message: "Title and deadline are required",
            });
        }

        // ✅ Get logged-in incharge from middleware
        const incharge = req.user;

        // (Optional safety check)
        if (!incharge || incharge.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized or inactive incharge",
            });
        }

        // ✅ Create Task with logged-in incharge
        const Task = await Tasks.create({
            title,
            deadline,
            incharge: incharge._id,
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            Task,
        });

    } catch (err) {
        console.error("Create Task Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create Task",
        });
    }
};

//get current incharge tasks
export const getCurrentInchargeTasks = async (req, res) => {
    try {
        // Logged-in incharge from middleware
        const inchargeId = req.user?._id;

        const tasks = await Tasks.find({ incharge: inchargeId })
            .populate("incharge", "fullName email departments status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });

    } catch (err) {
        console.error("Get Tasks Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Tasks",
        });
    }
};

// Get ALL tasks (Admin / Intern use)
export const getTasks = async (req, res) => {
    try {
        const tasks = await Tasks.find()
            .populate("incharge", "fullName email departments status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (err) {
        console.error("Get Tasks Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
        });
    }
};

// Bulk delete Tasks
export const bulkDeleteTasks = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                message: "No task IDs provided",
            });
        }

        const result = await Tasks.deleteMany({
            _id: { $in: ids },
        });
        await DailyTask.deleteMany({ task: { $in: ids } });

        return res.status(200).json({
            message: "Tasks deleted successfully",
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error("Bulk Delete Tasks Error:", err);
        return res.status(500).json({
            message: err.message || "Failed to delete tasks",
        });
    }
};

// controller for change task status
export const changeStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["In Progress", "Completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const task = await Tasks.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("incharge", "fullName email");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            task,
        });
    } catch (err) {
        console.error("Change Status Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to change task status",
        });
    }
};

//controller for update deadline
export const updateDeadline = async (req, res) => {
    try {
        const { deadline } = req.body;

        if (!deadline) {
            return res.status(400).json({ message: "Deadline required" });
        }

        const task = await Tasks.findByIdAndUpdate(
            req.params.id,
            { deadline },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//controller for change Incharge
export const changeIncharge = async (req, res) => {
    try {
        const { incharge } = req.body;

        const headExists = await InternHead.findById(incharge);
        if (!headExists) {
            return res.status(404).json({ message: "Intern Head not found" });
        }

        const task = await Tasks.findByIdAndUpdate(
            req.params.id,
            { incharge },
            { new: true }
        ).populate("incharge", "fullName email");

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//controller for update delay
export const updateTaskDelay = async (req, res) => {
    try {
        const task = await Tasks.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const today = new Date();
        const deadline = new Date(task.deadline);

        if (today > deadline) {
            const diffTime = today - deadline;
            const delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            task.delay = `${delayDays} days delayed`;
        } else {
            task.delay = "On Time";
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Incharge Heads
export const getInchargeHeads = async (req, res) => {
    try {
        const inchargeHeads = await InternHead.find({ status: "Active" })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inchargeHeads.length,
            data: inchargeHeads,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};