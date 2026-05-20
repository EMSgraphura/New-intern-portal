import Intern from '../models/InternDatabase.js'
import Feedback from '../models/Feedback.js'


export const getInternDetails = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    // 🔹 Find intern by uniqueId and filter only completed interns
    const intern = await Intern.findOne({ uniqueId, status: "Completed" });

    if (!intern) {
      return res.status(404).json({ success: false, message: "Completed intern not found" });
    }

    const existingFeedback = await Feedback.findOne({ uniqueId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: "Feedback has already given for this intern" });
    }

    // 🔹 Validate and convert joiningDate to Date
    if (!intern.joiningDate) {
      return res.status(400).json({ success: false, message: "Joining date is missing" });
    }

    const joining = new Date(intern.joiningDate);
    if (isNaN(joining.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid joining date format" });
    }

    // 🔹 Convert duration safely (handle "30 days" or "30" or "3 months" formats)
    let durationMonths = 0;
    if (intern.duration) {
      // Try to extract number from duration string
      const match = intern.duration.toString().match(/\d+/);
      durationMonths = match ? parseInt(match[0], 10) : 0;

      // If duration contains "month" or it's a small number, assume it's months
      // If it's a large number (like 90, 180), assume it's days and convert to months
      const durationStr = intern.duration.toString().toLowerCase();
      if (durationStr.includes('day') && durationMonths > 30) {
        // Convert days to approximate months (30 days per month)
        durationMonths = Math.round(durationMonths / 30);
      }
      // If it explicitly says months or is a small number, keep as months
      else if (durationStr.includes('month') || durationMonths <= 12) {
        // Already in months, no conversion needed
      }
      // Default: if number is large, assume days and convert to months
      else if (durationMonths > 31) {
        durationMonths = Math.round(durationMonths / 30);
      }
    }

    const extendedDays = intern.extendedDays ? parseInt(intern.extendedDays, 10) : 0;

    // 🔹 Calculate end date from joiningDate + duration (in months) + extendedDays (in days)
    const calculatedEndDate = new Date(joining);

    // Add months first
    calculatedEndDate.setMonth(calculatedEndDate.getMonth() + durationMonths);

    // Then add extended days
    calculatedEndDate.setDate(calculatedEndDate.getDate() + extendedDays);

    const endDateFormatted = calculatedEndDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get start and end month for display
    const startMonth = joining.toLocaleString('default', { month: 'long', year: 'numeric' });
    const endMonth = calculatedEndDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // ✅ Return intern data matching frontend expectations
    res.status(200).json({
      success: true,
      intern: {
        // Personal Information
        uniqueId: intern.uniqueId || '',
        fullName: intern.fullName || '',
        managerName: intern.TpoName || intern.managerName || '', // Use TpoName as managerName
        mobileNumber: intern.mobile || '',
        email: intern.email || '',
        state: intern.state || '',
        city: intern.city || '',

        // Internship Information
        domain: intern.domain || '',
        duration: `${durationMonths}`, // Return months as string for frontend
        extendedDays: extendedDays,
        startMonth: startMonth,
        endMonth: endMonth,

        // Additional Info (for display purposes)
        college: intern.college || '',
        course: intern.course || '',
        educationLevel: intern.edicationalLevel || '',
        performance: intern.performance || '',
        status: intern.status || '',
        endDate: endDateFormatted,
        joiningDate: intern.joiningDate || '',

        // For internship summary display
        totalDuration: durationMonths
      }
    });

  } catch (error) {
    console.error("❌ Error fetching intern details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching intern details",
      error: error.message,
    });
  }
};


// export class CertificateGenerator {
//   // 🆔 Generate auto-incremented certificate number (Fixed)
// static async generateCertificateNumber() {
//   try {
//     let newNumber;
//     let isDuplicate = true;

//     // Keep generating until a unique one is found
//     while (isDuplicate) {
//       // 🔹 Generate a random 9-digit number starting with 10016
//       const randomPart = Math.floor(10000 + Math.random() * 89999); // 5 random digits
//       newNumber = `10016${randomPart}`; // e.g. 1001653842 (total 9 digits)

//       // 🔍 Check in DB if it already exists
//       const existing = await Intern.findOne({ certificateNumber: newNumber });
//       if (!existing) isDuplicate = false;
//     }

