import express from "express";
const app = express();
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import ConnectDB from "./config/DB.js";
import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
import cors from "cors";

import { startInternshipCronJob } from "./CronJob/CalculateDuration.js";

// dotenv.config();


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// -------------------- HEALTH CHECK --------------------
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


// -------------------- ROUTES --------------------
import authRoutes from "./routers/AuthRoutes.js";
import internRoutes from "./routers/InternRoutes.js";
import hrRoutes from "./routers/HrRoutes.js";
import adminRoutes from "./routers/AdminRoutes.js";
import Incharge from "./routers/InchargeRoutes.js";
import Feedback from "./routers/FeedbackRoutes.js";
import ReviewTeam from "./routers/ReviewRouters.js";
import resignationRoutes from "./routers/ResignationRoutes.js"; // ✅ ADDED
import dailyTaskRoutes from "./routers/dailyTaskRoutes.js";
import projectRouter from "./routers/TaskRoutes.js";
import plannerRoutes from "./routers/PlannerRoutes.js";
// -------------------- DB CONNECTION --------------------
await ConnectDB();

// -------------------- REGISTER ROUTERS --------------------
app.use("/api", authRoutes);
app.use("/api", internRoutes);
app.use("/api", hrRoutes);
app.use("/api", adminRoutes);
app.use("/api", Incharge);
app.use("/api", Feedback);
app.use("/api", ReviewTeam);
app.use("/api", resignationRoutes); 
app.use("/api", dailyTaskRoutes);
app.use("/api", projectRouter);
app.use("/api/planner", plannerRoutes);
// -------------------- CRON JOB --------------------
startInternshipCronJob();

// -------------------- SERER --------------------
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
