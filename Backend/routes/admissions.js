import express from "express";
import {
  getAllAdmissions,
  getAdmissionById,
  updateFormStatus,
  updateEntryTestMarks,
  getAllEnrolledStudents,
} from "../controllers/admissionController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // optional

const router = express.Router();

// 🧾 Get all admissions (optional ?status=Pending|Approved|Rejected)
router.get("/", verifyToken, getAllAdmissions);

// 🧾 Update entry test marks
router.put("/updateMarks/:form_id", updateEntryTestMarks);

// ✅ Update admission form status (for ReviewDocuments)
router.patch("/updateStatus/:form_id", updateFormStatus);

// 🧾 Get single admission by ID
router.get("/:id", verifyToken, getAdmissionById);

// 🧾 Get list of enrolled students
router.get("/enrolled/list", getAllEnrolledStudents);

export default router;
