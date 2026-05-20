import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URL);

const InternSchema = new mongoose.Schema({}, { strict: false });
const Intern = mongoose.model('Intern', InternSchema, 'interns');

async function run() {
  const all = await Intern.find({});
  const active = await Intern.find({ status: "Active" });
  console.log("Total Interns:", all.length);
  console.log("Active Interns:", active.length);
  process.exit(0);
}
run();
