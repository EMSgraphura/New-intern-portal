import Planner from "../models/Planner.js";

// ✅ Create planner entries (Supports single or bulk)
export const createPlanner = async (req, res) => {
  try {
    const { entries } = req.body; // Expecting an array for bulk, or use fallback for single

    if (entries && Array.isArray(entries)) {
      const createdEntries = [];
      for (const entry of entries) {
        const { date, department, meetingTime, agenda } = entry;
        const dateObj = new Date(date);
        const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
        const year = dateObj.getFullYear().toString();

        const newEntry = await Planner.create({
          date,
          day,
          year,
          department,
          meetingTime,
          agenda,
          createdBy: req.user.id,
        });
        createdEntries.push(newEntry);
      }
      return res.status(201).json({ message: "Bulk entries created", entries: createdEntries });
    }

    // Fallback for single entry (existing logic)
    const { date, department, meetingTime, agenda } = req.body;
    if (!date || !department || !meetingTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dateObj = new Date(date);
    const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const year = dateObj.getFullYear().toString();

    const newEntry = await Planner.create({
      date,
      day,
      year,
      department,
      meetingTime,
      agenda,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Planner entry created", entry: newEntry });
  } catch (error) {
    res.status(500).json({ message: "Error creating planner", error: error.message });
  }
};

// ✅ Get all planner entries (Public)
export const getPlanner = async (req, res) => {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);

    // Automatically delete old past meetings (older than 5 days)
    await Planner.deleteMany({ date: { $lt: fiveDaysAgo } });

    const entries = await Planner.find()
      .populate("createdBy", "fullName")
      .sort({ date: 1 }); // Sort by date ascending

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching planner", error: error.message });
  }
};

// ✅ Update a planner entry (HR Manager/Admin)
export const updatePlanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, department, meetingTime, agenda } = req.body;

    const entry = await Planner.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    if (date) {
      const dateObj = new Date(date);
      entry.date = date;
      entry.day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
      entry.year = dateObj.getFullYear().toString();
    }
    
    if (department) entry.department = department;
    if (meetingTime) entry.meetingTime = meetingTime;
    if (agenda) entry.agenda = agenda;

    await entry.save();
    res.status(200).json({ message: "Planner entry updated", entry });
  } catch (error) {
    res.status(500).json({ message: "Error updating planner entry", error: error.message });
  }
};

// ✅ Delete a planner entry (HR Manager/Admin)
export const deletePlanner = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Planner.findByIdAndDelete(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting entry", error: error.message });
  }
};
