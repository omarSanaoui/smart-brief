import { NextFunction, Request, Response } from "express";
import { AuthContext, UserRole } from "../services/briefService.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    console.log("requireAuth hit")
    console.log("x-user-id:", req.header("x-user-id"))
    console.log("x-user-role:", req.header("x-user-role"))
    
    const userId = req.header("x-user-id");
    const role = req.header("x-user-role") as UserRole | undefined;

    if (!userId || !role) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    req.user = { userId, role };
    next();
}
