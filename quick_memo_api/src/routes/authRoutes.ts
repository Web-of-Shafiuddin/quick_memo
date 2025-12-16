import { Router } from "express";
import { validate } from "../middleware/validator";
import { createUserSchema, loginSchema } from "../schemas/userSchema";
import { userLogin, userRegister, validateToken } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
const router = Router();
// auth routes

router.post('/login', validate(loginSchema), userLogin);
router.post("/register", validate(createUserSchema), userRegister);
//admin login
// router.post('/admin/login', validate(adminLoginSchema), adminLogin);

router.get('/validate-token', authMiddleware, validateToken);

export default router;
