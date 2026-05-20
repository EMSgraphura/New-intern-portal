import Intern from "../models/InternDatabase.js";
import { sendZeptoEmail, sendEmail } from "../config/emailConfig.js";
import InterviewInvite from "../models/InterviewInvite.js";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import * as fontkit from "fontkit";
import axios from "axios";

// ✅ Fetch all interns (with search, filter, pagination)
export const getAllInterns = async (req, res) => {
  try {
    const {
      search = "",
      status,
      performance,

    } = req.query;

    // ✅ Allowed status values
    const allowedStatuses = ["Applied", "Selected", "Rejected", "Active", "Inactive", "Terminated"];

    // 🧩 Build query efficiently
    const searchQuery = {};
    if (status) {
      if (allowedStatuses.includes(status)) {
        searchQuery.status = status;
      } else {
        searchQuery.status = { $in: allowedStatuses };
      }
    } else {
      // By default, exclude Active and Inactive interns unless they have a pending termination appeal
      searchQuery.$or = [
        { status: { $nin: ["Active", "Inactive"] } },
        { terminationAppeal: true }
      ];
    }

    // 🔍 Add search filter (only if not empty)
    if (search.trim()) {
      const regex = new RegExp(search, "i"); // faster and cleaner regex
      const searchFields = [
        { fullName: regex },
        { email: regex },
        { domain: regex },
        { college: regex },
        { course: regex },
        { educationLevel: regex },
        { uniqueId: regex },
        { mobile: regex },
      ];

      if (searchQuery.$or) {
        // Use $and to combine the default status exclusion with the search parameters to prevent clashing
        searchQuery.$and = [
          { $or: searchQuery.$or },
          { $or: searchFields }
        ];
        delete searchQuery.$or;
      } else {
        searchQuery.$or = searchFields;
      }
    }

    // 🎯 Add performance filter if provided
    if (performance) {
      searchQuery.performance = performance;
    }

    // ⚡ Fetch data efficiently using aggregation to include interview counts
    const interns = await Intern.aggregate([
      { $match: searchQuery },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "interviewinvites",
          localField: "email",
          foreignField: "candidates.email",
          as: "invites"
        }
      },
      {
        $addFields: {
          interviewCount: { $size: "$invites" }
        }
      },
      {
        $project: {
          invites: 0 // remove the temporary invites array
        }
      }
    ]);

    // ✅ Count total documents
    const total = await Intern.countDocuments(searchQuery);

    // 🚀 Respond with data
    res.status(200).json({
      success: true,
      total,
      interns,
    });
  } catch (error) {
    console.error("❌ Error fetching interns:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

export const getInternById = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: "Intern not found" });

    // ✅ Get full interview invites history for this intern
    const interviewHistory = await InterviewInvite.find({
      "candidates.email": intern.email
    }).populate("sender", "fullName role").sort({ createdAt: -1 });

    res.status(200).json({
      ...intern._doc,
      interviewCount: interviewHistory.length,
      interviewHistory
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const intern = await Intern.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!intern) return res.status(404).json({ message: "Intern not found" });

    res.status(200).json({ message: "Status updated successfully", intern });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Update intern performance
export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { performance } = req.body;
    const hrId = req.user.id; // assuming your auth middleware sets req.user

    const intern = await Intern.findByIdAndUpdate(
      id,
      {
        performance,
        updatedByHR: hrId, // track which HR updated performance
      },
      { new: true }
    ).populate("updatedByHR", "fullName email role"); // optional: show HR info

    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    res.status(200).json({
      message: "Performance updated successfully",
      intern,
    });
  } catch (err) {
    console.error("Error updating performance:", err);
    res.status(500).json({ message: "Failed to update performance" });
  }
};

// Update intern domain
export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain } = req.body;
    const intern = await Intern.findByIdAndUpdate(
      id,
      { domain },
      { new: true }
    );
    if (!intern) return res.status(404).json({ message: "Intern not found" });

    res.status(200).json({ message: "Domain updated successfully", intern });
  } catch (err) {
    console.error("Error updating domain:", err);
    res.status(500).json({ message: "Failed to update domain" });
  }
};

