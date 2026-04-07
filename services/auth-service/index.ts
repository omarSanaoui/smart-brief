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
    origin: [
        "http://localhost:5173", // frontend
        "http://localhost:8080"  // gateway
    ],
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


