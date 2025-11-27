// routes/emailRoutes.js - HOSTINGER SOLUTION
import express from "express";
import nodemailer from "nodemailer";
import env from "dotenv";

env.config();

const router = express.Router();

const email = process.env.NOREPLY_EMAIL;
const emailPassword = process.env.NOREPLY_EMAIL_PASSWORD;

router.post("/send-credentials", async (req, res) => {
  try {
    const { to, studentName, rollNumber, password, department } = req.body;

    if (!to || !studentName || !rollNumber || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // HOSTINGER SMTP CONFIGURATION
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true, // true for port 465
      auth: {
        user: email,
        pass: emailPassword,
      },
    });

    console.log("🔧 Testing Hostinger connection...");
    await transporter.verify();
    console.log("✅ Hostinger connection verified!");

    const mailOptions = {
      from: `"SALU Ghotki Campus" <noreply@salu-gc.com>`,
      to: to,
      subject: "Your Student Portal Credentials",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to SALU Ghotki Campus!</h2>
          <p>Dear ${studentName},</p>
          <p>Your student account has been created successfully. Here are your login credentials:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Roll Number:</strong> ${rollNumber}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Department:</strong> ${department}</p>
          </div>
          
          <p><strong>Portal URL:</strong> http://localhost:5173/SALU-PORTAL-FYP/login</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              <strong>Important Security Notes:</strong><br>• Your Roll Number will be your username for login to Portal.<br>
              • This is an auto-generated email. Please do not reply.<br>
              • Keep your credentials secure and do not share them with anyone.<br>
              • Change your password after first login.<br>
              • If you didn't request this, please contact the administration immediately.
            </p>
          </div>
          
          <p>Best regards,<br>SALU GC Administration</p>
        </div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully! Message ID:", info.messageId);

    res.json({
      success: true,
      message: "Credentials email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

// Add this route to your existing emailRoutes.js file
router.post("/send-form-status", async (req, res) => {
  try {
    const { to, studentName, status, remarks, formId } = req.body;

    if (!to || !studentName || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, studentName, status",
      });
    }

    // HOSTINGER SMTP CONFIGURATION
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: emailPassword,
      },
    });

    console.log("🔧 Testing Hostinger connection for form status email...");
    await transporter.verify();
    console.log("✅ Hostinger connection verified!");

    // Email content based on status
    let subject = "";
    let statusMessage = "";
    let color = "";

    switch (status.toLowerCase()) {
      case "approved":
        subject = "Congratulations! Your Admission Form Has Been Approved";
        statusMessage = "Approved ✅";
        color = "#28a745";
        break;
      case "revert":
        subject = "Admission Form Requires Revision";
        statusMessage = "Reverted for Revision 🔄";
        color = "#ffc107";
        break;
      case "trash":
        subject = "Admission Form Status Update";
        statusMessage = "Rejected ❌";
        color = "#dc3545";
        break;
      default:
        subject = "Admission Form Status Update";
        statusMessage = status;
        color = "#6c757d";
    }

    const mailOptions = {
      from: `"SALU Ghotki Campus Admissions" <noreply@salu-gc.com>`,
      to: to,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Admission Form Status Update</h2>
          <p>Dear ${studentName},</p>
          <p>Your admission form has been reviewed by the admissions committee. Here is the current status:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
            <h3 style="color: ${color}; margin: 0 0 10px 0;">Status: ${statusMessage}</h3>
            ${formId ? `<p><strong>Form ID:</strong> ${formId}</p>` : ""}
            ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
          </div>

          ${
            status.toLowerCase() === "approved"
              ? `
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #155724; margin: 0 0 10px 0;">🎉 Congratulations!</h4>
            <p style="margin: 0;">Your admission form has been approved. You will receive further instructions regarding the next steps shortly.</p>
          </div>
          `
              : ""
          }

          ${
            status.toLowerCase() === "revert"
              ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #856404; margin: 0 0 10px 0;">📝 Action Required</h4>
            <p style="margin: 0;">Please review the remarks above and submit your form again with the required corrections.</p>
          </div>
          `
              : ""
          }

          ${
            status.toLowerCase() === "trash"
              ? `
          <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h4 style="color: #721c24; margin: 0 0 10px 0;">ℹ️ Important Notice</h4>
            <p style="margin: 0;">Your form has been rejected. Please contact the admissions office for more information or to discuss alternative options.</p>
          </div>
          `
              : ""
          }

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              <strong>Contact Information:</strong><br>
              SALU Ghotki Campus Admissions Office<br>
              Email: admissions@salu-gc.com<br>
              Phone: [Your Phone Number]
            </p>
          </div>
          
          <p>Best regards,<br>SALU Ghotki Campus Admissions Committee</p>
        </div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Form status email sent successfully! Message ID:",
      info.messageId
    );

    res.json({
      success: true,
      message: "Form status email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Error sending form status email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send form status email",
      error: error.message,
    });
  }
});

export default router;
