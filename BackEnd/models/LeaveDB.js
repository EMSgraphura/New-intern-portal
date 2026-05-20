import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
  },
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Intern",
    required: true
  },
  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });


const Leave = mongoose.model("Leaves", leaveSchema);
export default Leave;