export const addHrComment = async (req, res) => {
  try {
    const { id } = req.params; // intern id
    const { text, stage } = req.body;
    const hrId = req.user?.id; // HR id from JWT (if using auth middleware)

    // Validate input
    if (!text || !stage) {
      return res
        .status(400)
        .json({ message: "Stage and comment text are required" });
    }

    // Find intern and push new HR comment
    const intern = await Intern.findByIdAndUpdate(
      id,
      {
        $push: {
          hrComments: {
            text,
            stage,
            commentedBy: hrId,
            date: new Date(),
          },
        },
        updatedByHR: hrId,
      },
      { new: true }
    )
      .populate("hrComments.commentedBy", "fullName email role")
      .populate("updatedByHR", "fullName email role");

    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    res.status(200).json({
      message: "HR comment added successfully",
      intern,
    });
  } catch (err) {
    console.error("Error adding HR comment:", err);
    res.status(500).json({ message: "Failed to add HR comment" });
  }
};

export const getHrComments = async (req, res) => {
  try {
    const { id } = req.params; // Intern ID

    // Find intern and populate HR comment authors
    const intern = await Intern.findById(id).populate(
      "hrComments.commentedBy",
      "fullName email role"
    );

    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    res.status(200).json({
      message: "HR comments fetched successfully",
      hrComments: intern.hrComments || [],
    });
  } catch (err) {
    console.error("Error fetching HR comments:", err);
    res.status(500).json({ message: "Failed to fetch HR comments" });
  }
};

export const deleteHrComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const hrId = req.user?.id; // Assuming JWT middleware provides logged-in HR ID

    // Find intern
    const intern = await Intern.findById(id);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    // Find the comment by its ID
    const comment = intern.hrComments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "HR comment not found" });
    }

    // Optional: Ensure only the HR who added it can delete
    if (comment.commentedBy.toString() !== hrId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment
    comment.deleteOne();

    await intern.save();

    res.status(200).json({ message: "HR comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting HR comment:", err);
    res.status(500).json({ message: "Failed to delete HR comment" });
  }
};

