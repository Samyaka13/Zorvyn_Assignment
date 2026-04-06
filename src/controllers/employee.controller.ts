// Add to controllers/auth.controller.ts
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. The Admin-Only Schema
export const createEmployeeSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters" }),
  email: z.email({ error: "Invalid email format" }).trim(),
  password: z.string().min(6, { error: "Password must be at least 6 characters" }),
  role: z.enum(["viewer", "analyst", "admin"], { error: "Invalid role" }) // 👈 Allowed here!
}).strict();

// 2. The Controller
export const createEmployeeController = asyncHandler(async (req, res) => {
  const parsed = createEmployeeSchema.safeParse(req.body);

  if (!parsed.success) {
    // In Zod v4, the error mapping is slightly updated, but this remains a safe way to grab the message
    throw new ApiError(400, parsed.error.message || "Invalid input");
  }

  const { name, email, password, role } = parsed.data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role, // Admin forces the role here!
  });

  const createdUser = user.toJSON();

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, `Employee (${role}) created successfully`));
});