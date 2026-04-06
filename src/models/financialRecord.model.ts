import mongoose, { Document } from "mongoose";

export interface IFinancialRecord extends Document {
  user: mongoose.Types.ObjectId;

  amount: number;

  type: "income" | "expense";

  category: string;

  note?: string;

  date: Date;

  createdAt: Date;
  updatedAt: Date;
}

const financialRecordSchema = new mongoose.Schema<IFinancialRecord>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: [
        "salary",
        "food",
        "transport",
        "entertainment",
        "shopping",
        "health",
        "other",
      ],
      required: true,
      index: true,
    },

    note: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

financialRecordSchema.index({ user: 1, date: -1 });

financialRecordSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};
export const FinancialRecord = mongoose.model<IFinancialRecord>(
  "FinancialRecord",
  financialRecordSchema
);
