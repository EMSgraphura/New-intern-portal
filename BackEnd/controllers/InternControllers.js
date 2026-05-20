import Intern from '../models/InternDatabase.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from "../config/emailConfig.js"
import Setting from "../models/SettingDB.js"
import Performance from "../models/Performance.js"
import Leave from "../models/LeaveDB.js"
import InternHead from '../models/InternHead.js';
import Attendance from '../models/Attendance.js';
import { google } from 'googleapis';
import stream from 'stream';
import fs from 'fs';
import path from 'path';

// Drive is initialized fresh per request from credentials.json so that
// replacing credentials.json with a new file takes effect immediately
// without needing to restart the server.
function getDriveClient() {
  try {
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      console.warn('credentials.json not found. Google Drive upload is disabled.');
      return null;
    }
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to create Drive client:', error.message);
    return null;
  }
}

export const createIntern = async (req, res) => {
  try {
    const internData = req.body;
    console.log('Incoming Intern Data:', internData);

    // Explicitly validate all required fields to avoid Mongoose validation errors (500s)
    const requiredFields = [
      'fullName', 'email', 'mobile', 'dob', 'gender', 'aadharNumber',
      'currentAddress', 'currentState', 'currentCity', 'currentPinCode',
      'permanentAddress', 'permanentState', 'permanentCity', 'permanentPinCode',
      'college', 'course', 'educationLevel', 'domain', 'contactMethod', 'duration', 'prevInternship'
    ];

    const missingFields = requiredFields.filter(field => !internData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields 
      });
    }

    // Check for existing email or mobile
    const existingEmail = await Intern.findOne({ email: internData.email });
    if (existingEmail) return res.status(400).json({ message: "Application already applied" });

    const existingMobile = await Intern.findOne({ mobile: internData.mobile });
    if (existingMobile) return res.status(400).json({ message: "Application already applied" });

    let finalResumeUrl = internData.resumeUrl || "";
    const drive = getDriveClient();

    if (req.file && process.env.GOOGLE_DRIVE_FOLDER_ID) {
      if (!drive) {
        console.warn('Google Drive client unavailable – resume will be saved without a Drive link.');
        finalResumeUrl = '';
      } else {
        try {
          console.log('Starting Google Drive upload to folder:', process.env.GOOGLE_DRIVE_FOLDER_ID);
          const bufferStream = new stream.PassThrough();
          bufferStream.end(req.file.buffer);

          const response = await drive.files.create({
            requestBody: {
              name: `${internData.fullName}_Resume_${Date.now()}${path.extname(req.file.originalname)}`,
              parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            },
            media: {
              mimeType: req.file.mimetype,
              body: bufferStream,
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
            supportsTeamDrives: true,
          });

          console.log('File created on Drive. ID:', response.data.id);

          await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
            supportsAllDrives: true,
            supportsTeamDrives: true,
          });

          finalResumeUrl = response.data.webViewLink;
          console.log('Drive upload successful:', finalResumeUrl);
        } catch (uploadError) {
          // Log full error for debugging but do NOT store it as the resume URL.
          // The application is still saved; the admin can re-upload the resume manually.
          console.error('Google Drive Upload Error:', uploadError.message);
          console.error('Drive upload failed – likely invalid/expired credentials.json key. Please regenerate the service account key from GCP Console.');
          finalResumeUrl = '';
        }
      }
    }

    // Create new intern
    const newIntern = new Intern({
      fullName: internData.fullName,
      email: internData.email,
      mobile: internData.mobile,
      alternateMobile: internData.alternateMobile,
      dob: internData.dob,
      gender: internData.gender,
      apaarId: internData.apaarId,
      aadharNumber: internData.aadharNumber,
      currentAddress: internData.currentAddress,
      currentState: internData.currentState,
      currentCity: internData.currentCity,
      currentPinCode: internData.currentPinCode,
      permanentAddress: internData.permanentAddress,
      permanentState: internData.permanentState,
      permanentCity: internData.permanentCity,
      permanentPinCode: internData.permanentPinCode,
      latitude: internData.latitude,
      longitude: internData.longitude,
      ipAddress: (internData.ipAddress && internData.ipAddress !== "Detection Failed")
        ? internData.ipAddress
        : (req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || "").replace(/^.*:/, ''),
      college: internData.college,
      course: internData.course,
      educationLevel: internData.educationLevel,
      domain: internData.domain,
      contactMethod: internData.contactMethod,
      resumeUrl: finalResumeUrl,
      duration: internData.duration,
      prevInternship: internData.prevInternship || 'No',
      prevInternshipDesc: internData.prevInternshipDesc || '',
      TpoEmail: internData.TpoEmail,
      TpoNumber: internData.TpoNumber,
      TpoName: internData.TpoName,
      parentName: internData.parentName,
      parentNumber: internData.parentNumber,
      parentEmail: internData.parentEmail,
      parentAltNumber: internData.parentAltNumber,
      fingerprintRequestId: internData.fingerprintRequestId,
    });

    console.log("Preparing to save new intern to database...");
    await newIntern.save();
    console.log("Intern saved successfully.");

    // Email message (same as WhatsApp style)
    const emailMsg = `Dear ${newIntern.fullName},

Thank you for your interest in joining Graphura and submitting your application for the ${newIntern.domain} internship position.

📌 Internship Domain: ${newIntern.domain}
📌 Duration: ${newIntern.duration}

We have successfully received your application and our recruitment team will carefully review your qualifications. We appreciate the time and effort you've invested in your application.

You can expect to hear back from us within the next 2-3 business days regarding the status of your application.

Should you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
The Graphura Team
🌐 www.graphura.online`;

    try {
      await sendEmail(newIntern.email, "Graphura - Internship Application Received", `<pre style="font-family:inherit;">${emailMsg}</pre>`);
    } catch (emailErr) {
      console.error("Email dispatch failed:", emailErr.message);
    }

    res.status(201).json({ message: "Intern created successfully", intern: newIntern });

  } catch (error) {
    console.error('Error while creating intern:', error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getApplicationStatus = async (req, res) => {
  try {
    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create({ isApplicationOpen: true });
    }

    // Fetch the 4 most recent intern applications with limited fields for privacy
    const recentApplications = await Intern.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select("fullName domain status createdAt");

    res.status(200).json({
      success: true,
      isApplicationOpen: setting.isApplicationOpen,
      recentApplications: recentApplications || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching application status",
      error: error.message,
    });
  }
};

export const verifyIntern = async (req, res) => {
  try {
    const { uniqueId, joiningDate, email } = req.body;

    // 🔹 Validate inputs
    if (!uniqueId || !joiningDate || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔹 Helper to get UTC, Local, and India Standard Time date strings to prevent timezone mismatch errors
    const getFormattedDates = (dateObj) => {
      const d = new Date(dateObj);
      if (isNaN(d.getTime())) return [];
      const utcDate = d.toISOString().split("T")[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;
      
      // India Standard Time (IST) Date
      let istDate = null;
      try {
        istDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      } catch (e) {
        console.error("IST date format error:", e.message);
      }

      const results = [utcDate, localDate];
      if (istDate) results.push(istDate);
      return Array.from(new Set(results));
    };

    const inputDates = getFormattedDates(joiningDate);
    if (!inputDates.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid joining date format",
      });
    }

    // 🔹 Find intern by ID and email (case-insensitive for maximum reliability)
    console.log("🔍 [verifyIntern] Received inputs:", { uniqueId, joiningDate, email });
    console.log("🔍 [verifyIntern] Input Dates formatted:", inputDates);

    const escapeRegex = (string) => {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const interns = await Intern.find({
      uniqueId: { $regex: new RegExp(`^${escapeRegex(uniqueId.trim())}$`, "i") },
      email: { $regex: new RegExp(`^${escapeRegex(email.trim())}$`, "i") },
    });

    console.log(`🔍 [verifyIntern] Found ${interns.length} interns with both matching uniqueId & email.`);

    if (!interns.length) {
      // Diagnostic check to print what matched individually in the server console and return it to UI
      const matchedById = await Intern.find({ uniqueId: { $regex: new RegExp(`^${escapeRegex(uniqueId.trim())}$`, "i") } });
      const matchedByEmail = await Intern.find({ email: { $regex: new RegExp(`^${escapeRegex(email.trim())}$`, "i") } });
      console.log(`🔍 [verifyIntern] Diagnostics - matchedById count: ${matchedById.length}, matchedByEmail count: ${matchedByEmail.length}`);

      if (matchedById.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Unique ID matches a registered intern, but the email entered does not match our records.`,
        });
      } else if (matchedByEmail.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Email matches a registered intern, but the Unique ID entered does not match our records.`,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `No intern found matching the provided Unique ID and Email. Please double-check your credentials.`,
        });
      }
    }

    // 🔹 Match by joining date (timezone-robust check)
    const intern = interns.find((i) => {
      const dbDates = getFormattedDates(i.joiningDate);
      return dbDates.some(date => inputDates.includes(date));
    });

    if (!intern) {
      const allowedDates = interns.map(i => {
        const d = new Date(i.joiningDate);
        return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      });
      return res.status(404).json({
        success: false,
        message: `Intern found, but joining date does not match our records. Expected: ${allowedDates.join(" or ")}.`,
      });
    }

    // 🔹 Find performance data
    const performance = await Performance.findOne({ intern: intern._id });

    // 🔹 Fetch daily day-wise attendance records sorted chronologically
    const attendanceRecords = await Attendance.find({ intern: intern._id }).sort({ meetingDate: 1 });

    // 🔹 Prepare full response data
    const responseData = {
      fullName: intern.fullName,
      email: intern.email,
      mobile: intern.mobile,
      dob: intern.dob,
      joiningDate: intern.joiningDate,
      uniqueId: intern.uniqueId,
      college: intern.college,
      status: intern.status,
      course: intern.course,
      educationLevel: intern.educationLevel,
      domain: intern.domain,
      duration: intern.duration,
      totalMeetings: intern.totalMeetings || 0,
      meetingsAttended: intern.meetingsAttended || 0,
      certificateStatus: intern.certificateStatus || "not issued",
      certificateNumber: intern.certificateNumber || null,
      certificateIssuedAt: intern.certificateIssuedAt || null,
      performance: performance || { monthlyPerformance: [] },
      attendanceRecords: attendanceRecords || [],
    };

    // 🔹 Generate a short-lived secure token for daily attendance access to prevent URL leakage exploits
    const attendanceToken = jwt.sign(
      { 
        uniqueId: intern.uniqueId, 
        email: intern.email, 
        joiningDate: intern.joiningDate 
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "10m" } // Token strictly expires in 10 minutes
    );
    responseData.attendanceToken = attendanceToken;

    // 🔹 Send response (wrapped in object for frontend)
    return res.status(200).json({
      success: true,
      message: "Intern verified successfully",
      responseData,
    });
  } catch (error) {
    console.error("❌ Error verifying intern:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying intern",
    });
  }
};

