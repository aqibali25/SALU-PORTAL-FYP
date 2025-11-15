// Backend/routes/studentMarks.js
import { Router } from "express";
import {
  upsertStudentMarks,
  getStudentMarks,
  getAllStudentMarks,
  getStudentMarksByRoll,
  updateStudentMarks,
} from "../controllers/studentMarksController.js";

const router = Router();

// Create/Update by (roll+subject+semester+department)
router.post("/upsert", upsertStudentMarks);

// Filtered get (supports ?roll_no= or ?rollNumber= etc.)
router.get("/", getStudentMarks);

// PURE full table
router.get("/all", getAllStudentMarks);

// Get only by roll number (all subjects/semesters)
router.get("/by-roll/:roll_no", getStudentMarksByRoll);

// Update by mark_id
router.put("/:mark_id", updateStudentMarks);

export default router;
