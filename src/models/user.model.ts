import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import ms from "ms";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "viewer" | "analyst" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["viewer", "analyst", "admin"],
      default: "viewer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
function isValidExpiry(value: string): value is StringValue {
  return typeof ms(value as StringValue) === "number";
}
const rawExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const expiry: StringValue =
  rawExpiry && isValidExpiry(rawExpiry) ? rawExpiry : "1d";
userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: expiry,
    }
  );
};

const rawRefreshExpiry = process.env.REFRESH_TOKEN_EXPIRY;

const refreshExpiry: StringValue =
  rawRefreshExpiry && isValidExpiry(rawRefreshExpiry)
    ? rawRefreshExpiry
    : "10d";
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: refreshExpiry,
    }
  );
};
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>("User", userSchema);
