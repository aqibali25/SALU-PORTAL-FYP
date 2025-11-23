// Backend/routes/timetableRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadTimeTable,
  getTimeTables,
  getTimeTableById,
  getTimeTableImage,
  deleteTimeTable,
} from "../controllers/timeTableController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// store file in memory → we put buffer into MySQL LONG BLOB
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/timetable/upload
 * Used by FileUploadOverlay.jsx
 */
router.post(
  "/timetable/upload",
  verifyToken,
  upload.single("timetable_image"),
  uploadTimeTable
);

/**
 * GET /api/timetable
 * Optional filters via query: department, semester, year
 */
router.get("/timetable", verifyToken, getTimeTables);

/**
 * GET /api/timetable/:id
 * Returns single row metadata (no blob)
 */
router.get("/timetable/:id", verifyToken, getTimeTableById);

/**
 * GET /api/timetable/:id/image
 * Streams the image/blob
 */
router.get("/timetable/:id/image", verifyToken, getTimeTableImage);

/**
 * DELETE /api/timetable/:id
 * Delete one timetable record
 */
router.delete("/timetable/:id", verifyToken, deleteTimeTable);

export default router;
