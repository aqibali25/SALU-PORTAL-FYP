// Backend/routes/subjects.js
import { Router } from "express";
import {
  listSubjects,
  getSubjectById,
  upsertSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = Router();

router.get("/", listSubjects);
router.get("/:id", getSubjectById);
router.post("/upsert", upsertSubject);
router.delete("/:id", deleteSubject);

export default router;
