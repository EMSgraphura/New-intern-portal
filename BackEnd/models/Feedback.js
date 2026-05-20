import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Intern",  // Reference to your existing Intern model
    required: true
  },

  uniqueId: {
    type: String,
    required: true,
  },

  // Auto-fetched snapshot of inter info (so even if the intern record changes, feedback keeps original data)
  internDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    dob: { type: String, required: true },
  },

  // Internship info snapshot
  internshipInfo: {
    domain: { type: String, required: true },
    duration: { type: String, required: true },
    startMonth: { type: String, required: true },
    endMonth: { type: String, required: true },
    certificateNumber: { 
      type: String, 
    },
  },

  // Feedback section
  feedbackText: {
    type: String,
    required: true,
  },

  // Cloudinary URLs
  media: {
    photoUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
  },

  // Certificate status
  certificateStatus: {
    type: String,
    enum: ["pending", "issued", "rejected"],
    default: "pending",
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;