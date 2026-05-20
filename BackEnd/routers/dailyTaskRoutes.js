import express from "express";
import { createDailyTask, getAllDailyTasks, bulkDeleteDailyTasks, getAllInchargeDailyTasks } from "../controllers/DailyTaskController.js";
import { protectInternIncharge } from "../middlewares/InchargeMiddle.js";

const dailyTaskRoutes = express.Router();

//daily task routeshhhh
dailyTaskRoutes.post("/daily-tasks", createDailyTask);
dailyTaskRoutes.get("/daily-tasks", getAllDailyTasks);
dailyTaskRoutes.get("/incharge/daily-tasks", protectInternIncharge, getAllInchargeDailyTasks);
dailyTaskRoutes.post("/daily-tasks/bulk-delete", bulkDeleteDailyTasks);

export default dailyTaskRoutes;