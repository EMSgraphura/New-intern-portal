import mongoose from "mongoose";

const dailyTaskSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks"
    },
    intern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intern",
      required: true,
    },
    internId: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["Daily Update", "Project Update", "Other Update"],
      required: true
    },
    taskTitle: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    hoursSpent: {
      type: Number,
      required: true,
    },
    taskDate: {
      type: Date,
      required: true,
    },
    taskStatus: {
      type: String,
      default: "In progress"
    }
  },
  { timestamps: true }
);

export default mongoose.model("DailyTask", dailyTaskSchema);
