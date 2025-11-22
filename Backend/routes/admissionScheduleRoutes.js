// routes/admissionScheduleRoutes.js
import express from "express";
import {
  createAdmissionSchedule,
  updateAdmissionSchedule,
  getAdmissionScheduleById,
  getAllAdmissionSchedules,
  deleteAdmissionSchedule,
  updateAdmissionScheduleStatus, // Add this import
} from "../controllers/admissionScheduleController.js";

const router = express.Router();

/* ------------- CREATE / UPDATE ------------- */

// POST  -> new schedule  (used by AdmissionSchedule.jsx for Add)
router.post("/admission-schedules/create", createAdmissionSchedule);

// PUT   -> update schedule (used by AdmissionSchedule.jsx for Edit)
router.put("/admission-schedules/update", updateAdmissionSchedule);

// PUT   -> update all statuses automatically (call this API without any data)
router.put("/admission-schedules/update-status", updateAdmissionScheduleStatus);

/* ------------- READ ------------- */

// GET all schedules (list page)
router.get("/admission-schedules", getAllAdmissionSchedules);

// GET single schedule by id (used when editing via URL)
router.get("/admission-schedules/:id", getAdmissionScheduleById);

/* ------------- DELETE ------------- */

// DELETE single schedule
router.delete("/admission-schedules/:id", deleteAdmissionSchedule);

export default router;