export const verifyAttendanceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Secure session token is required to view attendance details."
      });
    }

    // Verify token cryptographically
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Verification session has expired or is invalid. Please verify the intern again at the portal."
      });
    }

    const { uniqueId, email, joiningDate } = decoded;

    // Find the intern and fetch performance and attendance data exactly as verifyIntern does
    const escapeRegex = (string) => {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const interns = await Intern.find({
      uniqueId: { $regex: new RegExp(`^${escapeRegex(uniqueId.trim())}$`, "i") },
      email: { $regex: new RegExp(`^${escapeRegex(email.trim())}$`, "i") },
    });

    if (!interns.length) {
      return res.status(404).json({
        success: false,
        message: "Intern registry match not found."
      });
    }

    // Timezone robust match
    const getFormattedDates = (dateObj) => {
      const d = new Date(dateObj);
      if (isNaN(d.getTime())) return [];
      const utcDate = d.toISOString().split("T")[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;
      let istDate = null;
      try {
        istDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      } catch (e) {}
      const results = [utcDate, localDate];
      if (istDate) results.push(istDate);
      return Array.from(new Set(results));
    };

    const inputDates = getFormattedDates(joiningDate);
    const intern = interns.find((i) => {
      const dbDates = getFormattedDates(i.joiningDate);
      return dbDates.some(date => inputDates.includes(date));
    });

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern date parameters mismatch."
      });
    }

    const performance = await Performance.findOne({ intern: intern._id });
    const attendanceRecords = await Attendance.find({ intern: intern._id }).sort({ meetingDate: 1 });

    const responseData = {
      fullName: intern.fullName,
      email: intern.email,
      mobile: intern.mobile,
      dob: intern.dob,
      joiningDate: intern.joiningDate,
      uniqueId: intern.uniqueId,
      college: intern.college,
      status: intern.status,
      course: intern.course,
      educationLevel: intern.educationLevel,
      domain: intern.domain,
      duration: intern.duration,
      totalMeetings: intern.totalMeetings || 0,
      meetingsAttended: intern.meetingsAttended || 0,
      certificateStatus: intern.certificateStatus || "not issued",
      certificateNumber: intern.certificateNumber || null,
      certificateIssuedAt: intern.certificateIssuedAt || null,
      performance: performance || { monthlyPerformance: [] },
      attendanceRecords: attendanceRecords || [],
    };

    return res.status(200).json({
      success: true,
      message: "Attendance session verified successfully",
      responseData
    });
  } catch (error) {
    console.error("❌ Error in verifyAttendanceToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during attendance verification."
    });
  }
};

