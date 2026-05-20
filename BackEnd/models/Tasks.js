import mongoose from "mongoose"

const tasksSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        deadline: {
            type: Date,
            required: true
        },
        incharge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InternHead",
            required: true
        },
        delay: {
            type: String,
        },
        status: {
            type: String,
            enum: ["In Progress", "Completed"],
            default: "In Progress",
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Tasks", tasksSchema);