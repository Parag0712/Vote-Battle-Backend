import { Router } from "express";
import AuthRoutes from "./authRoutes.js";
import VerifyRoutes from "./verifyRoutes.js";
import PasswordRoutes from "./passwordRoutes.js";
import ClashRoutes from "./clashRoutes.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
const router = Router();
router.use("/api/auth", AuthRoutes);
router.use("/api/password", PasswordRoutes);
router.use("/api/clash", authMiddleware, ClashRoutes);
router.use("/", VerifyRoutes);
export default router;
