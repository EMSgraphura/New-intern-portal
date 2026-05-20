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

// 🔒 Protected Routes - Only HR Manager and Admin can manage
router.post("/", verifyToken, verifyRole(["Admin", "HR Manager"]), createPlanner);
router.put("/:id", verifyToken, verifyRole(["Admin", "HR Manager"]), updatePlanner);
router.delete("/:id", verifyToken, verifyRole(["Admin", "HR Manager"]), deletePlanner);

export default router;
