import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  intern: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
  meetingDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave"],
    default: "Absent",
    required: true,
  },
  remarks: { type: String }, // Optional field (reason for leave, etc.)
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance