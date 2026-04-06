import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  loginSchema,
  registerUserSchema,
} from "../validators/user.validator.js";

// Generate Tokens
const generateTokens = async (user: any) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return { accessToken, refreshToken };
};

// Register
export const registerUser = asyncHandler(async (req, res) => {
  const parsed = registerUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, parsed.error.message);
  }

  const { name, email, password } = parsed.data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const createdUser = user.toJSON();

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

//  Login
export const loginUser = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, parsed.error.message);
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User is inactive");
  }

  const isValid = await user.isPasswordCorrect(password);

  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

//Logout
export const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Refresh Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { _id: string };

    const user = await User.findById(decoded._id);
    if (!user) throw new ApiError(401, "Invalid token");
    if (!user.isActive) {
      throw new ApiError(403, "User is inactive");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict" as const,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed")
      );
  } catch (error: any) {
    throw new ApiError(401, error.message || "Invalid token");
  }
});

// Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched"));
});