export const deleteRejectMany = async (req, res) => {
  try {
    const result = await Intern.deleteMany({ status: "Rejected" });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} rejected interns`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting rejected interns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete rejected interns",
    });
  }
};

export const ImportedIntern = async (req, res) => {
  try {
    // Check if the user has the required role
    if (req.user.role !== "Admin" && req.user.role !== "HR Manager") {
      return res.status(403).json({ message: "Access denied. Only HR Managers or Admins can import interns." });
    }
    const { interns } = req.body;

    if (!interns || !Array.isArray(interns) || interns.length === 0) {
      return res.status(400).json({
        message: "Invalid or empty data. Please provide an array of interns.",
      });
    }

    if (interns.length > 1000) {
      return res.status(400).json({
        message: "Too many records. Maximum 1000 records per import.",
      });
    }

    const results = {
      total: interns.length,
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
    };

    // ✅ Collect all emails and mobiles at once
    const allEmails = interns.map(i => i.email?.toString().trim().toLowerCase()).filter(Boolean);
    const allMobiles = interns.map(i => i.mobile?.toString().trim()).filter(Boolean);

    // ✅ Query DB once to find existing ones
    const existingInterns = await Intern.find({
      $or: [{ email: { $in: allEmails } }, { mobile: { $in: allMobiles } }]
    }).select("email mobile");

    const existingEmails = new Set(existingInterns.map(e => e.email));
    const existingMobiles = new Set(existingInterns.map(e => e.mobile));

    const seenEmails = new Set();
    const seenMobiles = new Set();
    const validDocs = [];

    const allowedDomains = [
      'Sales & Marketing',
      'Data Science & Analytics',
      'Email and Outreaching',
      'Content writing',
      'Human Resources',
      'Social Media Management',
      'Graphic Design',
      'Digital Marketing',
      'Video Editing',
      "Full Stack Development",
      "MERN Stack Development",
      'Content Creator',
      'UI/UX Designing',
      'Front-end Developer',
      'Back-end Developer'
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ✅ Validate all records locally (no DB call)
    for (const [index, internData] of interns.entries()) {
      try {
        const requiredFields = ['fullName', 'email', 'mobile', 'domain'];
        const missing = requiredFields.filter(f => !internData[f] || internData[f].toString().trim() === '');
        if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

        const email = internData.email.toString().trim().toLowerCase();
        const mobile = internData.mobile.toString().trim();

        if (!emailRegex.test(email)) throw new Error(`Invalid email format: ${email}`);
        if (mobile.length < 10) throw new Error(`Invalid mobile number: ${mobile}`);

        // Batch duplicate check
        if (seenEmails.has(email) || seenMobiles.has(mobile)) {
          results.duplicates++;
          throw new Error(`Duplicate entry in batch: ${email} / ${mobile}`);
        }

        // Database duplicate checkkk
        if (existingEmails.has(email) || existingMobiles.has(mobile)) {
          results.duplicates++;
          throw new Error(`Already exists in database: ${email} / ${mobile}`);
        }

        if (!allowedDomains.includes(internData.domain)) {
          throw new Error(`  domain Invalid: ${internData.domain}`);
        }



        // Prepre intern objectsss
        const internToSave = {
          fullName: internData.fullName.trim(),
          email,
          mobile,
          dob: internData.dob?.toString().trim() || '',
          gender: internData.gender?.toString().trim() || '',
          state: internData.state?.toString().trim() || '',
          city: internData.city?.toString().trim() || '',
          address: internData.address?.toString().trim() || '',
          pinCode: internData.pinCode?.toString().trim() || '',
          college: internData.college?.toString().trim() || '',
          course: internData.course?.toString().trim() || '',
          educationLevel: internData.educationLevel?.toString().trim() || '',
          domain: internData.domain.trim(),
          contactMethod: internData.contactMethod?.toString().trim() || 'Email',
          resumeUrl: internData.resumeUrl?.toString().trim() || '',
          duration: internData.duration?.toString().trim() || '',
          prevInternship: ['Yes', 'No'].includes(internData.prevInternship) ? internData.prevInternship : 'No',
          TpoName: internData.TpoName?.toString().trim() || '',
          TpoEmail: internData.TpoEmail?.toString().trim().toLowerCase() || '',
          TpoNumber: internData.TpoNumber?.toString().trim() || '',
          uniqueId: internData.uniqueId?.toString().trim() || '',
          joiningDate: internData.joiningDate?.toString().trim() || '',
          status:
            internData.uniqueId && internData.joiningDate ? 'Active' : 'Applied',
          performance:
            internData.uniqueId && internData.joiningDate ? 'Good' : 'Average',
          importedBy: req.user.id,
          importDate: new Date(),
          source: "import",
        };

        validDocs.push(internToSave);
        seenEmails.add(email);
        seenMobiles.add(mobile);
        results.success++;

      } catch (err) {
        results.failed++;
        results.errors.push(`Record ${index + 1}: ${err.message}`);
      }
    }

    // ✅ Bulk insert (1 DB call only)
    if (validDocs.length > 0) {
      await Intern.insertMany(validDocs, { ordered: false });
    }

    res.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed, ${results.duplicates} duplicates.`,
      summary: results,
      importedCount: results.success,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({
      message: "Failed to import interns: " + error.message,
    });
  }
};



