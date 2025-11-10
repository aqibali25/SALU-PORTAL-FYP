// Backend/routes/fees.js
import { Router } from "express";
import {
  upsertFee,
  getFees,
  getFeeById,
  getFeesByCnic,
} from "../controllers/feesController.js";

const router = Router();

// Create / Update
router.post("/upsert", upsertFee);

// Reads
router.get("/", getFees);
router.get("/:fee_id", getFeeById);
router.get("/byCnic/:cnic", getFeesByCnic);

export default router;
