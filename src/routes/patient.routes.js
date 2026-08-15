import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createPatient);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