//     console.log(`🆕 Generated unique 9-digit certificate number: ${newNumber}`);
//     return newNumber;
//   } catch (error) {
//     console.error("❌ Error generating certificate number:", error);
//     // Fallback — unique pattern
//     return `100${Date.now().toString().slice(-6)}`;
//   }
// }


//   // ✅ Check if certificate already exists
//   static async getExistingCertificate(internEmail) {
//     return await Intern.findOne({
//       email: internEmail,
//       certificateNumber: { $exists: true, $ne: null },
//     });
//   }

//   // 🎓 Generate certificate using stored PNG template
//   static async generateCertificate(internData) {
//     try {
//       if (!internData.certificateNumber) {
//         throw new Error("Certificate number is required but was not provided");
//       }

//       // ✅ Template path
//       const templatePath = path.join(process.cwd(), "public", "templates", "certificate-template.png");
//       if (!fs.existsSync(templatePath)) {
//         throw new Error(`Certificate template not found at: ${templatePath}`);
//       }
//       const templateImage = fs.readFileSync(templatePath);

//       // ✅ Load font
//       const fontPath = path.join(process.cwd(), "public", "fonts", "BerkshireSwash-Regular.ttf");
//       if (!fs.existsSync(fontPath)) {
//         throw new Error(`Font not found at: ${fontPath}`);
//       }
//       const pacificoFontBytes = fs.readFileSync(fontPath);

//       // ✅ Create PDF and register fontkit
//       const pdfDoc = await PDFDocument.create();
//       pdfDoc.registerFontkit(fontkit);

//       // ✅ Add page (A4 Landscape)
//       const page = pdfDoc.addPage([842, 595]);

//       // ✅ Embed background image
//       const image = await pdfDoc.embedPng(templateImage);
//       page.drawImage(image, {
//         x: 0,
//         y: 0,
//         width: 842,
//         height: 595,
//       });

//       // ✅ Embed fonts
//       const pacificoFont = await pdfDoc.embedFont(pacificoFontBytes);
//       const defaultFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//       // 1️⃣ Intern Name — Pacifico
//       const name = internData.fullName || "";
//       const nameWidth = this.getTextWidth(name, pacificoFont, 58);
//       page.drawText(name, {
//         x: 480 - nameWidth / 2,
//         y: 283,
//         size: 58,
//         font: pacificoFont,
//         color: rgb(0, 0, 0),
//       });

//       // 2️⃣ Completion Text — Default font
//       const completionText = `Has completed the internship program from ${internData.startMonth} to ${internData.endMonth} demonstrating exceptional dedication as an intern of the ${internData.domain} Department at Graphura India Private Limited.`;

//       const lines = this.splitTextIntoLines(completionText, defaultFont, 15, 500);
//       const lineHeight = 22;
//       const totalTextHeight = lines.length * lineHeight;
//       const startY = 272 - totalTextHeight / 2;

//       lines.forEach((line, index) => {
//         const lineWidth = this.getTextWidth(line, defaultFont, 15);
//         page.drawText(line, {
//           x: 490 - lineWidth / 2,
//           y: startY - index * lineHeight,
//           size: 15,
//           font: defaultFont,
//           color: rgb(0, 0, 0),
//         });
//       });

//       // 3️⃣ Certificate ID — Bold
//       page.drawText(`Certificate ID: ${internData.certificateNumber}`, {
//         x: 50,
//         y: 27,
//         size: 10,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       // 4️⃣ Unique ID — Bold
//       page.drawText(`Unique ID: ${internData.uniqueId || "GRAPH/GR/101"}`, {
//         x: 560,
//         y: 27,
//         size: 10,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       const pdfBytes = await pdfDoc.save();
//       return Buffer.from(pdfBytes);
//     } catch (error) {
//       console.error("❌ Certificate generation error:", error);
//       throw new Error(`Failed to generate certificate: ${error.message}`);
//     }
//   }

//   // Helper function to calculate text width
//   static getTextWidth(text, font, fontSize) {
//     return text.length * (fontSize * 0.6);
//   }

//   // Helper function to split long text into multiple lines
//   static splitTextIntoLines(text, font, fontSize, maxWidth) {
//     const words = text.split(" ");
//     const lines = [];
//     let currentLine = words[0];

