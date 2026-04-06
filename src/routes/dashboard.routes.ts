import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { getSummary, getTrends } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles("analyst", "admin", "viewer"));

router.get("/summary", getSummary);

router.get("/trends", getTrends);

export default router;
