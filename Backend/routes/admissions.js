// Backend/routes/admissions.js
import express from "express";
import { getAllAdmissions, getAdmissionById } from "../controllers/admissionController.js";
import { updateEntryTestMarks } from "../controllers/admissionController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // if you have it

const router = express.Router();

// List forms (optionally filter by ?status=Pending|Approved|Rejected)
router.get("/", verifyToken, getAllAdmissions);
router.put("/updateMarks/:form_id", updateEntryTestMarks);

// Single form detail
router.get("/:id", verifyToken, getAdmissionById);

export default router;
