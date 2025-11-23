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

export default router;
