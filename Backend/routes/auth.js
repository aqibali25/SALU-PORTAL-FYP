import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  register,
  logoutAllDevices,
  getTokenInfo,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post(
  "/register",
  [
    body("username").notEmpty(),
    body("email").isEmail(),
    body("cnic").matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/),
    body("password").isLength({ min: 6 }),
  ],
  register
);

router.post(
  "/login",
  [body("identifier").notEmpty(), body("password").notEmpty()],
  login
);

// Protected routes - require authentication
router.post("/logout-all", verifyToken, logoutAllDevices);
router.get("/token-info", verifyToken, getTokenInfo);

export default router;
