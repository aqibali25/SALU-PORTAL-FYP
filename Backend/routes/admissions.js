// Backend/routes/admissions.js
import express from "express";
import {
  getAllAdmissions,
  getAdmissionById,
  viewDocument,
  updateEntryTestMarks,
  getAllEnrolledStudents,
  updateFormStatus,
  assignRollNo,
  assignTestRollNo,
} from "../controllers/admissionController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // if you have it

const router = express.Router();

// List forms (optionally filter by ?status=Pending|Approved|Rejected)
router.get("/", verifyToken, getAllAdmissions);
router.put("/updateMarks/:form_id", updateEntryTestMarks);
router.patch("/updateStatus/:form_id", updateFormStatus);
router.put("/assignRollNo/:form_id", assignRollNo);
router.put("/assignTestRollNo/:form_id", assignTestRollNo);

// Single form detail
router.get("/:id", verifyToken, getAdmissionById);
router.get("/enrolled/list", getAllEnrolledStudents);

// View document inline
router.get("/viewDocument/:id", viewDocument);

export default router;
