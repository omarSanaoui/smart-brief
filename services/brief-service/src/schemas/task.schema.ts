import { z } from "zod";

const dateString = z.string().refine((s) => !isNaN(Date.parse(s)), "Invalid date").transform((s) => new Date(s));

export const createTaskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  startDate: dateString,
  endDate: dateString,
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});