// ✅ Send Interview Mail via ZeptoMail
export const sendInterviewMail = async (req, res) => {
  try {
    const { emails, interviewDate, interviewTime, meetingLink, domain } = req.body;

    // ✅ Access Control
    if (req.user.role !== "Admin" && req.user.role !== "HR Manager") {
      return res.status(403).json({ message: "Access denied. Only HR Managers or Admins can send interview mails." });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "No candidates selected." });
    }

    if (!interviewDate || !interviewTime || !meetingLink) {
      return res.status(400).json({ message: "Interview date, time, and meeting link are required." });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const candidateInvites = [];

    // ✅ Send emails to each candidate
    for (const email of emails) {
      try {
        const intern = await Intern.findOne({ email: email.trim().toLowerCase() });
        const candidateName = intern ? intern.fullName : "Candidate";

        const subject = `Interview Invitation – Graphura Internship Program | Graphura India Private Limited`;
        const htmlContent = `
          <div style="font-family: 'Outfit', 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 30px 20px; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <!-- Header / Brand -->
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; tracking-tight: -0.025em;">Graphura</h2>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin: 4px 0 0 0; font-weight: 700;">India Private Limited</p>
              <div style="height: 3px; background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899); margin-top: 15px; border-radius: 9999px;"></div>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">Dear <strong>${candidateName}</strong>,</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 12px;">We are pleased to inform you that you have been shortlisted for the interview round of the <strong>Graphura Internship Program</strong> at <strong>Graphura India Private Limited</strong>.</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">After reviewing your application submitted through our official platform, we found your profile suitable for the next stage and would like to connect with you for a brief interaction.</p>
            
            <!-- Interview Details Section -->
            <div style="background: linear-gradient(to bottom right, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin-top: 0; margin-bottom: 16px; color: #1e1b4b; font-size: 14px; font-weight: 800; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Interview Details:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 700; width: 120px; vertical-align: top; color: #475569;">Date:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${interviewDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 700; vertical-align: top; color: #475569;">Mode:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">Online (Google Meet)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 700; vertical-align: top; color: #475569;">Time:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${interviewTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 700; vertical-align: middle; color: #475569;">Meeting Link:</td>
                  <td style="padding: 8px 0;">
                    <a href="${meetingLink}" style="display: inline-block; padding: 6px 14px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 12px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15);">Join Google Meet</a>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- WhatsApp Coordination Section -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
              <div style="font-size: 14px; line-height: 1.6; color: #14532d;">
                <strong>Important Coordination:</strong> For real-time updates and seamless coordination, please join our official WhatsApp group:
                <div style="margin-top: 10px;">
                  <a href="https://chat.whatsapp.com/DbrUGgw4CBI1w4KNa8a1dH" style="display: inline-block; padding: 8px 16px; background-color: #22c55e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 12px; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.15);">Join WhatsApp Group</a>
                </div>
              </div>
            </div>
            
            <!-- Benefits Section -->
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; background-color: #faf5ff;">
              <h3 style="margin-top: 0; margin-bottom: 12px; color: #581c87; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Internship Benefits:</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.7; color: #581c87; font-weight: 600;">
                <li>Certificate of Completion</li>
                <li>Letter of Recommendation (based on performance)</li>
                <li>Pre-Placement Offer (PPO) opportunity for top performers</li>
                <li>Hands-on experience with live projects</li>
                <li>Flexible working hours (5-day working || 05PM - 09:00PM)</li>
                <li>Mentorship and guidance from experienced team members</li>
                <li>Opportunity to work across multiple domains (tech & non-tech)</li>
              </ul>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">The interview will be a short <strong>15–20 minute discussion</strong> focused on understanding your background, skills, interests, and motivation for applying. You may also share any projects, portfolios, or work samples during the interaction.</p>
            
            <!-- Guidelines Section -->
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
              <h4 style="margin-top: 0; margin-bottom: 8px; color: #78350f; font-size: 14px; font-weight: 800;">Kindly ensure that you:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #78350f; font-weight: 600;">
                <li>Join the meeting on time</li>
                <li>Have a stable internet connection</li>
                <li>Sit in a quiet environment</li>
              </ul>
            </div>
            
            <!-- Organization Websites -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #475569;">
              <strong>ℹOrganization Resources:</strong><br/>
              • Official Website: <a href="https://www.graphura.in" style="color: #4f46e5; text-decoration: none; font-weight: 600;">www.graphura.in</a><br/>
              • Internship Website: <a href="https://www.graphura.online" style="color: #4f46e5; text-decoration: none; font-weight: 600;">www.graphura.online</a>
            </div>

            <p style="font-size: 13.5px; line-height: 1.6; color: #475569; margin-bottom: 24px;">If you have any queries, feel free to reach out to us at <a href="mailto:hr@graphura.in" style="color: #4f46e5; text-decoration: none; font-weight: 600;">hr@graphura.in</a></p>

            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">We look forward to interacting with you.</p>
            
            <!-- Footer Sign-off -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; font-size: 13.5px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0; font-weight: 700; color: #1e293b;">Warm regards,</p>
              <p style="margin: 2px 0 0 0; font-weight: 800; color: #4f46e5;">HR Department</p>
              <p style="margin: 0; font-weight: 700; color: #0f172a;">Graphura India Private Limited</p>
            </div>
          </div>
        `;

        // ✅ Dynamic personalized email sending one-by-one
        if (process.env.ZEPTOMAIL_API_KEY && process.env.ZEPTOMAIL_SENDER_EMAIL) {
          await sendZeptoEmail(email, subject, htmlContent, candidateName);
        } else {
          await sendEmail(email, subject, htmlContent, candidateName);
        }

        results.success++;
        candidateInvites.push({ email, status: "Sent" });
      } catch (err) {
        results.failed++;
        results.errors.push(`${email}: ${err.message}`);
        candidateInvites.push({ email, status: "Failed" });
      }
    }

    // ✅ Save history to database (save even if failed for tracking/testing)
    await InterviewInvite.create({
      sender: req.user.id,
      candidates: candidateInvites,
      domain,
      interviewDate,
      interviewTime,
      meetingLink
    });

    res.status(200).json({
      message: `Emails sent successfully: ${results.success} sent, ${results.failed} failed.`,
      summary: results
    });

  } catch (error) {
    console.error("Interview Mail Error:", error);
    res.status(500).json({ message: "Failed to send interview emails." });
  }
};

