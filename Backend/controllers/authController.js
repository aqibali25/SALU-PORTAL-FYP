// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { Op } from "sequelize";             // <-- ✅ import Op from sequelize
import { User } from "../models/User.js";

// helper to sign JWT
function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, cnic, password, role = "user" } = req.body;

    const exists = await User.findOne({ where: { [Op.or]: [{ email }, { username }, { cnic }] } });
    if (exists) return res.status(409).json({ message: "Email/username/CNIC already in use" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, cnic, password_hash, role });

    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;

    // ✅ Correct operator usage
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
};
