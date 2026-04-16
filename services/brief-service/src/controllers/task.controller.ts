import { Request, Response } from "express";
import { z } from "zod";
import * as taskService from "../services/taskService.js";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "../schemas/task.schema.js";
import type { AuthContext } from "../services/briefService.js";

const getAuth = (req: Request): AuthContext => (req as any).user;

export const getTasksHandler = async (req: Request, res: Response) => {
  try {
    const tasks = await taskService.getTasksByBrief(req.params.briefId);
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTaskHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const body = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(req.params.briefId, body);
    res.status(201).json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(error.message === "Brief not found" ? 404 : 500).json({ error: error.message });
  }
};

export const updateTaskHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const body = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(req.params.taskId, body);
    res.status(200).json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(error.message === "Task not found" ? 404 : 500).json({ error: error.message });
  }
};

export const updateTaskStatusHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "EMPLOYEE") return res.status(403).json({ error: "Forbidden" });

    const body = updateTaskStatusSchema.parse(req.body);
    const task = await taskService.updateTaskStatus(req.params.taskId, body.status, auth.userId);
    res.status(200).json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(error.message === "Forbidden" ? 403 : 404).json({ error: error.message });
  }
};

export const deleteTaskHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    await taskService.deleteTask(req.params.taskId);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.message === "Task not found" ? 404 : 500).json({ error: error.message });
  }
};