// ✅ Fetch Interview Invite History
export const getInterviewHistory = async (req, res) => {
  try {
    // ✅ Access Control
    if (req.user.role !== "Admin" && req.user.role !== "HR Manager") {
      return res.status(403).json({ message: "Access denied. Only HR Managers or Admins can view history." });
    }

    const historyDocs = await InterviewInvite.find()
      .populate("sender", "fullName email role")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch candidate names based on emails
    const allEmails = [...new Set(historyDocs.flatMap(h => h.candidates.map(c => c.email)))];
    const interns = await Intern.find({ email: { $in: allEmails } }, 'email fullName').lean();

    const emailToNameMap = {};
    interns.forEach(intern => {
      emailToNameMap[intern.email] = intern.fullName;
    });

    const history = historyDocs.map(h => ({
      ...h,
      candidates: h.candidates.map(c => ({
        ...c,
        name: emailToNameMap[c.email] || "Unknown Candidate"
      }))
    }));

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ message: "Failed to fetch interview history." });
  }
};

// ✅ Terminate Candidate & Generate Termination Letter & Send Mail via Brevo
export const terminateIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const { terminationDate, reason } = req.body;

    // Access Control
    if (req.user.role !== "Admin" && req.user.role !== "HR Manager") {
      return res.status(403).json({ message: "Access denied. Only HR Managers or Admins can terminate interns." });
    }

    const intern = await Intern.findById(id);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found." });
    }

    const selectedReason = reason || "Performance issues";
    const selectedDate = terminationDate ? new Date(terminationDate) : new Date();

    // 1️⃣ PDF Generation setup
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const backgroundPath = path.join(
      process.cwd(),
      "public",
      "templates",
      "GRAPHURAOFFERLETTERS.png"
    );

    if (fs.existsSync(backgroundPath)) {
      const backgroundImageBytes = fs.readFileSync(backgroundPath);
      const backgroundImage = await pdfDoc.embedPng(backgroundImageBytes);
      page.drawImage(backgroundImage, {
        x: 0,
        y: 0,
        width: 595.28,
        height: 841.89,
      });
    }

    // Register fontkit and load Jost fonts
    pdfDoc.registerFontkit(fontkit);
    const jostRegularPath = path.join(process.cwd(), "public", "fonts", "Jost-Regular.ttf");
    const jostBoldPath = path.join(process.cwd(), "public", "fonts", "Jost-Bold.ttf");

    let font, fontBold;
    if (fs.existsSync(jostRegularPath) && fs.existsSync(jostBoldPath)) {
      font = await pdfDoc.embedFont(fs.readFileSync(jostRegularPath));
      fontBold = await pdfDoc.embedFont(fs.readFileSync(jostBoldPath));
    } else {
      font = await pdfDoc.embedFont("Helvetica");
      fontBold = await pdfDoc.embedFont("Helvetica-Bold");
    }

    const formattedTerminationDate = selectedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let y = 635;
    page.drawText("GRAPHURA INDIA PRIVATE LIMITED", {
      x: 60,
      y,
      size: 15,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    page.drawText("Gurgaon, Haryana.", {
      x: 60,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 60;
    page.drawText(`To,`, { x: 60, y, size: 13, font, color: rgb(0, 0, 0) });
    y -= 20;
    page.drawText(`${intern.fullName}`, {
      x: 60,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    page.drawText(`${intern.domain} Department`, {
      x: 60,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 40;
    page.drawText(
      "Subject: Notice of Termination of Internship",
      { x: 60, y, size: 13, font: fontBold, color: rgb(0, 0, 0) }
    );

    y -= 35;
    page.drawText(`Dear ${intern.fullName},`, {
      x: 60,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 20;
    const textLines = [
      `We regret to inform you that your internship at Graphura India Private Limited`,
      `is terminated, effective ${formattedTerminationDate}. This decision has been made`,
      `due to ${selectedReason.toLowerCase()}.`,
      "",
      `Please return any company materials or credentials currently in your possession.`,
      `Any pending payouts or clearances (if applicable) will be processed in due course`,
      `subject to completion of standard exit formalities.`,
      "",
      "We wish you the best in your future endeavors.",
    ];

    textLines.forEach((line) => {
      if (line === "") {
        y -= 10;
      } else {
        page.drawText(line, { x: 60, y, size: 13, font, color: rgb(0, 0, 0) });
        y -= 18;
      }
    });

    y -= 25;
    page.drawText("Thank you", { x: 60, y, size: 14, font: fontBold });
    y -= 15;
    page.drawText("Team Graphura.", { x: 60, y, size: 14, font: fontBold });

    if (intern.uniqueId) {
      y -= 70;
      page.drawText("Unique ID:", { x: 75, y, size: 14, font: fontBold });
      y -= 15;
      page.drawText(intern.uniqueId, { x: 75, y, size: 14, font: fontBold });
    }

    y -= 15;
    page.drawText("Date:", { x: 75, y, size: 14, font: fontBold });
    page.drawText(formattedTerminationDate, { x: 115, y, size: 14, font });

    const pdfBytes = await pdfDoc.save();
    const fileName = `TerminationLetter-${intern.fullName.replace(/\s+/g, "_")}.pdf`;

    // Email Body
    const emailText = `Dear ${intern.fullName},

We regret to inform you that your internship with Graphura India Private Limited is terminated, effective from ${formattedTerminationDate}.

This decision was made after careful review, on the grounds of: ${selectedReason}.

Please review the attached formal Letter of Termination for detailed information regarding your release and exit procedures. You are required to immediately return any company assets, projects, or credentials.

We thank you for your time and wish you the best for your career.

Best regards,
HR Management Team
Graphura India Private Limited
📧 Official@graphura.in
🌐 www.graphura.online
`;

    // 2️⃣ Send via Brevo API
    let emailSent = false;
    if (process.env.BREVO_API_KEY && process.env.FROM_EMAIL) {
      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: { name: "Graphura", email: process.env.FROM_EMAIL },
            to: [{ email: intern.email }],
            subject: "Internship Termination Notice – Graphura India Private Limited",
            htmlContent: `<pre style="font-family:inherit; white-space: pre-wrap;">${emailText}</pre>`,
            attachment: [
              {
                name: fileName,
                content: Buffer.from(pdfBytes).toString("base64"),
                type: "application/pdf",
                disposition: "attachment",
              },
            ],
          },
          {
            headers: {
              "api-key": process.env.BREVO_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        emailSent = true;
      } catch (emailError) {
        console.error("❌ Brevo termination email send error:", emailError.response?.data || emailError.message);
      }
    } else {
      console.warn("⚠️ Brevo credentials missing in .env. Skipping email sending.");
    }

    // 3️⃣ Update DB
    intern.status = "Rejected"; // set to Rejected status
    intern.performance = "Poor"; // typically poor performance for terminated
    intern.comment = `Terminated on ${formattedTerminationDate} due to ${selectedReason}.`;

    // Also push an HR Comment
    intern.hrComments.push({
      stage: "Selected",
      text: `Internship terminated on ${formattedTerminationDate}. Reason: ${selectedReason}. Letter sent via Brevo.`,
      commentedBy: req.user.id,
      date: new Date(),
    });

    await intern.save();

    res.status(200).json({
      success: true,
      message: `Intern terminated successfully. Letter generated and ${emailSent ? "sent via Brevo" : "saved in system"}.`,
      intern
    });

  } catch (error) {
    console.error("❌ Error in terminateIntern:", error);
    res.status(500).json({ message: "Internal server error. Failed to terminate candidate." });
  }
};

// ✅ Bulk Mark Inactive
export const bulkMarkInactive = async (req, res) => {
  try {
    const { internIds, comment } = req.body;
    if (!internIds || !Array.isArray(internIds) || internIds.length === 0) {
      return res.status(400).json({ error: "Intern IDs array is required" });
    }

    if (req.user.role !== "Admin" && req.user.role !== "HR Manager" && req.user.role !== "HR") {
      return res.status(403).json({ message: "Access denied. Only HR Managers, HRs, or Admins can perform bulk updates." });
    }

    const hrId = req.user.id;
    const note = comment || "Bulk marked as Inactive by HR Manager";

    await Intern.updateMany(
      { _id: { $in: internIds } },
      {
        $set: { status: "Inactive" },
        $push: {
          hrComments: {
            stage: "Selected",
            text: note,
            commentedBy: hrId,
            date: new Date(),
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully marked ${internIds.length} interns as Inactive.`,
    });
  } catch (error) {
    console.error("❌ Error in bulkMarkInactive:", error);
    res.status(500).json({ error: "Failed to mark interns as Inactive." });
  }
};

// ✅ Bulk Send Email via Brevo with Template Interpolation
export const bulkSendEmail = async (req, res) => {
  try {
    const { internIds, subject, htmlContent } = req.body;
    if (!internIds || !Array.isArray(internIds) || internIds.length === 0) {
      return res.status(400).json({ error: "Intern IDs array is required" });
    }
    if (!subject || !htmlContent) {
      return res.status(400).json({ error: "Subject and htmlContent are required" });
    }

    if (req.user.role !== "Admin" && req.user.role !== "HR Manager" && req.user.role !== "HR") {
      return res.status(403).json({ message: "Access denied. Only HR Managers, HRs, or Admins can send bulk emails." });
    }

    const interns = await Intern.find({ _id: { $in: internIds } });
    if (interns.length === 0) {
      return res.status(404).json({ error: "No interns found matching the provided IDs." });
    }

    const results = {
      successCount: 0,
      failedCount: 0,
      details: []
    };

    if (process.env.BREVO_API_KEY && process.env.FROM_EMAIL) {
      for (const intern of interns) {
        try {
          // Dynamic template variable replacements
          let personalizedBody = htmlContent
            .replace(/{{fullName}}/g, intern.fullName)
            .replace(/{{uniqueId}}/g, intern.uniqueId || "")
            .replace(/{{domain}}/g, intern.domain || "");

          await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
              sender: { name: "Graphura", email: process.env.FROM_EMAIL },
              to: [{ email: intern.email }],
              subject: subject,
              htmlContent: personalizedBody,
            },
            {
              headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
              },
            }
          );
          results.successCount++;
          results.details.push({ id: intern._id, email: intern.email, status: "sent" });
        } catch (err) {
          console.error(`❌ Bulk email failed for ${intern.email}:`, err.response?.data || err.message);
          results.failedCount++;
          results.details.push({ id: intern._id, email: intern.email, status: "failed", error: err.message });
        }
      }
    } else {
      return res.status(400).json({ error: "Brevo SMTP credentials are not configured in the server environment." });
    }

    res.status(200).json({
      success: true,
      message: `Bulk email process completed. Sent: ${results.successCount}, Failed: ${results.failedCount}`,
      results
    });
  } catch (error) {
    console.error("❌ Error in bulkSendEmail:", error);
    res.status(500).json({ error: "Failed to send bulk emails." });
  }
};




