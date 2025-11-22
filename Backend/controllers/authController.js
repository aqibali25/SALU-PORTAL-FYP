// Backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { User } from "../models/User.js";

// Helper to sign JWT with token version
function sign(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      tokenVersion: user.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, cnic, password, role = "user" } = req.body;

    const exists = await User.findOne({
      where: { [Op.or]: [{ email }, { username }, { cnic }] },
    });
    if (exists)
      return res
        .status(409)
        .json({ message: "Email/username/CNIC already in use" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      cnic,
      password_hash,
      role,
      token_version: 0,
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/auth/logout-all
export const logoutAllDevices = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Increment token version to invalidate all existing tokens
    user.token_version = user.token_version + 1;
    await user.save();

    res.json({
      message: "Logged out from all devices successfully.",
      logoutAll: true,
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/auth/token-info
export const getTokenInfo = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "token_version"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      userId: user.id,
      username: user.username,
      tokenVersion: user.token_version,
    });
  } catch (e) {
    next(e);
  }
};
