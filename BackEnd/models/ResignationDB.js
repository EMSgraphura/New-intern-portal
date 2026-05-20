import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    intern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intern",
      required: true,
    },
    internId: {
      type: String,
      required: true
    },
    domain: {
      type: String,
      required: true,
    },
    resignationType: {
      type: String,
      required: true,
    },
    resignationRequestDate: {
      type: Date,
      required: true,
    },
    lastWorkingDate: {
      type: Date,
      required: true,
    },

    tasksCompleted: {
      type: Boolean,
      required: true,
    },

    evidenceUrl: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      minlength: 10,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resignation", resignationSchema);