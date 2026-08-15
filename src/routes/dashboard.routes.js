import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/stats", getDashboardStats);

export default router;
