import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js"
import { forgotPassword, getMe, getUserById, googleCallback, logIn, register, resetPassword, verifyCode, getMultipleUsers, getUsersByRole } from "../src/controllers/authController.js"
import passport from "../middlewares/passport.js"

const router = Router()

router.post("/register",  register)
router.post("/verify-code", verifyCode)
router.post("/login", logIn)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

router.get("/google", passport.authenticate("google", { scope: ['profile', 'email'] }))

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }
    ),
    googleCallback
)

router.get("/me", authenticate, getMe);
router.get("/users/role/:role", authenticate, getUsersByRole);
router.get("/users/:id", authenticate, getUserById);

// Internal API endpoint for service-to-service communication (not authenticated)
router.get("/api/users/internal", getMultipleUsers);

export default router;