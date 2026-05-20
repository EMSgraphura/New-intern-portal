import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (toEmail, subject, htmlContent, toName = "Candidate") => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Graphura", email: process.env.FROM_EMAIL },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Email send error:", error.response?.data || error.message);
  }
};
export const sendZeptoEmail = async (toEmail, subject, htmlContent, toName = "Candidate") => {
  try {
    const response = await axios.post(
      "https://api.zeptomail.in/v1.1/email",
      {
        from: {
          address: process.env.ZEPTOMAIL_SENDER_EMAIL,
          name: process.env.ZEPTOMAIL_SENDER_NAME || "Graphura"
        },
        to: [
          {
            email_address: {
              address: toEmail,
              name: toName
            }
          }
        ],
        subject: subject,
        htmlbody: htmlContent
      },
      {
        headers: {
          "Authorization": `Zoho-enczpt ${process.env.ZEPTOMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ ZeptoMail send error:", error.response?.data || error.message);
    throw error;
  }
};