//     for (let i = 1; i < words.length; i++) {
//       const word = words[i];
//       const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
//       if (width < maxWidth) {
//         currentLine += " " + word;
//       } else {
//         lines.push(currentLine);
//         currentLine = word;
//       }
//     }
//     lines.push(currentLine);
//     return lines;
//   }

//   // ✉️ Send certificate email
//   static async sendCertificateEmail(internEmail, internName, certificateBuffer, internData) {
//     try {
//       const subject = `🎓 Your Internship Completion Certificate - ${internName}`;
//       const certificateBase64 = certificateBuffer.toString("base64");

//       const htmlContent = `
// <!DOCTYPE html>
// <html>
// <head>
//   <style>
//     body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
//     .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
//     .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
//     .content { padding: 20px; }
//     .footer { text-align: center; padding: 20px; color: #666; }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <h2>🎓 Congratulations ${internName}!</h2>
//       <p>Your Internship Certificate is Ready</p>
//     </div>
//     <div class="content">
//       <p>Dear <strong>${internName}</strong>,</p>
//       <p>Congratulations on successfully completing your internship at <strong>Graphura India Pvt. Ltd.</strong></p>
//       <p>Your certificate is attached to this email. You can download and share it on professional platforms like LinkedIn.</p>
//       <ul>
//         <li>Certificate ID: ${internData.certificateNumber}</li>
//         <li>Unique ID: ${internData.uniqueId}</li>
//         <li>Domain: ${internData.domain}</li>
//         <li>Duration: ${internData.duration}</li>
//         <li>Period: ${internData.startMonth} to ${internData.endMonth}</li>
//       </ul>
//     </div>
//     <div class="footer">
//       <p>Best regards,<br>Team Graphura</p>
//     </div>
//   </div>
// </body>
// </html>`;

//       const emailData = {
//         sender: { name: "Graphura", email: process.env.FROM_EMAIL },
//         to: [{ email: internEmail }],
//         subject,
//         htmlContent,
//         attachment: [
//           {
//             name: `Certificate_${internName.replace(/\s+/g, "_")}.pdf`,
//             content: certificateBase64,
//           },
//         ],
//       };

//       const response = await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
//         headers: {
//           "api-key": process.env.BREVO_API_KEY,
//           "Content-Type": "application/json",
//         },
//       });

//       console.log("✅ Certificate email sent successfully");
//       return response.data;
//     } catch (error) {
//       console.error("❌ Email sending error:", error.response?.data || error.message);
//       throw new Error(`Failed to send certificate email: ${error.message}`);
//     }
//   }
// }







export const submitFeedback = async (req, res) => {
  try {
    const { uniqueId, feedbackText } = req.body;

    if (!uniqueId || !feedbackText) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // 🔹 Find completed intern
    const intern = await Intern.findOne({ uniqueId, status: "Completed" });
    if (!intern) {
      return res.status(404).json({ success: false, message: "Completed intern not found" });
    }

    // 🔹 Calculate duration and dates
    let durationMonths = 0;
    if (intern.duration) {
      const match = intern.duration.toString().match(/\d+/);
      durationMonths = match ? parseInt(match[0], 10) : 0;
    }

    const joining = new Date(intern.joiningDate);
    const endDate = new Date(joining);
    endDate.setMonth(joining.getMonth() + durationMonths);

    const startMonth = joining.toLocaleString("default", { month: "long", year: "numeric" });
    const endMonth = endDate.toLocaleString("default", { month: "long", year: "numeric" });

    // 🔹 Handle uploaded media
    const photoUrl = req.files?.photo ? req.files.photo[0].path : null;
    const videoUrl = req.files?.video ? req.files.video[0].path : null;

    if (!photoUrl || !videoUrl) {
      return res.status(400).json({ success: false, message: "Photo and video are required" });
    }

    // ✅ Create feedback entry
    const feedbackData = {
      intern: intern._id,
      uniqueId: intern.uniqueId,
      feedbackText,
      media: { photoUrl, videoUrl },
      internshipInfo: {
        domain: intern.domain,
        duration: `${durationMonths} months`,
        startMonth,
        endMonth,
      },
      internDetails: {
        fullName: intern.fullName,
        email: intern.email,
        mobile: intern.mobile,
        dob: intern.dob,
      },
    };

    await Feedback.create(feedbackData);

    // ✅ Success response (no certificate)
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
    });

  } catch (error) {
    console.error("❌ Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};









