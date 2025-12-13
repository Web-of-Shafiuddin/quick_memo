import { Router } from "express";
import { validate } from "../middleware/validator";
import { createUserSchema, loginSchema } from "../schemas/userSchema";
import { userLogin, userRegister } from "../controllers/authController";

const router = Router();
// auth routes

router.post('/login', validate(loginSchema), userLogin);
router.post("/register", validate(createUserSchema), userRegister);
//admin login
// router.post('/admin/login', validate(adminLoginSchema), adminLogin);

export default router;
