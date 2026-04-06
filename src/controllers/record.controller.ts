import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  FinancialRecord,
  type IFinancialRecord,
} from "../models/financialRecord.model.js";
import {
  createRecordSchema,
  updateRecordSchema,
} from "../validators/user.validator.js";
import type { FilterQuery } from "mongoose";

// CREATE RECORD
export const createRecord = asyncHandler(async (req, res) => {
  const parsed = createRecordSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, parsed.error.message);
  }

  const { amount, type, category, note, date } = parsed.data;

  const record = await FinancialRecord.create({
    user: req.user!._id,
    amount,
    type,
    category,
    note,
    date,
  });

  return res.status(201).json(new ApiResponse(201, record, "Record created"));
});

//GET RECORD
export const getRecords = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate as string) : null;
  const end = endDate ? new Date(endDate as string) : null;

  if (start && isNaN(start.getTime())) {
    throw new ApiError(400, "Invalid startDate");
  }

  if (end && isNaN(end.getTime())) {
    throw new ApiError(400, "Invalid endDate");
  }
  const allowedTypes = ["income", "expense"];
  const allowedCategories = [
    "salary",
    "food",
    "transport",
    "entertainment",
    "shopping",
    "health",
    "other",
  ];
  const filter: FilterQuery<IFinancialRecord> = {};

  if (req.query.userId) {
    filter.user = req.query.userId;
  }

  if (type && allowedTypes.includes(type as string)) {
    filter.type = type;
  }
  if (category && allowedCategories.includes(category as string)) {
    filter.category = category;
  }

  if (start || end) {
    filter.date = {};

    if (start) {
      filter.date.$gte = start;
    }

    if (end) {
      filter.date.$lte = end;
    }
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const records = await FinancialRecord.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
  const total = await FinancialRecord.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        records,
        page,
        limit,
        total,
      },
      "Records fetched"
    )
  );
});

//UPDATE RECORD
export const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const parsed = updateRecordSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, parsed.error.message);
  }

  const record = await FinancialRecord.findById(id);

  if (!record) {
    throw new ApiError(404, "Record not found or unauthorized");
  }

  if (
    record.user.toString() !== req.user!._id.toString() &&
    req.user!.role !== "admin"
  ) {
    throw new ApiError(403, "Forbidden: You can only update your own records");
  }
  const updatedRecord = await FinancialRecord.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true, runValidators: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, "Record updated successfully"));
});

//DELETE RECORD
export const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await FinancialRecord.findById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  if (
    record.user.toString() !== req.user!._id.toString() &&
    req.user!.role !== "admin"
  ) {
    throw new ApiError(403, "Forbidden: You can only delete your own records");
  }

  await record.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Record deleted successfully"));
});
