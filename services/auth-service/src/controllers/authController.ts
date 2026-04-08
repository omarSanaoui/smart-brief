import { Request, Response } from 'express';
import prisma from "../../db/prisma.js";
import bcrypt from "bcryptjs";
import {
    completePasswordReset,
    initiateRegister,
    logUser,
    requestPasswordReset,
    resendVerificationCode,
    verifyAndCreateUser
} from '../../services/authServices.js';
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
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
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

        if (typeof email === "string") {
            const clean = normalizeEmail(email);
            if (!isValidEmail(clean)) {
                res.status(400).json({ message: "Invalid email format" });
                return;
            }

            // If changing email, ensure uniqueness.
            if (clean !== requester.email) {
                const existing = await prisma.user.findUnique({ where: { email: clean } });
                if (existing) {
                    res.status(400).json({ message: "Email already in use" });
                    return;
                }
                data.email = clean;
            }
        }

        if (Object.keys(data).length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        const updated = await prisma.user.update({
            where: { id: requester.id },
            data,
        });

        const { password, ...safeUser } = updated as any;
        res.status(200).json({ user: safeUser });
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
