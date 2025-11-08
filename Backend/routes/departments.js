import { Router } from "express";
import {
  listDepartments,
  getDepartmentById,
  upsertDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

const router = Router();

router.get("/", listDepartments);
router.get("/:id", getDepartmentById);
router.post("/upsert", upsertDepartment);
router.delete("/:id", deleteDepartment);

export default router;
