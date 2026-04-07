import { Request, Response } from 'express';
import prisma from "../../db/prisma.js";
import {
    completePasswordReset,
    initiateRegister,
    logUser,
    requestPasswordReset,
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