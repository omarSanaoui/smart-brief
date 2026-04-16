import prisma from "../../db/prisma.js";

export type UserRole = "ADMIN" | "CLIENT" | "EMPLOYEE";
export type ProjectType = "SITE_WEB" | "SEO" | "GOOGLE_ADS" | "SOCIAL_MEDIA" | "PHOTO_VIDEO" | "EMAIL_MARKETING" | "COMMUNITY_MANAGER" | "BRANDING" | "OTHER";
export type BriefStatus = "PENDING" | "ACCEPTED" | "REFUSED" | "IN_PROGRESS" | "COMPLETED";

export interface AuthContext {
  userId: string;
  role: UserRole;
}

export interface CreateBriefInput {
  title: string;
  projectType: ProjectType;
  description: string;
  features: string[];
  budgetRange: string;
  deadline: Date;
  attachments: string[];
}

export interface UpdateBriefInput {
  title?: string;
  projectType?: ProjectType;
  description?: string;
  features?: string[];
  budgetRange?: string;
  deadline?: Date;
  attachments?: string[];
}

const EDITABLE_BY_CLIENT: BriefStatus[] = ["PENDING"];
const EMPLOYEE_ALLOWED_STATUS: BriefStatus[] = ["IN_PROGRESS", "COMPLETED"];

export async function createBrief(clientId: string, input: CreateBriefInput) {
  // console.log("Creating brief with clientId:", clientId, "input:", input);
  const result = await prisma.brief.create({ data: { clientId, ...input } });
  // console.log("Brief created:", result);
  return result;
}

export async function getClientBriefs(clientId: string) {
  return prisma.brief.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateClientBrief(clientId: string, briefId: string, input: UpdateBriefInput) {
  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) throw new Error("Brief not found");
  if (brief.clientId !== clientId) throw new Error("Forbidden");
  if (!EDITABLE_BY_CLIENT.includes(brief.status as BriefStatus)) throw new Error("Brief cannot be edited in current status");

  return prisma.brief.update({ where: { id: briefId }, data: input });
}

export async function getAllBriefs() {
  return prisma.brief.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateBriefStatus(briefId: string, status: BriefStatus, adminId: string, reason?: string) {
  return prisma.brief.update({
    where: { id: briefId },
    data: {
      status,
      statusReason: reason?.trim() || null,
      statusUpdatedById: adminId,
      statusUpdatedAt: new Date(),
    },
  });
}

export async function assignBrief(briefId: string, employeeIds: string[], adminId: string) {
  return prisma.brief.update({
    where: { id: briefId },
    data: {
      assignedToIds: employeeIds,
      assignedById: adminId,
      assignedAt: new Date(),
      status: "IN_PROGRESS",
      statusUpdatedById: adminId,
      statusUpdatedAt: new Date(),
    },
  });
}

export async function getEmployeeBriefs(employeeId: string) {
  return prisma.brief.findMany({
    where: { assignedToIds: { has: employeeId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateEmployeeBriefStatus(briefId: string, employeeId: string, status: BriefStatus) {
  if (!EMPLOYEE_ALLOWED_STATUS.includes(status as BriefStatus)) throw new Error("Status not allowed for employee");

  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) throw new Error("Brief not found");
  if (!brief.assignedToIds.includes(employeeId)) throw new Error("Forbidden");

  return prisma.brief.update({
    where: { id: briefId },
    data: { status, statusUpdatedById: employeeId, statusUpdatedAt: new Date() },
  });
}

export async function getBriefById(briefId: string, requester: AuthContext) {
  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) throw new Error("Brief not found");

  const isClientOwner = requester.role === "CLIENT" && brief.clientId === requester.userId;
  const isAssignedEmployee = requester.role === "EMPLOYEE" && brief.assignedToIds.includes(requester.userId);
  const isAdmin = requester.role === "ADMIN";

  if (!isClientOwner && !isAssignedEmployee && !isAdmin) {
    throw new Error("Forbidden");
  }

  return brief;
}

export async function deleteBrief(briefId: string, requester: AuthContext) {
  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) throw new Error("Brief not found");

  const isAdmin = requester.role === "ADMIN";
  const isClientOwner = requester.role === "CLIENT" && brief.clientId === requester.userId && brief.status === "PENDING";

  if (!isAdmin && !isClientOwner) {
    throw new Error("Forbidden");
  }

  return prisma.brief.delete({ where: { id: briefId } });
}
