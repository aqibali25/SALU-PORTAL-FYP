import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getAllUsers } from "../controllers/userController.js";

const router = express.Router();

// ✅ GET all users (protected)
router.get("/", verifyToken, getAllUsers);

export default router;
