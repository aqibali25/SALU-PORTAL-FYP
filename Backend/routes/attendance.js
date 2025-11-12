// Backend/routes/attendance.js
import express from "express";
import {
  createAttendance,
  getAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

// CREATE (Mark attendance)
router.post("/", createAttendance);

// READ (List attendance with filters)
router.get("/", getAttendance);

// UPDATE (Edit attendance)
router.put("/:attendance_id", updateAttendance);

export default router;
