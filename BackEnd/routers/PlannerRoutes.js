import express from "express";
import { 
  getPlanner, 
  createPlanner, 
  updatePlanner, 
  deletePlanner 
} from "../controllers/PlannerControllers.js";
import { verifyToken, verifyRole } from "../middlewares/AuthVerify.js";

const router = express.Router();

// 🔓 Public Route - Everyone can view the planner
router.get("/", getPlanner);

// 🔒 Protected Routes - Only HR Manager, Admin, and Intern Head can manage
router.post("/", verifyToken, verifyRole(["Admin", "HR Manager", "HR", "InternHead", "InternIncharge"]), createPlanner);
router.put("/:id", verifyToken, verifyRole(["Admin", "HR Manager", "HR", "InternHead", "InternIncharge"]), updatePlanner);
router.delete("/:id", verifyToken, verifyRole(["Admin", "HR Manager", "HR", "InternHead", "InternIncharge"]), deletePlanner);

export default router;
