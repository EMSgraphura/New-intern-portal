import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Intern",
    required: true
  },

  // 🔹 Array of months — one entr pe month
  monthlyPerformance: [
    {
      monthLabel: { type: String, required: true }, // e.g. "October 2025"

      // ✅ Task summary
      totalTasks: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },

      // ✅ Ratings (given by incharge)
      ratings: {
        initiative: { type: Number, min: 0, max: 10, default: 0 },
        communication: { type: Number, min: 0, max: 10, default: 0 },
        behaviour: { type: Number, min: 0, max: 10, default: 0 }
      },

      // ✅ Auto-calculated or manually given overall rating (0–10)
      overallRating: { type: Number, min: 0, max: 10, default: 0 },

      // ✅ Percentage of tasks completed
      completionPercentage: { type: Number, min: 0, max: 100, default: 0 },

      // ✅ Optional remarks
      inchargeRemarks: { type: String }
    }
  ]
}, { timestamps: true });

// 🔹 Auto-calculate overallRating and completionPercentage before saving
performanceSchema.pre("save", function (next) {
  this.monthlyPerformance.forEach(month => {
    // Auto-calculate overallRating if ratings exist
    const { initiative, communication, behaviour } = month.ratings;
    month.overallRating = parseFloat(((initiative + communication + behaviour) / 3).toFixed(1));

    // Auto-calculate task completion percentage
    if (month.totalTasks > 0) {
      month.completionPercentage = parseFloat(((month.tasksCompleted / month.totalTasks) * 100).toFixed(1));
    } else {
      month.completionPercentage = 0;
    }
  });
  next();
});

const Performance = mongoose.model("Performance", performanceSchema);
export default Performance;
