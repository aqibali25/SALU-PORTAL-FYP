// Backend/routes/subjectAllocation.js
import { Router } from "express";
import {
  listSubjectAllocations,
  getSubjectAllocation,
  createSubjectAllocation,
  updateSubjectAllocation,
  deleteSubjectAllocation,
} from "../controllers/subjectAllocationController.js";

const router = Router();

router.get("/", listSubjectAllocations);
router.get("/:saId", getSubjectAllocation);
router.post("/", createSubjectAllocation);
router.put("/:saId", updateSubjectAllocation);
router.delete("/:saId", deleteSubjectAllocation);

export default router;