export const LeaveApplication = async (req, res) => {
  try {
    const { internId, leaveType, startDate, endDate, reason, totalDays } = req.body;

    if (!internId || !leaveType || !startDate || !endDate || !reason || totalDays == null) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({
        error: "Reason must be at least 10 characters long",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Invalid date format",
      });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    if (totalDays <= 0) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    const intern = await Intern.findOne({ uniqueId: internId.trim() });

    if (!intern) {
      return res.status(404).json({
        error: "Intern ID not found",
      });
    }

    const overlappingLeave = await Leave.findOne({
      internId: intern._id,
      startDate: { $lte: end },
      endDate: { $gte: start },
      status: { $in: ["Pending", "Approved"] },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        error: "You already have a leave request in this date range",
      });
    }

    const leave = await Leave.create({
      uniqueId: intern.uniqueId,
      internId: intern._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      status: "Pending",
    });

    return res.status(201).json({
      message: "Leave application submitted successfully",
      leave,
    });

  } catch (error) {
    console.error("❌ Leave Application Error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const getInternIncharge = async (req, res) => {
  try {
    const { internId } = req.body;

    if (!internId) {
      return res.status(400).json({
        success: false,
        message: "Intern ID is required",
      });
    }

    // 1️⃣ Find Intern by uniqueId
    const intern = await Intern.findOne({ uniqueId: internId });

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found",
      });
    }

    // 2️⃣ Get intern domain
    const internDomain = intern.domain;

    if (!internDomain) {
      return res.status(404).json({
        success: false,
        message: "Intern domain not found",
      });
    }

    // 3️⃣ Find matching InternHead by department (EXCEPT "Core team")
    const incharge = await InternHead.findOne({
      departments: { $in: [internDomain] },
      fullName: { $ne: "Core team" }
    }).select("fullName email mobile departments status");

    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: "No incharge found for this intern domain",
      });
    }

    // 4️⃣ Success response
    return res.status(200).json({
      success: true,
      incharge,
    });

  } catch (error) {
    console.error("Get Intern Incharge Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getInternCities = async (req, res) => {
  try {
    const interns = await Intern.find({ status: { $in: ["Active", "Selected", "Applied"] } })
      .select("fullName currentCity currentState domain status");

    res.status(200).json({
      success: true,
      interns: interns || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching intern city distribution",
      error: error.message,
    });
  }
};
