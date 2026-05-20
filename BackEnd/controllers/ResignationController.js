import Resignation from "../models/ResignationDB.js";
import Intern from "../models/InternDatabase.js";
import { sendEmail } from "../config/emailConfig.js";

export const submitResignation = async (req, res) => {
  try {
    const {
      internId,
      resignationType,
      tasksCompleted,
      reason,
    } = req.body;

    if (!internId || !resignationType || !reason) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const intern = await Intern.findOne({ uniqueId: internId.trim() });

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found. Please check your Intern Unique ID.",
      });
    }

    const tasksDone =
      tasksCompleted === true || tasksCompleted === "true";

    if (!tasksDone) {
      return res.status(400).json({
        success: false,
        message: "All assigned tasks must be completed before resignation",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Evidence file is required",
      });
    }

    const existingResignation = await Resignation.findOne({
      internId,
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingResignation) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a resignation request",
      });
    }

    // ✅ BACKEND-CONTROLLED DATES
    const resignationRequestDate = new Date();

    const lastWorkingDate = new Date(resignationRequestDate);
    lastWorkingDate.setDate(lastWorkingDate.getDate() + 15);

    const resignation = new Resignation({
      intern: intern._id,
      internId,
      domain: intern.domain,
      resignationType,
      resignationRequestDate,
      lastWorkingDate,
      tasksCompleted: true,
      evidenceUrl: req.file.path,
      reason: reason.trim(),
      status: "Pending",
    });

    await resignation.save();

    return res.status(201).json({
      success: true,
      message: "🎉 Resignation submitted successfully",
    });
  } catch (error) {
    console.error("Resignation Submit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const acceptResignation = async (req, res) => {
  try {
    const { resignationId } = req.params;

    if (!resignationId) {
      return res.status(400).json({
        success: false,
        message: "Resignation ID is required",
      });
    }

    const resignation = await Resignation.findById(resignationId);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "Resignation not found",
      });
    }

    if (resignation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Resignation already ${resignation.status}`,
      });
    }

    resignation.status = "Approved";
    await resignation.save();

    const intern = await Intern.findOne({
      uniqueId: resignation.internId,
    });

    if (intern?.email) {
      const emailMsg = `
Dear ${intern.fullName},

We have reviewed your resignation application along with the submitted documents. We are pleased to inform you 
that the documents provided by you are complete and <strong>valid as per the internship resignation guidelines</strong>.
Accordingly, your resignation request has been <strong>officially approved</strong>, and your resignation process with
<strong>Graphura India Private Limited</strong> is now <strong>successfully completed</strong>.

No further action is required from your end.

We wish you all the very best for your future endeavors and professional growth.

Warm regards,
<strong>HR Team</strong>
<strong>Graphura India Private Limited</strong>
`;

      await sendEmail(
        intern.email,
        "Graphura | Resignation Approved",
        `<pre style="font-family:inherit;">${emailMsg}</pre>`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Resignation approved successfully",
    });

  } catch (error) {
    console.error("Accept Resignation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectResignation = async (req, res) => {
  try {
    const { resignationId } = req.params;

    if (!resignationId) {
      return res.status(400).json({
        success: false,
        message: "Resignation ID is required",
      });
    }

    const resignation = await Resignation.findById(resignationId);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "Resignation not found",
      });
    }

    if (resignation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Resignation already ${resignation.status}`,
      });
    }

    resignation.status = "Rejected";
    await resignation.save();

    const intern = await Intern.findOne({
      uniqueId: resignation.internId,
    });

    if (intern?.email) {
      const emailMsg = `
Dear ${intern.fullName},

We have reviewed your resignation application along with the documents submitted by you.
After careful verification, we regret to inform you that the submitted document 
<strong>does not meet the required authorization standards</strong> and <strong>does not comply 
with the resignation guidelines</strong> set by the internship policy. Due to this, your 
resignation request <strong>cannot be approved at this stage</strong>.

You are hereby informed that <strong>after receiving this email, you are provided with a final window of 24 hours</strong>
to take either one of the following actions:

    1 <strong>Resubmit the resignation document</strong> with all required details and proper authorization
    <strong>strictly as per the guidelines</strong>, OR
    2 <strong>Complete the applicable penalty payment</strong> as per the internship terms and conditions.

<strong>Penalty Payment Link:</strong> <a href="https://rzp.io/rzp/graphura-fee">https://rzp.io/rzp/graphura-fee</a>

Please note that if <strong>neither a valid document nor the penalty payment is completed within the given 24-hour time frame</strong>,
the matter will be <strong>escalated to your respective college/institution for further necessary action</strong>,
without any further communication.

This is a <strong>final opportunity</strong> to resolve the matter at your end.

Regards,
<strong>HR Team</strong>
<strong>Graphura India Private Limited</strong>
`;

      await sendEmail(
        intern.email,
        "Graphura | Resignation Rejected",
        `<pre style="font-family:inherit;">${emailMsg}</pre>`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Resignation rejected successfully",
    });

  } catch (error) {
    console.error("Reject Resignation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendPenaltyEmail = async (req, res) => {
  try {
    const { resignationId } = req.params;

    if (!resignationId) {
      return res.status(400).json({
        success: false,
        message: "Resignation ID is required",
      });
    }

    const resignation = await Resignation.findById(resignationId)
      .populate("intern", "fullName email mobile dob gender duration address");

    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "Resignation not found",
      });
    }

    if (!resignation.intern?.email) {
      return res.status(400).json({
        success: false,
        message: "Intern email not found",
      });
    }

    const emailMsg = `
Dear ${resignation.intern.fullName},

This is to inform you that your resignation application has been <strong>reviewed and rejected</strong> due to submission 
of <strong>unauthorized and non-compliant documents</strong>, which do not meet the <strong>resignation guidelines of the internship policy</strong>.

Despite being provided sufficient time, the <strong>submission deadline has now expired</strong>, and 
<strong>no valid or authorized document has been received</strong> from your side. As per the internship terms and conditions, this constitutes 
<strong>non-compliance with the resignation process</strong>.

Accordingly, you are now required to <strong>pay the applicable penalty fee</strong> to close your resignation formally.

<strong>Payment Deadline:</strong> Within 24 hours of receiving this email
<strong>Payment Link:</strong> <a href="https://rzp.io/rzp/graphura-fee">https://rzp.io/rzp/graphura-fee</a>

Please note that
<strong>failure to complete the payment within the above-mentioned time frame</strong> will result in 
<strong>escalation of this matter to your respective college/institution for further action</strong>, without any further notice. This is a 
<strong>final communication</strong> regarding this matter. We strongly advise you to <strong>resolve this immediately</strong> to avoid <strong>institutional involvement</strong>.

Regards,
<strong>HR Team</strong>
<strong>Graphura India Private Limited</strong>
`

    await sendEmail(
      resignation.intern.email,
      "Graphura | Penalty Notice – Action Required",
      `<pre style="font-family:inherit; white-space:pre-wrap;">${emailMsg}</pre>`
    );

    return res.status(200).json({
      success: true,
      message: "Penalty email sent successfully",
    });

  } catch (error) {
    console.error("Penalty Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const bulkDeleteResignations = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No resignation IDs provided",
      });
    }

    // ❌ Safety: prevent deleting pending resignations
    const pendingExists = await Resignation.exists({
      _id: { $in: ids },
      status: "Pending",
    });

    if (pendingExists) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete pending resignations",
      });
    }

    const result = await Resignation.deleteMany({
      _id: { $in: ids },
    });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Resignations deleted successfully",
    });

  } catch (error) {
    console.error("Bulk delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting resignations",
    });
  }
};