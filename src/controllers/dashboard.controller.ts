import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FinancialRecord } from "../models/financialRecord.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  const matchStage: any = {};

  if (req.user!.role === "viewer") {
    matchStage.user = new mongoose.Types.ObjectId(req.user!._id.toString());
  } else if (userId) {
    matchStage.user = new mongoose.Types.ObjectId(userId as string);
  }

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate as string);
    if (endDate) matchStage.date.$lte = new Date(endDate as string);
  }

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $facet: {
        typeSummary: [{ $group: { _id: "$type", total: { $sum: "$amount" } } }],
        categorySummary: [
          { $group: { _id: "$category", total: { $sum: "$amount" } } },
          { $sort: { total: -1 } },
        ],
      },
    },
  ]);

  const typeData = result[0].typeSummary;
  const categoryData = result[0].categorySummary;

  let income = 0;
  let expense = 0;

  typeData.forEach((item: any) => {
    if (item._id === "income") income = item.total;
    if (item._id === "expense") expense = item.total;
  });

  const netBalance = income - expense;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        income,
        expense,
        netBalance,
        categories: categoryData,
      },
      "Dashboard summary fetched successfully"
    )
  );
});

export const getTrends = asyncHandler(async (req, res) => {
  // 1. Strict TypeScript Extraction (Addresses Issue #3 & #5)
  const userId =
    typeof req.query.userId === "string" ? req.query.userId : undefined;
  const startDate =
    typeof req.query.startDate === "string" ? req.query.startDate : undefined;
  const endDate =
    typeof req.query.endDate === "string" ? req.query.endDate : undefined;

  const matchStage: any = {};

  // 2. Date Filtering
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  if (req.user!.role === "viewer") {
    matchStage.user = new mongoose.Types.ObjectId(req.user!._id.toString());
  } else if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userId format");
    }
    matchStage.user = new mongoose.Types.ObjectId(userId);
  }

  const trends = await FinancialRecord.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          month: "$_id.month",
        },
        data: {
          $push: {
            type: "$_id.type",
            total: "$total",
          },
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const formatted = trends.map((item) => {
    let income = 0;
    let expense = 0;

    item.data.forEach((d: any) => {
      if (d.type === "income") income = d.total;
      if (d.type === "expense") expense = d.total;
    });

    return {
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      income,
      expense,
      net: income - expense,
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Trends fetched successfully"));
});
