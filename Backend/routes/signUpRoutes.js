// Backend/routes/signUpRoutes.js
import express from "express";
import {
  getAllSignUps,
  getSignUpByCnic,
} from "../controllers/signUpController.js";
// agar JWT protected rakhna ho to ye middleware use kar sakte ho
// import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all (CNIC, EMAIL, FULLNAME)
router.get("/signups", getAllSignUps); // verifyToken lagaana ho to: [verifyToken, getAllSignUps]

// GET one by CNIC
router.get("/signups/:cnic", getSignUpByCnic); // yahan bhi verifyToken laga sakte ho

export default router;
