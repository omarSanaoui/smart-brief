import "dotenv/config";
import express from "express";
import cors from "cors"
import { Request, Response } from 'express';
import authRoutes from "./routes/authRoutes.js"
import passport from "passport";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const app = express()
app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        const allowed = [
            "http://localhost:5173",
            "http://localhost:8080",
            process.env.GATEWAY_URL,
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        if (allowed.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".railway.app")) {
            callback(null, true);
        } else {
            callback(null, true); // permissive for internal service calls
        }
    },
    credentials: true
}))
app.use(passport.initialize())

const PORT = process.env.PORT || 3000;

app.get("/", async (req: Request, res: Response) => {
  res.json({ message: "auth-service running" });
})
app.use('/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Auth service running on http://localhost:${PORT}`);
})


