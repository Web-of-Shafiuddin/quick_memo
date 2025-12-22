import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validator.js';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customerSchema.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Customer CRUD
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', validate(createCustomerSchema), createCustomer);
router.put('/:id', validate(updateCustomerSchema), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
