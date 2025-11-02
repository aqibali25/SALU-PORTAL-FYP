// Backend/routes/admissions.js
import { Router } from "express";
import {
  getAllAdmissions,
  getAdmissionById,
  getAcademicsById,
  getDocumentsById,
  updateEntryTestMarks,
  updateEntryTestMarksByEnroll,
  getAllEnrolledStudents,
  updateFormStatus,
} from "../controllers/admissionController.js";

const router = Router();

// lists & details
router.get("/", getAllAdmissions);
router.get("/:id", getAdmissionById);
router.get("/:id/academics", getAcademicsById);
router.get("/:id/documents", getDocumentsById);

// marks upserts
router.put("/updateMarks/:form_id", updateEntryTestMarks);             // expects personal_info.id
router.put("/updateMarksByEnroll/:enroll_id", updateEntryTestMarksByEnroll); // accepts enroll_students.enroll_id

// enroll_students listing
router.get("/enrolled/list", getAllEnrolledStudents);

// status-only (personal_info)
router.patch("/updateStatus/:form_id", updateFormStatus);

export default router;
