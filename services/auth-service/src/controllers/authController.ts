import { Request, Response } from 'express';
import prisma from "../../db/prisma.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import {
    completePasswordReset,
    initiateRegister,
    logUser,
    requestPasswordReset,
    resendVerificationCode,
    verifyAndCreateUser
} from '../../services/authServices.js';
import { sendEmailChangeVerification, sendEmailChangeNotification } from '../../services/emailServices.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
import {
    isStrongPassword,
    isValidEmail,
    isValidName,
    isValidPhone,
    isValidVerificationCode,
    normalizeEmail,
} from '../../utils/validation.js';


export async function register(req: Request, res: Response) {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        const cleanFirstName = String(firstName).trim();
        const cleanLastName = String(lastName).trim();
        const cleanEmail = normalizeEmail(String(email));
        const cleanPassword = String(password);
        const cleanPhone = phone ? String(phone).trim() : undefined;

        if (!isValidName(cleanFirstName) || !isValidName(cleanLastName)) {
            res.status(400).json({ message: "First and last name must be 2-40 letters" });
            return;
        }

        if (!isValidEmail(cleanEmail)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }

        if (!isStrongPassword(cleanPassword)) {
            res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, a number, and a special character" });
            return;
        }

        if (cleanPhone && !isValidPhone(cleanPhone)) {
            res.status(400).json({ message: "Invalid phone number" });
            return;
        }
        
        const registeredUser = await initiateRegister(cleanFirstName, cleanLastName, cleanEmail, cleanPassword, cleanPhone)
        res.status(200).json(registeredUser)

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function verifyCode(req: Request, res: Response) {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            res.status(400).json({ message: "Email and code are required" });
            return;
        }

        const cleanEmail = normalizeEmail(String(email));
        const cleanCode = String(code).trim();

        if (!isValidEmail(cleanEmail)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }

        if (!isValidVerificationCode(cleanCode)) {
            res.status(400).json({ message: "Invalid verification code" });
            return;
        }

        const result = await verifyAndCreateUser(cleanEmail, cleanCode);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export async function logIn(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" })
            return
        }

        const cleanEmail = normalizeEmail(String(email));
        const cleanPassword = String(password);

        if (!isValidEmail(cleanEmail)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }

        if (!isStrongPassword(cleanPassword)) {
            res.status(400).json({ message: "Password format is invalid" });
            return;
        }

        const loggedUser = await logUser(cleanEmail, cleanPassword)
        res.status(200).json({ user: loggedUser.user, token: loggedUser.token })

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }

        const cleanEmail = normalizeEmail(String(email));
        if (!isValidEmail(cleanEmail)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }

        const result = await requestPasswordReset(cleanEmail);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: "Token and new password are required" });
            return;
        }

        if (!isStrongPassword(String(newPassword))) {
            res.status(400).json({ message: "New password format is invalid" });
            return;
        }

        const result = await completePasswordReset(String(token), String(newPassword));
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function resendCode(req: Request, res: Response) {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const cleanEmail = normalizeEmail(String(email));
        if (!isValidEmail(cleanEmail)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }
        const result = await resendVerificationCode(cleanEmail);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function googleCallback(req: Request, res: Response) {
    try {
        const { token } = req.user as any
        const frontendUrl = process.env.FRONTEND_URL || "https://smart-brief-six.vercel.app";
        res.redirect(`${frontendUrl}?token=${token}`);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getMultipleUsers(req: Request, res: Response) {
    try {
        const { ids } = req.query;
        if (!ids || typeof ids !== 'string') {
            res.status(400).json({ message: "ids query parameter is required" });
            return;
        }

        const userIds = ids.split(',').map(id => id.trim()).filter(Boolean);
        if (!userIds.length) {
            res.status(200).json([]);
            return;
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
        });

        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getUsersByRole(req: Request, res: Response) {
    try {
        const { role } = req.params;
        if (!role) {
            res.status(400).json({ message: "Role is required" });
            return;
        }

        const users = await prisma.user.findMany({
            where: { role: (role as string).toUpperCase() as any },
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
        });

        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getMe(req: Request, res: Response) {
    res.status(200).json({ user: req.user });
}

export async function updateMe(req: Request, res: Response) {
    try {
        const requester = req.user as any;
        if (!requester?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { firstName, lastName, email, phone } = req.body ?? {};
        const data: Record<string, unknown> = {};

        if (typeof firstName === "string") {
            const clean = firstName.trim();
            if (!clean || !isValidName(clean)) {
                res.status(400).json({ message: "First name must be 2-40 letters" });
                return;
            }
            data.firstName = clean;
        }

        if (typeof lastName === "string") {
            const clean = lastName.trim();
            if (!clean || !isValidName(clean)) {
                res.status(400).json({ message: "Last name must be 2-40 letters" });
                return;
            }
            data.lastName = clean;
        }

        if (typeof phone === "string") {
            const clean = phone.trim();
            if (clean && !isValidPhone(clean)) {
                res.status(400).json({ message: "Invalid phone number" });
                return;
            }
            data.phone = clean || null;
        }

        let pendingEmailChange: string | null = null;

        if (typeof email === "string") {
            const clean = normalizeEmail(email);
            if (!isValidEmail(clean)) {
                res.status(400).json({ message: "Invalid email format" });
                return;
            }

            if (clean !== requester.email) {
                const existing = await prisma.user.findUnique({ where: { email: clean } });
                if (existing) {
                    res.status(400).json({ message: "Email already in use" });
                    return;
                }
                // Don't update email directly — send verification link instead
                pendingEmailChange = clean;
            }
        }

        // Save non-email fields immediately
        if (Object.keys(data).length > 0) {
            const updated = await prisma.user.update({ where: { id: requester.id }, data });
            const { password, ...safeUser } = updated as any;
            if (!pendingEmailChange) {
                res.status(200).json({ user: safeUser });
                return;
            }
        } else if (!pendingEmailChange) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        // Handle email change: issue a signed token and send verification
        if (pendingEmailChange) {
            const token = jwt.sign(
                { id: requester.id, newEmail: pendingEmailChange, purpose: "email-change" },
                JWT_SECRET,
                { expiresIn: "1h" }
            );
            const frontendUrl = process.env.FRONTEND_URL || "https://smart-brief-six.vercel.app";
            const confirmLink = `${frontendUrl}/verify-email-change?token=${token}`;

            sendEmailChangeVerification(pendingEmailChange, requester.firstName, confirmLink).catch((err: any) =>
                console.error("[EMAIL] Failed to send email change verification:", err?.message ?? err)
            );
            sendEmailChangeNotification(requester.email, requester.firstName, pendingEmailChange).catch((err: any) =>
                console.error("[EMAIL] Failed to send email change notification:", err?.message ?? err)
            );

            res.status(200).json({ pendingEmailChange: true, message: `A confirmation link has been sent to ${pendingEmailChange}` });
            return;
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function changePassword(req: Request, res: Response) {
    try {
        const requester = req.user as any;
        if (!requester?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { currentPassword, newPassword } = req.body ?? {};
        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            res.status(400).json({ message: "Current password and new password are required" });
            return;
        }

        if (!isStrongPassword(String(newPassword))) {
            res.status(400).json({ message: "New password format is invalid" });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: requester.id } });
        if (!user || !user.password) {
            res.status(400).json({ message: "Password change is not available for this account" });
            return;
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            res.status(400).json({ message: "Current password is incorrect" });
            return;
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: requester.id }, data: { password: hashed } });

        res.status(200).json({ message: "Password updated" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteMe(req: Request, res: Response) {
    try {
        const requester = req.user as any;
        if (!requester?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { password } = req.body ?? {};
        const user = await prisma.user.findUnique({ where: { id: requester.id } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.provider === "LOCAL") {
            if (typeof password !== "string" || !password) {
                res.status(400).json({ message: "Password is required to delete this account" });
                return;
            }
            if (!user.password) {
                res.status(400).json({ message: "Password is required to delete this account" });
                return;
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                res.status(400).json({ message: "Password is incorrect" });
                return;
            }
        }

        await prisma.user.delete({ where: { id: requester.id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function adminCreateClient(req: Request, res: Response) {
    try {
        const admin = req.user as any;
        if (!admin?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { firstName, lastName, email, phone } = req.body;

        if (!firstName || !lastName) {
            res.status(400).json({ message: "First name and last name are required" });
            return;
        }

        const cleanFirstName = String(firstName).trim();
        const cleanLastName = String(lastName).trim();
        const cleanPhone = phone ? String(phone).trim() : undefined;

        if (!isValidName(cleanFirstName) || !isValidName(cleanLastName)) {
            res.status(400).json({ message: "First and last name must be 2-40 letters" });
            return;
        }

        if (cleanPhone && !isValidPhone(cleanPhone)) {
            res.status(400).json({ message: "Invalid phone number" });
            return;
        }

        // Generate placeholder email if not provided
        const isPlaceholder = !email;
        let cleanEmail: string;
        if (email) {
            cleanEmail = normalizeEmail(String(email));
            if (!isValidEmail(cleanEmail)) {
                res.status(400).json({ message: "Invalid email format" });
                return;
            }
        } else {
            const base = `${cleanFirstName.toLowerCase()}.${cleanLastName.toLowerCase()}`.replace(/[^a-z.]/g, "");
            cleanEmail = `${base}@client.agence47.ma`;
            // Ensure uniqueness by appending a number if needed
            let suffix = 0;
            let candidate = cleanEmail;
            while (await prisma.user.findUnique({ where: { email: candidate } })) {
                suffix++;
                candidate = `${base}${suffix}@client.agence47.ma`;
            }
            cleanEmail = candidate;
        }

        // Check email uniqueness for provided emails
        if (!isPlaceholder) {
            const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
            if (existing) {
                res.status(400).json({ message: "Email already in use" });
                return;
            }
        }

        // Generate a password matching validation rules: uppercase + lowercase + number, no special chars
        const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const lower = "abcdefghjkmnpqrstuvwxyz";
        const digits = "23456789";
        const all = upper + lower + digits;
        const rand = (pool: string) => pool[Math.floor(Math.random() * pool.length)];
        const randomPassword = [
            rand(upper), rand(lower), rand(digits),
            ...Array.from({ length: 9 }, () => rand(all))
        ].sort(() => Math.random() - 0.5).join("");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const user = await prisma.user.create({
            data: {
                firstName: cleanFirstName,
                lastName: cleanLastName,
                email: cleanEmail,
                password: hashedPassword,
                phone: cleanPhone,
                role: "CLIENT",
                provider: "LOCAL",
                addedByAdminId: admin.id,
                isPlaceholderEmail: isPlaceholder,
            },
        });

        const { password, ...safeUser } = user;
        res.status(201).json({ user: safeUser, generatedPassword: randomPassword });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getAdminClients(req: Request, res: Response) {
    try {
        const admin = req.user as any;
        if (!admin?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const clients = await prisma.user.findMany({
            where: { addedByAdminId: admin.id, role: "CLIENT" },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, isPlaceholderEmail: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json(clients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function verifyEmailChange(req: Request, res: Response) {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            res.status(400).json({ message: "Token is required" });
            return;
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            res.status(400).json({ message: "Invalid or expired link" });
            return;
        }

        if (decoded.purpose !== "email-change" || !decoded.id || !decoded.newEmail) {
            res.status(400).json({ message: "Invalid token" });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email: decoded.newEmail } });
        if (existing) {
            res.status(400).json({ message: "This email is already in use" });
            return;
        }

        const updated = await prisma.user.update({
            where: { id: decoded.id },
            data: { email: decoded.newEmail },
        });

        const { password, ...safeUser } = updated;
        res.status(200).json({ user: safeUser, message: "Email updated successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getUserById(req: Request, res: Response) {
    try{
        const requester = req.user as any
        const userId = req.params.id as string

        if(requester.id !== userId && requester.role !== "ADMIN") {
            res.status(403).json({ message: "Forbidden" })
            return
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if(!user) {
            res.status(404).json({ message: "User not found" })
            return
        }
        const { password, ...safeUser } = user
        res.status(200).json({ user: safeUser });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
