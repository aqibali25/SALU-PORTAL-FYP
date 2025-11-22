// Backend/routes/user.js
import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
  upsertUser,
  getMe,
  getAllUsers,
  deleteUser,
  uploadProfilePicture,
  changePassword,
  getProfileImage,
} from "../controllers/userController.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Create or update user
router.post("/upsert", verifyToken, upsertUser);

// Get current logged-in user
router.get("/me", verifyToken, getMe);

// Get all users
router.get("/", verifyToken, getAllUsers);

// Delete user
router.delete("/:id", verifyToken, deleteUser);

// Upload profile picture
router.post(
  "/upload-profile-picture",
  verifyToken,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// Change password
router.post("/change-password", verifyToken, changePassword);

// Get profile image
router.get("/profile-image", verifyToken, getProfileImage);

export default router;
