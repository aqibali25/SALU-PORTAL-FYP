import { Router } from "express";
import { body } from "express-validator";
import { login, register } from "../controllers/authController.js";

const router = Router();

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

export default router;
