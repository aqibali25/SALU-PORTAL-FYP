// Backend/routes/studentMarks.js
import { Router } from "express";
import {
  upsertStudentMarks,
  getStudentMarks,
  updateStudentMarks,
} from "../controllers/studentMarksController.js";

const router = Router();

// Create/Update by (roll+subject+semester+department)
router.post("/upsert", upsertStudentMarks);

// Read with filters
router.get("/", getStudentMarks);

// Update by mark_id
router.put("/:mark_id", updateStudentMarks);

export default router;
