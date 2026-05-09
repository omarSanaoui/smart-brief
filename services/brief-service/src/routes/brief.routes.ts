import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as briefController from "../controllers/brief.controller.js";
import * as taskController from "../controllers/task.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Add the auth middleware to protect all routes below
router.use(requireAuth);

// Client Routes
router.post("/", briefController.createBriefHandler);
router.get("/client", briefController.getClientBriefsHandler);
router.patch("/client/:briefId", briefController.updateClientBriefHandler);

// Admin Routes
router.get("/admin", briefController.getAllBriefsHandler);
router.post("/admin/for-client/:clientId", briefController.adminCreateBriefForClientHandler);
router.patch("/admin/:briefId/status", briefController.updateBriefStatusHandler);
router.patch("/admin/:briefId/assign", briefController.assignBriefHandler);

// Employee Routes
router.get("/employee", briefController.getEmployeeBriefsHandler);
router.patch("/employee/:briefId/status", briefController.updateEmployeeBriefStatusHandler);

// Shared/Generic routes (role-based logic handles access internally)
router.get("/", briefController.getBriefsHandler);
router.get("/:briefId", briefController.getBriefByIdHandler);
router.patch("/:briefId", briefController.updateClientBriefHandler); // Clients edit their own
router.patch("/:briefId/status", (req, res, next) => {
    // Determine which status handler to use based on role
    // This is a bit of a shortcut, ideally the handlers check the role themselves
    const role = req.headers["x-user-role"];
    if (role === "ADMIN") return briefController.updateBriefStatusHandler(req, res);
    if (role === "EMPLOYEE") return briefController.updateEmployeeBriefStatusHandler(req, res);
    next();
});

// File upload & download
router.post("/upload", (req, res, next) => {
  upload.array("files", 20)(req, res, (err) => {
    if (err) {
      console.error("[upload] multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, briefController.uploadAttachmentsHandler);
router.get("/:briefId/attachments/zip", briefController.downloadAttachmentsZipHandler);

// Multi-role/Export route
router.get("/:briefId/export", briefController.exportBriefDataHandler);

// Admin/Client deletion
router.delete("/:briefId", briefController.deleteBriefHandler);

// Task routes (nested under brief)
router.get("/:briefId/tasks", taskController.getTasksHandler);
router.post("/:briefId/tasks", taskController.createTaskHandler);
router.patch("/:briefId/tasks/:taskId", taskController.updateTaskHandler);
router.patch("/:briefId/tasks/:taskId/status", taskController.updateTaskStatusHandler);
router.delete("/:briefId/tasks/:taskId", taskController.deleteTaskHandler);

export default router;
