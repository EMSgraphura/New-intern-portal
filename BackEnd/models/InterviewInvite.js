import mongoose from "mongoose";

const interviewInviteSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidates: [
      {
        email: { type: String, required: true },
        status: { type: String, default: "Sent" },
      },
    ],
    domain: {
      type: String,
      required: true,
    },
    interviewDate: {
      type: String,
      required: true,
    },
    interviewTime: {
      type: String,
      required: true,
    },
    meetingLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const InterviewInvite = mongoose.model("InterviewInvite", interviewInviteSchema);
export default InterviewInvite;
