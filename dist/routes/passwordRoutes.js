import { Router } from "express";
import prisma from "../config/database.js";
import { authLimiter } from "../config/rateLimiter.js";
import { forgetPasswordSchema, resetPasswordSchema } from "../validations/passwordValidation.js";
import { checkDateHourDifference, formatError, generateRandomNum, renderEmailEjs } from "../helper.js";
import bcrypt from 'bcrypt';
import { ZodError } from "zod";
import { emailQueue, emailQueueName } from "../jobs/EmailQueue.js";
const router = Router();
// forget password
router.post("/forget-password", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = forgetPasswordSchema.parse(body);
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: payload.email },
        });
        // Check if user exists
        if (!user) {
            return res.status(422).json({
                message: "Invalid data",
                errors: {
                    email: "No Account found with this email!",
                },
            });
        }
        // Generate token
        const id = generateRandomNum();
        const salt = await bcrypt.genSalt(10);
        const token = await bcrypt.hash(id, salt);
        await prisma.user.update({
            data: {
                password_reset_token: token,
                token_send_at: new Date().toISOString(),
            },
            where: {
                email: payload.email
            }
        });
        const url = `${process.env.CLIENT_URL}/reset-password?email=${payload.email}&token=${token}`;
        const html = await renderEmailEjs("forget-password", {
            name: user.name,
            url: url,
        });
        await emailQueue.add(emailQueueName, {
            to: payload.email,
            subject: "Reset Password",
            html: html
        });
        return res.json({
            message: "Email sent successfully!! please check your email.",
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
// reset password
router.post("/reset-password", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = resetPasswordSchema.parse(body);
        const user = await prisma.user.findUnique({
            select: {
                email: true,
                password_reset_token: true,
                token_send_at: true
            },
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return res.status(422).json({
                errors: {
                    email: "No Account found with this email.",
                },
            });
        }
        if (payload.token !== user.password_reset_token) {
            return res.status(422).json({
                errors: {
                    email: "Please make sure you are using correct url.",
                },
            });
        }
        const hoursDiff = checkDateHourDifference(user.token_send_at);
        if (hoursDiff > 2) {
            return res.status(422).json({
                errors: {
                    email: "Password Reset token got expire.please send new token to reset password.",
                },
            });
        }
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(payload.password, salt);
        await prisma.user.update({
            data: {
                password: newPass,
                password_reset_token: null,
                token_send_at: null,
            },
            where: { email: payload.email },
        });
        return res.json({
            message: "Password reset successfully! please try to login now.",
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            return res.status(500).json({
                error: "Something went wrong.please try again!",
                data: error,
            });
        }
    }
});
export default router;
