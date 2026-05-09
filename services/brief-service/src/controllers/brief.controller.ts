import { Request, Response } from "express";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { Writable } from "stream";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const archiver = require("archiver") as typeof import("archiver");
import * as briefService from "../services/briefService.js";
import { fetchUsersFromAuthService } from "../utils/authClient.js";
import { sendBriefStatusEmail, sendEmployeeAssignmentEmail, sendAdminNewBriefEmail } from "../services/emailService.js";
import { createBriefPdf } from "../services/pdfService.js";
import {
  createBriefSchema,
  updateBriefSchema,
  updateBriefStatusSchema,
  assignBriefSchema,
} from "../schemas/brief.schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

const getAuth = (req: Request): briefService.AuthContext => {
  // @ts-ignore
  return req.user;
};

export const createBriefHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (auth.role !== "CLIENT") {
      return res.status(403).json({ error: "Only clients can create briefs" });
    }

    const body = createBriefSchema.parse(req.body);
    const brief = await briefService.createBrief(auth.userId, body);

    // NOTIFY ADMIN OF NEW BRIEF
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (adminEmail) {
        // Fetch client details for the email
        const usersMap = await fetchUsersFromAuthService([auth.userId]);
        const client = usersMap.get(auth.userId);
        await sendAdminNewBriefEmail(adminEmail, client ? `${client.firstName} ${client.lastName}` : "A Client", brief.title);
      }
    } catch (err) {
      console.error("Could not send admin notification email", err);
    }

    res.status(201).json(brief);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ error: error.message });
  }
};

export const getClientBriefsHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "CLIENT") return res.status(403).json({ error: "Forbidden" });

    const briefs = await briefService.getClientBriefs(auth.userId);
    res.status(200).json(briefs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClientBriefHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const briefId = req.params.briefId as string;
    const body = updateBriefSchema.parse(req.body);

    const updated = await briefService.updateClientBrief(auth.userId, briefId, body);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(error.message === "Forbidden" ? 403 : 400).json({ error: error.message });
  }
};

export const getAllBriefsHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const briefs = await briefService.getAllBriefs();
    res.status(200).json(briefs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBriefStatusHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const briefId = req.params.briefId as string;
    const body = updateBriefStatusSchema.parse(req.body);

    const updated = await briefService.updateBriefStatus(briefId, body.status, auth.userId, body.reason);

    // SEND EMAIL ON STATUS UPDATE
    try {
      const usersMap = await fetchUsersFromAuthService([updated.clientId]);
      const client = usersMap.get(updated.clientId);
      if (client?.email) {
        await sendBriefStatusEmail(client.email, `${client.firstName} ${client.lastName}`, updated.title, updated.status, updated.statusReason || undefined);
      }
    } catch (err) {
      console.error("Could not send brief status email", err);
    }

    res.status(200).json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(400).json({ error: error.message });
  }
};

export const assignBriefHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const briefId = req.params.briefId as string;
    const body = assignBriefSchema.parse(req.body);

    const updated = await briefService.assignBrief(briefId, body.employeeIds, auth.userId);

    // NOTIFY EMPLOYEES OF ASSIGNMENT
    try {
      const employeesMap = await fetchUsersFromAuthService(body.employeeIds);
      for (const employeeId of body.employeeIds) {
        const emp = employeesMap.get(employeeId);
        if (emp?.email) {
          await sendEmployeeAssignmentEmail(emp.email, `${emp.firstName} ${emp.lastName}`, updated.title);
        }
      }
    } catch (err) {
      console.error("Could not send assignment emails", err);
    }

    res.status(200).json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(400).json({ error: error.message });
  }
};

export const getEmployeeBriefsHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "EMPLOYEE") return res.status(403).json({ error: "Forbidden" });

    const briefs = await briefService.getEmployeeBriefs(auth.userId);
    res.status(200).json(briefs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployeeBriefStatusHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const briefId = req.params.briefId as string;
    const body = updateBriefStatusSchema.parse(req.body);

    const updated = await briefService.updateEmployeeBriefStatus(briefId, auth.userId, body.status);

    // NOTIFY ADMIN/CLIENT OF PROGRESS (Optional: choosing to notify client of "COMPLETED" status)
    if (body.status === "COMPLETED") {
        try {
          const usersMap = await fetchUsersFromAuthService([updated.clientId]);
          const client = usersMap.get(updated.clientId);
          if (client?.email) {
            await sendBriefStatusEmail(client.email, `${client.firstName} ${client.lastName}`, updated.title, updated.status, "Project marked as completed by production team.");
          }
        } catch (err) {
          console.error("Could not send completion email", err);
        }
    }

    res.status(200).json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(403).json({ error: error.message });
  }
};

