import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNumber,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceStats,
} from "../controllers/invoiceController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get invoice statistics
router.get('/stats', getInvoiceStats);

// Get all invoices
router.get('/', getAllInvoices);

// Get invoice by ID
router.get('/:id', getInvoiceById);

// Get invoice by invoice number
router.get('/number/:invoiceNumber', getInvoiceByNumber);

// Create invoice from order
router.post('/', createInvoice);

// Update invoice
router.put('/:id', updateInvoice);

// Update invoice status only
router.patch('/:id/status', updateInvoiceStatus);

// Delete (void) invoice
router.delete('/:id', deleteInvoice);

export default router;
