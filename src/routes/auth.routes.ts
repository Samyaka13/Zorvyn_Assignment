import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createEmployeeController } from "../controllers/employee.controller.js";
console.log("Auth routes loaded");
const router = Router();
//Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
//Protected Routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post(
  "/employees", 
  verifyJWT, 
  authorizeRoles("admin"), 
  createEmployeeController 
);

export default router;
