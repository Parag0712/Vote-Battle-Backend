import { Router } from "express";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import { ZodError } from "zod";
import { formatError, generateRandomNum, renderEmailEjs } from "../helper.js";
import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import { emailQueue, emailQueueName } from "../jobs/EmailQueue.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { authLimiter } from "../config/rateLimiter.js";
const router = Router();
// Register
router.post("/register", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = registerSchema.parse(body);
        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });
        // If user exists, check if email is verified
        if (user) {
            if (user.email_verified_at === null) {
                // Resend verification email
                const salt = await bcrypt.genSalt(10);
                const id = generateRandomNum();
                const token = await bcrypt.hash(id, salt);
                const url = `${process.env.APP_URL}/verify-email/?email=${user.email}&token=${token}`;
                const html = await renderEmailEjs("verify-email", {
                    name: user.name,
                    url: url
                });
                await emailQueue.add(emailQueueName, {
                    to: user.email,
                    subject: "Please verify your email for Battle Arena",
                    html: html
                });
                // Update user's email_verify_token
                await prisma.user.update({
                    where: { email: user.email },
                    data: { email_verify_token: token }
                });
                return res.status(200).json({
                    message: "Verification email resent. Please check your inbox!"
                });
            }
            return res.status(422).json({
                errors: {
                    email: "Email already taken. Please use another one.",
                },
            });
        }
        // Proceed with new user registration
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
        const id = generateRandomNum();
        const token = await bcrypt.hash(id, salt);
        const url = `${process.env.APP_URL}/verify-email/?email=${payload.email}&token=${token}`;
        const html = await renderEmailEjs("verify-email", {
            name: payload.name,
            url: url
        });
        await emailQueue.add(emailQueueName, {
            to: payload.email,
            subject: "Please verify your email for Battle Arena",
            html: html
        });
        await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                email_verify_token: token,
            }
        });
        return res.json({ message: "User created successfully!" });
    }
    catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid Inputs", errors: errors });
        }
        else {
            res
                .status(500)
                .json({ error: "Something went wrong. Please try again!", data: error });
        }
    }
});
// Login
router.post("/login", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = loginSchema.parse(body);
        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }
        if (user.email_verified_at === null) {
            return res.status(422).json({
                errors: "Email is not verified yet.please check your email and verify your email.",
            });
        }
        const isMatch = await bcrypt.compare(payload.password, user.password);
        if (!isMatch) {
            return res.status(422).json({
                errors: {
                    password: "Password is incorrect!"
                },
            });
        }
        const JWTPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        const token = jwt.sign(JWTPayload, process.env.JWT_SECRET, {
            expiresIn: "365d",
        });
        const resPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            token: `Bearer ${token}`,
        };
        return res.json({
            message: "Logged in successfully!",
            data: resPayload,
        });
    }
    catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid Inputs", errors: errors });
        }
        else {
            res
                .status(500)
                .json({ error: "Something went wrong. Please try again!", data: error });
        }
    }
});
// check Login
router.post("/check/credentials", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = loginSchema.parse(body);
        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });
        if (!user) {
            return res.status(422).json({
                errors: {
                    email: "No user found with this email.",
                },
            });
        }
        if (user.email_verified_at == null) {
            return res.status(422).json({
                errors: {
                    email: "Email is not verified yet.please check your email and verify your email.",
                },
            });
        }
        if (!bcrypt.compareSync(payload.password, user.password)) {
            return res.status(422).json({
                errors: {
                    email: "Invalid Credentials.",
                },
            });
        }
        return res.json({
            message: "Logged in successfully!",
            data: null,
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid login data", errors });
        }
        else {
            res.status(500).json({
                error: "Something went wrong.please try again!",
                data: error,
            });
        }
    }
});
// Get User
router.get("/user", authMiddleware, async (req, res) => {
    const user = req.user;
    return res.json({
        data: user
    });
});
export default router;
