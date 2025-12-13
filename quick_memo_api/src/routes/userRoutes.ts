import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';
import { validate } from '../middleware/validator.js';
import { createUserSchema } from '../schemas/userSchema.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
