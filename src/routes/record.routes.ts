import { Router } from "express";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "../controllers/record.controller.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
// Create only admin
router.post("/", authorizeRoles("admin"), createRecord);

// Read raw records analyst and admin
router.get("/", authorizeRoles("analyst", "admin"), getRecords);

// Update
router.put("/:id", authorizeRoles("admin", "analyst", "viewer"), updateRecord);

// Delete
router.delete(
  "/:id",
  authorizeRoles("admin", "analyst", "viewer"),
  deleteRecord
);

export default router;
