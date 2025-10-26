// Backend/routes/user.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upsertUser, getMe, getAllUsers, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Create or update user
router.post("/upsert", verifyToken, upsertUser);

// Get current logged-in user (for profile)
router.get("/me", verifyToken, getMe);

// GET /api/users
router.get("/", verifyToken, getAllUsers);

// ✅ Delete user by ID
router.delete("/:id", verifyToken, deleteUser);

export default router;
