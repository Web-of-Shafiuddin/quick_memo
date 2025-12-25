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
  getProductVariants,
  createVariant,
  updateVariantAttribute,
  deleteVariantAttribute,
  getVariantAttributes,
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

// Variant management - Full CRUD for variants
router.get('/:id/variants', getProductVariants);
router.post('/:id/variants', createVariant);

// Variant attributes management
router.get('/:id/attributes', getVariantAttributes);
router.post('/:id/attributes', validate(createVariantAttributeSchema), addVariantAttribute);
router.put('/:id/attributes/:attributeId', updateVariantAttribute);
router.delete('/:id/attributes/:attributeId', deleteVariantAttribute);

// Stock management
router.patch('/:id/stock', updateStock);

export default router;
