import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  isApplicationOpen: {
    type: Boolean,
    default: true,
  },
});

const Setting = mongoose.model("Setting",settingsSchema, "Setting" )

export default Setting