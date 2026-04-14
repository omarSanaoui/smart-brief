import dotenv from "dotenv"
import express, { Request, Response, NextFunction } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import jwt from "jsonwebtoken"
import cors from "cors"

dotenv.config()

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required")
}

const app = express()
const JWT_SECRET = process.env.JWT_SECRET as string

const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true
}))

const publicRoutes = [
    { path: "/auth/register", method: "POST" },
    { path: "/auth/verify-code", method: "POST" },
    { path: "/auth/resend-code", method: "POST" },
    { path: "/auth/login", method: "POST" },
    { path: "/auth/forgot-password", method: "POST" },
    { path: "/auth/reset-password", method: "POST" },
    { path: "/auth/google", method: "GET" },
    { path: "/auth/google/callback", method: "GET" },
    { path: "/api/users/internal", method: "GET" },
]

app.use((req, _res, next) => {
    console.log(`-> ${req.method} ${req.path}`)
    next()
})

function authenticate(req: Request, res: Response, next: NextFunction) {
    const isPublic = publicRoutes.some(
        r => req.path.startsWith(r.path) && req.method === r.method
    )
    if (isPublic) return next()

    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        res.status(401).json({ message: "No token provided" })
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string }
        req.headers["x-user-id"] = decoded.id
        req.headers["x-user-role"] = decoded.role
        next()
    } catch {
        res.status(401).json({ message: "Invalid or expired token" })
    }
}

app.use(authenticate)

app.use("/auth", createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
    on: {
        proxyReq: (_proxyReq, req) => {
            console.log(`Forwarding: ${req.method} ${req.url}`)
        },
        error: (err) => {
            console.log("Proxy error:", err.message)
        }
    }
}))

app.use("/api/users/internal", createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: { "^/api/users/internal": "/auth/api/users/internal" },
}))

app.use("/briefs", createProxyMiddleware({
    target: process.env.BRIEF_SERVICE_URL || "http://localhost:4000",
    changeOrigin: true,
    pathRewrite: (path) => `/briefs${path}`,
    on: {
        proxyReq: (_proxyReq, req) => {
            console.log(`Forwarding: ${req.method} ${req.url}`)
        },
        error: (err) => {
            console.log("Proxy error:", err.message)
        }
    }
}))

app.listen(8080, () => console.log("Gateway running on http://localhost:8080"))
