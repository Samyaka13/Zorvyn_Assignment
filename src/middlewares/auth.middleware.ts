import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface JwtPayload {
  _id: string;
}

export const verifyJWT = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User is inactive");
    }

    // 🔥 attach user to request
    req.user = user;

    next();
  }
);
