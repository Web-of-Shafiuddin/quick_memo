import { Router } from "express";
import { validate } from "../middleware/validator";
import { createUserSchema, loginSchema } from "../schemas/userSchema";
import { userLogin, userRegister, validateToken, adminLogin, validateAdminToken } from "../controllers/authController";
import { authMiddleware, adminAuthMiddleware } from "../middleware/authMiddleware";
const router = Router();

// User auth routes
router.post('/login', validate(loginSchema), userLogin);
router.post("/register", validate(createUserSchema), userRegister);
router.get('/validate-token', authMiddleware, validateToken);

// Admin auth routes
router.post('/admin/login', validate(loginSchema), adminLogin);
router.get('/admin/validate-token', adminAuthMiddleware, validateAdminToken);

export default router;
