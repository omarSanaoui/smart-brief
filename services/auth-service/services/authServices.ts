import prisma from "../db/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendVerificationEmail } from "./emailServices.js";
import { User } from "../src/generated/prisma/index.js";

const JWT_SECRET = process.env.JWT_SECRET as string

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function excludePassword(user: User): Omit<User, "password"> {
    const { password, ...safeUser } = user;
    return safeUser
}
//this leads to sending a verification code and temporarly creating data in verifytoken
export async function initiateRegister(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string
) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already in use");

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.verifyToken.upsert({
        where: { email },
        update: { email, code, expiresAt, firstName, lastName, password: hashedPassword, phone },
        create: { email, code, expiresAt, firstName, lastName, password: hashedPassword, phone }
    })
    await sendVerificationEmail(email, code)
    return { message: "Verification code sent to your email" }
}
//verify user then create the user with its token and delete verify Token
export async function verifyAndCreateUser(
    email: string, code: string
) {
    const record = await prisma.verifyToken.findUnique({ where: { email } })
    if (!record) throw new Error("No verification pending for this email");
    if (record.code !== code) throw new Error("Invalid code");
    if (record.expiresAt < new Date()) throw new Error("Code has expired");
    //remider: test it with a smaller value like 30s
    const user = await prisma.user.create({
        data: {
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email,
            password: record.password,
            phone: record.phone,
            provider: "LOCAL",
        },
    });

    await prisma.verifyToken.delete({ where: { email } });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
    });
    return { user: excludePassword(user), token }
}

export async function logUser(
    email: string,
    password: string
) {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!user || !user.password) throw new Error("Invalid credentials")

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error("Invalid credentials")

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET,
        { expiresIn: '7d' }
    )
    return { user: excludePassword(user), token }
}

export async function findOrCreateGoogleUser(profile: any) {
    const { id: googleId, emails, name } = profile;
    const email = emails[0].value;

    let user = await prisma.user.findUnique({
        where: { googleId }
    })
    if (!user) {
        user = await prisma.user.upsert({
            where: { email },
            update: { googleId, provider: "GOOGLE" },
            create: {
                firstName: name.givenName,
                lastName: name.familyName,
                email,
                googleId,
                provider: "GOOGLE"
            }
        })
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET,
        { expiresIn: '7d' }
    )
    return { user: excludePassword(user), token }
}

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return { message: "If this email is registered, a reset link has been sent" };
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetToken = jwt.sign(
        { id: user.id, purpose: "reset-password" },
        JWT_SECRET,
        { expiresIn: "30m" }
    );

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    return { message: "If this email is registered, a reset link has been sent" };
}

export async function completePasswordReset(token: string, newPassword: string) {
    let decoded: jwt.JwtPayload | string;

    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        throw new Error("Invalid or expired reset token");
    }

    if (typeof decoded === "string" || decoded.purpose !== "reset-password" || !decoded.id) {
        throw new Error("Invalid or expired reset token");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id as string } });
    if (!user) {
        throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });

    return { message: "Password reset successful" };
}
