import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.email("Invalid email").trim(),

  password: z.string().min(6, "Password must be at least 6 characters"),
}).strict();

export const loginSchema = z.object({
  email: z.email("Invalid email format").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.enum([
    "salary",
    "food",
    "transport",
    "entertainment",
    "shopping",
    "health",
    "other",
  ]),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
});


export const createEmployeeSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters" }),
  email: z.email({ error: "Invalid email format" }).trim(),
  password: z.string().min(6, { error: "Password must be at least 6 characters" }),
  role: z.enum(["viewer", "analyst", "admin"], { error: "Invalid role" }) // 👈 Allowed here!
}).strict();
export const updateRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").optional(),
  type: z.enum(["income", "expense"]).optional(),
  category: z
    .enum([
      "salary",
      "food",
      "transport",
      "entertainment",
      "shopping",
      "health",
      "other",
    ])
    .optional(),
  note: z.string().trim().optional(),
  date: z.coerce.date().optional(), // Coerces valid date strings into Date objects
});
