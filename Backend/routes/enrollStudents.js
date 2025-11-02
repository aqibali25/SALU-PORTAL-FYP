// Backend/routes/enrollStudents.js
import { Router } from "express";
import {
  getAllEnrollments,
  getEnrollmentById,
  saveStudentMarks,
  updateEnrollmentStatus,
} from "../controllers/enrollStudentsController.js";

const router = Router();

router.get("/", getAllEnrollments);
router.get("/:id", getEnrollmentById);
router.post("/marks", saveStudentMarks);
router.patch("/:id/status", updateEnrollmentStatus);

export default router;
