import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} from "../controllers/doctor.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createDoctor);
router.get("/", getDoctors);
router.get("/:id/patients", getDoctorPatients);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;
