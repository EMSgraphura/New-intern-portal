import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URL);

const InternSchema = new mongoose.Schema({}, { strict: false });
const Intern = mongoose.model('Intern', InternSchema, 'interns');

async function run() {
  const all = await Intern.find({});
  console.log("All Interns:", JSON.stringify(all, null, 2));
  process.exit(0);
}
run();
