import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET = process.env.JWT_SECRET as string

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string }

        const user = await prisma.user.findUnique({ where: { id: decoded.id } })
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

     
        const { password, ...safeUser } = user
        req.user = safeUser
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

export async function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any
    if (!user || user.role !== "ADMIN") {
        res.status(403).json({ message: "Access denied" });
        return;
    }
    next()
}