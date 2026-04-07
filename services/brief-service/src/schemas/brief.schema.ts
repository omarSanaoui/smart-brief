import { z } from "zod";

export const ProjectTypeEnum = z.enum(["WEB", "MOBILE", "DESKTOP", "UI_UX", "BRANDING", "OTHER"]);
export const BriefStatusEnum = z.enum(["PENDING", "ACCEPTED", "REFUSED", "IN_PROGRESS", "COMPLETED"]);

export const createBriefSchema = z.object({
    title: z.string().min(1, "Title is required"),
    projectType: ProjectTypeEnum,
    description: z.string().min(1, "Description is required"),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    budgetRange: z.string().min(1, "Budget range is required"),
    deadline: z.string().refine((str) => !isNaN(Date.parse(str)), "Invalid date format").transform((str) => new Date(str)),
    attachments: z.array(z.string()).optional().default([]),
});

export const updateBriefSchema = z.object({
    title: z.string().min(1).optional(),
    projectType: ProjectTypeEnum.optional(),
    description: z.string().min(1).optional(),
    features: z.array(z.string()).optional(),
    budgetRange: z.string().min(1).optional(),
    deadline: z.string().refine((str) => !isNaN(Date.parse(str)), "Invalid date format").transform((str) => new Date(str)).optional(),
    attachments: z.array(z.string()).optional(),
});

export const updateBriefStatusSchema = z.object({
    status: BriefStatusEnum,
    reason: z.string().optional(),
});

export const assignBriefSchema = z.object({
    employeeIds: z.array(z.string().uuid("Invalid employee ID format")).min(1, "At least one employee must be assigned"),
});
