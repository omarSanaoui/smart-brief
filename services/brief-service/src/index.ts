import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import briefRoutes from "./routes/brief.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:8080"
    ],
    credentials: true
}))
app.use(express.json());
app.use((req, _res, next) => {
    console.log(`Brief-service received: ${req.method} ${req.path}`)
    next()
})
app.use("/briefs", briefRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", service: "brief-service" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Brief service running on http://localhost:${PORT}`);
});