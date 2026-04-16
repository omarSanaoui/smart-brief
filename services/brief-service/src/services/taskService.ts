import prisma from "../../db/prisma.js";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface CreateTaskInput {
  name: string;
  description: string;
  priority: Priority;
  startDate: Date;
  endDate: Date;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
}

export async function getTasksByBrief(briefId: string) {
  return prisma.task.findMany({
    where: { briefId },
    orderBy: { startDate: "asc" },
  });
}

export async function createTask(briefId: string, input: CreateTaskInput) {
  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) throw new Error("Brief not found");
  return prisma.task.create({ data: { briefId, ...input } });
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");
  return prisma.task.update({ where: { id: taskId }, data: input });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, employeeId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { brief: true },
  });
  if (!task) throw new Error("Task not found");
  if (!task.brief.assignedToIds.includes(employeeId)) throw new Error("Forbidden");
  return prisma.task.update({ where: { id: taskId }, data: { status } });
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");
  return prisma.task.delete({ where: { id: taskId } });
}
