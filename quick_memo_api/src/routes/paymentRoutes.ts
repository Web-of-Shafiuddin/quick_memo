import { Router } from 'express';
import { addPayment, getPaymentsByInvoice, deletePayment } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', addPayment);
router.get('/invoice/:invoice_id', getPaymentsByInvoice);
router.delete('/:id', deletePayment);

export default router;