export const getBriefsHandler = async (req: Request, res: Response) => {
    try {
      const auth = getAuth(req);
      if (!auth) return res.status(401).json({ error: "Unauthorized" });
  
      let briefs;
      if (auth.role === "ADMIN") {
        briefs = await briefService.getAllBriefs();
      } else if (auth.role === "CLIENT") {
        briefs = await briefService.getClientBriefs(auth.userId);
      } else if (auth.role === "EMPLOYEE") {
        briefs = await briefService.getEmployeeBriefs(auth.userId);
      } else {
        return res.status(403).json({ error: "Forbidden role" });
      }
  
      res.status(200).json(briefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getBriefByIdHandler = async (req: Request, res: Response) => {
    try {
      const auth = getAuth(req);
      const briefId = req.params.briefId as string;
  
      const brief = await briefService.getBriefById(briefId, auth);
      res.status(200).json(brief);
    } catch (error: any) {
      res.status(error.message === "Forbidden" ? 403 : (error.message === "Brief not found" ? 404 : 500)).json({ error: error.message });
    }
  };

export const exportBriefDataHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const briefId = req.params.briefId as string;

    const brief = await briefService.getBriefById(briefId, auth);

    // Fetch user details from Auth Service via HTTP
    const userIdsToFetch = [brief.clientId, ...brief.assignedToIds];
    const usersMap = await fetchUsersFromAuthService(userIdsToFetch);

    const clientData = usersMap.get(brief.clientId) || null;
    const assignees = brief.assignedToIds.map((id: string) => usersMap.get(id)).filter(Boolean) as any[];

    // GENERATE PDF BUFFER
    const pdfBuffer = await createBriefPdf(brief, clientData, assignees, auth.role);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="brief-${brief.id}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

export const adminCreateBriefForClientHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (auth.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const clientId = req.params.clientId as string;
    if (!clientId) return res.status(400).json({ error: "clientId is required" });

    const body = createBriefSchema.parse(req.body);
    const brief = await briefService.adminCreateBriefForClient(auth.userId, clientId, body);
    res.status(201).json(brief);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ error: error.message });
  }
};

export const deleteBriefHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const briefId = req.params.briefId as string;

    await briefService.deleteBrief(briefId, auth);
    res.status(204).send(); // 204 No Content
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : (error.message === "Brief not found" ? 404 : 500);
    res.status(status).json({ error: error.message });
  }
};

export const uploadAttachmentsHandler = (req: Request, res: Response) => {
  console.log("[upload] handler reached, files:", (req.files as Express.Multer.File[] | undefined)?.length ?? 0);
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const filenames = files.map(f => f.filename);
  console.log("[upload] saved filenames:", filenames);
  res.status(200).json({ filenames });
};

export const downloadAttachmentsZipHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const briefId = req.params.briefId as string;

    const brief = await briefService.getBriefById(briefId, auth);
    if (!brief.attachments || brief.attachments.length === 0) {
      return res.status(404).json({ error: "No attachments found" });
    }

    // Resolve existing files BEFORE touching the response stream
    const existing = (brief.attachments as string[])
      .map((name: string) => ({ name, filePath: path.join(uploadsDir, name) }))
      .filter(({ filePath }) => fs.existsSync(filePath));

    if (existing.length === 0) {
      return res.status(404).json({ error: "Attachment files not found on server" });
    }

    // Buffer the zip in memory so headers are only sent after success
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) { chunks.push(Buffer.from(chunk)); cb(); },
    });

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(sink);
    for (const { name, filePath } of existing) {
      archive.file(filePath, { name });
    }

    await new Promise<void>((resolve, reject) => {
      sink.on("finish", resolve);
      sink.on("error", reject);
      archive.on("error", reject);
      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);
    const safeTitle = brief.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-attachments.zip"`);
    res.setHeader("Content-Length", zipBuffer.length);
    res.end(zipBuffer);
  } catch (error: any) {
    console.error("ZIP download error:", error);
    if (!res.headersSent) {
      const status = error.message === "Forbidden" ? 403 : (error.message === "Brief not found" ? 404 : 500);
      res.status(status).json({ error: error.message });
    }
  }
};
