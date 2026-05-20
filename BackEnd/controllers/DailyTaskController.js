import DailyTask from "../models/DailyTask.js";
import Intern from "../models/InternDatabase.js";

export const createDailyTask = async (req, res) => {
    try {
        const { taskType, task, internId, taskTitle, taskDescription, hoursSpent, taskDate, taskStatus } = req.body;

        if (!taskType || !internId || !taskTitle || !taskDescription || !hoursSpent || !taskDate || !taskStatus) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const intern = await Intern.findOne({ uniqueId: internId });

        if (!intern) {
            return res.status(404).json({
                success: false,
                message: "Invalid Intern ID",
            });
        }

        const hours = Number(hoursSpent);
        if (Number.isNaN(hours) || hours < 0) {
            return res.status(400).json({ success: false, message: "Hours spent must be a non-negative number" });
        }

        const dailyTask = await DailyTask.create({
            task,
            taskType,
            intern: intern?._id,
            internId,
            taskTitle,
            taskDescription,
            hoursSpent,
            taskDate: new Date(taskDate),
            taskStatus
        });

        // 4️⃣ Success response
        return res.status(201).json({
            success: true,
            message: "Daily task submitted successfully",
            data: dailyTask,
        });

    } catch (error) {
        console.error("Create Daily Task Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while submitting daily task",
        });
    }
};

export const getAllDailyTasks = async (req, res) => {
    try {
        const tasks = await DailyTask.find()
            .populate("intern", "fullName deadline domain email mobile")
            .populate("task", "deadline incharge delay")
            .sort({ createdAt: -1 });

        return res.status(200).json(tasks);
    } catch (error) {
        console.error("Fetch Daily Tasks Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily tasks",
        });
    }
};

export const getAllInchargeDailyTasks = async (req, res) => {
    try {
        const inchargeId = req.user._id;

        const tasks = await DailyTask.find({
            task: { $exists: true, $ne: null }, // ✅ ONLY project tasks
        })
            .populate({
                path: "task",
                match: { incharge: inchargeId }, // ✅ ONLY this incharge's tasks
                select: "title deadline incharge delay status",
            })
            .populate("intern", "fullName email domain mobile")
            .sort({ createdAt: -1 });

        // 🔥 FINAL HARD FILTER (important)
        const filteredTasks = tasks.filter((t) => t.task !== null);

        return res.status(200).json(filteredTasks);
    } catch (error) {
        console.error("Fetch Daily Tasks Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily tasks",
        });
    }
};

export const bulkDeleteDailyTasks = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No task IDs provided",
            });
        }

        await DailyTask.deleteMany({ internId: { $in: ids } });

        return res.status(200).json({
            success: true,
            message: "Selected daily tasks deleted successfully",
        });
    } catch (error) {
        console.error("Bulk Delete Daily Tasks Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete selected daily tasks",
        });
    }
};