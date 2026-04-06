import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const authorizeRoles =
  (...allowedRoles: ("viewer" | "analyst" | "admin")[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: insufficient permissions");
    }

    next();
  };
