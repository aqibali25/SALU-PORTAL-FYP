// Backend/routes/admissions.js
import express from "express";
import { getAllAdmissions, getAdmissionByCnic } from "../controllers/admissionController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // if you have it

const router = express.Router();

// List forms (optionally filter by ?status=Pending|Approved|Rejected)
router.get("/", verifyToken, getAllAdmissions);



// Single form detail
//router.get("/:id", verifyToken, getAdmissionById);
router.get("/admissions/:cnic", getAdmissionByCnic);
export default router;
