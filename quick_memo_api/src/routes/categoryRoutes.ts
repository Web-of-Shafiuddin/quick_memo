import { Router } from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkCategoryLimit } from '../middleware/subscriptionLimits.js';
import { validate } from '../middleware/validator.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', checkCategoryLimit, validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
