import { Router } from "express";
import prisma from "../config/database.js";
const router = Router();
router.get("/verify-email", async (req, res) => {
    const { email, token } = req.query;
    if (email && token) {
        const user = await prisma.user.findUnique({
            select: {
                email_verify_token: true,
                id: true
            },
            where: {
                email: email
            }
        });
        if (user) {
            if (token !== user.email_verify_token) {
                return res.redirect("/verify-error");
            }
            await prisma.user.update({
                data: {
                    email_verified_at: new Date().toISOString(),
                    email_verify_token: null
                },
                where: {
                    id: user?.id
                }
            });
            return res.redirect(`${process.env.CLIENT_URL}/login`);
        }
        return res.redirect("/verify-error");
    }
});
router.get("/verify-error", (req, res) => {
    return res.render("auth/verifyEmailError");
});
export default router;
