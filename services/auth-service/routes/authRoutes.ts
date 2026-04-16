import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js"
import { changePassword, deleteMe, forgotPassword, getMe, getUserById, googleCallback, logIn, register, resendCode, resetPassword, updateMe, verifyCode, getMultipleUsers, getUsersByRole, adminCreateClient, getAdminClients, verifyEmailChange } from "../src/controllers/authController.js"
import passport from "../middlewares/passport.js"

const router = Router()

router.post("/register",  register)
router.post("/verify-code", verifyCode)
router.post("/resend-code", resendCode)
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
router.patch("/me", authenticate, updateMe);
router.post("/change-password", authenticate, changePassword);
router.delete("/me", authenticate, deleteMe);
router.get("/users/role/:role", authenticate, getUsersByRole);
router.get("/users/:id", authenticate, getUserById);

router.post("/admin/create-client", authenticate, authorizeAdmin, adminCreateClient);
router.get("/admin/clients", authenticate, authorizeAdmin, getAdminClients);

// Email change confirmation (public — user clicks from email, no session)
router.get("/verify-email-change", verifyEmailChange);

// Internal API endpoint for service-to-service communication (not authenticated)
router.get("/api/users/internal", getMultipleUsers);

export default router;
