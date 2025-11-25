import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Store used tokens to prevent reuse (in production, use Redis instead)
const usedTokens = new Set();

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    // Generate reset token with expiration
    const resetToken = jwt.sign(
      {
        userId: user.id,
        type: "password_reset",
        // Include password hash version to invalidate when password changes
        hashVersion: await bcrypt.hash(user.password_hash, 1),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // This will now work properly
    );

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/SALU-PORTAL-FYP/reset-password?token=${resetToken}&id=${user.id}`;

    // Send reset email
    await sendResetEmail(email, resetLink, user.username);

    res.json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
      error: error.message,
    });
  }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body;

    if (!token || !userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, user ID, and new password are required",
      });
    }

    // Check if token was already used
    if (usedTokens.has(token)) {
      return res.status(400).json({
        success: false,
        message: "This reset link has already been used",
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify token with proper error handling
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Additional security checks
      if (decoded.userId !== parseInt(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid token for this user",
        });
      }

      if (decoded.type !== "password_reset") {
        return res.status(400).json({
          success: false,
          message: "Invalid token type",
        });
      }

      // Mark token as used (prevents reuse)
      usedTokens.add(token);

      // Clean up old tokens periodically (optional)
      setTimeout(() => {
        usedTokens.delete(token);
      }, 2 * 60 * 60 * 1000); // Remove after 2 hours

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and increment token version
      user.password_hash = hashedPassword;
      user.token_version = (user.token_version || 0) + 1;
      await user.save();

      // Send confirmation email
      await sendPasswordChangedEmail(user.email, user.username);

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);

      if (tokenError.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "Reset link has expired. Please request a new one.",
        });
      }

      if (tokenError.name === "JsonWebTokenError") {
        return res.status(400).json({
          success: false,
          message: "Invalid reset token",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// Enhanced email function with expiration notice
const sendResetEmail = async (email, resetLink, username) => {
  try {
    console.log("🔧 Email Configuration Debug:");
    console.log("NOREPLY_EMAIL:", process.env.NOREPLY_EMAIL);
    console.log(
      "NOREPLY_EMAIL_PASSWORD exists:",
      !!process.env.NOREPLY_EMAIL_PASSWORD
    );

    if (!process.env.NOREPLY_EMAIL || !process.env.NOREPLY_EMAIL_PASSWORD) {
      throw new Error(
        "Email credentials are missing from environment variables"
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_EMAIL_PASSWORD,
      },
    });

    // Test connection
    await transporter.verify();
    console.log("✅ Email server connection verified");

    const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const formattedTime = expirationTime.toLocaleString();

    const mailOptions = {
      from: `"SALU Ghotki Campus" <${process.env.NOREPLY_EMAIL}>`,
      to: email,
      subject: "Reset Your SALU Portal Password - Link Expires in 1 Hour",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Dear ${username},</p>
          <p>We received a request to reset your password for your SALU Portal account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Your Password
            </a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              <strong>⚠️ Important Security Notice:</strong><br>
              • This link will expire on: <strong>${formattedTime}</strong><br>
              • This link can only be used <strong>ONCE</strong><br>
              • If you didn't request this reset, please ignore this email<br>
              • Your password will not change until you complete the reset process
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              <strong>Security Note:</strong> This is an auto-generated email. Please do not reply.
            </p>
          </div>
          
          <p>Best regards,<br>SALU GC Administration</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending reset email:", error);
    throw error;
  }
};

// Function to send password changed confirmation
const sendPasswordChangedEmail = async (email, username) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"SALU Ghotki Campus" <${process.env.NOREPLY_EMAIL}>`,
      to: email,
      subject: "Your Password Has Been Changed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Changed Successfully</h2>
          <p>Dear ${username},</p>
          <p>This is a confirmation that your SALU Portal password has been successfully changed.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>If you made this change:</strong></p>
            <p>No further action is required. You can now login with your new password.</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>If you didn't make this change:</strong></p>
            <p>Please contact the administration immediately as your account may be compromised.</p>
          </div>
          
          <p><strong>Portal URL:</strong> ${process.env.FRONTEND_URL}/SALU-PORTAL-FYP/login</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              <strong>Security Note:</strong> This is an auto-generated email. Please do not reply.
            </p>
          </div>
          
          <p>Best regards,<br>SALU GC Administration</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password changed confirmation sent to: ${email}`);
  } catch (error) {
    console.error("❌ Error sending password changed email:", error);
  }
};
