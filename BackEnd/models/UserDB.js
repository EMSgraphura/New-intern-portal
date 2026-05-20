import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile:{
      type:String,
      require:true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "HR", "HR Manager"],
      default: "HR",
    },
    status:{
      type:String,
      enum:["Active", "Inactive"],
      default : "Active"
    }
  },
  { timestamps: true }
);

const UserDB = mongoose.model("User", userSchema);
export default UserDB;
