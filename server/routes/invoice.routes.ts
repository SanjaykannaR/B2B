// Routes for: Invoice billing
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: GET /, GET /my, GET /:id, POST /generate/:manifestId, PATCH /:id/pay, GET /stats

import { Router } from 'express';
import invoiceController from '../controllers/invoice.controller';
import authMiddleware from '../middleware/auth';
import roleGuard from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/', roleGuard(['admin', 'executive']), invoiceController.listInvoices);
router.get('/my', roleGuard(['client']), invoiceController.getMyInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/:id', invoiceController.getInvoice);

router.post('/generate/:manifestId', roleGuard(['admin']), invoiceController.generateInvoiceForManifest);
router.patch('/:id/pay', roleGuard(['admin', 'client']), invoiceController.markInvoicePaid);

export default router;
