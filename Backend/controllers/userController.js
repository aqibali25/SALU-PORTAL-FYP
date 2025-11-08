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

// ✅ DELETE user by ID or CNIC
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Try finding the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete from DB
    await user.destroy();

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};
