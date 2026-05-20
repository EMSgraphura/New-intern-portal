import express, { Router } from "express"
import { protectInternIncharge } from "../middlewares/InchargeMiddle.js";
import {
    createTask,
    getCurrentInchargeTasks,
    updateDeadline,
    updateTaskDelay,
    changeIncharge,
    getInchargeHeads,
    getTasks,
    bulkDeleteTasks,
    changeStatus
} from "../controllers/TaskController.js";

const taskRouter = express.Router();

taskRouter.post("/create-task", protectInternIncharge, createTask);
taskRouter.get("/get-tasks", protectInternIncharge, getCurrentInchargeTasks);
taskRouter.get("/get-all-tasks", getTasks);
taskRouter.patch("/:id/deadline", updateDeadline);
taskRouter.patch("/:id/incharge", changeIncharge);
taskRouter.patch("/:id/delay", updateTaskDelay);
taskRouter.get("/get-incharges", getInchargeHeads);
taskRouter.post("/tasks/bulk-delete", bulkDeleteTasks);
taskRouter.patch("/tasks/:id/status", changeStatus);

export default taskRouter