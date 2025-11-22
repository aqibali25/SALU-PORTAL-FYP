// Backend/controllers/userController.js
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

/**
 * Create or update user based on CNIC.
 * If CNIC exists -> update existing user.
 * If CNIC not found -> insert new user.
 */
export const upsertUser = async (req, res) => {
  try {
    const { cnic, username, email, password, role, department } = req.body;

    if (!cnic || !username || !email || !role)
      return res.status(400).json({ message: "Missing required fields" });

    // Hash password if provided
    let passwordHash;
    if (password && password.trim() !== "") {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Find if user exists
    const existing = await User.findOne({ where: { cnic } });

    if (existing) {
      // Update existing user
      existing.username = username;
      existing.email = email;
      existing.role = role;
      existing.department = department;
      if (passwordHash) existing.password_hash = passwordHash;
      await existing.save();

      return res.status(200).json({ message: "User updated successfully" });
    }

    // Create new user
    await User.create({
      username,
      email,
      cnic,
      role,
      department,
      password_hash: passwordHash,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Upsert user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetch logged-in user info
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "username",
        "email",
        "cnic",
        "role",
        "department",
        "created_at",
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "cnic",
        "role",
        "department",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// ✅ DELETE user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};

// NEW API #1: Upload profile picture (BLOB)
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profile_image = req.file.buffer;
    await user.save();

    res.json({ message: "Profile picture updated successfully" });
  } catch (err) {
    console.error("uploadProfilePicture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// NEW API #2: Change password

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Both old and new password are required." });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match)
      return res.status(400).json({ message: "Old password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);

    // 👇 INCREMENT TOKEN VERSION TO LOGOUT ALL DEVICES
    user.password_hash = newHash;
    user.token_version = user.token_version + 1; // This invalidates all existing tokens
    await user.save();

    res.json({
      message:
        "Password changed successfully. You have been logged out of all devices.",
      logoutAll: true, // Flag to indicate logout all devices
    });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//NEW API #3: Get profile image (for display)
export const getProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user || !user.profile_image)
      return res.status(404).json({ message: "No profile picture found" });

    res.setHeader("Content-Type", "image/jpeg");
    res.send(user.profile_image);
  } catch (err) {
    console.error("getProfileImage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
