import express from "express";
import {
  getAllAdmissions,
  getAdmissionById,
  updateFormStatus,
  updateEntryTestMarks,
  getAllEnrolledStudents,
} from "../controllers/admissionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Keep order strict — specific routes first
router.get("/", verifyToken, getAllAdmissions);
router.put("/updateMarks/:form_id", updateEntryTestMarks);
router.patch("/updateStatus/:form_id", updateFormStatus);
router.get("/enrolled/list", getAllEnrolledStudents);
router.get("/:id", verifyToken, getAdmissionById); // must be last!

export default router;
