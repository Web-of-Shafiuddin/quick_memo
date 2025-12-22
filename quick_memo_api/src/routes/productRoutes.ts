import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariantAttribute,
  updateStock,
} from '../controllers/productController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validator.js';
import { createProductSchema, updateProductSchema, createVariantAttributeSchema } from '../schemas/productSchema.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Product CRUD
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/sku/:sku', getProductBySku);
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

// Variant management
router.post('/:id/attributes', validate(createVariantAttributeSchema), addVariantAttribute);

// Stock management
router.patch('/:id/stock', updateStock);

export default router;
