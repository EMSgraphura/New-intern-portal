import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    meetingTime: {
      type: String,
      required: true,
    },
    agenda: {
      type: String,
      default: "Weekly Sync",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Planner = mongoose.model("Planner", plannerSchema);
export default Planner;
