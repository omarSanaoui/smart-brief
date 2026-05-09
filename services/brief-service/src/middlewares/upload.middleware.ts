import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log("[upload] uploads directory:", uploadsDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    console.log("[upload] saving file to:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const hash = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    const name = `${hash}${ext}`;
    console.log("[upload] filename:", name, "original:", file.originalname);
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
