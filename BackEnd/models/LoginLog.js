import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "HR", "InternIncharge", "ReviewTeam"],
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    ipAddress: { type: String, default: "Unknown", trim: true },
    deviceType: { type: String, default: "Unknown", trim: true },
    browserDetails: { type: String, default: "Unknown", trim: true },
    userAgent: { type: String, default: "Unknown", trim: true },
    loginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const LoginLog = mongoose.model("LoginLog", loginLogSchema);
export default LoginLog;
